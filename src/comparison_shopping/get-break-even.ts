type Loan = {
  rate: number;
  initialCost: number;
};

//returns the amount of months until the cost of two different loans are even
export const getBreakEven = (a: Loan, b: Loan) => {
  //two loans of the same rate will never break even
  if (a.rate === b.rate) {
    return 0;
  }
  const rateDiff = a.rate - b.rate;
  const initialCostDiff = b.initialCost - a.initialCost;
  const breakEven = initialCostDiff / rateDiff;
  //if the breakEven is negative then one of the loans is always better
  return breakEven > 0 ? breakEven : 0;
};
