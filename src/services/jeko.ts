/**
 * Module Officiel d'intégration Jèko Partner API & Webhook (Documentation Jèko Checkout)
 * Conforme à la spécification technique Jèko :
 * - POST /partner_api/payment_requests
 * - GET  /partner_api/payment_requests/{id}
 * - Validation HMAC-SHA256 pour Webhooks
 */

export const JEKO_CONFIG = {
  API_BASE_URL: 'https://api.jeko.africa/partner_api',
  STORE_ID: 'd4365c1e-b68a-46c4-a0fb-49d92c4c43c8',
  API_KEY: 'jeko_4e6af80c6279a8112d7813a11e4863b1b9dbabc26fbaaedb106be041c7f0f6da',
  // Nouveau secret généré suite à la création du webhook direct (IMG_1545)
  WEBHOOK_SECRET: '533e792aaaf1369cec78cdcda70d3abcce36d40fd34cfdb6df088e4323a4fe7a',
  CURRENCY: 'XOF',
} as const;

/**
 * Moyens de paiement supportés par l'API Jèko :
 * "wave"   : Wave Mobile Money
 * "orange" : Orange Money CI
 * "mtn"    : MTN Mobile Money CI
 * "moov"   : Moov Money CI
 * "djamo"  : DJAMO
 * "jeko"   : Compte Jèko
 */
export type JekoPaymentMethod = 'wave' | 'orange' | 'mtn' | 'moov' | 'djamo' | 'jeko';

export function mapProviderToJekoMethod(provider: string): JekoPaymentMethod {
  const p = (provider || '').toLowerCase();
  if (p.includes('orange')) return 'orange';
  if (p.includes('mtn')) return 'mtn';
  if (p.includes('moov')) return 'moov';
  if (p.includes('djamo')) return 'djamo';
  if (p.includes('jeko')) return 'jeko';
  return 'wave'; // Par défaut Wave
}

export interface JekoCreatePaymentPayload {
  storeId: string;
  amountCents: number; // Montant en centimes (ex: 500 F CFA = 50000)
  currency: 'XOF';
  reference: string; // 5 à 100 caractères
  paymentDetails: {
    type: 'redirect';
    data: {
      paymentMethod: JekoPaymentMethod;
      successUrl: string;
      errorUrl: string;
    };
  };
}

export interface JekoPaymentResponse {
  id: string;
  storeId: string;
  reference: string;
  type: 'redirect';
  paymentMethod: JekoPaymentMethod;
  status: 'pending' | 'success' | 'failed' | 'expired';
  redirectUrl: string;
  errorReason?: string | null;
}

export interface JekoCheckStatusResponse {
  id: string;
  storeId: string;
  reference: string;
  type: string;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed';
  transaction?: {
    id: string;
    amount: {
      amount: number;
      currency: string;
    };
    fees?: {
      amount: number;
      currency: string;
    };
    status: string;
    counterpartLabel?: string;
    counterpartIdentifier?: string;
    description?: string;
    executedAt?: string;
  };
}
