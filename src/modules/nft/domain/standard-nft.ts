import { IsString, IsNumber } from 'class-validator';

/**
 * Model class that reflects the standard used for NFTs metadata
 */
export class StandardNftMetadata {
  name?: string;
  description?: string;
  private image?: string;
  image_url?: string;
  image_large?: string;
  animation_url?: string;
  animation?: string;
  image_original_url?: string;
  external_url?: string;
  animation_original_url?: string;
  attributes?: StandardNftMetadataAttribute[] | Record<string, unknown>;

  constructor(json: Record<string, any>) {
    this.name = json?.name;
    this.description = json?.description;
    this.image = json?.image;
    this.image_url = json?.image_url;
    this.attributes = json?.attributes;
    this.animation_url = json?.animation_url;
    this.animation = json?.animation;
    this.external_url = json?.external_url;
  }

  public getImage() {
    return this.image || this.image_url || this.image_large;
  }

  public isImageOnIPFS() {
    return this.getImage()?.startsWith('ipfs:');
  }

  public getFileExtension() {
    const components = this.getImage()?.split('.');
    if (Array.isArray(components) && components.length >= 3) {
      const extension = components[components.length - 1];
      if (extension.length <= 7) return `.${extension}`;
    }
    return '';
  }

  public isImageOnWeb() {
    return !!this.getImage()?.startsWith('http');
  }

  public isImageBase64Image() {
    return !!this.getImage()?.startsWith('data:image/');
  }

  public getNormalizedAttributes() {
    if (this.attributes) {
      if (Array.isArray(this.attributes)) {
        return this.attributes;
      } else {
        return Object.keys(this.attributes).map((key) => ({
          trait_type: key,
          value: this.attributes[key],
        }));
      }
    }
    return undefined;
  }
}

class StandardNftMetadataAttribute {
  @IsString()
  trait_type?: string;

  @IsString()
  value?: string;

  @IsString()
  display_type?: string;

  @IsNumber()
  trait_count?: number;

  @IsString()
  order?: string;

  @IsString()
  max_value?: string;

  @IsString()
  min_value?: string;
}
