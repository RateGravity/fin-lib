import { MonthlyRateDecimal, MonthsPerYear } from './constants';
import { PMT } from './math';

const nearest8th = (rate: number) => {
  const eights = rate * 8;
  const rounded = Math.round(eights);
  const r = rounded / 8;
  return r;
};

export interface AmortizationPeriod {
  /** Payment towards principal */
  principal: number;
  /** Interest payment */
  interest: number;
  /** Remaining Balance */
  balanceAtEndOfMonth: number;
}

export interface ComputeAmortizationInputs {
  /** The rate of the loan */
  initialRate: number;
  /** The loan size */
  presentValue: number;
  /** For adjustable rate loans, the fully indexed rate */
  fullyIndexedRate?: number;
  /** Loan term in years */
  loanTerm: number;
  /** For adjustable rate loans, the fixed period in years */
  fixedTerm?: number;
  /** For adjustable rate loans, the adjustment period in years */
  adjustmentPeriod?: number;
  /** For adjustable rate loans, the adjustment caps */
  caps?: { initial: number; periodic: number; lifetime: number };
}

/**
 * Computes a monthly amortization schedule
 * for a given loan. An amortization schedule
 * shows the amount of principal and interest
 * that is payed every month and what the resulting
 * balance of the loan is.
 */
export function computeAmortizationSchedule({
  initialRate,
  presentValue,
  fullyIndexedRate = initialRate,
  loanTerm,
  fixedTerm = loanTerm,
  adjustmentPeriod = 1,
  caps = { initial: 0, periodic: 0, lifetime: 0 }
}: ComputeAmortizationInputs): AmortizationPeriod[] {
  const monthlyIndexedRate = nearest8th(fullyIndexedRate) / MonthlyRateDecimal;
  const maxRate = Math.min((initialRate + caps.lifetime) / MonthlyRateDecimal, monthlyIndexedRate);
  const minRate = Math.max((initialRate - caps.lifetime) / MonthlyRateDecimal, monthlyIndexedRate);
  const paymentPeriods = loanTerm * MonthsPerYear;
  const fixedPeriods = fixedTerm * MonthsPerYear;
  const periodsPerAdjustment = adjustmentPeriod * MonthsPerYear;
  let remainingBalance = presentValue;
  let monthlyDecimalRate = initialRate / MonthlyRateDecimal;
  let monthlyPayment = PMT(monthlyDecimalRate, paymentPeriods, remainingBalance, 0);
  const schedule: AmortizationPeriod[] = [];
  // iterate over the life of the loan, month by month
  for (let i = 0; i < paymentPeriods; i++) {
    // if we're beyond the fixed term
    if (i >= fixedPeriods) {
      // if we're at an adjustment
      if ((i - fixedPeriods) % periodsPerAdjustment === 0) {
        const cap = (i === fixedPeriods ? caps.initial : caps.periodic) / MonthlyRateDecimal;
        monthlyDecimalRate = Math.max(
          minRate,
          Math.min(
            monthlyDecimalRate + cap * (monthlyDecimalRate < monthlyIndexedRate ? 1 : -1),
            maxRate
          )
        );
        monthlyPayment = PMT(monthlyDecimalRate, paymentPeriods - i, remainingBalance, 0);
      }
    }
    const interest = monthlyDecimalRate * remainingBalance;
    const paid = Math.min(remainingBalance + interest, monthlyPayment);
    remainingBalance = Math.max(remainingBalance - (paid - interest), 0);
    schedule.push({
      principal: paid - interest,
      interest,
      balanceAtEndOfMonth: remainingBalance
    });
  }
  return schedule;
}
