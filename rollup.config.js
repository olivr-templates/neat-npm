import { DEFAULT_EXTENSIONS } from '@babel/core'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import externals from 'rollup-plugin-node-externals'
import glob from 'glob'
import multi from '@rollup/plugin-multi-entry'
import pkg from './package.json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import varname from 'varname'

const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

/**
 * ES6 & CJS modules
 * These modules are to be consumed by Node.js projects or projects
 * that use bundlers/compilers/transpilers and inherit node_modules dependencies
 */

// Babel configuration (extends babel.config.js)
const babelConfig = {
  babelHelpers: 'runtime',
  extensions,
  plugins: ['@babel/plugin-transform-runtime'],
}

// This config marks all declared dependencies as externals.
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

// Plugins common to CJS and ES6 modules
const plugins = [
  externals(externalsConfig),
  resolve({ extensions }),
  commonjs(),
  babel(babelConfig),
]

/**
 * ES6 modules
 * to be consumed via import
 */
const esModules = {
  input: glob.sync('src/**/*.[jt]s?(x)'),
  output: {
    dir: 'dist/esm',
    format: 'esm',
    sourcemap: process.env.BUILD === 'production' ? false : true,
  },
  plugins: [
    alias({
      // File imports instead of directory imports for native Node ES6 support
      // Needed until babel adds extensions itself https://github.com/babel/babel/pull/10853
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
    }),
    ...plugins,
  ],
}

/**
 * CommonJS modules
 * to be consumed via require
 */
const cjsModules = {
  input: glob.sync('src/**/*.[jt]s?(x)'),
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: process.env.BUILD === 'production' ? false : true,
    },
  ],
  plugins,
}

/**
 * IIFE modules
 * These modules are consumed directly in the browser via <script> tag
 * Browsers don't have automatic access to node_modules dependencies, so basically
 * for every dependency, you have to either include it in iifeExternals or in iifeBundled
 * Don't forget to add the external dependencies to the documentation's examples/usage
 */

// Global variables used to access external dependencies
// These should be imported via another <script> tag
const iifeExternals = {
  'not-defined': 'notDefined', // This is for the 'not-defined' module used in the example src/myModule
}

// Dependencies that should be bundled (ES6 tree-shaking supported)
const iifeBundled = ['core-js']

const iifeExternalsConfig = { ...externalsConfig }
iifeExternalsConfig.exclude = [...iifeExternalsConfig.exclude, ...iifeBundled]

// Compute export name from package name
const exportName = varname.camelback(
  pkg.name.substring(pkg.name.lastIndexOf('/') + 1)
)

// Babel configuration (extends babel.config.js)
const iifeBabelConfig = {
  babelHelpers: 'bundled',
  extensions,
  presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
}

/**
 * IIFE modules
 * to be consumed directly via one <script> tag
 */
const iifeModules = {
  input: {
    include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['src/**/index.ts'], // Re-exports are not needed in a one file bundle
  },
  output: [
    // One file bundle
    {
      file: pkg.browser,
      name: exportName,
      format: 'iife',
      globals: iifeExternals,
      sourcemap: process.env.BUILD === 'production' ? false : true,
      sourcemapExcludeSources: true,
    },
    // Minified bundle
    {
      file: pkg.unpkg,
      name: exportName,
      format: 'iife',
      globals: iifeExternals,
      sourcemap: process.env.BUILD === 'production' ? false : true,
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
  ],
}

export default [esModules, cjsModules, iifeModules]
