var botio = require('botio');
require('shelljs/global');

var fail = false;

silent(true);

//
// Lint
//
echo('>> Linting');

var output = exec('node make lint', {silent:false}).output,
    successMatch = output.match('files checked, no errors found');

if (successMatch) {
  botio.message('+ **Lint:** Passed');
} else {
  botio.message('+ **Lint:** FAILED');
  fail = true; // non-fatal, continue
}

//
// Get PDFs from local cache
//
echo('>> Copying cached PDF files to repo');
cp(__dirname+'/pdf-cache/*', './test/pdfs');

//
// Get ref snapshots
//
echo('>> Getting ref snapshots');
mkdir('-p', './test/ref');
cp('-Rf', __dirname+'/refs/*', './test/ref');

//
// Run tests
//
echo('>> Running tests');

cd('test');
var output = exec('node make test', {silent:false}).output,
    successMatch = output.match(/All tests passed/g);
cd('..');

if (successMatch) {
  botio.message('+ **Regression tests:** Passed');
} else {
  botio.message('+ **Regression tests:** FAILED');
  fail = true; // non-fatal, continue
}

//
// Update local cache of PDF files
//
echo('>> Updating local PDF cache')
mkdir('-p', __dirname+'/pdf-cache');
cp('./test/pdfs/*.pdf', __dirname+'/pdf-cache');


if (fail)
  exit(1);
