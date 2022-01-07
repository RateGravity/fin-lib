import { AmortizationPeriod } from './amortization';
import { MonthsPerYear } from './constants';

export type AmortizationPeriodWithMI = AmortizationPeriod & {
  mortgageInsurance: number;
};

export interface ComputeMIInputs {
  propertyValue: number;
  mortgageInsurance: number;
  upFrontMip?: number;
}

export type ComputeMI = (
  inputs: ComputeMIInputs,
  amortization: AmortizationPeriod[]
) => AmortizationPeriodWithMI[];

/**
 * Enhances an amortization schedule with PMI payments
 */
export function computePMI(
  inputs: ComputeMIInputs,
  amortization: AmortizationPeriod[]
): AmortizationPeriodWithMI[] {
  return amortization.map((amortizationPeriod) => {
    // only include pmi if the starting balance is more than 78% of the loan
    // lenders are required to remove the pmi after you have 22% equity.
    return {
      ...amortizationPeriod,
      mortgageInsurance:
        (amortizationPeriod.balanceAtEndOfMonth + amortizationPeriod.principal) /
          inputs.propertyValue >
        0.78
          ? inputs.mortgageInsurance
          : 0
    };
  });
}

/**
 * Enhances an amortization schedule with FHA MIP payments
 */
export function computeFHAMIP(
  inputs: ComputeMIInputs,
  amortization: AmortizationPeriod[]
): AmortizationPeriodWithMI[] {
  const loanValue =
    amortization[0].balanceAtEndOfMonth + amortization[0].principal - (inputs.upFrontMip || 0);
  return loanValue / inputs.propertyValue > 0.9
    ? amortization.map((period) => ({
        ...period,
        // more than 90% LTV you pay the mortgage insurance
        // every month
        mortgageInsurance: inputs.mortgageInsurance
      }))
    : amortization.map((period, index) => ({
        ...period,
        // Must pay mortgage insurance for 11 years.
        mortgageInsurance: index + 1 > MonthsPerYear * 11 ? 0 : inputs.mortgageInsurance
      }));
}
