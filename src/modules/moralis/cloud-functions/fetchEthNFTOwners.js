Moralis.Cloud.define('fetchEthNFTOwners', async (request) => {
  const skip = parseInt(request.params.skip);
  const limit = parseInt(request.params.limit);
  const startDate = new Date(parseInt(request.params.start));
  const endDate = new Date(parseInt(request.params.end));

  const query = new Moralis.Query('EthNFTOwners');

  query.greaterThan('createdAt', startDate);
  query.lessThan('createdAt', endDate);

  query.skip(skip);
  query.limit(limit);

  const queryResults = await query.find();

  const tokens = [];
  for (let i = 0; i < queryResults.length; i++) {
    tokens.push({
      ...queryResults[i].attributes,
    });
  }

  return tokens;
});
