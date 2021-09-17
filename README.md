[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

- Provide environment variables file

```shell script
cp .env.sample .env
```

- Run with docker-compose

```shell script
docker-compose up
```

- Format and lint source code files

```shell script
npm run format
npm run lint
```

- Generate database migration file

```shell script
npm run db:migration:generate <file-name>
```

- Run database migrations

```shell script
npm run db:migration:run
```

## Debugging

Few steps are needed in order to be able to debug:

- Create `.vscode` folder in root directory and create `launch.json` file.

- Paste the following config:

```
  {
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Debug: app-name",
      "remoteRoot": "/usr/src/app",
      "localRoot": "${workspaceFolder}",
      "protocol": "inspector",
      "port": 9229,
      "restart": true,
      "address": "0.0.0.0",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
 }
```

_The important variables are `"port": 9229` and ` "address": "0.0.0.0",`_

- Open .dev.command.sh and replace the last line:

```
npm run start:dev
```

with

```
npm run start:debug
```

- Run `docker-compose up`

- After the project has started start the debugger and add a breakpoint somewhere

- The breakpoint should be hit next time you run across it

_Remember to not commit the changes to `dev.command.sh` file_

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
