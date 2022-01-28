class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MarkRewardTierNftAsDepositedException extends ServiceError {
  constructor(message: string) {
    super(message);
  }
}
export class MarkRewardTierNftAsWithdrawnException extends ServiceError {
  constructor(message: string) {
    super(message);
  }
}
