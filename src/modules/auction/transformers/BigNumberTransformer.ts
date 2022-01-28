import BigNumber from 'bignumber.js';

export const stringToBigNumber = (amount: string, decimalPlaces: number) =>
  new BigNumber(amount).dividedBy(Math.pow(100, decimalPlaces));

export const bigNumberToString = (amount: BigNumber, decimalPlaces: number) =>
  amount.multipliedBy(Math.pow(100, decimalPlaces)).toString();
