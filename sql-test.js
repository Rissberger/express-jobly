const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: valid input", function () {
    const result = sqlForPartialUpdate(
      { firstName: 'Test', lastName: 'User' },
      { firstName: 'first_name', lastName: 'last_name' }
    );
    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ['Test', 'User']
    });
  });

  test("throws error with no data", function () {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });

  test("works: partial data input", function () {
    const result = sqlForPartialUpdate(
      { lastName: 'UpdatedUser' },
      { lastName: 'last_name' }
    );
    expect(result).toEqual({
      setCols: '"last_name"=$1',
      values: ['UpdatedUser']
    });
  });
});
