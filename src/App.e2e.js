const { Machine } = require("xstate");
const { createModel } = require("@xstate/test");

describe("Adco app", () => {
  const adcoMachine = Machine({
    id: "wizard",
    initial: "start",
    states: {
      start: {
        on: {
          BOM_UPLOAD: "step2",
        },
        meta: {
          test: async (page) => {
            await page.waitFor('[data-qa-id="bom-upload"]');
          },
        },
      },
      start2: {
        type: "final",
        meta: {
          test: async (page) => {
            await page.waitFor('[data-qa-id="bom-upload"]');
          },
        },
      },
      step2: {
        on: {
          CLICK_BACK: "start2",
          // REQUEST_QUOTE: "step3",
        },
        meta: {
          test: async (page) => {
            await page.waitFor('[data-qa-id="back-button"]');
            await page.waitFor('[data-qa-id="cm-button"]');
          },
        },
      },
      // step3: {
      //   type: "final",
      //   meta: {
      //     test: async (page) => {
      //       await page.waitFor('[data-qa-id="estimated-price"]');
      //     },
      //   },
      // },
    },
  });

  const testModel = createModel(adcoMachine).withEvents({
    BOM_UPLOAD: async (page) => {
      const uploadHandle = await page.waitFor(
        '[data-qa-id="bom-upload"] input[type="file"]'
      );
      await uploadHandle.uploadFile(
        "/home/vafliik/projects/adco/QA/tests_shi/data/bom/basic.xlsx"
      );
    },

    CLICK_BACK: async (page) => {
      await page.click('[data-qa-id="back-button"]');
    },
  });

  // const testModel = createModel(adcoMachine, {
  //   events: {
  //     BOM_UPLOAD: async (page) => {
  //       const uploadHandle = await page.waitFor(
  //         '[data-qa-id="bom-upload"] input[type="file"]'
  //       );
  //       await uploadHandle.uploadFile(
  //         "/home/vafliik/projects/adco/QA/tests_shi/data/bom/basic.xlsx"
  //       );
  //     },
  //     CLICK_BACK: async page => {
  //       await page.waitFor('[data-qa-id="back-button"]');
  //       await page.$eval('[data-qa-id="back-button"]', elem => elem.click());
  //       // await page.click('[data-qa-id="back-button"]');
  //     },
  //     REQUEST_QUOTE: {
  //       exec: async (page) => {
  //         await page.type('[data-qa-id="assembly-quantity-input"]', "1");
  //         await page.click('[data-qa-id="continue-button"]');
  //       },
  //       // await page.$eval('[data-qa-id="assembly-quantity-input"]', el => el.value = '1');
  //       // await page.type('[data-qa-id="assembly-quantity-input"]', "1");
  //       // await page.click('[data-qa-id="continue-button"]');
  //     },
  //   },
  // });

  const testPlans = testModel.getSimplePathPlans();

  testPlans.forEach((plan, i) => {
    describe(plan.description, () => {
      plan.paths.forEach((path, i) => {
        it(
          path.description,
          async () => {
            await page.goto(`https://adco-dev.herokuapp.com`);
            await path.test(page);
          },
          20000
        );
      });
    });
  });

  it("coverage", () => {
    testModel.testCoverage();
  });
});
