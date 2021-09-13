import { ComputeAmortizationInputs, computeAmortizationSchedule } from './amortization';
import { FV } from './math';
import { ComputeMI, ComputeMIInputs, computeRegularMI } from './mi';

// comparing 2 floats that result from repeated math
// can be problematic due to floating point percision errors.
// instead see if the numbers are very close.
const kindaEqual = (numOne: number, numTwo: number) => Math.abs(numOne - numTwo) < 0.000001;

export interface ComputeAprInputs extends ComputeAmortizationInputs, ComputeMIInputs {
  /**
   * The dollar value of fees that the lender is charging on a loan.
   */
  totalFees: number;
}

/**
 * Compute the APR for a loan.
 *
 * APR attempts to account for the true cost of getting a mortgage by factoring the future value
 * of the up-front costs and other costs like mortgage insurance.
 * @param computeMI a function for applying mortgage insurance to an amortization table.
 * @returns the APR for the mortgage.
 */
export function computeApr(
  inputs: ComputeAprInputs,
  computeMI: ComputeMI = computeRegularMI
): number {
  // Amoritzation Schedule for Fees over the life of the loan.
  // ie. What we would pay if we financed our fees. Which relates to
  // the lifetime value of fees assuming you'd invested them with the same
  // interest rate.
  const feeAmortization = computeAmortizationSchedule({
    ...inputs,
    presentValue: inputs.totalFees
  });
  // Amortization Schedule for the loan. We need the full schedule for
  // we don't technically need the full schedule but it's useful to compute
  // it and then reduce to the data we need.
  const loanAmortization = computeAmortizationSchedule(inputs);
  const paymentGroups = computeMI(inputs, loanAmortization)
    .map(
      // Include the mortgage insurance + feeAllocation + principle + interest in
      // the monthly payment
      ({ principle, interest, mortgageInsurance }, i) => {
        const feeAllocation =
          i < feeAmortization.length
            ? feeAmortization[i].principle + feeAmortization[i].interest
            : 0;
        return {
          monthlyPayment: principle + interest + feeAllocation + mortgageInsurance,
          payments: 1
        };
      }
    )
    .reduce((grouped, { monthlyPayment, payments }) => {
      // group adjacent monthly payments by their value so end result will be
      //  something like [{monthlyPayment: 969, payments: 84},....]
      const lastIndex = grouped.length - 1;
      if (lastIndex >= 0 && kindaEqual(grouped[lastIndex].monthlyPayment, monthlyPayment)) {
        grouped[lastIndex].payments += payments;
      } else {
        grouped.push({
          monthlyPayment,
          payments
        });
      }
      return grouped;
    }, [] as { monthlyPayment: number; payments: number }[]);

  // binary search for the apr
  // start with the loan rate, and work our way towards the actual apr.
  let rate = inputs.initialRate / 1200;
  let diff = rate;
  for (let t = 0; t < 100; t++) {
    // start with a present value of the loanValue
    let presentValue = inputs.presentValue;
    for (const { monthlyPayment, payments } of paymentGroups) {
      // repeated pay down the loan at the known monthlyPayment for
      // the known number of payments, at the estimated rate
      // for instance assume we have a 30 fixed rate loan with a single
      // payment group:
      // {monthlyPayment: 1050, payments: 360}
      // Given the value of the loan we can make 360 payments of 1050 at the
      //  rate of the apr and reach a future value of 0.
      presentValue = FV(rate, monthlyPayment, presentValue, payments);
    }
    // if the estimated rate produced a result of 0 than success!
    if (kindaEqual(presentValue, 0)) {
      break;
    }
    // adjust rate and diff accordingly.
    rate += diff * (presentValue < 0 ? 1 : -1);
    diff /= 2;
  }

  // yearly rate as a percent, rather than monthly as a decimal.
  return rate * 1200;
}
