import { MonthlyRateDecimal, MonthsPerYear } from './constants';
import { PMT } from './math';

export interface ComputeMonthlyPaymentInputs {
  /** The rate of the loan */
  initialRate: number;
  /** The loan size */
  presentValue: number;
  /** Loan term in years */
  loanTerm: number;
}

/**
 * Given minimal loan inputs returns the monthly payment to pay principal and interest (P&I)
 * @returns The monthly payment that is required to pay this loan off over it's term.
 */
export function computeMonthlyPayment({
  initialRate,
  presentValue,
  loanTerm
}: ComputeMonthlyPaymentInputs): number {
  return PMT(initialRate / MonthlyRateDecimal, loanTerm * MonthsPerYear, presentValue, 0);
}
