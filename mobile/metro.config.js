const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(projectRoot, 'src')];

/* ── Platform-specific CSS resolution ───────────────────
 * Importing 'global.css' resolves to:
 *   global.web.css on web (has @import "tailwindcss" for PostCSS)
 *   global.css       on native (LightningCSS-safe, no import)
 */
const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.endsWith('global.css')) {
    return context.resolveRequest(
      context,
      moduleName.replace(/\.css$/, '.web.css'),
      platform,
    );
  }
  if (typeof origResolveRequest === 'function') {
    return origResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config);
