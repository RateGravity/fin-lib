import { formatCurrency } from '@ownup/fin-lib';
import given from 'given2';

describe('formatCurrency', () => {
  given('returnNegative', () => undefined);
  given('fractionDigits', () => undefined);
  given('formatted', () => formatCurrency(given.value, given.returnNegative, given.fractionDigits));

  describe('given a positive value', () => {
    given('value', () => 1);
    it('formats with dollar sign', () => {
      expect(given.formatted).toEqual('$1');
    });
    describe('given a number of fractional digits', () => {
      given('fractionDigits', () => 3);
      it('formats with correct amount of numbers following decimal point', () => {
        expect(given.formatted).toEqual('$1.000');
      });
    });
  });

  describe('given a negative value', () => {
    given('value', () => -1);
    it('formats with a dollar sign', () => {
      expect(given.formatted).toEqual('-$1');
    });
    describe('given non-negative flag', () => {
      given('returnNegative', () => false);
      it('formats as a positive number', () => {
        expect(given.formatted).toEqual('$1');
      });
    });
  });

  describe('given a large value', () => {
    given('value', () => 3_000_000);
    it('formats with appropriate commas', () => {
      expect(given.formatted).toEqual('$3,000,000');
    });
  });
});
