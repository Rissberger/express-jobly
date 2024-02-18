"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 100000,
    equity: "0.1",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`, [job.id]);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New Job",
        salary: 100000,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    await Job.create(newJob); // First creation should work

    // Attempt to create a duplicate job
    await expect(Job.create(newJob))
      .rejects
      .toThrow(BadRequestError);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      // Expected jobs array
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    // Assuming you have a job to get; you might need to create one first
    let job = await Job.get(/* job ID */);
    expect(job).toEqual({
      // Expected job object
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(/* non-existent job ID */);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Updated Job",
    salary: 120000,
    equity: "0.2",
    // Note: companyHandle should not change and is not included here
  };

  test("works", async function () {
    // Assuming you have a job to update; you might need to create one first
    let job = await Job.update( updateData);
    expect(job).toEqual({
      id: 1 , 
      ...updateData,
      companyHandle: "c1", // The original companyHandle
    });

    // Verify the update in the database
  });

  // Additional update tests here, including for not found or bad requests
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    // Assuming you have a job to remove; you might need to create one first
    await Job.remove(/* job ID */);
    // Verify the job has been removed from the database
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(/* non-existent job ID */);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
