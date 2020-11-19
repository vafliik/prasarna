const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  const uploadHandle = await page.waitFor(
    '[data-qa-id="bom-upload"] input[type="file"]'
  );
  await uploadHandle.uploadFile(
    "/home/vafliik/projects/adco/QA/tests_shi/data/bom/basic.xlsx"
  );
  await page.waitFor('[data-qa-id="back-button"]');
//   await page.$eval('[data-qa-id="back-button"]', (elem) => elem.click());
  await page.screenshot({ path: "example.png" });

  await browser.close();
})();
