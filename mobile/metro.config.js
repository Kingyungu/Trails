const path = require('path');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Restrict Metro to only bundle files within the mobile directory
config.watchFolders = [__dirname];
config.resolver.blockList = [
  // Block the server directory from being bundled
  new RegExp(path.resolve(__dirname, '..', 'server').replace(/[/\\]/g, '[/\\\\]') + '.*'),
];

module.exports = config;