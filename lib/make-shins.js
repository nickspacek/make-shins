#!/usr/bin/env node
'use strict';

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const d = new _debug2.default('make-shins');

_commander2.default.version('0.1.0').option('-i, --input <input>', 'Input markdown file', 'index.html.md').option('-o, --output <output>', 'Output directory', 'public').option('-l, --logo <logo>', 'logo.png file to use').option('-c, --custom-css <custom-css>', 'Directory to custom CSS').option('-i, --inline <inline>', 'Inlines CSS and JS, minifies output').option('-m, --minify <minify>', 'Minifies the output').parse(process.argv);

if (!_commander2.default.output) {
  console.error('output directory must not be blank');
  process.exit(-1);
}

console.time('make-shins');
d('Reading markdown');
const markdownString = _fsExtra2.default.readFileSync(_path2.default.resolve(_commander2.default.input), 'utf8');

const shinsTmpModule = 'shins-tmp';
const shinsTmpDir = `node_modules/${shinsTmpModule}`;
d('Preparing temporary directory');
_fsExtra2.default.removeSync(shinsTmpDir);
_fsExtra2.default.copySync('node_modules/shins', shinsTmpDir);

const shins = require(shinsTmpModule);

if (_commander2.default['custom-css']) {
  d('Copying custom CSS');
  _fsExtra2.default.copySync(_commander2.default['custom-css'], _path2.default.join(shinsTmpDir, '/pub/css'));
}

if (_commander2.default.logo) {
  const logoDestination = _path2.default.join(shinsTmpDir, 'source/images/logo.png');
  d(`Copying ${_commander2.default.logo} to ${logoDestination}`);
  _fsExtra2.default.copySync(_commander2.default.logo, logoDestination);
}

d('Rendering shins');
shins.render(markdownString, {
  customCss: _commander2.default['custom-css'],
  inline: _commander2.default.inline,
  minify: _commander2.default.minify
}, (error, html) => {
  if (error) {
    console.error('Could not render shins', error);
  }

  d('Writing output');
  _fsExtra2.default.writeFileSync(_path2.default.join(_commander2.default.output, 'index.html'), html);

  d(`Moving output to ${_commander2.default.output}`);
  _fsExtra2.default.moveSync(shinsTmpDir, _commander2.default.output);

  d('Finished');
  console.timeEnd('make-shins');
});