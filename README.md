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
- `principal`: Amount of money that went towards the principal balance of the loan.
- `interest`: Amount of money that was paid in interest on the loan.
- `balanceAtEndOfMonth`: The principal balance remaining at the end of  the month.

In the case of adjustable rate loans that loan will adjust towards the fully indexed rate after the fixed term, based on the adjustment period and bounded by the caps. After an adjustment a new monthly payment to reach a zero balance will be computed and principal and interest payments will adjust accordingly.

### computePMI
```ts
import { computePMI } from '@ownup/fin-lib';

const amortizationSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30
});

const scheduleWithMortgageInsurance = computePMI({
  propertyValue: 500_000,
  mortgageInsurance: 150,
}, amortizationSchedule);
```

Given a pre-computed amortization schedule adds monthly mortgage insurance premiums to the schedule following the standard rules for PMI. This will return an array matching the one from computeAmortizationSchedule with an additional `mortgageInsurance` data point representing the monthly mortgage insurance payment due.

### computeFHAMIP
```ts
import { computeFHAMIP } from '@ownup/fin-lib';

const amortizationSchedule = computeAmortizationSchedule({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30
});

const scheduleWithMortgageInsurance = computeFHAMIP({
  propertyValue: 500_000,
  mortgageInsurance: 150,
  upFrontMip: 1_000
}, amortizationSchedule);
```

Given a pre-computed amortization schedule adds monthly mortgage insurance premiums to the schedule following the FHA rules. This will return an array matching the one from computeAmortizationSchedule with an additional `mortgageInsurance` data point representing the monthly mortgage insurance payment due. The upFrontMip amount given to this function is an amount of mortgage insurance premium that is paid upfront and included in the balance of the loan.

### computeApr
```ts
import { computeApr, computeFHAMIP } from '@ownup/fin-lib';

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
}, computeFHAMIP);
```

Given a fairly complete description of a loan returns the APR (Annual Percentage Rate) for the loan. Because mortgages already have their interest rates expressed as an annual rate APR for mortgages takes into account additional fees that are paid to the lender (`totalFees`) and any mortgage insurance that is paid. The APR attempts to reflect the "true cost" of a mortgage by accounting for the future value of any money spent up-front. Additionally for adjustable rate loans the APR accounts for estimated adjustments based on a fully indexed rate.

### computeTotalCost
```ts
import { computeTotalCost } from '@ownup/fin-lib';

const totalCost = computeTotalCost({
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30,
  totalFees: 4_000,
  propertyValue: 500_000,
  mortgageInsurance: 0
});
```

Given a fairly complete description of a loan return the total interest, fees, and mortgage insurance that will be paid over the life of the loan. When making a monthly payment on a loan a part of the monthly payment goes towards interest and a part goes towards paying the pinciple or balance of the loan. The payment towards the balance of the loan becomes equity in the house so is excluded from this computation.

### computeBreakEven
```ts
import { computeBreakEven } from '@ownup/fin-lib';

const loanA = {
  initialRate: 3.125,
  presentValue: 400_000,
  loanTerm: 30,
  totalFees: 4_000,
  propertyValue: 500_000,
  mortgageInsurance: 0
};

const loanB = {
  initialRate: 3.25,
  presentValue: 400_000,
  loanTerm: 30,
  totalFees: 3_000,
  propertyValue: 500_000,
  mortgageInsurance: 0
};

const breakEven = computeBreakEven(loanA, loanB);
```

Given 2 fairly complete descriptions of loans determine the "breakeven" point when it makes more sense to have one loan over the other. Often loans trade-off higher up-front cost with lower monthly cost in the form of a lower rate. One way to understand the implication of this tradeoff is with the breakeven calculation which find the point in which the lowered monthly costs recoups the higher up-front costs. This calculation examines the cost-to-date of a loan factoring in interest, fees, and mortgage insurance and balances it against the equity that is in the home. The equity in the home is an important consideration since many loans such as ones with longer terms, or ones in which some of the up-front costs are financed may seem objectively better on paper but actually leave the home owner with less equity in the home throughout the loan.

### computeAffordability
```ts
import { computeAffordability } from '@ownup/fin-lib';

const downPayment = 50_000;
const input = {
  initialRate: 3.25,
  loanTerm: 30,
  targetMonthlyPayment: 2_500,
  costs: {
    taxes: createTaxModels(downPayment),
    pmi: createPmiModels(downPayment),
    condoFee: [{
      costOffset: 150,
      presentValueFactor: 0,
      minPresentValue: Number.NEGATIVE_INFINITY,
      maxPresentValue: Number.POSITIVE_INFINITY
    }] // fixed cost condo fee
  }
}

const { presentValue, costs } = computeAffordability(input);
```

Given a loan term and rate and a set of additional monthly cost models return the maximum presentValue of the loan that will have a total monthly payment
less than or equal to the targetMonthlyPayment amount. Additionally return the discreet monthly costs for a loan of that size including the pAndI. 

### formatCurrency
```ts
import { formatCurrency } from '@ownup/fin-lib';

const formatted = formatCurrency(1_000, false, 2);
```

Given a number and two optional flags (should this function return negative numbers, how many decimal points to return.) returns a string formatted for US dollars.

## A note on precision / accuracy
This entire library is built using the standard javascript number types which suffer from precision loss after repeated operations. As such the numbers that are produced from this library should be considered "rough" numbers that are good enough for most mortgage calculators but not sufficient for CFPB mandated disclosures. All efforts have been made to have the functions in this library represent a correct understanding of mortgage financing practices and regulations, however no warranty is implied by this library and Own Up will not be held liable for any losses that are incurred as a result of using this library.

## Contributing
We welcome contributions in the form of bug fixes and new features. In the case of bug fixes we ask that you please provide a test case demonstrating the bug as well as the fix. In the case of the new features we ask that the feature include documentation in both TSDoc and the README.md file, as well as comprehensive test cases.