import { FV, PMT } from '@ownup/fin-lib';
import given from 'given2';

describe('mortgage math', () => {
  given('rate', () => 0.04 / 12);
  given('payments', () => 360);
  given('presentValue', () => 400_000);
  given('remainingPrincipal', () => {
    let remainingPrincipal = given.presentValue;
    for (let month = 1; month <= given.payments; month++) {
      const interest = given.rate * remainingPrincipal;
      remainingPrincipal -= given.payment - interest;
    }
    return remainingPrincipal;
  });

  describe('PMT', () => {
    given('futureValue', () => 0);
    given('payment', () => PMT(given.rate, given.payments, given.presentValue, given.futureValue));
    it('calculates payment to pay to future value correctly', () => {
      expect(given.remainingPrincipal).toBeCloseTo(given.futureValue);
    });
  });

  describe('FV', () => {
    given('payment', () => 1_909.66);
    given('futureValue', () => FV(given.rate, given.payment, given.presentValue, given.payments));
    describe.each([360, 12])('given %s payments', (payments) => {
      given('payments', () => payments);
      it('calculates future value based on payment', () => {
        expect(given.futureValue).toBeCloseTo(given.remainingPrincipal);
      });
    });
    describe('given paying more than required', () => {
      given('payment', () => 2_000);
      it('has a negative future value', () => {
        expect(given.futureValue).toBeLessThan(0);
      });
    });
  });
});
