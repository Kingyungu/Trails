const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Restrict Metro to only bundle files within the mobile directory
config.watchFolders = [__dirname];
config.resolver.blockList = [
  // Block the server directory from being bundled
  new RegExp(path.resolve(__dirname, '..', 'server').replace(/[/\\]/g, '[/\\\\]') + '.*'),
];

module.exports = config;
