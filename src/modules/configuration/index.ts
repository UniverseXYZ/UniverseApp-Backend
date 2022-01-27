import { registerAs } from '@nestjs/config';

export const configValues = {
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
  },
  app: {
    port: parseInt(process.env.APP_PORT, 10),
  },
  ethereum: {
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    infuraProjectSecret: process.env.INFURA_PROJECT_SECRET,
    ethereumNetwork: process.env.ETHEREUM_NETWORK,
    beWalletPK: process.env.BE_WALLET_PK,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    apiSecret: process.env.API_SECRET,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    s3BaseUrl: process.env.AWS_S3_BASE_URL,
  },
  arweave: {
    wallet: process.env.AIRWEAVE_WALLET,
  },
  moralis: {
    serverUrl: process.env.MORALIS_SERVER_URL,
    masterKey: process.env.MORALIS_MASTER_KEY,
    applicationId: process.env.MORALIS_APPLICATION_ID,
  },
  opensea: {
    apiKey: process.env.OPEN_SEA_X_API_KEY,
  },
};

export default registerAs('config', () => {
  return configValues;
});
