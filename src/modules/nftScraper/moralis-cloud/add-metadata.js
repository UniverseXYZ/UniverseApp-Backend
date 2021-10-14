Moralis.Cloud.job('addMetadata', async (request) => {
  logger.info('Running addMetadata job');
  const query = new Moralis.Query('EthNFTOwners');
  //query.doesNotExist('isScraped'); // only check those that have not been scraped before
  const items = await query.find({ useMasterKey: true });

  for (let i = 0; i < items.length; ++i) {
    const token_uri = items[i].get('token_uri');
    if (token_uri && token_uri.length) {
      // get token_uri data

      const result = await Moralis.Cloud.httpRequest({
        url: token_uri,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
      // add new EthNFTMetadata item
      const EthNFTMetadata = Moralis.Object.extend('EthNFTMetadata');
      const metadata = new EthNFTMetadata();
      metadata.set('token_address', items[i].get('token_address'));
      metadata.set('token_id', items[i].get('token_id'));
      metadata.set('name', result.data.name);
      if (result.data.description) metadata.set('description', result.data.description);
      if (result.data.image) metadata.set('image', result.data.image);
      if (result.data.image_url) metadata.set('image_url', result.data.image_url);
      if (result.data.optimized_url) metadata.set('optimized_url', result.data.optimized_url);
      if (result.data.thumbnail_url) metadata.set('thumbnail_url', result.data.thumbnail_url);
      if (result.data.original_url) metadata.set('original_url', result.data.original_url);
      if (result.data.external_url) metadata.set('external_url', result.data.external_url);
      if (result.data.animation_url) metadata.set('animation_url', result.data.animation_url);
      if (result.data.background_color) metadata.set('background_color', result.data.background_color);
      if (result.data.traits) metadata.set('traits', result.data.traits);
      if (result.data.unlockable) metadata.set('unlockable', result.data.unlockable);
      await metadata.save(null, { useMasterKey: true });
      // flag item was scraped
      items[i].set('isScraped', true);
      await items[i].save(null, { useMasterKey: true });
    }
  }
});
