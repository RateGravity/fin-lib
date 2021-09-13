import { computeApr, ComputeAprInputs, computeFHAMip } from '@ownup/fin-lib';
import given from 'given2';

describe('computeApr', () => {
  given('computeMI', () => undefined);
  given('apr', () => computeApr(given.input, given.computeMI));

  describe('given a fixed period loan', () => {
    given(
      'input',
      (): ComputeAprInputs => ({
        totalFees: 1000,
        initialRate: 4.125,
        presentValue: 200000,
        loanTerm: 30,
        propertyValue: 300000,
        mortgageInsurance: 0
      })
    );

    it('returns an apr that includes the fees', () => {
      expect(given.apr).toBeCloseTo(4.1667);
    });

    describe('given no fees', () => {
      given(
        'input',
        (): ComputeAprInputs => ({
          totalFees: 0,
          initialRate: 3.75,
          presentValue: 500000,
          loanTerm: 30,
          propertyValue: 600000,
          mortgageInsurance: 0
        })
      );
      it('returns the same apr as the initial rate', () => {
        expect(given.apr).toBeCloseTo(given.input.initialRate);
      });
    });

    describe('given an fha loan', () => {
      given(
        'input',
        (): ComputeAprInputs => ({
          totalFees: 3853,
          initialRate: 4.375,
          presentValue: 450000,
          loanTerm: 30,
          mortgageInsurance: 131.25,
          propertyValue: 500000,
          upFrontMip: 1000
        })
      );
      given('computeMI', () => computeFHAMip);
      it('returns an apr that includes the fees and mi costs', () => {
        expect(given.apr).toBeCloseTo(4.708);
      });
    });
  });

  describe('given an adjustable rate loan', () => {
    given('fullyIndexedRate', () => 5);
    given(
      'input',
      (): ComputeAprInputs => ({
        totalFees: 1000,
        initialRate: 4.125,
        presentValue: 200000,
        loanTerm: 30,
        fixedTerm: 7,
        adjustmentPeriod: 1,
        fullyIndexedRate: given.fullyIndexedRate,
        caps: {
          initial: 2,
          periodic: 2,
          lifetime: 5
        },
        mortgageInsurance: 0,
        propertyValue: 300000
      })
    );
    it('returns an apr that includes fees and adjustments', () => {
      expect(given.apr).toBeCloseTo(4.62);
    });
    describe('given pmi', () => {
      given(
        'input',
        (): ComputeAprInputs => ({
          totalFees: 3853,
          initialRate: 4.375,
          presentValue: 450000,
          loanTerm: 30,
          fixedTerm: 10,
          adjustmentPeriod: 1,
          fullyIndexedRate: 5,
          caps: {
            initial: 5,
            periodic: 2,
            lifetime: 5
          },
          mortgageInsurance: 131.25,
          propertyValue: 500000
        })
      );
      it('returns an apr that includes pmi costs', () => {
        expect(given.apr).toBeCloseTo(4.859);
      });
    });

    describe('given a lower fullyIndexedRate', () => {
      given('fullyIndexedRate', () => 2.43);
      it('returns an apr that is lower than the initial rate', () => {
        expect(given.apr).toBeCloseTo(3.226);
      });
    });
  });
});
