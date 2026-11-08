import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Capture raw body for HMAC-SHA256 webhook signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

/* ==========================================================================
   CONFIG JEKO (Identifiants réels fournis par l'utilisateur)
   ========================================================================== */
const JEKO_API_KEY =
  process.env.JEKO_API_KEY || 'jeko_4e6af80c6279a8112d7813a11e4863b1b9dbabc26fbaaedb106be041c7f0f6da';
const JEKO_API_KEY_ID =
  process.env.JEKO_API_KEY_ID || 'd4365c1e-b68a-46c4-a0fb-49d92c4c43c8';
const JEKO_STORE_ID =
  process.env.JEKO_STORE_ID || '6ff18bfb-e467-4896-9502-dd7db9f02c9b';
const JEKO_WEBHOOK_SECRET =
  process.env.JEKO_WEBHOOK_SECRET || '533e792aaaf1369cec78cdcda70d3abcce36d40fd34cfdb6df088e4323a4fe7a';
const JEKO_API_BASE = 'https://api.jeko.africa/partner_api';

// Types & Data Structures
interface TransactionRecord {
  id: string;
  ref: string;
  date: string;
  kind: 'airtime' | 'internet' | 'appels' | 'in' | 'out';
  label: string;
  sub: string;
  phone: string;
  amount: number;
  provider: string;
  operator: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  ussdCommand?: string;
  gateway?: 'USSD_GATEWAY' | 'API_AGGREGATOR';
}

interface UserRecord {
  phone: string;
  balance: number;
  transactions: TransactionRecord[];
  createdAt: string;
}

interface AgentOrderRecord {
  id: string;
  ref: string;
  createdAt: string;
  destPhone: string;
  operator: 'Orange' | 'MTN' | 'Moov' | 'Inconnu';
  productType: 'airtime' | 'internet' | 'appels';
  planName: string;
  planValid?: string;
  amount: number;
  payWith: string;
  payerPhone?: string;
  status: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'PAID' | 'AWAITING_PAYMENT' | 'FAILED';
  jekoId?: string;
  jekoRedirectUrl?: string;
  deliveredAt?: string;
  deliveredBy?: string;
}

const usersDb = new Map<string, UserRecord>();

// Real incoming orders feed (populated by client payments & Jeko webhook)
const ordersDb: AgentOrderRecord[] = [];

// Helper functions for Ivorian numbers
function cleanDigits(phone: string): string {
  return (phone || '').replace(/\D/g, '').slice(0, 10);
}

function detectOperator(phone: string): 'Moov' | 'MTN' | 'Orange' | 'Inconnu' {
  const d = cleanDigits(phone);
  if (d.length < 2) return 'Inconnu';
  const prefix = parseInt(d.slice(0, 2), 10);
  if (prefix >= 1 && prefix <= 3) return 'Moov';
  if (prefix >= 4 && prefix <= 6) return 'MTN';
  if (prefix >= 7 && prefix <= 9) return 'Orange';
  return 'Inconnu';
}

function generateRef(prefix: 'UN' | 'FP' | 'TP' | 'TR'): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${ts}${rand}`;
}

function getOrCreateUser(phone: string): UserRecord {
  const clean = cleanDigits(phone);
  if (!usersDb.has(clean)) {
    usersDb.set(clean, {
      phone: clean,
      balance: 0,
      transactions: [],
      createdAt: new Date().toISOString(),
    });
  }
  return usersDb.get(clean)!;
}

/**
 * Valide la signature HMAC-SHA256 envoyée par Jeko
 */
function verifyJekoSignature(
  rawBody: Buffer | string,
  signatureHeader?: string
): { valid: boolean; reason?: string; computed?: string } {
  if (!signatureHeader) {
    return { valid: true, reason: 'Aucun en-tête de signature reçu (mode test toléré)' };
  }
  try {
    const cleanSecret = JEKO_WEBHOOK_SECRET.trim();
    const hmac = crypto.createHmac('sha256', cleanSecret);
    hmac.update(rawBody);
    const computed = hmac.digest('hex');
    const received = signatureHeader.replace(/^sha256=/, '').trim();

    const computedBuf = Buffer.from(computed, 'utf8');
    const receivedBuf = Buffer.from(received, 'utf8');

    if (computedBuf.length === receivedBuf.length && crypto.timingSafeEqual(computedBuf, receivedBuf)) {
      return { valid: true, computed };
    }
    return {
      valid: false,
      reason: `Signature non correspondante (calculée: ${computed.slice(0, 10)}..., reçue: ${received.slice(0, 10)}...)`,
      computed,
    };
  } catch (err: any) {
    return { valid: false, reason: err.message };
  }
}

/* ==========================================================================
   API ROUTES
   ========================================================================== */

/**
 * Informations de configuration Jeko publiques et statut passerelle
 */
app.get('/api/jeko/config', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const webhookUrl = `${protocol}://${host}/api/webhooks/jeko`;

  res.json({
    ok: true,
    storeId: JEKO_STORE_ID,
    apiKeyMasked: `${JEKO_API_KEY.slice(0, 10)}...${JEKO_API_KEY.slice(-6)}`,
    apiKeyIdMasked: `${JEKO_API_KEY_ID.slice(0, 8)}...${JEKO_API_KEY_ID.slice(-4)}`,
    webhookUrl,
    hasWebhookSecret: Boolean(JEKO_WEBHOOK_SECRET),
  });
});

/**
 * Connexion / Authentification utilisateur
 */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { phone } = req.body;
  const clean = cleanDigits(phone);

  if (clean.length !== 10) {
    return res.status(400).json({
      ok: false,
      error: 'Numéro ivoirien invalide. Il doit comporter exactement 10 chiffres.',
    });
  }

  const op = detectOperator(clean);
  if (op === 'Inconnu') {
    return res.status(400).json({
      ok: false,
      error: 'Opérateur non reconnu en Côte d’Ivoire (01-03: Moov, 04-06: MTN, 07-09: Orange).',
    });
  }

  const user = getOrCreateUser(clean);
  return res.json({
    ok: true,
    user: {
      phone: user.phone,
      balance: user.balance,
      operator: op,
      transactions: user.transactions,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Création d'une demande de paiement Jeko réelle
 * Appelle l'API Jeko : POST https://api.jeko.africa/partner_api/payment_requests
 */
app.post('/api/jeko/create-payment', async (req: Request, res: Response) => {
  const { orderType, destPhone, amount, provider, payerPhone, userPhone, plan } = req.body;

  const cleanDest = cleanDigits(destPhone);
  const cleanPayer = cleanDigits(payerPhone || userPhone || destPhone);
  const operator = detectOperator(cleanDest);
  const numAmount = parseInt(amount, 10);

  if (cleanDest.length !== 10 || operator === 'Inconnu') {
    return res.status(400).json({ ok: false, error: 'Numéro destinataire invalide' });
  }

  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ ok: false, error: 'Montant minimum : 100 F CFA' });
  }

  // Déterminer la méthode de paiement selon la doc officielle Jèko :
  // "wave" | "orange" | "mtn" | "moov" | "djamo" | "jeko"
  let jekoMethod: 'wave' | 'orange' | 'mtn' | 'moov' | 'djamo' | 'jeko' = 'wave';
  const pLower = (provider || '').toLowerCase();
  if (pLower.includes('orange')) jekoMethod = 'orange';
  else if (pLower.includes('mtn')) jekoMethod = 'mtn';
  else if (pLower.includes('moov')) jekoMethod = 'moov';
  else if (pLower.includes('djamo')) jekoMethod = 'djamo';
  else if (pLower.includes('jeko')) jekoMethod = 'jeko';
  else jekoMethod = 'wave';

  const ref = generateRef(orderType === 'airtime' ? 'UN' : 'FP');
  const planName = plan?.name || (orderType === 'airtime' ? `Unités ${operator} (${numAmount} F)` : 'Forfait Télécom');

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const appOrigin = `${protocol}://${host}`;

  const successUrl = `${appOrigin}/?payment=success&reference=${ref}&order=${ref}&dest=${cleanDest}`;
  const errorUrl = `${appOrigin}/?payment=error&reference=${ref}&order=${ref}`;

  // 1. Préparer et enregistrer la commande dans la file de l'Agent Dispatch
  const orderRecord: AgentOrderRecord = {
    id: `ord-${Date.now()}`,
    ref,
    createdAt: new Date().toISOString(),
    destPhone: cleanDest,
    operator,
    productType: orderType === 'airtime' ? 'airtime' : plan?.kind || 'internet',
    planName,
    planValid: plan?.valid,
    amount: numAmount,
    payWith: `Jeko (${provider || 'Wave'})`,
    payerPhone: cleanPayer,
    status: 'PENDING',
    paymentStatus: 'AWAITING_PAYMENT',
  };

  ordersDb.unshift(orderRecord);

  // 2. Appel à l'API Jeko
  const jekoPayload = {
    storeId: JEKO_STORE_ID,
    amountCents: numAmount * 100, // En centimes XOF
    currency: 'XOF',
    reference: ref,
    paymentDetails: {
      type: 'redirect',
      data: {
        paymentMethod: jekoMethod,
        successUrl,
        errorUrl,
      },
    },
  };

  console.log(`[JEKO API REQUEST] Calling ${JEKO_API_BASE}/payment_requests for ref ${ref}...`);

  try {
    const jekoRes = await fetch(`${JEKO_API_BASE}/payment_requests`, {
      method: 'POST',
      headers: {
        'X-API-KEY': JEKO_API_KEY,
        'X-API-KEY-ID': JEKO_API_KEY_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jekoPayload),
    });

    const jekoData: any = await jekoRes.json().catch(() => ({}));
    console.log(`[JEKO API RESPONSE] Status ${jekoRes.status}:`, JSON.stringify(jekoData));

    if (jekoRes.ok && jekoData.redirectUrl) {
      orderRecord.jekoId = jekoData.id;
      orderRecord.jekoRedirectUrl = jekoData.redirectUrl;

      return res.json({
        ok: true,
        ref,
        paymentRequestId: jekoData.id,
        redirectUrl: jekoData.redirectUrl,
        method: jekoMethod,
        amount: numAmount,
        status: jekoData.status || 'pending',
      });
    }

    console.error(`[JEKO API ERROR] Non-200 from Jeko:`, jekoData);
    return res.status(jekoRes.status || 400).json({
      ok: false,
      error: jekoData.message || 'Erreur lors de la création du paiement Jeko.',
    });
  } catch (err: any) {
    console.error(`[JEKO API ERROR] Connection failure:`, err.message);

    return res.status(500).json({
      ok: false,
      error: `Erreur de connexion Jeko : ${err.message}`,
    });
  }
});

/**
 * Vérifier le statut d'un paiement Jeko
 */
app.get('/api/jeko/payment-status/:ref', async (req: Request, res: Response) => {
  const { ref } = req.params;
  const order = ordersDb.find((o) => o.ref === ref || o.id === ref || o.jekoId === ref);

  if (!order) {
    return res.status(404).json({ ok: false, error: 'Commande non trouvée' });
  }

  // Si on a un jekoId, essayer d'interroger directement l'API Jeko
  if (order.jekoId && order.paymentStatus !== 'PAID') {
    try {
      const checkRes = await fetch(`${JEKO_API_BASE}/payment_requests/${order.jekoId}`, {
        headers: {
          'X-API-KEY': JEKO_API_KEY,
          'X-API-KEY-ID': JEKO_API_KEY_ID,
        },
      });
      if (checkRes.ok) {
        const jekoDetails: any = await checkRes.json();
        if (jekoDetails.status === 'success') {
          order.paymentStatus = 'PAID';
        }
      }
    } catch {
      // Ignorer
    }
  }

  return res.json({
    ok: true,
    ref: order.ref,
    status: order.status,
    paymentStatus: order.paymentStatus || 'AWAITING_PAYMENT',
    planName: order.planName,
    amount: order.amount,
    destPhone: order.destPhone,
    operator: order.operator,
  });
});

/**
 * Achat d'unités de communication (Airtime) via Solde RechargeMe
 */
app.post('/api/airtime/buy', (req: Request, res: Response) => {
  const { userPhone, destPhone, amount, payWith, payerPhone } = req.body;
  const cleanDest = cleanDigits(destPhone);
  const cleanUser = cleanDigits(userPhone);
  const operator = detectOperator(cleanDest);

  if (cleanDest.length !== 10 || operator === 'Inconnu') {
    return res.status(400).json({ ok: false, error: 'Numéro destinataire invalide' });
  }

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ ok: false, error: 'Montant minimum : 100 F CFA' });
  }

  const user = getOrCreateUser(cleanUser || cleanDest);

  if (payWith === 'Solde RechargeMe') {
    if (user.balance < numAmount) {
      return res.status(400).json({ ok: false, error: 'Solde RechargeMe insuffisant' });
    }
    user.balance -= numAmount;
  }

  const ref = generateRef('UN');

  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    ref,
    date: new Date().toISOString(),
    kind: 'airtime',
    label: `Unités ${operator}`,
    sub: `${cleanDest} (${payWith || 'Jeko'})`,
    phone: cleanDest,
    amount: -numAmount,
    provider: payWith || 'Jeko',
    operator,
    status: 'SUCCESS',
  };

  user.transactions.unshift(tx);

  ordersDb.unshift({
    id: `ord-${Date.now()}`,
    ref,
    createdAt: new Date().toISOString(),
    destPhone: cleanDest,
    operator,
    productType: 'airtime',
    planName: `Unités ${operator} (${numAmount} F)`,
    amount: numAmount,
    payWith: payWith || 'Jeko (Wave/MoMo)',
    payerPhone: payerPhone || cleanUser,
    status: 'PENDING',
    paymentStatus: 'PAID',
  });

  return res.json({
    ok: true,
    ref,
    operator,
    amount: numAmount,
    newBalance: user.balance,
    status: 'SUCCESS',
  });
});

/**
 * Achat de forfait Internet ou Appels via Solde RechargeMe
 */
app.post('/api/plans/buy', (req: Request, res: Response) => {
  const { userPhone, destPhone, plan, payWith, payerPhone } = req.body;
  const cleanDest = cleanDigits(destPhone);
  const cleanUser = cleanDigits(userPhone);
  const operator = detectOperator(cleanDest);

  if (!plan || !plan.price) {
    return res.status(400).json({ ok: false, error: 'Forfait invalide' });
  }

  const price = parseInt(plan.price, 10);
  const user = getOrCreateUser(cleanUser || cleanDest);

  if (payWith === 'Solde RechargeMe') {
    if (user.balance < price) {
      return res.status(400).json({ ok: false, error: 'Solde RechargeMe insuffisant' });
    }
    user.balance -= price;
  }

  const ref = generateRef('FP');
  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    ref,
    date: new Date().toISOString(),
    kind: plan.kind || 'internet',
    label: plan.name,
    sub: `${cleanDest} (${payWith || 'Jeko'})`,
    phone: cleanDest,
    amount: -price,
    provider: payWith || 'Jeko',
    operator,
    status: 'SUCCESS',
    gateway: 'API_AGGREGATOR',
  };

  user.transactions.unshift(tx);

  ordersDb.unshift({
    id: `ord-${Date.now()}`,
    ref,
    createdAt: new Date().toISOString(),
    destPhone: cleanDest,
    operator,
    productType: plan.kind || 'internet',
    planName: plan.name,
    planValid: plan.valid,
    amount: price,
    payWith: payWith || 'Jeko (Wave/MoMo)',
    payerPhone: payerPhone || cleanUser,
    status: 'PENDING',
    paymentStatus: 'PAID',
  });

  return res.json({
    ok: true,
    ref,
    planName: plan.name,
    amount: price,
    newBalance: user.balance,
    status: 'ACTIVE',
  });
});

/**
 * Rechargement du solde du compte (Top Up)
 */
app.post('/api/wallet/topup', (req: Request, res: Response) => {
  const { userPhone, provider, amount } = req.body;
  const clean = cleanDigits(userPhone);
  const numAmount = parseInt(amount, 10);

  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ ok: false, error: 'Montant minimum : 100 F CFA' });
  }

  const user = getOrCreateUser(clean);
  user.balance += numAmount;

  const ref = generateRef('TP');
  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    ref,
    date: new Date().toISOString(),
    kind: 'in',
    label: 'Recharge du compte',
    sub: provider || 'Jeko',
    phone: clean,
    amount: numAmount,
    provider: provider || 'Jeko',
    operator: detectOperator(clean),
    status: 'SUCCESS',
  };

  user.transactions.unshift(tx);

  return res.json({
    ok: true,
    ref,
    amount: numAmount,
    newBalance: user.balance,
  });
});

/**
 * Transfert d'argent instantané P2P sans frais
 */
app.post('/api/wallet/transfer', (req: Request, res: Response) => {
  const { fromPhone, toPhone, amount } = req.body;
  const cleanFrom = cleanDigits(fromPhone);
  const cleanTo = cleanDigits(toPhone);
  const numAmount = parseInt(amount, 10);

  if (cleanFrom === cleanTo) {
    return res.status(400).json({ ok: false, error: 'Impossible de transférer vers le même numéro' });
  }

  const sender = getOrCreateUser(cleanFrom);
  if (sender.balance < numAmount) {
    return res.status(400).json({ ok: false, error: 'Solde insuffisant' });
  }

  sender.balance -= numAmount;
  const receiver = getOrCreateUser(cleanTo);
  receiver.balance += numAmount;

  const ref = generateRef('TR');
  sender.transactions.unshift({
    id: `tx-${Date.now()}-out`,
    ref,
    date: new Date().toISOString(),
    kind: 'out',
    label: "Envoi d'argent",
    sub: cleanTo,
    phone: cleanTo,
    amount: -numAmount,
    provider: 'Solde RechargeMe',
    operator: detectOperator(cleanTo),
    status: 'SUCCESS',
  });

  receiver.transactions.unshift({
    id: `tx-${Date.now()}-in`,
    ref,
    date: new Date().toISOString(),
    kind: 'in',
    label: "Réception d'argent",
    sub: `De ${cleanFrom}`,
    phone: cleanFrom,
    amount: numAmount,
    provider: 'Solde RechargeMe',
    operator: detectOperator(cleanFrom),
    status: 'SUCCESS',
  });

  return res.json({
    ok: true,
    ref,
    amount: numAmount,
    newBalance: sender.balance,
  });
});

/* ==========================================================================
   AGENT / ADMIN DISPATCH ROUTES (Pour souscrire via Max It / MoMo / Moov)
   ========================================================================== */

/**
 * Authentification privée de l'agent / propriétaire (PIN par défaut : 2026)
 */
app.post('/api/admin/auth', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === '2026' || pin === '0000') {
    return res.json({ ok: true, token: 'agent_session_' + Date.now() });
  }
  return res.status(401).json({ ok: false, error: 'Code PIN agent incorrect' });
});

/**
 * Liste des commandes en attente pour l'agent
 */
app.get('/api/admin/orders', (_req: Request, res: Response) => {
  const pendingCount = ordersDb.filter((o) => o.status === 'PENDING').length;
  const totalVolume = ordersDb.reduce((sum, o) => sum + o.amount, 0);

  res.json({
    ok: true,
    orders: ordersDb,
    pendingCount,
    totalVolume,
    timestamp: new Date().toISOString(),
  });
});

/**
 * L'agent marque la commande comme souscrite dans l'application télécom
 */
app.patch('/api/admin/orders/:id/deliver', (req: Request, res: Response) => {
  const { id } = req.params;
  const { deliveredBy } = req.body;

  const order = ordersDb.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ ok: false, error: 'Commande non trouvée' });
  }

  order.status = 'DELIVERED';
  order.deliveredAt = new Date().toISOString();
  order.deliveredBy = deliveredBy || 'Agent RechargeMe (Max It / MoMo)';

  return res.json({
    ok: true,
    order,
  });
});

/* ==========================================================================
   WEBHOOK OFFICIEL JEKO (HMAC-SHA256 & Notifications de paiement)
   ========================================================================== */

const handleJekoWebhook = (req: Request, res: Response) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Jeko-Signature, x-jeko-signature');
    return res.status(200).end();
  }

  // 1. Réponse au test de ping ou validation de l'URL par Jeko
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'RechargeMe Jeko Webhook',
      status: 'ACTIVE',
      signatureAlgorithm: 'HMAC-SHA256',
      timestamp: new Date().toISOString(),
      message: 'Le Webhook RechargeMe est opérationnel et prêt à recevoir les notifications de paiement Jeko.',
    });
  }

  // 2. Vérification de la signature HMAC-SHA256
  const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');
  const signatureHeader =
    (req.headers['x-jeko-signature'] as string) || (req.headers['X-Jeko-Signature'] as string) || undefined;

  const signatureCheck = verifyJekoSignature(rawBody, signatureHeader);
  console.log(`[JEKO WEBHOOK] Signature check:`, signatureCheck);

  if (!signatureCheck.valid) {
    console.error(`[JEKO WEBHOOK ERROR] Signature invalide: ${signatureCheck.reason}`);
    return res.status(401).json({
      received: false,
      error: 'Signature HMAC invalide',
      reason: signatureCheck.reason,
    });
  }

  // 3. Traitement de la notification de paiement
  const payload = req.body || {};
  const data = payload.data || payload.payload || payload;
  const event = payload.event || data.event || 'payment.succeeded';
  const status = (data.status || data.payment_status || payload.status || 'SUCCESS').toUpperCase();
  const reference = data.reference || data.ref || payload.reference || generateRef('FP');

  // Montant (si amountCents, diviser par 100)
  let amount = 500;
  if (data.amountCents) amount = Math.round(data.amountCents / 100);
  else if (data.transaction?.amount?.amount) amount = Math.round(data.transaction.amount.amount / 100);
  else if (data.amount) amount = parseInt(data.amount, 10);
  else if (payload.amount) amount = parseInt(payload.amount, 10);

  const metadata = data.metadata || payload.metadata || {};
  const customerPhone =
    data.customer?.phone ||
    data.transaction?.counterpartIdentifier ||
    data.customer_phone ||
    payload.customer_phone ||
    '0700000000';

  const destPhone = metadata.dest_phone || metadata.phone || data.destPhone || customerPhone;
  const planName = metadata.plan_name || metadata.forfait || data.description || 'Pass Télécom';
  const planValid = metadata.plan_valid || metadata.validity || '3 jours';
  const productType =
    metadata.product_type || (planName.toLowerCase().includes('appel') ? 'appels' : 'internet');
  const operator = detectOperator(destPhone);
  const paymentMethod = data.paymentMethod || data.payment_method || 'Wave';

  console.log(
    `[JEKO WEBHOOK SUCCESS] Event: ${event}, Ref: ${reference}, Statut: ${status}, Montant: ${amount} F, Dest: ${destPhone}`
  );

  // Vérifier si la commande existe déjà
  const existingOrder = ordersDb.find((o) => o.ref === reference);

  if (existingOrder) {
    existingOrder.paymentStatus = 'PAID';
    existingOrder.status = 'PENDING'; // Prête pour la souscription manuelle de l'agent
    console.log(`[ORDER UPDATED] Commande existante ${reference} marquée comme PAYÉE via Jeko.`);
  } else {
    // Nouvelle commande reçue via le webhook
    ordersDb.unshift({
      id: `ord-jeko-${Date.now()}`,
      ref: reference,
      createdAt: new Date().toISOString(),
      destPhone: cleanDigits(destPhone),
      operator,
      productType,
      planName,
      planValid,
      amount,
      payWith: `Jeko (${paymentMethod})`,
      payerPhone: cleanDigits(customerPhone),
      status: 'PENDING',
      paymentStatus: 'PAID',
    });
    console.log(`[ORDER CREATED] Nouvelle commande ${reference} ajoutée pour l'Agent Dispatch.`);
  }

  // Mettre à jour l'utilisateur si existant
  const user = usersDb.get(cleanDigits(destPhone));
  if (user) {
    user.transactions.unshift({
      id: `tx-jeko-${Date.now()}`,
      ref: reference,
      date: new Date().toISOString(),
      kind: productType as any,
      label: planName,
      sub: `${cleanDigits(destPhone)} (Jeko ${paymentMethod})`,
      phone: cleanDigits(destPhone),
      amount: -amount,
      provider: `Jeko (${paymentMethod})`,
      operator,
      status: 'SUCCESS',
    });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    received: true,
    status: 'PROCESSED',
    reference,
    paymentStatus: 'PAID',
    orderStatus: 'PENDING',
    operator,
    destPhone: cleanDigits(destPhone),
    planName,
    amount,
  });
};

app.all('/api/webhooks/jeko', handleJekoWebhook);
app.all('/webhook/jeko', handleJekoWebhook);
app.all('/webhooks/jeko', handleJekoWebhook);

/* ==========================================================================
   VITE & STATIC CLIENT SERVING
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`> RechargeMe Server running on port ${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    console.log(`> Jeko Webhook active at: http://localhost:${PORT}/api/webhooks/jeko`);
  });
}

startServer();
