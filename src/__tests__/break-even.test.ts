import { computeBreakEven } from '@ownup/fin-lib';
import given from 'given2';
import { cases } from './break-even-cases';

describe('computeBreakEven', () => {
  given('breakEven', () => computeBreakEven(given.inputA, given.inputB));

  // Breakeven is hard math. We've validated the cases that
  // are coded here by manually running the amortizations tables
  // and finding the breakeven point, using snapshots to effectively
  // write these tests and prevent them from changing is easier than
  // pretending we have well understood answers.
  it.each(cases)('given %j', ({ a, b }) => {
    given('inputA', () => a);
    given('inputB', () => b);
    expect(given.breakEven).toMatchSnapshot();
  });
});
