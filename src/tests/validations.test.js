jest.mock("../rest/dao/projectDao");

describe("Project validations tests", () => {
  const projectValidation = require("../rest/services/validations/projectValidation");
  let mockProjectDto;
  let projectDao;
  beforeEach(() => {
    
    projectDao = require("../rest/dao/projectDao");
    mockProjectDto = {
      projectName: "a name",
      mission: "a mission",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "15/12//2018",
      row: 5
    };
    projectDao.availableName = jest.fn(name => {
      return true;
    });
  });

  test("a project with empty fields must add an error for each empty fields", () => {
    mockProjectDto = {
      projectName: "  ",
      mission: "  ",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "1/1/1998",
      row: 5
    };
    projectValidation(mockProjectDto);
    expect.arrayContaining(mockProjectDto.errors);
    expect(mockProjectDto.errors.length).toBe(2);
  });

  test("project timeframe with incorrect date format must add an error", () => {
    mockProjectDto = {
      projectName: "a name",
      mission: "a mission",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "15/12//20?8",
      row: 5
    };
    projectValidation(mockProjectDto);
    expect.arrayContaining(mockProjectDto.errors);
    expect(mockProjectDto.errors.length).toBe(1);
  });

  test("project name with existent name must add an error", () => {
    projectDao.availableName = jest.fn(name => {
      throw "Project name already in use";
    });

    projectValidation(mockProjectDto);

    expect(projectDao.availableName.mock.calls.length).toBe(1);
  });
});
