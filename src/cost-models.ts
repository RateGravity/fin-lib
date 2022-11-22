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
 * A collection of labeled cost models.
 */
export type CostModelCollection<TCostLabel extends string> = {
  [TLabel in TCostLabel]: CostModel[];
};

/**
 * Given a collection of cost models returns an array with
 * all the possible combinations of cost model permutations.
 * @param costs A collection of cost models
 * @returns a flattened list of combined cost models.
 */
export function combineCostModels(costs: CostModelCollection<string>): CostModel[] {
  let results: CostModel[] = [];
  for (const models of Object.values(costs)) {
    if (models.length < 1) {
      continue;
    }
    if (results.length < 1) {
      results = models;
      continue;
    }
    results = results.flatMap((baseModel) =>
      models
        .map(({ presentValueFactor, costOffset, minPresentValue, maxPresentValue }) => ({
          presentValueFactor: baseModel.presentValueFactor + presentValueFactor,
          costOffset: baseModel.costOffset + costOffset,
          minPresentValue: Math.max(baseModel.minPresentValue, minPresentValue),
          maxPresentValue: Math.min(baseModel.maxPresentValue, maxPresentValue)
        }))
        .filter(({ minPresentValue, maxPresentValue }) => minPresentValue <= maxPresentValue)
    );
  }
  return results;
}

/**
 * Given a set of cost models for specific labels
 * And given
 */
export type ComputeCostModelInput<TCostLabel extends string> = {
  /**
   * A set of cost models for specific labels.
   */
  costs: CostModelCollection<TCostLabel>;
  /**
   * The present value of the loan
   */
  presentValue: number;
};

export type ComputeCostModelOutput<TCostLabel extends string> = {
  [TLabel in TCostLabel]: number;
};

/**
 *
 * @returns
 */
export function computeCostModels<TCostLabel extends string>({
  costs,
  presentValue
}: ComputeCostModelInput<TCostLabel>): ComputeCostModelOutput<TCostLabel> {
  return Object.fromEntries(
    (Object.entries(costs) as [TCostLabel, CostModel[]][]).map(([key, models]) => [
      key,
      models
        .filter(
          ({ minPresentValue, maxPresentValue }) =>
            presentValue >= minPresentValue && presentValue <= maxPresentValue
        )
        .map(({ costOffset, presentValueFactor }) => costOffset + presentValue * presentValueFactor)
        .reduce((l, r) => {
          if (Number.isNaN(l)) {
            return r;
          }
          if (Number.isNaN(r)) {
            return l;
          }
          return Math.min(l, r);
        }, Number.NaN)
    ])
  ) as { [TLabel in TCostLabel]: number };
}
