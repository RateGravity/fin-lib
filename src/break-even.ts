import { ComputeAmortizationInputs, computeAmortizationSchedule } from './amortization';
import { AmortizationPeriodWithMI, ComputeMI, ComputeMIInputs, computePMI } from './mi';

export interface ComputeBreakEvenInputs extends ComputeAmortizationInputs, ComputeMIInputs {
  /**
   * The dollar value of fees that a loan costs up-front
   */
  totalFees: number;
  /**
   * The function that should be used for computing mortgage insurance payments,
   * defaults to computeRegularMI if not provided.
   */
  computeMI?: ComputeMI;
}

const computeEquity = (
  amorizationPeriodsWithMI: AmortizationPeriodWithMI[],
  {
    totalFees,
    propertyValue,
    presentValue
  }: Pick<ComputeBreakEvenInputs, 'totalFees' | 'propertyValue' | 'presentValue'>
): number[] => {
  // running total of costs accrued
  let costs = totalFees;
  // for each month of the loan total costs to that point less the equity in the property
  const equityLessCosts = [propertyValue - presentValue - costs];
  for (const { interest, mortgageInsurance, balanceAtEndOfMonth } of amorizationPeriodsWithMI) {
    costs += interest + mortgageInsurance;
    equityLessCosts.push(propertyValue - balanceAtEndOfMonth - costs);
  }
  return equityLessCosts;
};

const compareArray = (aArray: number[], bArray: number[]): (-1 | 0 | 1)[] => {
  const comparedArray: (-1 | 0 | 1)[] = [];
  const aArrayMaxIndex = aArray.length - 1;
  const bArrayMaxIndex = bArray.length - 1;
  for (let idx = 0; idx <= aArrayMaxIndex || idx <= bArrayMaxIndex; idx++) {
    const a = aArrayMaxIndex >= idx ? aArray[idx] : aArray[aArrayMaxIndex];
    const b = bArrayMaxIndex >= idx ? bArray[idx] : bArray[bArrayMaxIndex];
    comparedArray.push(a === b ? 0 : a > b ? -1 : 1);
  }
  return comparedArray;
};

/**
  BreakEven, the amount of months until one loan becomes more expensive than another
 * @param inputA An input object representing one of the loans
 * @param inputB An input object representing one of the loans
 * @returns a positive integer, n if inputA is more expensive until n months out
 * @returns a POSITIVE_INFINITY if inputA is always more expensive,
 * @returns a negative integer, n if inputA is cheaper until n months out.
 * @returns a NEGATIVE_INFINITY if inputA is always cheaper
 * @returns 0 if inputA and inputB are always the same cost.
 */
export function computeBreakEven(
  { computeMI: computeMIA = computePMI, ...a }: ComputeBreakEvenInputs,
  { computeMI: computeMIB = computePMI, ...b }: ComputeBreakEvenInputs
): number {
  let [initialCompare, ...compared] = compareArray(
    computeEquity(computeMIA(a, computeAmortizationSchedule(a)), a),
    computeEquity(computeMIB(b, computeAmortizationSchedule(b)), b)
  );

  let minMonth = 1;

  // initially the same cost
  if (initialCompare === 0) {
    // find the index to strip off leading zeros
    const leadingZeros = compared.findIndex((v) => v !== 0);
    // everything is zero
    if (leadingZeros === -1) {
      return 0;
    }
    minMonth += leadingZeros;
    // update the initial set and the comparison
    initialCompare = compared[leadingZeros];
    compared = compared.splice(0, leadingZeros + 1);
  }

  // find the point at which the comparison changes.
  const breakEvenPoint = compared.findIndex(
    (compareResults) => compareResults === initialCompare * -1
  );

  // no changes
  if (breakEvenPoint === -1) {
    return Number.POSITIVE_INFINITY * initialCompare;
  } else {
    // if a is initially more expensive (initialCompare === 1) return a positive number
    // if b is initially more expensive (initialCompare === -1) return a negative number
    return initialCompare * (breakEvenPoint + minMonth);
  }
}
