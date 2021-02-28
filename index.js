const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');

const wait = (len) => {
    len = len || 10000;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, len);
    });
};

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const path = require('path')

  // login

  await page.goto(credentials.pma);

  await page.type('#input_username', credentials.username);
  await page.type('#input_password', credentials.password);
  
  await Promise.all([
    page.click('#input_go'),
    page.waitForNavigation(),
  ]);

  // locating the DB list page

  await wait(3000);

  const frameHandle = await page.$('#frame_content');
  const frame = await frameHandle.contentFrame();

  const dbLinks = await frame.$x("//a[contains(@href, 'server_databases.php')]");

  await Promise.all([
    dbLinks[0].click(),
    frame.waitForNavigation(),
  ]);
  
  // locating the database's page

  await wait(3000);

  const dbLinks2 = await frame.$x("//a[contains(., '" + credentials.database + "')]");

  await Promise.all([
    dbLinks2[0].click(),
    frame.waitForNavigation(),
  ]);

  // locating the export page

  const dbExportLink = await frame.$x("//a[contains(@href, 'db_export.php')]");
  
  await Promise.all([
    dbExportLink[0].click(),
    frame.waitForNavigation({waitUntil: "domcontentloaded"}),
  ]);

  // exporting with default options

  await frame.waitForSelector('#buttonGo');

  await page._client.send(
    'Page.setDownloadBehavior',
    {
      behavior: 'allow',
      downloadPath: path.resolve(__dirname, 'exports'),
    },
  );

  await frame.click('#buttonGo');

  await wait(30000); // default PHP max_execution_time, PMA usually cannot exceed this?

  await browser.close();
})();