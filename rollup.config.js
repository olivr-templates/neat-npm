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

// Rollup plugins common to all module types
const plugins = [
  externals(
    // This config marks all dependencies as externals. It can be
    // changed to bundle dependencies instead but it is recommended
    // to only bundle small dependencies that are not updated often
    {
      packagePath: 'package.json',
      builtins: true,
      deps: true,
      devDeps: true,
      peerDeps: true,
      optDeps: true,
    }
  ),
  resolve({
    extensions,
  }),
  commonjs(),
  babel({
    babelHelpers: 'runtime',
    extensions,
  }),
]

// Generate ES6 modules (to be consumed via import)
const esModules = {
  input: glob.sync('src/**/*.[jt]s?(x)'),
  output: {
    dir: 'esm',
    format: 'esm',
    sourcemap: process.env.BUILD === 'production' ? false : true,
  },
  plugins: [
    alias({
      // File imports instead of directory imports for native Node ES6 support
      entries: {
        '@babel/runtime/regenerator': '@babel/runtime/regenerator/index.js',
        '@babel/runtime/helpers/asyncToGenerator':
          '@babel/runtime/helpers/asyncToGenerator.js',
      },
    }),
    ...plugins,
  ],
}

// Generate CommonJS modules (to be consumed via require)
const cjsModules = {
  input: glob.sync('src/**/*.[jt]s?(x)'),
  output: [
    {
      dir: 'cjs',
      format: 'cjs',
      sourcemap: process.env.BUILD === 'production' ? false : true,
    },
  ],
  plugins,
}

// Generate IIFE module for browser (to be consumed via <script>)
const exportName = varname.camelback(
  pkg.name.substring(pkg.name.lastIndexOf('/') + 1)
)

const iifeModule = {
  input: {
    include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['src/**/index.js', 'src/**/index.ts'],
  },
  output: [
    {
      file: pkg.browser,
      name: exportName,
      format: 'iife',
      sourcemap: process.env.BUILD === 'production' ? false : true,
    },
  ],
  plugins: [multi(), ...plugins],
}

// Generate minified version of IIFE module
const iifeModuleMin = {
  input: 'iife/index.js',
  output: [
    {
      file: pkg.unpkg,
      name: exportName,
      format: 'iife',
      sourcemap: true,
      sourcemapExcludeSources: true,
      plugins: [terser()],
    },
  ],
  plugins,
}

export default [esModules, cjsModules, iifeModule, iifeModuleMin]
