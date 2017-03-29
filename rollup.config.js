// rollup.config.js

import buble from 'rollup-plugin-buble'
import minify from 'rollup-plugin-minify'


export default {
  entry: './lib/mdrag.js',
  moduleName: 'mdrag',
  plugins:[
    buble(),
    minify({iife: 'dist/mdrag.min.js'})
  ],
  targets: [
    { format: 'es',   dest: 'dist/mdrag.es.js' },
    { format: 'cjs',  dest: 'dist/mdrag.cjs.js' },
    { format: 'amd',  dest: 'dist/mdrag.amd.js' },
    { format: 'umd',  dest: 'dist/mdrag.umd.js' },
    { format: 'iife', dest: 'dist/mdrag.iife.js' },
  ]
}