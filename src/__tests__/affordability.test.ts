import {
  computeAffordability,
  CostModel,
  computeMonthlyPayment,
  ComputeMonthlyPaymentInputs
} from '@ownup/fin-lib';
import 'jest-extended';
import 'jest-extended/all';
import given from 'given2';
import { MonthlyRateDecimal } from '../constants';

describe('computeAffordability', () => {
  it.each([
    {
      presentValue: 300_000,
      initialRate: 5,
      loanTerm: 30
    }
  ])('computes affordability for %o', (input: ComputeMonthlyPaymentInputs) => {
    const targetMonthlyPayment = computeMonthlyPayment(input);

    expect(computeAffordability({ ...input, targetMonthlyPayment, costModels: {} })).toMatchObject({
      presentValue: input.presentValue,
      costs: {
        pAndI: targetMonthlyPayment
      }
    });
  });

  describe('cost models', () => {
    it('constrains an otherwise large present value', () => {
      const maxPresentValue = 500_000;
      expect(
        computeAffordability({
          initialRate: 1,
          loanTerm: 30,
          targetMonthlyPayment: 100_000,
          costModels: {
            constraint: [
              {
                presentValueFactor: 0,
                maxPresentValue,
                minPresentValue: Number.NEGATIVE_INFINITY,
                costOffset: 0
              }
            ]
          }
        })
      ).toMatchObject({ presentValue: maxPresentValue });
    });
    it('returns NaN if presentValue is unsolvable', () => {
      const minPresentValue = 1_000_000;
      expect(
        computeAffordability({
          initialRate: 15,
          loanTerm: 10,
          targetMonthlyPayment: 1000,
          costModels: {
            constrait: [
              {
                presentValueFactor: 0,
                maxPresentValue: Number.POSITIVE_INFINITY,
                minPresentValue,
                costOffset: 0
              }
            ]
          }
        })
      ).toMatchObject({ presentValue: expect.toBeNaN() });
    });
  });

  describe('costs', () => {
    const modelKeys = ['taxes', 'insurance', 'pmi'];
    const input = {
      initialRate: 5,
      loanTerm: 30,
      targetMonthlyPayment: 2_000,
      costModels: Object.fromEntries(
        modelKeys.map((key) => [
          key,
          [
            {
              presentValueFactor: 0,
              maxPresentValue: Number.POSITIVE_INFINITY,
              minPresentValue: Number.NEGATIVE_INFINITY,
              costOffset: 0
            }
          ]
        ])
      )
    };
    it.each(modelKeys)('returns costs for %s', (key) => {
      expect(computeAffordability(input).costs).toHaveProperty(key);
    });
    it('returns pAndI costs', () => {
      expect(computeAffordability(input).costs).toHaveProperty('pAndI');
    });
  });

  describe('affordability with complex models', () => {
    given('downPayment', () => 100_000);
    given('monthlyTaxRate', () => 2.05 / MonthlyRateDecimal);
    given('taxes', (): CostModel[] => [
      {
        minPresentValue: given.downPayment,
        maxPresentValue: Number.POSITIVE_INFINITY,
        presentValueFactor: given.monthlyTaxRate,
        costOffset: given.downPayment * given.monthlyTaxRate
      }
    ]);
    given('targetMonthlyPayment', () => 5_000);

    given('result', () =>
      computeAffordability({
        initialRate: 2.5,
        loanTerm: 30,
        targetMonthlyPayment: given.targetMonthlyPayment,
        costModels: {
          taxes: given.taxes
        }
      })
    );

    it('has costs less than targetMonthlyPayment', () => {
      const allCosts = (Object.values(given.result.costs) as number[]).reduce((l, r) => l + r, 0);
      expect(allCosts).toBeLessThanOrEqual(given.targetMonthlyPayment);
    });

    it('cost for taxes matches computed value', () => {
      const purchasePrice = given.downPayment + given.result.presentValue;
      expect(given.result.costs.taxes).toBeCloseTo(purchasePrice * given.monthlyTaxRate);
    });
  });
});
