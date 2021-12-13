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

export class ImageUriFormatNotSupportedError extends ServiceError {
  constructor(metadata) {
    super(`Image URI format not supported ${metadata}`);
  }
}

export class TokenAssertAddressNotSupportedError extends ServiceError {
  constructor() {
    super(`Token uri and id not supported`);
  }
}

export class OpenSeaNftImageSupportedError extends ServiceError {
  constructor() {
    super('OpenSea Nft is missing image');
  }
}
