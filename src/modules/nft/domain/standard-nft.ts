import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

/**
 * Model class that reflects the standard used for NFTs metadata
 */
export class StandardNftMetadata {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StandardNftMetadataAttribute)
  attributes?: StandardNftMetadataAttribute[];

  constructor(json: Record<string, any>) {
    this.name = json?.name;
    this.description = json?.description;
    this.image = json?.image;
    this.attributes = json?.attributes;
  }

  public isImageOnIPFS() {
    return this.image?.startsWith('ipfs:');
  }

  public getFileExtension() {
    const components = this.image?.split('.');
    if (Array.isArray(components) && components.length > 0) {
      return `.${components[components.length - 1]}`;
    }

    return '';
  }

  public isImageOnWeb() {
    return this.image?.startsWith('http');
  }
}

class StandardNftMetadataAttribute {
  @IsString()
  trait_type: string;

  @IsString()
  value: string;
}
