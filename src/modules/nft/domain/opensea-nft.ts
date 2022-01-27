import { IsNumber, IsString } from 'class-validator';
import { join } from 'path/posix';

/**
 * Model class that reflects the standard used for NFTs metadata
 */
export class StandardOpenseaNft {
  token_id: string;
  background_color?: string;
  image_url?: string;
  image_preview_url?: string;
  image_thumbnail_url?: string;
  image_original_url?: string;
  animation_url: string;
  animation_original_url: string;
  name: string;
  description?: string;
  traits?: StandardNftMetadataAttribute[] | Record<string, unknown>;
  external_link?: string;
  token_metadata?: string;
  creator?: string;
  collectionName?: string;
  collectionBannerUrl?: string;
  owner?: string;
  contract_type?: string;
  amount?: string;
  token_uri?: string;

  constructor(json: Record<string, any>) {
    this.token_id = json?.token_id;
    this.background_color = json?.background_color;
    this.name = json?.name;
    this.image_url = json?.image_url;
    this.image_thumbnail_url = json?.image_thumbnail_url;
    this.image_preview_url = json?.image_preview_url;
    this.image_original_url = json?.image_original_url;
    this.animation_url = json?.animation_url;
    this.animation_original_url = json?.animation_original_url;
    this.name = json?.name;
    this.description = json?.description;
    this.token_metadata = json?.token_metadata;
    this.traits = json?.traits;
    this.creator = json?.creator?.address;
    this.external_link = json?.external_link;
    this.collectionName = json?.collection.name;
    this.collectionBannerUrl = json?.collection.banner_image_url;
    this.owner = json?.owner.address;
    this.token_id = json?.token_id;
    this.contract_type = json?.asset_contract?.asset_contract_type === 'semi-fungible' ? 'ERC1155' : 'ERC721';
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
