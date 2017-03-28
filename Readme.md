# @molecuel/mongodb [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

mongodb module for the Molecuel framework


## Build System

We are using npm to build the entire module.
During development we use the tsc compiler defined in the task.json for visual studio code cause the incremental compilation is very fast. To start the build and watch process in Visual Studio Code just press CTRL+SHIFT+B. The build console should come up and show you the results of the build process.
Any other editor can be used or just use tsc -w -p . on the commandline.

All available npm options:

### npm run tslint
Executes the linter for the typescript files in the src folder

### npm run tslint_test
Executes the linter for the typescript files in the test folder

### npm run ts
Runs the Typescript compiler for all files in the src directory

### npm run ts_test
Runs the Typescript compiler for all files in the test directory

### npm run build
Executes thes linter for the files in the src folder and runs the typescript compiler for the files in the src folder.

### npm run build_test
Executes thes linter for the files in the test folder and runs the typescript compiler for the files in the test folder.

### npm run build_all
Executes thes linter for the files in the src and test folder and runs the typescript compiler for the files in the src and test folder.

### npm run mocha
Just executes the local mocha command which relies in the local node_modules directory.

### npm run test
Executes the compilation of the test files and runs the mocha test.

### npm run cover
Runs the istanbuld code coverage test and remaps the results to the typescript sources

### npm run remap
Remaps the code coverage report to typescript

### npm run remaphtml
Remaps the html output of istanbul to the typescript sources

### npm run remaplcov
Remaps the lcov reports to the typescript sources

### npm run coveralls
Runs the code coverage reports, the remaps and send the results to the coveralls.io service

### npm run createdoc
Creates the HTML for the API documentation in the docs folder. The docs folder is in .gitignore and not part of the master branch. 

### npm run publishdocs
Publishes the API documentation to the gh-pages branch.

### npm run docs
Shortcut for createdocs and publishdocs

### npm run 2npm
Checks it the package version in package.json is higher than the registered one in npm registry and published the package if the version is higher.

[npm-image]: https://badge.fury.io/js/@molecuel/mongodb.svg
[npm-url]: https://npmjs.org/package/@molecuel/mongodb
[travis-image]: https://travis-ci.org/molecuel/mongodb.svg?branch=master
[travis-url]: https://travis-ci.org/molecuel/mongodb
[daviddm-image]: https://david-dm.org/molecuel/mongodb.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/molecuel/mongodb
[coveralls-image]: https://coveralls.io/repos/molecuel/mongodb/badge.svg
[coveralls-url]: https://coveralls.io/r/molecuel/mongodb
