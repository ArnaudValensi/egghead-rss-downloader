const fs = require('fs');
const util = require('util');
const xml2js = require('xml2js');
const spawn = require('child-process-promise').spawn;
const sanitize = require('sanitize-filename');

const parseString = util.promisify(xml2js.parseString);

const escapeShell = str => sanitize(str).replace(/`/g, '\'');

async function downloadItem(filename, link) {
  console.log(`[+] Starting download for ${filename}`);

  const promise = spawn('curl', [`"${link}"`, '-o', filename], { shell: true });
  const childProcess = promise.childProcess;

  childProcess.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  childProcess.stderr.on('data', function (data) {
    process.stdout.write(data.toString());
  });

  await promise;

  console.log(`[+] Done`);
}

function createFolderIdNeeded(folderName) {
  if (!fs.existsSync(folderName)){
    fs.mkdirSync(folderName);
  }
}

const paddedNumber = number => ('0000' + number).slice(-4);

(async function runAsync() {
  const args = process.argv;

  if (args.length < 3) {
    console.log('Usage: node index.js <rss_file.xml>');
    process.exit(1);
  }

  const filename = process.argv[2];
  const file = fs.readFileSync(filename);
  const rss = await parseString(file);

  const entries = rss.rss.channel[0].item;
  const courseTitle = escapeShell(rss.rss.channel[0].title[0]);

  const items = entries.map(item => ({
    title: item.title[0],
    url: item.enclosure[0]['$'].url,
  }));

  createFolderIdNeeded('./videos');
  createFolderIdNeeded(`./videos/${courseTitle}`);
  process.chdir(`./videos/${courseTitle}`);

  console.log(`[+] Creating folder: ./videos/${courseTitle}`);

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const number = paddedNumber(index + 1);
    const filename = `"${escapeShell(`${number}-${item.title}.mp4`)}"`
    await downloadItem(filename, item.url);
  }

  console.log('[+] All course downloaded');
}()).catch(console.error);
