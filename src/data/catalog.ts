import { Operator, Plan, PlanKind } from '../types';

/**
 * Numéro officiel du support client (WhatsApp & Téléphone)
 * Format international: indicatif Côte d'Ivoire (225) + numéro
 */
export const SUPPORT = '2250700000000';

export const PROVIDERS = ['Wave', 'MTN Money', 'Orange Money', 'Moov Money'] as const;

/**
 * CATALOGUE OFFICIEL DES FORFAITS (Côte d'Ivoire)
 * Format source: [nom, validité, prix]
 */
export const CATALOG: Record<Operator, { internet: [string, string, number][]; appels: [string, string, number][] }> = {
  MTN: {
    internet: [
      ['Internet 2 Jours (400 Mo)', '2 jours', 200],
      ['Pass c’chic 650 Mo', '1 jour', 200],
      ['Internet 3 Jours (800 Mo)', '3 jours', 300],
      ['Pass c’chic 900 Mo', '1 jour', 300],
      ['Internet 3 Jours+ (1,2 Go)', '3 jours', 500],
      ['Pass c’chic 1,5 Go', '3 jours', 500],
      ['Pass c’chic 1,5 Go + 60 min', '7 jours', 700],
      ['Internet Week (2,5 Go)', '7 jours', 1000],
      ['Pass c’chic 5 Go', '7 jours', 1500],
      ['Internet Mois (5 Go)', '30 jours', 2500],
      ['Pass c’chic 7,5 Go', '10 jours', 2500],
      ['Internet Mois Medium (12 Go)', '30 jours', 5000],
      ['Pass c’chic 15 Go', '21 jours', 5000],
      ['Internet Mois Max (25 Go)', '30 jours', 10000],
    ],
    appels: [
      ['Appels Day+ (15 min)', '1 jour', 200],
      ['Pass c’chic 20 min', '2 jours', 200],
      ['Appels 3 Jours (25 min)', '3 jours', 300],
      ['Pass c’chic 35 min', '3 jours', 300],
      ['Appels Week (45 min)', '7 jours', 500],
      ['Pass c’chic 65 min', '5 jours', 500],
      ['Pass c’chic 60 min + 1,5 Go', '7 jours', 700],
      ['Appels 10 Jours (90 min)', '10 jours', 1000],
      ['Pass c’chic 140 min', '10 jours', 1000],
      ['Pass c’chic 210 min', '15 jours', 1500],
      ['Pass c’chic 280 min', '15 jours', 2000],
      ['Appels Mois (300 min)', '30 jours', 2500],
      ['Pass c’chic 400 min', '30 jours', 3000],
      ['Pass c’chic 700 min', '30 jours', 5000],
      ['Appels Premium (1500 min)', '30 jours', 10000],
      ['Appels Max (3200 min)', '30 jours', 20000],
    ],
  },
  Orange: {
    internet: [
      ['Internet 200 Mo', '1 jour', 200],
      ['Pass Nuit 2 Go', '22h-7h', 250],
      ['Internet 300 Mo', '1 jour', 300],
      ['Pass Mix 27 min + 50 Mo', '3 jours', 300],
      ['Internet 750 Mo', '1 jour', 500],
      ['Pass Spécial 1,5 Go', '3 jours', 500],
      ['Pass Mix 50 min + 250 Mo', '7 jours', 500],
      ['Pass Social 7j', '7 jours', 500],
      ['Pass Spécial 750 Mo', '1 jour', 700],
      ['Internet 1,5 Go', '3 jours', 1000],
      ['Pass Mix 100 min + 1 Go', '7 jours', 1000],
      ['Internet 2,5 Go', '7 jours', 1500],
      ['Pass Mix 200 min + 1,5 Go', '7 jours', 1500],
      ['Internet 3,5 Go', '7 jours', 2500],
      ['Pass Mix Mini (4 Go)', '30 jours', 3000],
      ['Pass Mix Medium (8 Go)', '30 jours', 5000],
      ['Pass Data+ 10 Go', '30 jours', 5000],
      ['Pass Mix Large (18 Go)', '30 jours', 10000],
      ['Pass Mix XL (40 Go)', '30 jours', 20000],
    ],
    appels: [
      ['Appels 17 min + 50 Mo', '3 jours', 200],
      ['Appels 27 min + 100 Mo', '3 jours', 300],
      ['Pass Mix 50 min + 250 Mo', '7 jours', 500],
      ['Pass Mix 100 min + 1 Go', '7 jours', 1000],
      ['Pass Mix 200 min + 1,5 Go', '7 jours', 1500],
      ['Pass Mix 250 min + 2,5 Go', '30 jours', 5000],
      ['Pass Mix Illimité 500 min', '30 jours', 10000],
    ],
  },
  Moov: {
    internet: [
      ['Internet 150 Mo', '2 jours', 150],
      ['Internet 200 Mo', '1 jour', 200],
      ['Réseaux Sociaux 500 Mo', '1 jour', 200],
      ['Internet Moov Folie Day', '1 jour', 200],
      ['Internet 500 Mo', '1 jour', 300],
      ['Pass TikTok 1 Go', '3 jours', 300],
      ['Internet Illimité 1h', '1 heure', 300],
      ['Internet Moov Folie 900 Mo', '1 jour', 300],
      ['Internet 1 Go', '3 jours', 500],
      ['Internet Illimité 2h', '2 heures', 500],
      ['Internet Moov Folie 3 Jours', '3 jours', 500],
      ['Internet 1024 Mo', '7 jours', 750],
      ['Moov Folie 2,5 Go', '5 jours', 750],
      ['Internet 2 Go', '7 jours', 1000],
      ['Internet Moov Folie 4 Go', '7 jours', 1000],
      ['Internet Illimité 6h', '6 heures', 1300],
      ['Internet 3 Go', '7 jours', 1500],
      ['Internet Moov Folie 6 Go', '10 jours', 1500],
      ['Internet 5 Go', '10 jours', 2000],
      ['Internet 3 Go Mois', '30 jours', 2000],
      ['Internet Moov Folie 10 Go', '15 jours', 2500],
      ['Internet 7,4 Go', '30 jours', 4900],
      ['Internet 10 Go', '30 jours', 5000],
      ['Internet 22 Go', '30 jours', 9900],
      ['Internet 50 Go', '30 jours', 19900],
      ['Internet 150 Go', '30 jours', 24000],
      ['Internet 300 Go', '30 jours', 29000],
    ],
    appels: [
      ['Appels 17 min + 25 Mo', '1 jour', 200],
      ['Moov Folie 20 min + 150 Mo', '1 jour', 200],
      ['Pass Nuit 30 min + 2 Go', '22h-7h', 200],
      ['Pass Mix 27 min + 100 Mo', '3 jours', 300],
      ['Moov Folie 35 min + 400 Mo', '1 jour', 300],
      ['Pass Mix 50 min + 250 Mo', '7 jours', 500],
      ['Moov Folie 60 min + 1 Go', '2 jours', 500],
      ['Moov Folie 1h + 1 Go', '5 jours', 700],
      ['Pass Mix 100 min + 1 Go', '10 jours', 1000],
      ['Moov Folie 120 min + 2,5 Go', '5 jours', 1000],
      ['Pass Mix 200 min + 1,5 Go', '15 jours', 1500],
      ['Pass Mix 250 min + 2,5 Go', '30 jours', 2500],
      ['Pass Mix 500 min + 5 Go', '30 jours', 5000],
      ['Pass Mix 830 min + 10 Go', '30 jours', 10000],
      ['Pass Mix 1660 min + 20 Go', '30 jours', 20000],
    ],
  },
};

/**
 * Convert raw catalog entries to structured Plan objects
 */
export const getCatalogPlans = (op: Operator, kind: PlanKind): Plan[] => {
  const plans = (CATALOG[op] || {})[kind] || [];
  return plans.map((p, i) => {
    const valid = p[1];
    let days = 1;
    if (/mois/i.test(valid)) {
      days = 30;
    } else if (/h/i.test(valid) && !/jour/i.test(valid)) {
      days = 1;
    } else {
      const match = valid.match(/\d+/);
      days = match ? parseInt(match[0], 10) : 1;
    }

    return {
      id: `${op}-${kind}-${i}`,
      name: p[0],
      valid: p[1],
      days,
      price: p[2],
      kind,
      operator: op,
    };
  });
};

/**
 * Format currency in FCFA (standard XOF format)
 */
export const fmtCFA = (amount: number): string => {
  return `${Math.abs(amount).toLocaleString('fr-FR')}\u00A0F CFA`;
};

/**
 * Strip all non-digit characters and limit to 10 characters (CI format)
 */
export const digits = (s: string): string => {
  return (s || '').replace(/\D/g, '').slice(0, 10);
};

/**
 * Format standard Ivorian 10-digit number as "07 00 00 00 00"
 */
export const prettyPhone = (p: string): string => {
  const d = digits(p);
  return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

/**
 * Detect Côte d'Ivoire mobile network operator:
 * 01, 02, 03 -> Moov Africa
 * 04, 05, 06 -> MTN
 * 07, 08, 09 -> Orange
 */
export const getOperator = (phone: string): Operator | null => {
  const d = digits(phone);
  if (d.length < 2) return null;
  const prefix = parseInt(d.slice(0, 2), 10);
  if (prefix >= 1 && prefix <= 3) return 'Moov';
  if (prefix >= 4 && prefix <= 6) return 'MTN';
  if (prefix >= 7 && prefix <= 9) return 'Orange';
  return null;
};

/**
 * Validate Ivorian phone number (exact 10 digits and recognized operator)
 */
export const isValidPhone = (phone: string): boolean => {
  const d = digits(phone);
  return d.length === 10 && !!getOperator(d);
};

export const OPERATOR_COLORS: Record<Operator, { bg: string; text: string; border: string; accent: string }> = {
  Orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-500',
    accent: '#FF7900',
  },
  MTN: {
    bg: 'bg-amber-400',
    text: 'text-black',
    border: 'border-amber-400',
    accent: '#FFCC00',
  },
  Moov: {
    bg: 'bg-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
    accent: '#0B63CE',
  },
};
