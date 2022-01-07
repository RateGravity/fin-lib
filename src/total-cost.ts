import { ComputeAmortizationInputs, computeAmortizationSchedule } from './amortization';
import { ComputeMI, ComputeMIInputs, computePMI } from './mi';

export interface ComputeTotalCostInputs extends ComputeAmortizationInputs, ComputeMIInputs {
  /**
   * The dollar value of fees that a loan costs up-front
   */
  totalFees: number;
}

/*
  calculate the total non-equity costs of a mortgage over its lifespan
*/
/**
 * Calculate the total non-equity costs of a mortgage over it's lifespan
 *
 * When paying a mortgage over time payments made to fees, interest, and mortgage insurance are effectively "lost" while
 * any money that is paid towards the principal or mortgage balance become equity in the home.
 * @param inputs inputs representing the loan
 * @param computeMI the function used to compute mortgage insurance, defaults to computeRegularMI
 * @returns the total dollar value of all fees, mortgage insurance, and interest paid over the life of the loan.
 */
export function computeTotalCost(
  inputs: ComputeTotalCostInputs,
  computeMI: ComputeMI = computePMI
): number {
  return computeMI(inputs, computeAmortizationSchedule(inputs))
    .map((amorizationPeriod) => amorizationPeriod.interest + amorizationPeriod.mortgageInsurance)
    .reduce((prev, curr) => prev + curr, inputs.totalFees);
}
