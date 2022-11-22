import { createPAndICostModel, CreatePAndICostModelInputs } from './payments';
import {
  combineCostModels,
  CostModelCollection,
  ComputeCostModelOutput,
  computeCostModels
} from './cost-models';

export type ComputeMaxPresentValueInput<TCostLabel extends string> = {
  /**
   * The collection of monthly costs
   */
  costs: CostModelCollection<TCostLabel>;
  /**
   * The target max monthly payment.
   */
  targetMonthlyPayment: number;
};

export function computeMaxPresentValue<TCostLabel extends string>({
  costs,
  targetMonthlyPayment
}: ComputeMaxPresentValueInput<TCostLabel>): number {
  return combineCostModels(costs)
    .map(({ presentValueFactor, costOffset, maxPresentValue, minPresentValue }) => {
      let computed = Math.min(
        (targetMonthlyPayment - costOffset) / presentValueFactor,
        maxPresentValue
      );
      if (computed < minPresentValue) {
        computed = NaN;
      }
      return computed;
    })
    .reduce((l, r) => {
      if (Number.isNaN(l)) {
        return r;
      }
      if (Number.isNaN(r)) {
        return l;
      }
      return Math.max(l, r);
    }, NaN);
}

/**
 * Inputs to the computeAffordability function
 */
export type ComputeAffordabilityInputs<TCostLabel extends string> =
  ComputeMaxPresentValueInput<TCostLabel> & CreatePAndICostModelInputs;

export type Affordability<TCostLabel extends string> = {
  /**
   * The highest present value of the loan to produce a monthly payment
   * equal to or less than the target. If no presentValue is possible to produce
   * the given target then NaN is returned
   */
  presentValue: number;
  /**
   * The various monthly costs associated with the result presentValue.
   * any cost models that are present on the input will be reflected here.
   * In addition the pAndI (principle and interest) value will be set
   */
  costs: ComputeCostModelOutput<TCostLabel | 'pAndI'>;
};

/**
 * Given the affordability compute inputs returns the best affordability
 * @returns An affordability object with the max affordable Present Value and all the associated monthly costs.
 */
export function computeAffordability<TCostLabel extends string>(
  input: ComputeAffordabilityInputs<TCostLabel>
): Affordability<TCostLabel> {
  const pAndI = createPAndICostModel(input);
  const costs = { ...input.costs, pAndI };
  const presentValue = computeMaxPresentValue({
    ...input,
    costs
  });
  return {
    presentValue,
    costs: computeCostModels({ presentValue, costs })
  };
}
