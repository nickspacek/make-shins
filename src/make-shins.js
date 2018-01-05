#!/usr/bin/env node

import Debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import program from 'commander'

const d = new Debug('make-shins')

program
  .version('0.1.0')
  .option('-i, --input <input>', 'Input markdown file', 'index.html.md')
  .option('-o, --output <output>', 'Output directory', 'public')
  .option('-l, --logo <logo>', 'logo.png file to use')
  .option('-c, --custom-css <custom-css>', 'Directory to custom CSS')
  .option('-i, --inline <inline>', 'Inlines CSS and JS, minifies output')
  .option('-m, --minify <minify>', 'Minifies the output')
  .parse(process.argv)

if (!program.output) {
  console.error('output directory must not be blank')
  process.exit(-1)
}

console.time('make-shins')
d('Reading markdown')
const markdownString = fs.readFileSync(path.resolve(program.input), 'utf8')

const shinsTmpModule = 'shins-tmp'
const shinsTmpDir = `node_modules/${shinsTmpModule}`
d('Preparing temporary directory')
fs.removeSync(shinsTmpDir)
fs.copySync('node_modules/shins', shinsTmpDir)

const shins = require(shinsTmpModule);

if (program['custom-css']) {
  d('Copying custom CSS')
  fs.copySync(
    program['custom-css'],
    path.join(shinsTmpDir, '/pub/css')
  )
}

if (program.logo) {
  const logoDestination = path.join(shinsTmpDir, 'source/images/logo.png');
  d(`Copying ${program.logo} to ${logoDestination}`)
  fs.copySync(program.logo, logoDestination)
}

d('Rendering shins')
shins.render(
  markdownString,
  {
    customCss: program['custom-css'],
    inline: program.inline,
    minify: program.minify
  },
  (error, html) => {
    if (error) {
      console.error('Could not render shins', error)
    }

    d('Writing output')
    fs.writeFileSync(path.join(program.output, 'index.html'), html)

    d(`Moving output to ${program.output}`)
    fs.moveSync(shinsTmpDir, program.output)

    d('Finished')
    console.timeEnd('make-shins')
  }
)
