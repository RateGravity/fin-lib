import {
  AmortizationPeriod,
  computeAmortizationSchedule,
  ComputeAmortizationInputs
} from '@ownup/fin-lib';
import given from 'given2';

describe('computeAmortizationSchedule', () => {
  const itHasAnEndingBalanceOfZero = () =>
    it('has an ending balance of zero', () => {
      const length = given.amortizationSchedule.length;
      const lastMonth: AmortizationPeriod = given.amortizationSchedule[length - 1];
      expect(lastMonth.balanceAtEndOfMonth).toBeCloseTo(0);
    });

  const itPaysDownPrincipalCorrectly = () =>
    it('pays down principal correctly', () => {
      const length = given.amortizationSchedule.length;
      expect.assertions(length);
      let balanceAtBeginningOfMonth = given.input.presentValue; // loan starts with presentValue
      for (let i = 0; i < length; i++) {
        const period: AmortizationPeriod = given.amortizationSchedule[i];
        expect(period.balanceAtEndOfMonth).toBeCloseTo(
          balanceAtBeginningOfMonth - period.principal
        );
        balanceAtBeginningOfMonth = period.balanceAtEndOfMonth;
      }
    });

  const itHasAConsistentAmortizationSchedule = (startMonth: number = 1, endMonth?: number) =>
    it(`has a consistent amortization schedule from month ${startMonth} to ${
      endMonth ?? 'end'
    }`, () => {
      const startIndex = startMonth - 1;
      if (endMonth === undefined) {
        endMonth = given.input.loanTerm * 12;
      }
      const monthlyPayment = Math.round(
        given.amortizationSchedule[startIndex].principal +
          given.amortizationSchedule[startIndex].interest
      );
      const monthlyPayments = given.amortizationSchedule.map(
        ({ interest, principal }: AmortizationPeriod) => Math.round(interest + principal)
      );
      const data: number[] = [];
      for (let month = 0; month < startIndex; month++) {
        data[month] = expect.any(Number);
      }
      for (let month = startIndex; month < endMonth; month++) {
        data[month] = monthlyPayment;
      }
      for (let month = endMonth; month < given.amortizationSchedule.length; month++) {
        data[month] = expect.any(Number);
      }
      expect(monthlyPayments).toEqual(data);
    });

  given('amortizationSchedule', () => computeAmortizationSchedule(given.input));
  describe('given a fixed rate loan', () => {
    given(
      'input',
      (): ComputeAmortizationInputs => ({
        initialRate: 5.25,
        presentValue: 400_000,
        loanTerm: 15
      })
    );
    itHasAConsistentAmortizationSchedule();
    itHasAnEndingBalanceOfZero();
    itPaysDownPrincipalCorrectly();
  });

  describe('given an adjustable rate loan', () => {
    given(
      'input',
      (): ComputeAmortizationInputs => ({
        initialRate: 4,
        presentValue: 400_000,
        fullyIndexedRate: 5.02,
        loanTerm: 30,
        fixedTerm: 5,
        adjustmentPeriod: 1,
        caps: { initial: 2, periodic: 2, lifetime: 5 }
      })
    );
    it('increases monthly payment after fixed period', () => {
      const initialMonthlyPayment = Math.round(
        given.amortizationSchedule[0].principal + given.amortizationSchedule[0].interest
      );
      const adjustedMonthlyPayment = Math.round(
        given.amortizationSchedule[60].principal + given.amortizationSchedule[60].interest
      );
      expect(initialMonthlyPayment).toBeLessThan(adjustedMonthlyPayment);
    });
    itHasAConsistentAmortizationSchedule(1, 60);
    itHasAConsistentAmortizationSchedule(61);
    itHasAnEndingBalanceOfZero();
    itPaysDownPrincipalCorrectly();
    describe('given a lower fully indexed rate', () => {
      given(
        'input',
        (): ComputeAmortizationInputs => ({
          initialRate: 4,
          presentValue: 400_000,
          fullyIndexedRate: 2.375,
          loanTerm: 30,
          fixedTerm: 5,
          adjustmentPeriod: 1,
          caps: { initial: 2, periodic: 2, lifetime: 5 }
        })
      );
      it('decreases monthly payment after fixed period', () => {
        const initialMonthlyPayment = Math.round(
          given.amortizationSchedule[0].principal + given.amortizationSchedule[0].interest
        );
        const adjustedMonthlyPayment = Math.round(
          given.amortizationSchedule[60].principal + given.amortizationSchedule[60].interest
        );
        expect(initialMonthlyPayment).toBeGreaterThan(adjustedMonthlyPayment);
      });
    });
  });
});
