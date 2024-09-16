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
