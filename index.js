const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');
const path = require('path');

(async () => {
     // { headless: false} as a parameter is useful for troubleshooting, or just for some fun
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // login
  
    await fnLogin(page);
    await wait(3000);
  
    // since PMA is a great and modern application, it works with frames!
    const frameHandle = await page.$('#frame_content');
    const frame = await frameHandle.contentFrame();
  
    // locating the DB list page
    await fnDbListPage(frame);
    
    // locating the database's page
    await wait(3000);
    await fnDatabaseDetailPage(frame);
    
    // locating the export page
    await fnExportPage(frame);
  
    // exporting with default options
    await fnDownload(frame, page);
    
    // and we are done
    await browser.close();
})();

const fnLogin = async (page) => {
    // navigate to PMA page
    await page.goto(credentials.pma);

    await page.type('#input_username', credentials.username);
    await page.type('#input_password', credentials.password);
    
    await Promise.all([
      page.click('#input_go'),
      page.waitForNavigation(),
    ]);
};

const fnDbListPage = async (frame) => {
    // looking for the link to the list of databases
    const dbLinks = await frame.$x("//a[contains(@href, 'server_databases.php')]");

    await Promise.all([
      dbLinks[0].click(),
      frame.waitForNavigation(),
    ]);
};

const fnDatabaseDetailPage = async (frame) => {
    // looking for the link to the database link - exact match
    const dbLinks2 = await frame.$x("//a[contains(., '" + credentials.database + "')]");

    await Promise.all([
      dbLinks2[0].click(),
      frame.waitForNavigation(),
    ]);
};

const fnExportPage = async (frame) => {
    // looking for the link to the export button, the href link contains the session id...
    const dbExportLink = await frame.$x("//a[contains(@href, 'db_export.php')]");
  
    await Promise.all([
      dbExportLink[0].click(),
      frame.waitForNavigation({waitUntil: "domcontentloaded"}),
    ]);
};

const fnDownload = async (frame, page) => {
    await frame.waitForSelector('#buttonGo'); // the export button itself

    await page._client.send(
      'Page.setDownloadBehavior',
      {
        behavior: 'allow',
        downloadPath: path.resolve(__dirname, 'exports'),
      },
    );
  
    await frame.click('#buttonGo');
  
    await wait(30000); // default PHP max_execution_time, PMA usually cannot exceed this?
};

const wait = (len) => {
    len = len || 10000;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, len);
    });
};
