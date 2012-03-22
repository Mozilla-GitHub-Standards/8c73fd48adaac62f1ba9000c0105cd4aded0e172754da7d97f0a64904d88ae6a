var botio = require('botio');
require('shelljs/global');

var fail = false;

silent(true);

//
// Lint
//
echo('>> Linting');
if (exec('make lint', {silent:false}).code !== 0) {
  botio.message('+ **Lint:** FAILED');
  fail = true; // non-fatal, continue
} else {
  botio.message('+ **Lint:** Passed');
}

//
// Get PDFs from local cache
//
echo('>> Copying cached PDF files to repo');
cp(__dirname+'/pdf-cache/*', './test/pdfs');

//
// Deploy missing files
//
echo('>> Deploying missing files');
cp('-f', __dirname+'/test-files/local.mk', '.');
cp('-f', __dirname+'/test-files/browser_manifest.json', './test/resources/browser_manifests');

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
if (exec('make bot_test', {silent:false}).code !== 0) {
  botio.message('+ **Regression tests:** FAILED');
  fail = true; // non-fatal, continue
} else {
  botio.message('+ **Regression tests:** Passed');
}

//
// Copy (possibly) new PDFs to local cache
//
echo('>> Updating local PDF cache')
mkdir('-p', __dirname+'/pdf-cache');
cp('./test/pdfs/*.pdf', __dirname+'/pdf-cache');


if (fail)
  exit(1);
