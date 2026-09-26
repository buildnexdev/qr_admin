/**
 * Centralized GST calculation — use this everywhere (POS, bills, QR, reports).
 * Mirrors backend src/utils/taxCalculator.js
 */

export type TaxRateLike = {
  TaxPercent?: number;
  CGSTPercent?: number;
  SGSTPercent?: number;
  IGSTPercent?: number;
  IsInclusive?: boolean | number;
  taxPercent?: number;
};

export type TaxLineResult = {
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  rate: number;
  inclusive: boolean;
};

function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function calculateLineTax(
  amount: number,
  rate: TaxRateLike,
  opts: {
    interState?: boolean;
    pricingMode?: 'inclusive' | 'exclusive';
  } = {}
): TaxLineResult {
  const raw = Number(amount) || 0;
  const pct = Number(rate?.TaxPercent ?? rate?.taxPercent ?? 0);
  const inclusive =
    opts.pricingMode === 'inclusive'
      ? true
      : opts.pricingMode === 'exclusive'
        ? false
        : Boolean(rate?.IsInclusive);

  let taxableAmount: number;
  let taxAmount: number;

  if (inclusive) {
    taxableAmount = round2(raw / (1 + pct / 100));
    taxAmount = round2(raw - taxableAmount);
  } else {
    taxableAmount = round2(raw);
    taxAmount = round2((raw * pct) / 100);
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (opts.interState) {
    igst = round2(
      rate?.IGSTPercent != null ? (taxableAmount * Number(rate.IGSTPercent)) / 100 : taxAmount
    );
  } else {
    const cgstPct = Number(rate?.CGSTPercent ?? pct / 2);
    const sgstPct = Number(rate?.SGSTPercent ?? pct / 2);
    cgst = round2((taxableAmount * cgstPct) / 100);
    sgst = round2((taxableAmount * sgstPct) / 100);
    taxAmount = round2(cgst + sgst);
  }

  const total = inclusive ? round2(raw) : round2(taxableAmount + taxAmount);

  return { taxableAmount, taxAmount, cgst, sgst, igst, total, rate: pct, inclusive };
}

export function calculateCartTax(
  lines: Array<{ amount: number; rate: TaxRateLike }>,
  opts: {
    interState?: boolean;
    pricingMode?: 'inclusive' | 'exclusive';
    roundOff?: boolean;
  } = {}
) {
  const details = lines.map((line) => calculateLineTax(line.amount, line.rate || {}, opts));
  const taxableAmount = round2(details.reduce((s, d) => s + d.taxableAmount, 0));
  const taxAmount = round2(details.reduce((s, d) => s + d.taxAmount, 0));
  const cgst = round2(details.reduce((s, d) => s + d.cgst, 0));
  const sgst = round2(details.reduce((s, d) => s + d.sgst, 0));
  const igst = round2(details.reduce((s, d) => s + d.igst, 0));
  let total = round2(details.reduce((s, d) => s + d.total, 0));
  let roundOff = 0;
  if (opts.roundOff) {
    const rounded = Math.round(total);
    roundOff = round2(rounded - total);
    total = rounded;
  }
  return { taxableAmount, taxAmount, cgst, sgst, igst, total, roundOff, lines: details };
}
