import { computeTotalCost } from '@ownup/fin-lib';
import given from 'given2';

describe('computeTotalCost', () => {
  given('input', () => ({
    totalFees: given.totalFees,
    initialRate: 3.75,
    presentValue: 500_000,
    loanTerm: 30,
    propertyValue: 600_000,
    mortgageInsurance: given.mortgageInsurance
  }));
  given('totalCost', () => computeTotalCost(given.input));
  given('lifetimeInterest', () => 333_608.06);

  describe('given a loan with no fees', () => {
    given('totalFees', () => 0);
    describe('given a loan with no mortgage insurance', () => {
      given('mortgageInsurance', () => 0);
      it('calculates total non-equity cost as just interest', () => {
        expect(given.totalCost).toBeCloseTo(given.lifetimeInterest);
      });
    });
    describe('given a loan with mortgage insurance', () => {
      given('mortgageInsurance', () => 1_000);
      given('lifetimeMortgageInsurance', () => 40_000);
      it('calculates total non-equity cost as interest and mortgage insurance', () => {
        expect(given.totalCost).toBeCloseTo(
          given.lifetimeInterest + given.lifetimeMortgageInsurance
        );
      });
    });
  });

  describe('given a loan with fees', () => {
    given('totalFees', () => 1_000);
    describe('given a loan with no mortgage insurance', () => {
      given('mortgageInsurance', () => 0);
      it('calculates total non-equity cost as interest and total fees', () => {
        expect(given.totalCost).toBeCloseTo(given.lifetimeInterest + given.totalFees);
      });
    });
    describe('given a loan with mortgage insurance', () => {
      given('mortgageInsurance', () => 1_000);
      given('lifetimeMortgageInsurance', () => 40_000);
      it('calculates total non-equity cost as interest, fees, and mortgage insurance', () => {
        expect(given.totalCost).toBeCloseTo(
          given.lifetimeInterest + given.totalFees + given.lifetimeMortgageInsurance
        );
      });
    });
  });
});
