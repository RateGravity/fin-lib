import { computeFHAMip, computeRegularMI } from '@ownup/fin-lib';
import given from 'given2';

describe('computeRegularMI', () => {
  given('mortgageInsurance', () => 100);
  given('input', () => ({
    propertyValue: 500_000,
    mortgageInsurance: given.mortgageInsurance
  }));
  given('amortizationTable', () => [
    { principle: 50_000, interest: 200, balanceAtEndOfMonth: 400_000 },
    { principle: 50_000, interest: 200, balanceAtEndOfMonth: 350_000 },
    { principle: 50_000, interest: 200, balanceAtEndOfMonth: 300_000 }
  ]);
  given('appliedMI', () => computeRegularMI(given.input, given.amortizationTable));
  it('applies monthly MI till LTV drops to 78%', () => {
    expect(given.appliedMI).toMatchObject([
      { mortgageInsurance: given.mortgageInsurance },
      { mortgageInsurance: given.mortgageInsurance },
      { mortgageInsurance: 0 }
    ]);
  });
});

describe('computeFHAMip', () => {
  given('mortgageInsurance', () => 100);
  given('input', () => ({
    propertyValue: given.propertyValue,
    mortgageInsurance: given.mortgageInsurance,
    upMip: 1_0000
  }));
  given('amortizationTable', () =>
    Array.from(Array(150)).map(() => ({
      principle: 5_000,
      interest: 200,
      balanceAtEndOfMonth: 100_000
    }))
  );
  given('appliedMI', () => computeFHAMip(given.input, given.amortizationTable));
  describe('given a loan over 90% LTV', () => {
    given('propertyValue', () => 107_000);
    it('applies monthly MI for the life of the loan', () => {
      expect(given.appliedMI).toMatchObject([
        ...Array.from(Array(150)).map(() => ({ mortgageInsurance: given.mortgageInsurance }))
      ]);
    });
  });
  describe('given a loan under 90% ltv', () => {
    given('propertyValue', () => 200_000);
    it('applies monthly MI for the first 11 years', () => {
      expect(given.appliedMI).toMatchObject([
        ...Array.from(Array(132)).map(() => ({ mortgageInsurance: given.mortgageInsurance })),
        ...Array.from(Array(18)).map(() => ({ mortgageInsurance: 0 }))
      ]);
    });
  });
});
