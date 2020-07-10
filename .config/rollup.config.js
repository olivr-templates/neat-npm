/**
 * This rollup config contains two distinct configurations:
 * - ES6 & CJS modules
 * - IIFE modules
 */
import { DEFAULT_EXTENSIONS } from '@babel/core'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import externals from 'rollup-plugin-node-externals'
import glob from 'glob'
import multi from '@rollup/plugin-multi-entry'
import pkg from '../package.json'
import resolve from '@rollup/plugin-node-resolve'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { terser } from 'rollup-plugin-terser'
import varname from 'varname'

/**
 * Configuration for all module types
 */

// Recognized file extensions
const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

// Size snapshot path (to track the size of your bundles)
const snapshotPath = '.config/.size-snapshot.json'

// Generate source maps only for development
const sourcemap = process.env.BUILD === 'production' ? false : true

/**
 * Configuration specific to ES6 & CJS modules
 * These modules are to be consumed by Node.js projects or projects that
 * use bundlers/compilers/transpilers and inherit node_modules dependencies
 */

// Babel configuration (extends babel.config.js)
const babelConfig = {
  babelHelpers: 'runtime',
  extensions,
  plugins: ['@babel/plugin-transform-runtime'],
}

// This config marks all the dependencies in package.json as externals.
// It can be tweaked to bundle some dependencies but if you do so,
// please only bundle small dependencies that are not updated often
const externalsConfig = {
  packagePath: 'package.json',
  builtins: true,
  deps: true,
  devDeps: true,
  peerDeps: true,
  optDeps: true,
  exclude: [], // Add here the small dependencies you want to bundle
}

// Convert Babel directory imports to file imports for native Node ES6 support
// Needed until babel adds extensions itself https://github.com/babel/babel/pull/10853
const aliasConfig = {
  entries: [
    {
      find: '@babel/runtime/regenerator',
      replacement: '@babel/runtime/regenerator/index.js',
    },
    {
      find: /(@babel\/runtime\/helpers\/.*(?<!\.js)$)/i,
      replacement: '$1.js',
    },
    { find: /(core-js\/modules\/.*(?<!\.js)$)/i, replacement: '$1.js' },
  ],
}

/**
 * Configuration specific to IIFE modules
 * Browsers don't have automatic access to node_modules dependencies, so basically
 * for every dependency, you have to either include it in iifeExternals or in iifeBundled
 * Don't forget to add the external dependencies to the documentation's examples/usage
 */

// Global variables used to access external dependencies
// These should be imported via another <script> tag
const iifeExternals = {
  'is-not-defined': 'isNotDefined', // This is for the 'is-not-defined' module used in the example src/myModule
}

// Dependencies that should be bundled (ES6 tree-shaking supported)
const iifeBundled = ['core-js']
const iifeExternalsConfig = { ...externalsConfig }
iifeExternalsConfig.exclude = [...iifeExternalsConfig.exclude, ...iifeBundled]

// Compute export name from package name
const iifeExportName = varname.camelback(
  pkg.name.substring(pkg.name.lastIndexOf('/') + 1)
)

// Babel configuration (extends babel.config.js)
const iifeBabelConfig = {
  babelHelpers: 'bundled',
  extensions,
  presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
}

/**
 * Export Rollup configuration
 */
export default [
  // ES6 & CJS modules
  {
    input: glob.sync('src/**/*.[jt]s?(x)'),
    output: [
      // ES6 modules (to be consumed via import)
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap,
      },
      // CommonJS modules (to be consumed by require)
      {
        dir: 'dist/cjs',
        format: 'cjs',
        sourcemap,
      },
    ],
    plugins: [
      alias(aliasConfig),
      externals(externalsConfig),
      resolve({ extensions }),
      commonjs(),
      babel(babelConfig),
      sizeSnapshot({ snapshotPath }),
    ],
  },

  // IIFE modules to be consumed directly via one <script> tag
  {
    input: {
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/index.ts'], // Re-exports are not needed in a one file bundle
    },
    output: [
      // One file bundle
      {
        file: pkg.browser,
        name: iifeExportName,
        format: 'iife',
        globals: iifeExternals,
        sourcemap,
        sourcemapExcludeSources: true,
      },
      // Minified bundle
      {
        file: pkg.unpkg,
        name: iifeExportName,
        format: 'iife',
        globals: iifeExternals,
        sourcemap,
        sourcemapExcludeSources: true,
        plugins: [terser()],
      },
    ],
    plugins: [
      multi(),
      externals(iifeExternalsConfig),
      resolve({ extensions }),
      commonjs(),
      babel(iifeBabelConfig),
      sizeSnapshot({ snapshotPath }),
    ],
  },
]
