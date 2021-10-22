class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NftMissingAttributesError extends ServiceError {
  constructor() {
    super('Nft is missing required attributes');
  }
}

export class SkippedUniverseNftError extends ServiceError {
  constructor(address: string) {
    super(`Universe NFT skipped ${address}`);
  }
}

export class TokenUriFormatNotSupportedError extends ServiceError {
  constructor(tokenUri: string) {
    super(`Token URI format not supported ${tokenUri}`);
  }
}

export class NotFoundNftOwnerError extends ServiceError {
  constructor(address: string) {
    super(`Not found the NFT owner in the user table ${address}`);
  }
}
