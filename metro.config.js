const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const defaultResolveRequest = defaultConfig.resolver?.resolveRequest;

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      // Force axios to use its browser build (avoids Node.js crypto, http, etc.)
      if (moduleName === 'axios') {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
        };
      }
      return defaultResolveRequest
        ? defaultResolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
