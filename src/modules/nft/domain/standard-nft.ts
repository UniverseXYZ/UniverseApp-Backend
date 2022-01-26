import { IsNumber, IsString } from 'class-validator';
import { join } from 'path/posix';

/**
 * Model class that reflects the standard used for NFTs metadata
 */
export class StandardNftMetadata {
  name?: string;
  description?: string;
  private image?: string;
  image_url?: string;
  image_large?: string;
  traits?: StandardNftMetadataAttribute[] | Record<string, unknown>;
  attributes?: StandardNftMetadataAttribute[] | Record<string, unknown>;
  external_link?: string;
  token_metadata?: string;
  background_color?: string;
  image_preview_url?: string;
  image_thumbnail_url?: string;
  image_original_url?: string;
  animation_url?: string;
  animation_original_url?: string;
  creator?: string;
  collectionName?: string;

  constructor(json: Record<string, any>) {
    this.name = json?.name;
    this.description = json?.description;
    this.image = json?.image;
    this.image_url = json?.image_url;
    this.attributes = json?.attributes;
    this.token_metadata = json?.token_metadata;
    this.background_color = json?.background_color;
    this.image_preview_url = json?.image_preview_url;
    this.image_thumbnail_url = json?.image_thumbnail_url;
    this.image_original_url = json?.image_thumbnail_url;
    this.animation_url = json?.animation_url;
    this.animation_original_url = json?.animation_original_url;
    this.traits = json?.traits;
    this.creator = json?.creator?.address;
    this.external_link = json?.external_link;
    this.collectionName = json?.collection.name;
  }

  public getImage() {
    return this.image || this.image_url || this.image_large;
  }

  public isImageOnIPFS() {
    return this.getImage()?.startsWith('ipfs:');
  }

  public isImageOnWeb() {
    return !!this.getImage()?.startsWith('http');
  }

  public isImageBase64Image() {
    return !!this.getImage()?.startsWith('data:image/');
  }

  public getNormalizedAttributes() {
    if (this.traits) {
      return this.traits;
    }
    return undefined;
  }
}

class StandardNftMetadataAttribute {
  @IsString()
  trait_type: string;

  @IsString()
  value: string;

  @IsString()
  display_type: string;

  @IsNumber()
  trait_count: string;

  @IsString()
  order?: string;
}
