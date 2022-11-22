import { computeAffordability, CostModel, computeMonthlyPayment } from '@ownup/fin-lib';
import 'jest-extended';
import 'jest-extended/all';
import given from 'given2';
import { MonthlyRateDecimal } from '../constants';

describe('computeAffordability', () => {
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
  given('insurance', (): CostModel[] => [
    {
      minPresentValue: 0,
      maxPresentValue: 1_000_000,
      presentValueFactor: 0,
      costOffset: 100
    },
    {
      minPresentValue: 1_000_000,
      maxPresentValue: Number.POSITIVE_INFINITY,
      presentValueFactor: 0,
      costOffset: 150
    }
  ]),
    given('pmi', (): CostModel[] => [
      {
        minPresentValue: 0,
        maxPresentValue: Number.POSITIVE_INFINITY,
        presentValueFactor: 0.012,
        costOffset: 0
      }
    ]);
  given('targetMonthlyPayment', () => 5_000);

  given('initialRate', () => 2.5);
  given('loanTerm', () => 30);

  given('affordability', () =>
    computeAffordability({
      initialRate: given.initialRate,
      loanTerm: given.loanTerm,
      targetMonthlyPayment: given.targetMonthlyPayment,
      costs: {
        taxes: given.taxes,
        insurance: given.insurance,
        pmi: given.pmi
      }
    })
  );

  describe('given a complete affordability calculation', () => {
    it.each(['taxes', 'insurance', 'pmi', 'pAndI'])('computes a cost for %s', (cost) => {
      expect(given.affordability.costs).toHaveProperty(cost, expect.not.toBeNaN());
    });

    it('has costs less than targetMonthlyPayment', () => {
      const allCosts = (Object.values(given.affordability.costs) as number[]).reduce(
        (l, r) => l + r,
        0
      );
      expect(allCosts).toBeLessThanOrEqual(given.targetMonthlyPayment + 0.001);
    });
  });

  describe('given only pAndI is a cost', () => {
    given('taxes', () => []);
    given('insurance', () => []);
    given('pmi', () => []);
    describe('given a known presentValue result', () => {
      given('presentValue', () => 300_000);
      given('targetMonthlyPayment', () =>
        computeMonthlyPayment({
          initialRate: given.initialRate,
          presentValue: given.presentValue,
          loanTerm: given.loanTerm
        })
      );
      it('returns the correct present value', () => {
        expect(given.affordability.presentValue).toBeCloseTo(given.presentValue);
      });
    });
  });

  describe('given pmi constraints max loan size', () => {
    given('maxPresentValue', () => 200_000);
    given('pmi', () => [
      {
        minPresentValue: 0,
        maxPresentValue: given.maxPresentValue,
        presentValueFactor: 0.012,
        costOffset: 0
      }
    ]);
    it('returns the max present value', () => {
      expect(given.affordability.presentValue).toBeLessThanOrEqual(given.maxPresentValue);
    });
  });

  describe('insurance causes the loan size to be unsolvable', () => {
    given('insurance', () => [
      {
        minPresentValue: 1_000_000,
        maxPresentValue: Number.POSITIVE_INFINITY,
        presentValueFactor: 0,
        costOffset: 150
      }
    ]);
    it('returns NaN for unsolvable presentValue', () => {
      expect(given.affordability.presentValue).toBeNaN();
    });
  });
});
