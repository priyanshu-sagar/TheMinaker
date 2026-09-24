const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support for monorepo workspace packages
config.resolver.nodeModulesPaths = [
  `${__dirname}/node_modules`,
  `${__dirname}/../../node_modules`,
];

// Watch shared packages for hot reload
config.watchFolders = [
  `${__dirname}/../../packages/shared-types`,
  `${__dirname}/../../packages/ui-kit`,
];

module.exports = config;
