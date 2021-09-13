/**
 * Note: Primarily for internal use, consider calculateMonthlyPayment
 * A Monthly Payment / Monthly dividend calculation for compounding interest
 * @param rate The Rate of the mortgage expressed as a monthly fraction.
 * @param payments The number of payments (usually years * 12)
 * @param presentValue The initial value of the mortgage
 * @param futureValue The targeted future value
 * @returns The monthly payment / dividend that must be paid to reach the target future
 * value given interest payments on the present value at the supplied rate.
 */
export function PMT(
  rate: number,
  payments: number,
  presentValue: number,
  futureValue: number
): number {
  const rExp = Math.pow(1 + rate, payments);
  return (rate * (futureValue + presentValue * rExp)) / (rExp - 1);
}

/**
 * Note: primarily for internal use.
 * A Future value calculator.
 * @param rate The Rate of the mortgage expressed as a monthly fraction
 * @param pmt The amount of money to be paid every month.
 * @param pv The initial value of the loan to compute future value from.
 * @param nper The number of payments to make on the loan.
 * @returns The future value of the loan based on the accumulation of interest and the payments towards the principle and interest.
 */
export function FV(rate: number, pmt: number, pv: number, nper: number): number {
  const pow = Math.pow(1 + rate, nper);
  if (rate) {
    return (pmt * (1 - pow)) / rate + pv * pow;
  }
  return pv - pmt * nper;
}
