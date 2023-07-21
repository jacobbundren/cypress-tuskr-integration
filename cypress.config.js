const { defineConfig } = require("cypress");
const uniqueId = new Date().valueOf();
const tenantId = "fd98afae-29d8-4e7d-a875-d502d3d58192";
const apiToken = "xd2W9NwjI3uV9B2YUeXTY8jU6c1P2J0fxKLdXrHa";
const testRun = `Cypress-Tuskr-Integration-Run ${uniqueId}`;
const method = "POST";
const headers = {
  "Content-Type": "application/json",
  "Authorization": `bearer ${apiToken}`
}
const creationContent = {
  method: method,
  body: JSON.stringify({
    data: {
      name: testRun,
      project: "Brokerkit",
      testCaseInclusionType: "ALL"
    }
  }),
  headers: headers
}

const createTestRunUrl = `https://api.tuskr.live/api/tenant/${tenantId}/test-run`;
const updateTestRunUrl = `https://api.tuskr.live/api/tenant/${tenantId}/test-run-result/bulk`
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("before:run", (details) => {
        createCITestRun();
      });
      on("after:run", async (results) => {
        let { passed, failed} = parseTestResults(results)
        await reportPassesToCI(passed);
        await reportFailuresToCI(failed)
      })
    },
  },
});

async function createCITestRun() {
  await fetch(createTestRunUrl, creationContent).then((response) => {
    if(response.status !== 200) {
      throw ("Test run failed to create!");
    } else {
      console.log("Test run created!");
    }
  })
}

function parseTestResults(results) {
  let passed = [];
  let failed = [];
  if (results.runs && results.runs.length > 0) {
    results.runs.forEach((run) => {
      run.tests.forEach((test) => {
        if (test.state === "passed") {
          passed.push(test.title[1])
        } else if (test.state === "failed") {
          failed.push(test.title[1])
        }
      });
    });
  }
  return { passed, failed }
}
async function reportPassesToCI(passed) {
  const passedUpdateContent = {
    method: method,
    headers: headers,
    body: JSON.stringify({
      data: {
        status: "PASSED",
        testRun: testRun,
        testCases: passed
      }
    })
  };
  await fetch(updateTestRunUrl, passedUpdateContent).then((response) => {
    if (response.status !== 200) {
      throw ("Error writing passed test results to Tuskr")
    }
  });
}

async function reportFailuresToCI(failures) {
  const failedUpdateContent = {
    method: method,
    headers: headers,
    body: JSON.stringify({
      data: {
        status: "FAILED",
        testRun: testRun,
        testCases: failures
      }
    })
  }
  await fetch(updateTestRunUrl, failedUpdateContent).then((response => {
    if (response.status !== 200) {
      throw ("Error writing failed test results to Tuskr")
    }
  }))
}