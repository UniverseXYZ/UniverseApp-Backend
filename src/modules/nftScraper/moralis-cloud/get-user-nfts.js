// getUserNFTs from EthNFTOwners
Moralis.Cloud.define('getUserNFTs', async function (request) {
  const { userAddress } = request.params;
  // In order to make queries based on the address you can convert it to lowercase
  const address = userAddress.toLowerCase();

  const query = new Moralis.Query('EthNFTOwners');
  query.equalTo('owner_of', address);

  const pipeline = [
    {
      lookup: {
        from: 'EthNFTMetadata',
        let: { token_id: '$token_id', token_address: '$token_address' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$token_id', '$$token_id'] }, { $eq: ['$token_address', '$$token_address'] }] },
            },
          },
          { $project: { _updated_at: 0, _created_at: 0, ACL: 0, _id: 0 } },
        ],
        as: 'metadata',
      },
    },
    {
      project: {
        contract_type: 1,
        name: 1,
        symbol: 1,
        token_id: 1,
        block_number: 1,
        amount: 1,
        updatedAt: 1,
        createdAt: 1,
        token_address: 1,
        token_uri: 1,
        owner_of: 1,
        metadata: { $first: '$metadata' },
      },
    },
  ];
  const queryResults = await query.aggregate(pipeline);

  return queryResults;
});
