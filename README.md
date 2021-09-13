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
