const { Machine } = require('xstate');
const { createModel } = require('@xstate/test');

const adcoMachine = Machine({
  id: 'wizard',
  initial: 'start',
  states: {
    start: {
      on: {
        BOM_UPLOAD: 'step2',
      },
      meta: {
        test: async () => {
          await (await $('[data-qa-id="bom-upload"]')).waitForDisplayed();
        },
      },
    },
    start2: {
      type: 'final',
      meta: {
        test: async () => {
          await (await $('[data-qa-id="bom-upload"]')).waitForDisplayed();
        },
      },
    },
    step2: {
      on: {
        CLICK_BACK: 'start2',
        // REQUEST_QUOTE: "step3",
      },
      meta: {
        test: async () => {
          await (await browser.$('[data-qa-id="back-button"]')).waitForDisplayed();
          await (await $('[data-qa-id="cm-button"]')).waitForDisplayed();
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
  BOM_UPLOAD: async () => {
    await browser.execute(() => {
      document.getElementsByTagName('input')[1].style.visibility = 'visible';
      document.getElementsByTagName('input')[1].style.display = 'block';
    });
    const uploadHandle = await $('[data-qa-id="bom-upload"] input');
    const file = await browser.uploadFile('./demo_bom.xlsx');
    await uploadHandle.setValue(file);
  },

  CLICK_BACK: async () => {
    await (await $('[data-qa-id="back-button"]')).click();
  },
});

describe('Commenting', () => {
  before(async () => {
    // await browser.setWindowPosition(2000, 0);
    await browser.setWindowSize(1800, 2000);
  });

  const testPlans = testModel.getShortestPathPlans();
  // console.log(testPlans);
  // testPlans.forEach(plan => console.log(plan.paths[0].description))

  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      beforeEach(async () => {
        await browser.reloadSession();
      });
      plan.paths.forEach((path) => {
        it(
          path.description,
          async () => {
            await browser.url('https://adco-dev.herokuapp.com');
            await path.test(browser);
          },
          20000
        );
      });
    });
  });
});
