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
      ['Internet 2 Jours', '2 jours', 200],
      ['Pass c’chic 650 Mo', '1 jour', 200],
      ['Internet 3 Jours', '3 jours', 300],
      ['Pass c’chic 900 Mo', '1 jour', 300],
      ['Internet 3 Jours+', '3 jours', 500],
      ['Pass c’chic 1,5 Go', '3 jours', 500],
      ['Pass c’chic 1,5 Go + 60 min', '7 jours', 700],
      ['Internet Week', '7 jours', 1000],
      ['Pass c’chic 5 Go', '7 jours', 1500],
      ['Internet Mois', '30 jours', 2500],
      ['Pass c’chic 7,5 Go', '10 jours', 2500],
      ['Internet Mois Medium', '30 jours', 5000],
      ['Pass c’chic 15 Go', '21 jours', 5000],
      ['Internet Mois Max', '30 jours', 10000],
    ],
    appels: [
      ['Appels Day+', '1 jour', 200],
      ['Appels 15 min', '1 jour', 200],
      ['Pass c’chic 20 min', '2 jours', 200],
      ['Appels 3 Jours', '3 jours', 300],
      ['Appels 27 min + Internet 50 Mo', '3 jours', 300],
      ['Pass c’chic 35 min', '3 jours', 300],
      ['Appels Week', '7 jours', 500],
      ['Pass c’chic 65 min', '5 jours', 500],
      ['Pass c’chic 1,5 Go + 60 min', '7 jours', 700],
      ['Appels 10 Jours', '10 jours', 1000],
      ['Pass c’chic 140 min', '10 jours', 1000],
      ['Pass c’chic 210 min', '15 jours', 1500],
      ['Pass c’chic 280 min', '15 jours', 2000],
      ['Appels Mois', '30 jours', 2500],
      ['Pass c’chic 400 min', '30 jours', 3000],
      ['Pass c’chic 700 min', '30 jours', 5000],
      ['Appels Premium', '30 jours', 10000],
      ['Appels Max', '30 jours', 20000],
    ],
  },
  Orange: {
    internet: [
      ['Internet 200 Mo', '1 jour', 200],
      ['Pass nuit 2 Go illimité numéro préféré', '22h-7h', 250],
      ['Internet 300 Mo', '1 jour', 300],
      ['Appels 27 min + Internet 50 Mo', '3 jours', 300],
      ['Internet 750 Mo', '1 jour', 500],
      ['Pass 50 min TRS + 300 SMS + 250 Mo', '7 jours', 500],
      ['Pass social', '7 jours', 500],
      ['Pass spécial 1,5 Go', '3 jours', 500],
      ['Pass spécial 750 Mo + vidéo cuisine', '1 jour', 700],
      ['Internet 1,5 Go', '3 jours', 1000],
      ['Pass 100 min + 1 Go + illimité + 150 Mo Spotify', '7 jours', 1000],
      ['Internet 2,5 Go', '7 jours', 1500],
      ['Pass 200 min TR + 1500 Mo + 300 SMS + illimité + 150 Mo Spotify', '7 jours', 1500],
      ['Internet 3,5 Go', '7 jours', 2500],
      ['Internet Pass Mix Mini', '30 jours', 3000],
      ['Internet Pass Mix Medium', '30 jours', 5000],
      ['Pass Data+ 30 jours', '30 jours', 5000],
      ['Pass 250 min + 2,5 Go + 500 SMS + illimité + 500 Mo Spotify', '1 mois', 5000],
      ['Internet Pass Mix Large', '30 jours', 10000],
      ['Internet Pass Mix XL', '30 jours', 20000],
    ],
    appels: [
      ['Appels 17 min + Internet 50 Mo', '3 jours', 200],
      ['Appels 27 min + Internet 100 Mo', '3 jours', 300],
      ['Appels 27 min + Internet 50 Mo', '3 jours', 300],
      ['Pass 50 min TRS + 300 SMS + 250 Mo', '7 jours', 500],
      ['Pass 100 min + 1 Go + illimité + 150 Mo Spotify', '7 jours', 1000],
      ['Pass 200 min TR + 1500 Mo + 300 SMS + illimité + 150 Mo Spotify', '7 jours', 1500],
      ['Pass 250 min + 2,5 Go + 500 SMS + illimité + 500 Mo Spotify', '30 jours', 5000],
      ['Pass 250 min + 2,5 Go + 500 SMS + illimité + 500 Mo Spotify', '1 mois', 5000],
    ],
  },
  Moov: {
    internet: [
      ['150 Mo - 2 jours', '2 jours', 150],
      ['Internet 200 Mo', '1 jour', 200],
      ['Réseaux sociaux - 500 Mo - 1 jour', '1 jour', 200],
      ['220 Mo - 2 jours', '2 jours', 200],
      ['Internet Moov Folie Day', '1 jour', 200],
      ['Internet 500 Mo', '1 jour', 300],
      ['TikTok - 1 Go - 3 jours', '3 jours', 300],
      ['340 Mo - 3 jours', '3 jours', 300],
      ['Internet illimité 1 heure', '1 heure', 300],
      ['Données illimitées 1h', '1 heure', 300],
      ['Internet Moov Folie 900Mo', '1 jour', 300],
      ['Internet 1 Go', '3 jours', 500],
      ['750 Mo - 3 jours', '3 jours', 500],
      ['Internet illimité 2 heures', '2 heures', 500],
      ['Données illimitées 2h', '2 heures', 500],
      ['Internet Moov Folie 3 Jours', '3 jours', 500],
      ['1024 Mo - 7 jours', '7 jours', 750],
      ['Internet Moov Folie 2,5Go 5j', '5 jours', 750],
      ['Moov Folie 2,5 Go (5j)', '5 jours', 750],
      ['Internet 2 Go', '7 jours', 1000],
      ['1,5 Go - 7 jours', '7 jours', 1000],
      ['Internet Moov Folie 4Go', '7 jours', 1000],
      ['Internet illimité 6 heures', '6 heures', 1300],
      ['Données illimitées 6h', '6 heures', 1300],
      ['Internet 3 Go', '7 jours', 1500],
      ['2,5 Go - 10 jours', '10 jours', 1500],
      ['Internet Moov Folie 6Go', '10 jours', 1500],
      ['Internet 5 Go', '10 jours', 2000],
      ['3 Go - 30 jours', '30 jours', 2000],
      ['Internet Moov Folie 10Go 15j', '15 jours', 2500],
      ['7,4 Go - 30 jours', '30 jours', 4900],
      ['Internet 10 Go', '30 jours', 5000],
      ['22 Go - 30 jours', '30 jours', 9900],
      ['Internet 20 Go', '30 jours', 10000],
      ['35 Go - 30 jours', '30 jours', 14900],
      ['50 Go - 30 jours', '30 jours', 19900],
      ['Internet 50 Go', '30 jours', 20000],
      ['150 Go', '30 jours', 24000],
      ['300 Go', '30 jours', 29000],
      ['400 Go', '30 jours', 39000],
    ],
    appels: [
      ['Appels 17 min + 25 Mo + 50 SMS', '1 jour', 200],
      ['Moov Folie Appel+Internet 20 min + 150 Mo', '1 jour', 200],
      ['Pass nuit 30 min TRS + 2 Go', '22h-7h', 200],
      ['Nuit - 30 min + 2 Go (22h-7h)', '22h-7h', 200],
      ['Appels 27 min + 100 SMS + 100 Mo + illimité vers 5 numéros préférés', '3 jours', 300],
      ['Moov Folie Appel+Internet 35 min + 400 Mo', '1 jour', 300],
      ['Appels 50 min + 250 SMS + 250 Mo + illimité vers 5 numéros préférés', '7 jours', 500],
      ['Moov Folie Appel+Internet 60 min + 1 Go', '2 jours', 500],
      ['Moov Folie Appel+Internet 1h + 1 Go', '5 jours', 700],
      ['Appels 100 min + 500 SMS + 1024 Mo + illimité vers 5 numéros préférés', '10 jours', 1000],
      ['Moov Folie Appel+Internet 120 min + 2,5 Go', '5 jours', 1000],
      ['Appel + Internet 120 min + 2,5 Go', '5 jours', 1000],
      ['Appels illimités vers 5 numéros préférés + 200 min + 500 SMS TR + 1536 Mo', '15 jours', 1500],
      ['Appels illimités vers 5 numéros préférés + 250 min + 500 SMS TR + 2,5 Go', '30 jours', 2500],
      ['Appels illimités vers 5 numéros préférés + 500 min + 500 SMS TR + 5 Go', '30 jours', 5000],
      ['Appels illimités vers 5 numéros préférés + 830 min + 500 SMS TR + 10 Go', '30 jours', 10000],
      ['Appels illimités vers 5 numéros préférés + 1660 min + 1000 SMS TR + 20 Go', '30 jours', 20000],
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
