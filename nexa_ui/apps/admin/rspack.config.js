const { DefinePlugin } = require('@rspack/core');
const { composePlugins, withNx, withReact } = require('@nx/rspack');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const withEnv = (config) => {
  config.plugins.push(
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.DOMAIN': JSON.stringify(process.env.DOMAIN),
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
      'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
      'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
      'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
      'process.env.APP_API_KEY': JSON.stringify(process.env.APP_API_KEY)
    })
  );
  return config;
};

module.exports = composePlugins(
  withNx(),
  withReact(),
  (config) => withEnv(config) // Apply the environment plugin correctly
);
