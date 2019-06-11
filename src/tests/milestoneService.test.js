const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config')
};

const testHelper = require('./testHelper');

describe('Testing milestoneService createMilestone', () => {
  let milestoneDao;
  let milestoneService;

  const project = 12;
  const newMilestoneId = 1;

  const mockMilestone = testHelper.buildMilestone(0, {
    projectId: project,
    id: newMilestoneId
  });

  const toCreateMilestone = { ...mockMilestone };
  delete toCreateMilestone.id;
  delete toCreateMilestone.project;

  beforeAll(() => {
    milestoneDao = {
      async saveMilestone({ projectId }) {
        if (projectId === 0) {
          throw Error('Error saving milestone');
        }
        return mockMilestone;
      }
    };

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao
    });
  });

  it('should return a new created milestone', async () => {
    const expected = mockMilestone;

    const response = await milestoneService.createMilestone(
      toCreateMilestone,
      project
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone is empty', async () => {
    const response = await milestoneService.createMilestone({}, project);

    const expected = {
      status: 409,
      error: 'Milestone is missing mandatory fields'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone is missing mandatory fields', async () => {
    const incompleteMilestone = { ...toCreateMilestone };
    delete incompleteMilestone.tasks;

    const response = await milestoneService.createMilestone(
      incompleteMilestone,
      project
    );

    const expected = {
      status: 409,
      error: 'Milestone is missing mandatory fields'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if it fails to create the milestone', async () => {
    const response = await milestoneService.createMilestone(
      toCreateMilestone,
      0
    );

    const expected = { status: 500, error: 'Error creating Milestone' };

    return expect(response).toEqual(expected);
  });
});

describe('Testing milestoneService createMilestones', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;
  let mockProjects;

  const project = 2;
  let milestoneCount = 1;

  const mockMilestones = [
    testHelper.buildMilestone(0, { projectId: project, id: 1 }),
    testHelper.buildMilestone(0, { projectId: project, id: 2 })
  ];

  beforeAll(() => {
    mockProjects = testHelper.getMockProjects();
    milestoneDao = {
      async saveMilestone({ milestone, projectId }) {
        const toSave = {
          ...milestone,
          project: projectId,
          id: milestoneCount++
        };
        delete toSave.activityList;
        return toSave;
      },

      async getMilestonesByProject(projectId) {
        const getProject = mockProjects.find(
          mockProject => projectId === mockProject.id
        );
        return getProject.milestones;
      }
    };

    activityService = {
      async createActivities() {
        return null;
      }
    };

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
    });
  });

  it('should return an array of created milestones associated to a project', async () => {
    const filePath = testHelper.getMockFiles().projectMilestones.path;

    milestoneService.readMilestones = jest.fn(() => {
      const firstMilestone = { ...mockMilestones[0], activityList: [] };
      delete firstMilestone.id;
      delete firstMilestone.project;

      const secondMilestone = { ...mockMilestones[1], activityList: [] };
      delete secondMilestone.id;
      delete secondMilestone.project;

      const toCreateMilestones = [firstMilestone, secondMilestone];
      return { errors: [], milestones: toCreateMilestones };
    });

    const milestones = await milestoneService.createMilestones(
      filePath,
      project
    );

    await expect(milestones).toEqual(mockMilestones);
  });
});

describe('Testing milestoneService updateMilestone', () => {
  let milestoneDao;
  let milestoneService;

  const milestoneId = 15;

  const mockMilestone = testHelper.buildMilestone(0, { id: milestoneId });

  const incompleteMilestone = testHelper.buildMilestone(0, { id: milestoneId });
  delete incompleteMilestone.tasks;

  beforeAll(() => {
    milestoneDao = {
      async updateMilestone(milestone, id) {
        if (id === '') {
          throw Error('Error updating milestone');
        }
        if (id !== milestoneId) {
          return undefined;
        }
        return milestone;
      }
    };

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao
    });
  });

  it('should return the updated milestone', async () => {
    const expected = mockMilestone;

    const response = await milestoneService.updateMilestone(
      mockMilestone,
      milestoneId
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone is empty', async () => {
    const response = await milestoneService.updateMilestone({}, milestoneId);

    const expected = {
      status: 409,
      error: 'Milestone is missing mandatory fields'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone is missing mandatory fields', async () => {
    const response = await milestoneService.updateMilestone(
      incompleteMilestone,
      milestoneId
    );

    const expected = {
      status: 409,
      error: 'Milestone is missing mandatory fields'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone does not exist', async () => {
    const response = await milestoneService.updateMilestone(mockMilestone, 0);

    const expected = {
      status: 404,
      error: 'Milestone does not exist'
    };

    return expect(response).toEqual(expected);
  });

  it('should return an error if the milestone could not be updated', async () => {
    const response = await milestoneService.updateMilestone(mockMilestone, '');

    const expected = { status: 500, error: 'Error updating Milestone' };

    return expect(response).toEqual(expected);
  });
});

describe('Testing milestoneService getMilestoneActivities', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const milestoneId = 11;
  const projectId = 12;

  beforeAll(() => {
    milestoneDao = {
      async getMilestoneActivities(milestone) {
        const milestoneWithActivities = testHelper.buildMilestone(2, {
          id: milestone,
          projectId
        });
        return milestoneWithActivities;
      }
    };
    activityService = {
      getOracleFromActivity() {
        return { user: testHelper.buildUserOracle() };
      }
    };

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
    });
  });

  it(
    'should return a milestone with its activities ' +
      'with quarter and type fields added to them',
    async () => {
      const mockMilestone = {
        ...testHelper.buildMilestone(0, {
          id: milestoneId,
          projectId
        }),
        activities: [{}, {}]
      };

      const expected = testHelper.buildMilestone(2, {
        id: mockMilestone.id,
        projectId
      });

      const response = await milestoneService.getMilestoneActivities(
        mockMilestone
      );

      await expect(response).toEqual(expected);
    }
  );
});

describe('Testing milestoneService readMilestones', () => {
  let milestoneService;

  beforeAll(() => {
    milestoneService = require('../rest/core/milestoneService')({
      fastify
    });
  });

  it(
    'should return an array of milestones and ' +
      'an empty array of errors from an excel file',
    async () => {
      const mockMilestones = {
        errors: [],
        milestones: [
          {
            quarter: 'Quarter 1',
            tasks: 'Task M1',
            impact: 'Impact M1',
            impactCriterion: 'Impact Criterion M1',
            signsOfSuccess: 'Success M1',
            signsOfSuccessCriterion: 'Success Criterion M1',
            category: 'Category M1',
            keyPersonnel: 'Key Personnel M1',
            budget: 'Budget M1',
            activityList: [
              {
                tasks: 'Task A1',
                impact: 'Impact A1',
                impactCriterion: 'Impact Criterion A1',
                signsOfSuccess: 'Success A1',
                signsOfSuccessCriterion: 'Success Criterion A1',
                category: 'Category A1',
                keyPersonnel: 'Key Personnel A1',
                budget: 'Budget A1'
              },
              {
                tasks: 'Task A2',
                impact: 'Impact A2',
                impactCriterion: 'Impact Criterion A2',
                signsOfSuccess: 'Success A2',
                signsOfSuccessCriterion: 'Success Criterion A2',
                category: 'Category A2',
                keyPersonnel: 'Key Personnel A2',
                budget: 'Budget A2'
              }
            ]
          },
          {
            quarter: 'Quarter 1',
            tasks: 'Task M2',
            impact: 'Impact M2',
            impactCriterion: 'Impact Criterion M2',
            signsOfSuccess: 'Success M2',
            signsOfSuccessCriterion: 'Success Criterion M2',
            category: 'Category M2',
            keyPersonnel: 'Key Personnel M2',
            budget: 'Budget M2',
            activityList: []
          },
          {
            quarter: 'Quarter 1',
            tasks: '',
            impact: '',
            impactCriterion: '',
            signsOfSuccess: '',
            signsOfSuccessCriterion: '',
            category: '',
            keyPersonnel: '',
            budget: '',
            activityList: []
          }
        ]
      };

      const mockXls = testHelper.getMockFiles().projectMilestones.path;
      const milestones = await milestoneService.readMilestones(mockXls);

      await expect(milestones).toEqual(mockMilestones);
    }
  );

  it('should throw an error when file not found', async () => {
    await expect(milestoneService.readMilestones('')).rejects.toEqual(
      Error('Error reading excel file')
    );
  });
});

describe('Testing milestoneService isMilestoneEmpty', () => {
  let milestoneService;

  beforeAll(() => {
    milestoneService = require('../rest/core/milestoneService')({
      fastify
    });
  });

  it('should return false if milestone has at least 1 field with data', async () => {
    const mockMilestone = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(false);
  });

  it(
    'should return true if milestone does not have any fields with data ' +
      'except Quarter or activityList',
    async () => {
      const mockMilestone = {
        quarter: 'Quarter 1',
        tasks: '',
        impact: '',
        impactCriterion: '',
        signsOfSuccess: '',
        signsOfSuccessCriterion: '',
        category: '',
        keyPersonnel: '',
        budget: '',
        activityList: []
      };
      await expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(true);
    }
  );
});

describe('Testing milestoneService isMilestoneValid', () => {
  let milestoneService;

  beforeAll(() => {
    milestoneService = require('../rest/core/milestoneService')({
      fastify
    });
  });

  it('should return true if milestone has quarter, tasks and impact not empty', async () => {
    const mockMilestone = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(milestoneService.isMilestoneValid(mockMilestone)).toBe(true);
  });

  it('should return true if milestone has quarter, tasks or impact empty', async () => {
    const mockMilestoneWithoutQuarter = {
      quarter: '',
      tasks: 'Task M1',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    const mockMilestoneWithoutTasks = {
      quarter: 'Quarter 1',
      tasks: '',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    const mockMilestoneWithoutImpact = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutQuarter)
    ).toBe(false);
    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutTasks)
    ).toBe(false);
    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutImpact)
    ).toBe(false);
  });
});

describe('Testing milestoneService verifyActivity', () => {
  let milestoneService;

  const mockActivity = testHelper.buildActivity({ id: 1 });

  beforeAll(() => {
    milestoneService = require('../rest/core/milestoneService')({
      fastify
    });
  });

  it('should return true if activity has all fields not empty', async () => {
    const response = { milestones: [], errors: [] };
    const rowNumber = 6;

    await expect(
      milestoneService.verifyActivity(mockActivity, response, rowNumber)
    ).toBe(true);
  });

  it('should return false if activity has at least one field empty', async () => {
    const incompleteActivity = { ...mockActivity, signsOfSuccess: '' };
    const response = { milestones: [], errors: [] };
    const rowNumber = 6;

    await expect(
      milestoneService.verifyActivity(incompleteActivity, response, rowNumber)
    ).toBe(false);
  });
});

describe('Testing milestonesService delete milestone', () => {
  let milestoneDao;
  let milestoneService;

  const milestoneId = 1;
  const mockMilestone = testHelper.buildMilestone(1, { id: milestoneId });

  beforeAll(() => {
    milestoneDao = {
      async deleteMilestone(id) {
        if (id === milestoneId) return mockMilestone;
        return [];
      }
    };

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao
    });
  });

  it('should return the deleted milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(milestoneId);
    await expect(milestone).toBe(mockMilestone);
  });

  it('should return empty list when try delete a non-existent milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(2);
    await expect(milestone).toEqual([]);
  });
});
