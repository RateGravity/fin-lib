import { MonthlyRateDecimal, MonthsPerYear } from './constants';
import { ComputeMonthlyPaymentInputs } from './payments';

/**
 * A Cost model for monthly costs
 */
export type CostModel = {
  /**
   * A factor to scale the present value of the loan by to figure out monthly cost
   */
  presentValueFactor: number;
  /**
   * A fixed offset of monthly cost to add to the result of the presentValueFactor * presentValue
   */
  costOffset: number;
  /**
   * A minimum present value for this cost model to be valid
   */
  minPresentValue: number;
  /**
   * A maximum present value for this cost model to be valid
   */
  maxPresentValue: number;
};

/**
 * Inputs to the computeAffordability function
 */
export type ComputeAffordabilityInputs<TCostLabel extends string> = Omit<
  ComputeMonthlyPaymentInputs,
  'presentValue'
> & {
  /**
   * Cost models for monthly costs.
   */
  costModels: { [TLabel in TCostLabel]: CostModel[] };
  /**
   * The target max monthly payment.
   */
  targetMonthlyPayment: number;
};

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
  costs: {
    [TLabel in TCostLabel | 'pAndI']: number;
  };
};

type ComputableModel<TCostLabel extends string> = CostModel & {
  compute: (costs: Record<TCostLabel, number>, presentValue: number) => void;
};

// project the compute function on the cost model.
const convertToComputableModels = <TCostLabel extends string>(
  label: TCostLabel,
  costModels: CostModel[]
): ComputableModel<TCostLabel>[] => {
  if (costModels.length < 1) {
    return [
      {
        maxPresentValue: Number.POSITIVE_INFINITY,
        minPresentValue: Number.NEGATIVE_INFINITY,
        presentValueFactor: 0,
        costOffset: 0,
        compute: (costs, presentValue) => {
          costs[label] = presentValue * 0; // NaN if presentValue is NaN, otherwise 0
        }
      }
    ];
  }
  return costModels.map((model) => ({
    ...model,
    compute: (costs, presentValue) => {
      costs[label] = model.costOffset + presentValue * model.presentValueFactor;
    }
  }));
};

// given an n x m matrix of cost models, flatten them into an n^m length array.
const combineCostModels = <TCostLabel extends string>(
  allModels: ComputableModel<TCostLabel>[][]
): ComputableModel<TCostLabel>[] => {
  let results: ComputableModel<TCostLabel>[] = [];
  for (const models of allModels) {
    if (models.length < 1) {
      continue;
    }
    if (results.length < 1) {
      results = models;
      continue;
    }
    results = results.flatMap((baseModel) =>
      models.map((model) => ({
        presentValueFactor: baseModel.presentValueFactor + model.presentValueFactor,
        costOffset: baseModel.costOffset + model.costOffset,
        minPresentValue: Math.max(baseModel.minPresentValue, model.minPresentValue),
        maxPresentValue: Math.min(baseModel.maxPresentValue, model.maxPresentValue),
        compute: (costs: Record<string, number>, presentValue: number) => {
          baseModel.compute(costs, presentValue);
          model.compute(costs, presentValue);
        }
      }))
    );
  }
  return results;
};

/**
 * Given the affordability compute inputs returns the best affordability
 * @returns An affordability object with the max affordable Present Value and all the associated monthly costs.
 */
export const computeAffordability = <TCostLabel extends string>(
  input: ComputeAffordabilityInputs<TCostLabel>
): Affordability<TCostLabel> => {
  const rate = input.initialRate / MonthlyRateDecimal;
  const rExp = Math.pow(1 + rate, input.loanTerm * MonthsPerYear);

  const pAndIModels = convertToComputableModels<TCostLabel | 'pAndI'>('pAndI', [
    {
      presentValueFactor: (rate * rExp) / (rExp - 1), // Compounding Interest factor
      costOffset: 0,
      minPresentValue: Number.NEGATIVE_INFINITY,
      maxPresentValue: Number.POSITIVE_INFINITY
    }
  ]);
  const allModels = combineCostModels([
    pAndIModels,
    ...(Object.entries(input.costModels) as [TCostLabel, CostModel[]][]).map(
      ([label, costModels]) => convertToComputableModels(label, costModels)
    )
  ]);
  const [presentValue, compute] = allModels
    .map(({ presentValueFactor, costOffset, minPresentValue, maxPresentValue, compute }) => {
      let computed = Math.min(
        (input.targetMonthlyPayment - costOffset) / presentValueFactor,
        maxPresentValue
      );
      if (computed < minPresentValue) {
        computed = NaN;
      }
      return [computed, compute] as [number, ComputableModel<TCostLabel | 'pAndI'>['compute']];
    })
    .reduce(
      (l, r) => {
        if (Number.isNaN(l[0])) {
          return r;
        }
        return l[0] > r[0] ? l : r;
      },
      [NaN, () => void 0]
    );
  const costs = {} as Record<TCostLabel | 'pAndI', number>;
  compute(costs, presentValue);
  return {
    presentValue,
    costs
  };
};
