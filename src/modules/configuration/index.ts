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
    sessionSecret: process.env.SESSION_SECRET
  },
  ethereum: {
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    infuraProjectSecret: process.env.INFURA_PROJECT_SECRET,
    ethereumNetwork: process.env.ETHEREUM_NETWORK,
    beWalletPK: process.env.BE_WALLET_PK
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET
  }
};

export default registerAs('config', () => {
  return configValues
});
