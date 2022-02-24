import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';
config();

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
    clientConfig: {
      host: process.env.ARWEAVE_HOST, // Hostname or IP address for a Arweave host
      port: parseInt(process.env.ARWEAVE_PORT, 10), // Port
      protocol: process.env.ARWEAVE_PROTOCOL, // Network protocol http or https
      timeout: parseInt(process.env.ARWEAVE_TIMEOUT, 10), // Network request timeouts in milliseconds
      logging: JSON.parse(process.env.ARWEAVE_NETWORK_LOGGING), // Enable network request logging
    },
    minConfirmations: parseInt(process.env.ARWEAVE_MIN_CONFIRMATIONS, 10),
    walletKey: JSON.parse(process.env.ARWEAVE_WALLET_KEY),
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
