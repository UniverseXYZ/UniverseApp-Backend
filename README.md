[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

* Provide environment variables file
```shell script
cp .env.sample .env
```

* Run with docker-compose
```shell script
docker-compose up
```

* Format and lint source code files
```shell script
npm run format
npm run lint
```

* Generate database migration file
```shell script
npm run db:migration:generate <file-name>
```

* Run database migrations
```shell script
npm run db:migration:run
```


## Authentication
The authentication process is based around the notion that a user must prove that he controls a specific address by signing a challenge with the corresponding private key. The first step is to get the challenge by doing a GET request to
```shell script
API_BASE_URL/api/auth/getChallenge
```
which returns a string, which you need to sign. You can do this using metamask, or any other kind of wallet provider.

After signing, you post the signature along with the address:
```shell script
  method: 'post',
  url: 'API_BASE_URL/api/auth/login',
  headers: {
    'Content-Type': 'application/json'
  },
  data : JSON.stringify({"address":"0x39aE4d18f...","signature":"0xe7203e823f..."});
```

We can extract from the signature and the challenge stored server side the signing address. If the signing address matches the provided address you get JWT token that you can use for subsequent requests.

After you get the token you add as a header to all authenticated requests:
```shell script
 'Authorization': 'Bearer eyJhbGciOi...'
```

## Mint new collection

The process of minting new collection requires multiple steps:

1. POST `/api/nfts/minting-collections`. This request will create the collection entity in the database so as to hold all off-chain data
   
2. Call the `deployUniverseERC721()` method of UniverseERC721Factory contract and keep the txHash in memory

3. PATCH `/api/nfts/minting-collections/{id}`. Use this endpoint to send the txHash to backend