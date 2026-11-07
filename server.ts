import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory persistent database for the backend session
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

const usersDb = new Map<string, UserRecord>();

// Helper functions for Ivorian telecom numbers
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

// Generate the exact USSD command executed by SIM Banks or USSD modems in CI
function getUssdSimulation(operator: string, phone: string, amount: number): string {
  switch (operator) {
    case 'Orange':
      // Code USSD standard des puces Master Orange Distributeur (Orange Money / E-Recharge)
      return `*144*2*1*${phone}*${amount}*XXXX#`;
    case 'MTN':
      // Code USSD Easy'n MTN revendeur
      return `*105*1*${phone}*${amount}*XXXX#`;
    case 'Moov':
      // Code USSD Moov Épargne / Flotte revendeur
      return `*155*2*${phone}*${amount}*XXXX#`;
    default:
      return `*100*${phone}*${amount}*XXXX#`;
  }
}

function getOrCreateUser(phone: string): UserRecord {
  const clean = cleanDigits(phone);
  if (!usersDb.has(clean)) {
    usersDb.set(clean, {
      phone: clean,
      balance: 7000,
      transactions: [],
      createdAt: new Date().toISOString(),
    });
  }
  return usersDb.get(clean)!;
}

/* ==========================================================================
   API ROUTES (/api/*) - Backend similaire à TransfertCI, Djamo, CinetPay
   ========================================================================== */

/**
 * Statut des passerelles télécoms (Simulation de monitoring des puces et APIs)
 */
app.get('/api/telecom/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    region: "Côte d'Ivoire (CI / 225)",
    networks: {
      Orange: {
        status: 'UP',
        latencyMs: 140,
        gatewayMode: 'API_DIRECT_B2B + SIM_GATEWAY_BACKUP',
        simBalanceCfa: 450000,
      },
      MTN: {
        status: 'UP',
        latencyMs: 180,
        gatewayMode: 'MTN_MOMO_OPENAPI + USSD_MASTER',
        simBalanceCfa: 380000,
      },
      Moov: {
        status: 'UP',
        latencyMs: 220,
        gatewayMode: 'MOOV_B2B_AGGREGATOR + SIM_SERVER',
        simBalanceCfa: 290000,
      },
    },
    paymentMethods: {
      Wave: 'WAVE_MERCHANT_CHECKOUT_API_v1',
      OrangeMoney: 'ORANGE_OM_WEB_PAYMENT_CI',
      MTNMoMo: 'MTN_COLLECTION_API',
      MoovMoney: 'MOOV_FLOOT_PAY_v2',
    },
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
 * Achat d'unités de communication (Airtime)
 * Comment TransfertCI fait : encaissement puis commande USSD / API Télécom
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

  // Si paiement avec solde RechargeMe
  if (payWith === 'Solde RechargeMe') {
    if (user.balance < numAmount) {
      return res.status(400).json({ ok: false, error: 'Solde RechargeMe insuffisant' });
    }
    user.balance -= numAmount;
  }

  const ref = generateRef('UN');
  const ussd = getUssdSimulation(operator, cleanDest, numAmount);

  const tx: TransactionRecord = {
    id: `tx-${Date.now()}`,
    ref,
    date: new Date().toISOString(),
    kind: 'airtime',
    label: `Unités ${operator}`,
    sub: `${cleanDest} (${payWith || 'Solde'})`,
    phone: cleanDest,
    amount: -numAmount,
    provider: payWith || 'Solde RechargeMe',
    operator,
    status: 'SUCCESS',
    ussdCommand: ussd,
    gateway: 'USSD_GATEWAY',
  };

  user.transactions.unshift(tx);

  return res.json({
    ok: true,
    ref,
    operator,
    amount: numAmount,
    newBalance: user.balance,
    delivery: {
      method: 'TELECOM_IN_GATEWAY',
      ussdSimulated: ussd,
      estimatedDeliveryTime: '3 secondes',
      status: 'DELIVERED',
    },
  });
});

/**
 * Achat de forfait Internet ou Appels
 */
app.post('/api/plans/buy', (req: Request, res: Response) => {
  const { userPhone, destPhone, plan, payWith } = req.body;
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
    sub: `${cleanDest} (${payWith || 'Solde'})`,
    phone: cleanDest,
    amount: -price,
    provider: payWith || 'Solde RechargeMe',
    operator,
    status: 'SUCCESS',
    gateway: 'API_AGGREGATOR',
  };

  user.transactions.unshift(tx);

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
    sub: provider || 'Wave',
    phone: clean,
    amount: numAmount,
    provider: provider || 'Wave',
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

/**
 * Webhook de simulation pour encaissements Wave / CinetPay / MoMo
 */
app.post('/api/webhooks/payment', (req: Request, res: Response) => {
  const { event, transaction_id, status, amount, metadata } = req.body;
  // Simulation de réception d'un webhook officiel
  res.json({
    received: true,
    processedAt: new Date().toISOString(),
    event,
    status: 'ACKNOWLEDGED',
  });
});

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
  });
}

startServer();
