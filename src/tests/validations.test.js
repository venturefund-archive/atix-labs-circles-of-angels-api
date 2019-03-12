const {
  projectValidation
} = require("../rest/services/validations/projectValidation");
const {
  milestoneValidation
} = require("../rest/services/validations/milestoneValidation");

let mockProjectDto = {
  projectName: "a name",
  mission: "a mission",
  problemAddressed: "a problem",
  location: "here",
  timeframe: "12/12/2018",
  row: 5
};
let mockProjectDao = {
  availableName: jest.fn(name => {
    return true;
  })
};
let mockMilestoneDto = {
  quarter: "Quarter 1",
  tasks: "A tasks",
  impact: "Impact",
  impactCriterion: "Criterion",
  signsOfSuccess: "Signs of Success",
  signsOfSuccessCriterion: "Signs of Success Criterion",
  category: "Category",
  keyPersonnel: "224412",
  budget: "a budget"
};

describe("Project validations tests", () => {
  afterEach(() => {
    mockProjectDto = {
      projectName: "a name",
      mission: "a mission",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "12/12/2018",
      row: 5
    };
    mockProjectDao = {
      availableName: jest.fn(name => {
        return true;
      })
    };
  });

  test("a project with empty fields must add an error for each empty fields", () => {
    mockProjectDto.projectName = " ";
    mockProjectDto.mission = " ";
    projectValidation(mockProjectDto, mockProjectDao);
    expect.arrayContaining(mockProjectDto.errors);
    expect(mockProjectDto.errors.length).toBe(2);
  });

  test("project timeframe with incorrect date format must add an error", () => {
    mockProjectDto = {
      projectName: "a name",
      mission: "a mission",
      problemAddressed: "a problem",
      location: "here",
      timeframe: "15/12/20?8",
      row: 5
    };
    projectValidation(mockProjectDto, mockProjectDao);
    expect.arrayContaining(mockProjectDto.errors);
    expect(mockProjectDto.errors.length).toBe(1);
  });

  test("project name with existent name must add an error", () => {
    mockProjectDao = {
      availableName: jest.fn(name => {
        throw "Project name already in use";
      })
    };

    projectValidation(mockProjectDto, mockProjectDao);

    expect(mockProjectDao.availableName.mock.calls.length).toBe(1);
  });
});

describe("Milestone dto validations tests", () => {
  afterEach(() => {
    mockMilestoneDto = {
      quarter: "Quarter 1",
      tasks: "A tasks",
      impact: "Impact",
      impactCriterion: "Criterion",
      signsOfSuccess: "Signs of Success",
      signsOfSuccessCriterion: "Signs of Success Criterion",
      category: "Category",
      keyPersonnel: "224412",
      budget: "a budget"
    };
  });

  test("Quarter out of range must add an error", () => {
    mockMilestoneDto.quarter = "Quarter 5";
    milestoneValidation(mockMilestoneDto);

    expect.arrayContaining(mockMilestoneDto.errors);
    expect(mockMilestoneDto.errors.length).toBe(1);
  });
});
