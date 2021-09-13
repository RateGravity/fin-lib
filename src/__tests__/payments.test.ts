import { computeMonthlyPayment, ComputeMonthlyPaymentInputs } from '@ownup/fin-lib';
import given from 'given2';

describe('computeMonthlyPayment', () => {
  given(
    'input',
    (): ComputeMonthlyPaymentInputs => ({
      initialRate: 4,
      presentValue: 400_000,
      loanTerm: 30
    })
  );
  given('monthlyPayment', () => computeMonthlyPayment(given.input));
  it('calculates monthly payment to known value', () => {
    expect(given.monthlyPayment).toBeCloseTo(1909.66);
  });
});
