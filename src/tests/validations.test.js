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
      timeframe: "11/12/2018",
      row: 5
    };
    projectDao.availableName = jest.fn(name => {
      return true;
    });
  });

  test("a project with empty fields must add an error for each empty fields", () => {
    mockProjectDto.projectName = " ";
    mockProjectDto.mission = " ";
    projectValidation(mockProjectDto);
    expect.arrayContaining(mockProjectDto.errors);
    expect(mockProjectDto.errors.length).toBe(2);
  });

  test("project timeframe with incorrect date format must add an error", () => {
    mockProjectDto.timeframe = " 11/12/20?8";
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

describe("Milestone dto validations tests", () => {
  const milestoneValidation = require('../rest/services/validations/milestoneValidation');
  let mockMilestoneDto;
  beforeEach(() => {
    mockMilestoneDto = {
      quarter: "Quarter 1",
      tasks: "A tasks",
      impact: "Impact",
      impactCriterion: "Criterion",
      signsOfSuccess: "Signs of Success",
      signsOfSuccessCriterion: "Signs of Success Criterion",
      category: "Category",
      keyPersonnel: "224412",
      budget: "a budget",
      row: 10
    };
  });

  test("Quarter out of range must add an error", () => {
    mockMilestoneDto.quarter = "Quarter 5";
    milestoneValidation(mockMilestoneDto);
    expect.arrayContaining(mockMilestoneDto.errors);
    expect(mockMilestoneDto.errors.length).toBe(1);
  });

  test("a mileston with empty fields must add an error for each empty fields", () => {
    mockMilestoneDto.impact = " ";
    mockMilestoneDto.tasks = " ";
    milestoneValidation(mockMilestoneDto);
    expect.arrayContaining(mockMilestoneDto.errors);
    expect(mockMilestoneDto.errors.length).toBe(2);
  });
});
