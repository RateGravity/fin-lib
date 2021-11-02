import { getBreakEven } from '../get-break-even';

describe('get-break-even', () => {
  it('loanA and loanB have same rate', () => {
    const loanA = {
      rate: 5,
      initialCost: 1000
    };

    const loanB = {
      rate: 5,
      initialCost: 0
    };

    expect(getBreakEven(loanA, loanB)).toEqual(0);
  });

  it('loanA and loanB have same initial cost', () => {
    const loanA = {
      rate: 5,
      initialCost: 0
    };

    const loanB = {
      rate: 6,
      initialCost: 0
    };

    expect(getBreakEven(loanA, loanB) === 0).toEqual(true); //ugly because -0
  });

  it('loanA and loanB have different initial cost and same rate', () => {
    const loanA = {
      rate: 5,
      initialCost: 1000
    };

    const loanB = {
      rate: 5,
      initialCost: 0
    };

    expect(getBreakEven(loanA, loanB)).toEqual(0);
  });

  it('loanA and loanB have different initial cost and different rate but loanB is always better', () => {
    const loanA = {
      rate: 2.3,
      initialCost: 1000
    };

    const loanB = {
      rate: 1.5,
      initialCost: 0
    };

    expect(getBreakEven(loanA, loanB)).toEqual(0);
  });

  it('loanA and loanB have different initial cost and different rate and there is a breakEven point', () => {
    const loanA = {
      rate: 1.5,
      initialCost: 1000
    };

    const loanB = {
      rate: 2.3,
      initialCost: 0
    };

    expect(getBreakEven(loanA, loanB)).toBeCloseTo(1250);
  });
});
