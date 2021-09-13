# @ownup/fin-lib
Math functions for working with mortgage finances.

## Functions
### PMT
```ts
import { PMT } from '@ownup/fin-lib';

const rate = 3.125 / 100 / 12; // fractional monthly representation of 3.125%
const payments = 30 * 12; // 30 years as months
const presentValue = 400_000;
const futureValue = 0;

const monthlyPayment = PMT(rate, payments, presentValue, futureValue);
```

Given: rate, number of payments, present value of loan, and future value of loan, returns a monthly number reflecting the payment that would be required in order to reach the future value using compounding interest. This is a math function that is used internally by many other modules and should not be used directly in most cases.

### FV
```ts
import { FV } from '@ownup/fin-lib';

const rate = 3.125 / 100 / 12; // fractional monthly representation of 3.125%;
const pmt = 1_909; // dollars of payment per month
const pv = 400_000;
const nper = 20 * 12; // 20 years as months

const futureValue = FV(rate, pmt, pv, nper);
```

Given: rate, monthly payment amount, present value of loan, and number of payments to make, returns the value of the loan after the payments were made based on compounding interest. This is a math function that is used internally and should not be used directly in most cases.

### computeMonthlyPayment
```ts
import { computeMonthlyPayment } from '@ownup/fin-lib';

const monthlyPayment = computeMonthlyPayment({ initialRate: 3.125, loanTerm: 30, presentValue: 400_000 });
```

Given: Rate, term, and present value compute a monthly payment that would pay this loan down to 0 by the end of the term while factoring in compound interest.


### computeAmortizationSchedule
```ts
import { computeAmortizationSchedule } from '@ownup/fin-lib';

const fixedRateSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30
});

const adjustableRateSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  fullyIndexedRate: 4.25,
  loanTerm: 30,
  fixedTerm: 7,
  adjustmentPeriod: 1
  caps: { initial: 2, periodic: 2, lifetime: 5 }
});
```

Computes a monthly amortization schedule for the given fixed or adjustable loan. An amortization schedule is an array with each element representing a month and the following data points:
- `principle`: Amount of money that went towards the principle balance of the loan.
- `interest`: Amount of money that was paid in interest on the loan.
- `balanceAtEndOfMonth`: The principle balance remaining at the end of  the month.

In the case of adjustable rate loans that loan will adjust towards the fully indexed rate after the fixed term, based on the adjustment period and bounded by the caps. After an adjustment a new monthly payment to reach a zero balance will be computed and principle and interest payments will adjust accordingly.

### computeRegularMI
```ts
import { computeRegularMI } from '@ownup/fin-lib';

const amortizationSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30
});

const scheduleWithMortgageInsurance = computeRegularMI({
  propertyValue: 500_000,
  mortgageInsurance: 150,
}, amortizationSchedule);
```

Given a pre-computed amortization schedule adds monthly mortgage insurance premiums to the schedule following the standard rules for PMI. This will return an array matching the one from computeAmortizationSchedule with an additional `mortgageInsurance` data point representing the monthly mortgage insurance payment due.

### computeFHAMip
```ts
import { computeFHAMip } from '@ownup/fin-lib';

const amortizationSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30
});

const scheduleWithMortgageInsurance = computeFHAMip({
  propertyValue: 500_000,
  mortgageInsurance: 150,
  upFrontMip: 1_000
}, amortizationSchedule);
```

Given a pre-computed amortization schedule adds monthly mortgage insurance premiums to the schedule following the FHA rules. This will return an array matching the one from computeAmortizationSchedule with an additional `mortgageInsurance` data point representing the monthly mortgage insurance payment due. The upFrontMip amount given to this function is an amount of mortgage insurance premium that is paid upfront and included in the balance of the loan.

### computeApr
```ts
import { computeApr, computeFHAMip } from '@ownup/fin-lib';

const fixedRateApr = computeApr({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30,
  totalFees: 4_000,
  propertyValue: 500_000,
  mortgageInsurance: 0
});

const adjustableRateFHAApr = computeApr({
  initialRate: 3.125,
  presentValue: 400_000,
  fullyIndexedRate: 4.25,
  loanTerm: 30,
  fixedTerm: 7,
  adjustmentPeriod: 1
  caps: { initial: 2, periodic: 2, lifetime: 5 },
  totalFees: 4_000,
  propertyValue: 500_000,
  mortgageInsurance: 150,
  upFrontMip: 1_000,
}, computeFHAMip);
```

Given a fairly complete description of a loan returns the APR (Annual Percentage Rate) for the loan. Because mortgages already have their interest rates expressed as an annual rate APR for mortgages takes into account additional fees that are paid to the lender (`totalFees`) and any mortgage insurance that is paid. The APR attempts to reflect the "true cost" of a mortgage by accounting for the future value of any money spent up-front. Additionally for adjustable rate loans the APR accounts for estimated adjustments based on a fully indexed rate.
