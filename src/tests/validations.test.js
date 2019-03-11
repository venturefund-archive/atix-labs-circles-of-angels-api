const { assert } = require("chai");
const { projectValidation } = require("../rest/services/validations/csvImporterValidations");

describe("Project validations tests", () => {
  it("a project with empty fields must add an error for each empty fields", () => {
    const mockProjectDto = {
      projectName: "  ",
      mission: "  ",
      problemAddressed: "a problem",
      location: "here",
      timeframe: new Date("1/1/1998").toDateString(),
      row: 5
    };
    projectValidation(mockProjectDto);
    assert.isArray(mockProjectDto.errors);
    assert.equal(mockProjectDto.errors.length, 2);
  });

  it("project timeframe with incorrect date format must add an error", () => {
    const mockProjectDto = {
      projectName: "a name",
      mission: "a mission",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "15/12/20?8",
      row: 5
    };
    projectValidation(mockProjectDto);
  });
});
