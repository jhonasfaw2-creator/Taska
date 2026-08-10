const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(projectRoot, 'src')];

/* ── NativeWind (Tailwind v4 / react-native-css) ──────────────
 * `withNativeWind` wires the CSS transformer for both platforms.
 * A single `global.css` is processed by PostCSS (@tailwindcss/postcss)
 * and compiled to native styles on iOS/Android and real CSS on web.
 */
module.exports = withNativeWind(config);
