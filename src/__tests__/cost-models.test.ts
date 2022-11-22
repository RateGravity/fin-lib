import { computeCostModels, combineCostModels } from '@ownup/fin-lib';
import given from 'given2';

describe('combineCostModels', () => {
  given('modelOne', () => [
    { presentValueFactor: 1, costOffset: 1, minPresentValue: 1, maxPresentValue: 10 },
    { presentValueFactor: 3, costOffset: 3, minPresentValue: 3, maxPresentValue: 30 }
  ]);
  given('modelTwo', () => [
    { presentValueFactor: 5, costOffset: 5, minPresentValue: 5, maxPresentValue: 50 },
    { presentValueFactor: 7, costOffset: 7, minPresentValue: 7, maxPresentValue: 70 }
  ]);
  given('combinedModels', () => combineCostModels({ one: given.modelOne, two: given.modelTwo }));
  describe('given combinable cost models', () => {
    it('creates all the combinations', () => {
      expect(given.combinedModels).toEqual([
        { presentValueFactor: 6, costOffset: 6, minPresentValue: 5, maxPresentValue: 10 },
        { presentValueFactor: 8, costOffset: 8, minPresentValue: 7, maxPresentValue: 10 },
        { presentValueFactor: 8, costOffset: 8, minPresentValue: 5, maxPresentValue: 30 },
        { presentValueFactor: 10, costOffset: 10, minPresentValue: 7, maxPresentValue: 30 }
      ]);
    });
  });
  it('ommits impossible models', () => {
    // result will be constrainted to 101 < value < 100 which is impossible.
    const input = {
      one: [{ presentValueFactor: 1, costOffset: 0, minPresentValue: 10, maxPresentValue: 100 }],
      two: [{ presentValueFactor: 1, costOffset: 0, minPresentValue: 101, maxPresentValue: 200 }]
    };
    expect(combineCostModels(input)).toEqual([]);
  });
});

describe('computeCostModels', () => {
  given('presentValue', () => 50);
  given('computedCostModels', () =>
    computeCostModels({
      costs: { one: given.modelOne, two: given.modelTwo },
      presentValue: given.presentValue
    })
  );
  describe('given two models with known results', () => {
    given('modelOne', () => [
      { presentValueFactor: 0, costOffset: 1, minPresentValue: 0, maxPresentValue: 100 }
    ]);
    given('modelTwo', () => [
      { presentValueFactor: 0, costOffset: 2, minPresentValue: 0, maxPresentValue: 100 }
    ]);
    it('returns results in correct keys', () => {
      expect(given.computedCostModels).toEqual({
        one: 1,
        two: 2
      });
    });
  });
  describe("given two models that can't be computed", () => {
    given('modelOne', () => [
      { presentValueFactor: 0, costOffset: 0, minPresentValue: 75, maxPresentValue: 100 }
    ]);
    given('modelTwo', () => [
      { presentValueFactor: 0, costOffset: 0, minPresentValue: 0, maxPresentValue: 25 }
    ]);
    it('returns NaN in keys', () => {
      expect(given.computedCostModels).toEqual({
        one: NaN,
        two: NaN
      });
    });
  });
  describe('given models with multiple possible costs', () => {
    given('modelOne', () => [
      { presentValueFactor: 0, costOffset: 1, minPresentValue: 0, maxPresentValue: 100 },
      { presentValueFactor: 0, costOffset: 2, minPresentValue: 0, maxPresentValue: 100 }
    ]);
    given('modelTwo', () => [
      { presentValueFactor: 0, costOffset: 1, minPresentValue: 0, maxPresentValue: 45 },
      { presentValueFactor: 0, costOffset: 2, minPresentValue: 45, maxPresentValue: 100 }
    ]);
    it('returns the lowest cost', () => {
      expect(given.computedCostModels).toEqual({
        one: 1,
        two: 2
      });
    });
  });
  describe('given models that use presentValueFactor', () => {
    given('modelOne', () => [
      {
        presentValueFactor: 0.01,
        costOffset: 2,
        minPresentValue: Number.NEGATIVE_INFINITY,
        maxPresentValue: Number.POSITIVE_INFINITY
      }
    ]);
    given('modelTwo', () => [
      {
        presentValueFactor: 0.02,
        costOffset: 3,
        minPresentValue: Number.NEGATIVE_INFINITY,
        maxPresentValue: Number.POSITIVE_INFINITY
      }
    ]);
    given('presentValue', () => 100);
    it('returns the correct values', () => {
      expect(given.computedCostModels).toEqual({
        one: 3,
        two: 5
      });
    });
  });
});
