import { MonthlyRateDecimal, MonthsPerYear } from './constants';
import { CostModel } from './cost-models';
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

export type CreatePAndICostModelInputs = Omit<ComputeMonthlyPaymentInputs, 'presentValue'>;

export function createPAndICostModel({
  initialRate,
  loanTerm
}: CreatePAndICostModelInputs): CostModel[] {
  const rate = initialRate / MonthlyRateDecimal;
  const rExp = Math.pow(1 + rate, loanTerm * MonthsPerYear);

  return [
    {
      presentValueFactor: (rate * rExp) / (rExp - 1), // Compounding Interest factor
      costOffset: 0,
      minPresentValue: Number.NEGATIVE_INFINITY,
      maxPresentValue: Number.POSITIVE_INFINITY
    }
  ];
}
