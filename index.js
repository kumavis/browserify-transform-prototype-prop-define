const through = require('through2')
const parser = require('@babel/parser')
const { default: traverse } = require('@babel/traverse')
const { default: generate } = require('@babel/generator')
const protoPropDefinePlugin = require('babel-plugin-prototype-prop-define')
const concat = require('concat-stream')
const duplexer = require('duplexer2')

module.exports = function (file, opts) {
  if (/\.json$/.test(file)) return through()
  return createTransform()
}

function createTransform () {
  var output = through();
  return duplexer(concat({ encoding: 'buffer' }, function (buf) {
    const body = buf.toString('utf8').replace(/^#!/, '//#!');
    
    // // quick check for match before parsing
    // if (!body.includes('.prototype.')) {
    //   output.write(buf)
    //   output.end()
    //   return
    // }
    
    // parse, transform, output
    const ast = parser.parse(body)
    const pattern = protoPropDefinePlugin().visitor
    traverse(ast, pattern)
    const { code } = generate(ast, { /* options */ }, body)

    output.write(Buffer.from(code, 'utf8'))
    output.end()

  }), output);
}

