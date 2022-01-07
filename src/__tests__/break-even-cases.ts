import { ComputeBreakEvenInputs } from '@ownup/fin-lib';

export const cases: { a: ComputeBreakEvenInputs; b: ComputeBreakEvenInputs }[] = [
  {
    a: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 600000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 600000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 1000,
      initialRate: 4.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 1000,
      initialRate: 4.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 10000000,
      initialRate: 3.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 5.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 10000,
      initialRate: 3.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 5.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 0,
      initialRate: 5.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 10000,
      initialRate: 3.0,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 100000,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 10000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 0,
      initialRate: 1,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 100000,
      initialRate: 10,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 10000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 5000,
      initialRate: 1,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 1000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 10000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 100000,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 100000,
      initialRate: 10,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 1,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 10000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 0,
      initialRate: 3.75,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  },
  {
    a: {
      totalFees: 1000,
      initialRate: 3,
      presentValue: 500000,
      loanTerm: 15,
      propertyValue: 600000,
      mortgageInsurance: 0
    },
    b: {
      totalFees: 5000,
      initialRate: 1,
      presentValue: 500000,
      loanTerm: 30,
      propertyValue: 600000,
      mortgageInsurance: 0
    }
  }
];
