import { metadataWithBase64SvgImage } from './constants';
import { StandardNftMetadata } from './standard-nft';

describe('StandardNftMetadata', () => {
  it('should detect image in image_url', async () => {
    const standardNftMetadata = new StandardNftMetadata({
      description: 'Snap a pair of chopsticks',
      home_url: 'https://app.poap.xyz/token/362561',
      image_url: 'https://storage.googleapis.com/poapmedia/international-sushi-day-2021-2021-logo-1623944746181.png',
      name: 'International Sushi Day 2021',
      year: 2021,
      tags: ['poap', 'event'],
      attributes: [
        {
          trait_type: 'startDate',
          value: '18-Jun-2021',
        },
      ],
    });
    expect(standardNftMetadata.isImageOnWeb()).toStrictEqual(true);
  });

  it('should detect base64 images', () => {
    const nftMetadata = new StandardNftMetadata(metadataWithBase64SvgImage);
    expect(nftMetadata.isImageBase64Image()).toStrictEqual(true);
  });
});
