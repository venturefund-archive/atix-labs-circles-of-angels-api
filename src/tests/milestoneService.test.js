const fastify = { log: { info: console.log, error: console.log } };

describe('Testing milestoneService createMilestones', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {
      async saveMilestone({ milestone, projectId }) {
        const toSave = {
          ...milestone,
          project: projectId
        };
        delete toSave.activityList;
        return toSave;
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

    jest.mock(milestoneService, () => ({
      readMilestones: jest.fn()
    }));
  });

  it('should return an array of created milestones associated to a project', async () => {
    const projectId = 2;
    const mockMilestones = [
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
        project: projectId
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
        project: projectId
      }
    ];

    const filePath = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );

    milestoneService.readMilestones.mockImplementation = jest.fn(() =>
      milestoneService.readMilestones(filePath)
    );

    const milestones = await milestoneService.createMilestones(
      filePath,
      projectId
    );

    await expect(milestones).toEqual(mockMilestones);
  });

  it(
    'should return an array of errors and an empty array of milestones ' +
      'if the milestones are invalid',
    async () => {
      const projectId = 2;
      const errors = {
        errors: [
          { rowNumber: 6, msg: 'Found a milestone without Tasks' },
          {
            rowNumber: 6,
            msg:
              'Found a milestone without Expected Changes/ Social Impact Targets'
          },
          {
            rowNumber: 7,
            msg:
              'Found an activity without an specified milestone or inside an invalid milestone'
          },
          {
            rowNumber: 8,
            msg:
              'Found an activity without an specified milestone or inside an invalid milestone'
          },
          {
            rowNumber: 10,
            msg:
              'Found a milestone without Expected Changes/ Social Impact Targets'
          },
          { rowNumber: 11, msg: 'Found a milestone without Tasks' },
          {
            rowNumber: 1,
            msg:
              'Could not find any valid activities. There should be at least one.'
          }
        ],
        milestones: []
      };

      const filePath = require('path').join(
        __dirname,
        './mockFiles/milestonesErrors.xlsx'
      );

      milestoneService.readMilestones.mockImplementation = jest.fn(() =>
        milestoneService.readMilestones(filePath)
      );

      const milestones = await milestoneService.createMilestones(
        filePath,
        projectId
      );

      await expect(milestones).toEqual(errors);
    }
  );
});

describe('Testing milestoneService getMilestoneActivities', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {
      async getMilestoneActivities(milestoneId) {
        const mockMilestone = {
          id: milestoneId,
          project: 1,
          quarter: 'Quarter 1',
          tasks: 'Task M1',
          impact: 'Impact M1',
          impactCriterion: 'Impact Criterion M1',
          signsOfSuccess: 'Success M1',
          signsOfSuccessCriterion: 'Success Criterion M1',
          category: 'Category M1',
          keyPersonnel: 'Key Personnel M1',
          budget: 'Budget M1',
          activities: [
            {
              id: 1,
              tasks: 'Task A1',
              impact: 'Impact A1',
              impactCriterion: 'Impact Criterion A1',
              signsOfSuccess: 'Success A1',
              signsOfSuccessCriterion: 'Success Criterion A1',
              category: 'Category A1',
              keyPersonnel: 'Key Personnel A1',
              budget: 'Budget A1',
              milestone: milestoneId
            },
            {
              id: 2,
              tasks: 'Task A2',
              impact: 'Impact A2',
              impactCriterion: 'Impact Criterion A2',
              signsOfSuccess: 'Success A2',
              signsOfSuccessCriterion: 'Success Criterion A2',
              category: 'Category A2',
              keyPersonnel: 'Key Personnel A2',
              budget: 'Budget A2',
              milestone: milestoneId
            }
          ]
        };
        return mockMilestone;
      }
    };
    activityService = {
      getOracleFromActivity() {
        return [];
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
      const milestoneId = 1;
      const projectId = 1;

      const mockMilestone = {
        id: milestoneId,
        project: projectId,
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        impact: 'Impact M1',
        impactCriterion: 'Impact Criterion M1',
        signsOfSuccess: 'Success M1',
        signsOfSuccessCriterion: 'Success Criterion M1',
        category: 'Category M1',
        keyPersonnel: 'Key Personnel M1',
        budget: 'Budget M1',
        activities: [{}, {}]
      };

      const mockMilestoneWithActivity = {
        id: milestoneId,
        project: projectId,
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        impact: 'Impact M1',
        impactCriterion: 'Impact Criterion M1',
        signsOfSuccess: 'Success M1',
        signsOfSuccessCriterion: 'Success Criterion M1',
        category: 'Category M1',
        keyPersonnel: 'Key Personnel M1',
        budget: 'Budget M1',
        activities: [
          {
            id: 1,
            tasks: 'Task A1',
            impact: 'Impact A1',
            impactCriterion: 'Impact Criterion A1',
            signsOfSuccess: 'Success A1',
            signsOfSuccessCriterion: 'Success Criterion A1',
            category: 'Category A1',
            keyPersonnel: 'Key Personnel A1',
            budget: 'Budget A1',
            milestone: milestoneId,
            type: 'Activity',
            quarter: 'Quarter 1'
          },
          {
            id: 2,
            tasks: 'Task A2',
            impact: 'Impact A2',
            impactCriterion: 'Impact Criterion A2',
            signsOfSuccess: 'Success A2',
            signsOfSuccessCriterion: 'Success Criterion A2',
            category: 'Category A2',
            keyPersonnel: 'Key Personnel A2',
            budget: 'Budget A2',
            milestone: milestoneId,
            type: 'Activity',
            quarter: 'Quarter 1'
          }
        ]
      };

      const milestoneWithActivity = await milestoneService.getMilestoneActivities(
        mockMilestone
      );

      await expect(milestoneWithActivity).toEqual(mockMilestoneWithActivity);
    }
  );
});

describe('Testing milestoneService readMilestone', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {};
    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
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

      const mockXls = require('path').join(
        __dirname,
        './mockFiles/projectMilestones.xlsx'
      );
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
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {};
    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
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
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {};
    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
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
  let milestoneDao;
  let activityService;
  let milestoneService;

  beforeAll(() => {
    milestoneDao = {};
    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
    });
  });

  it('should return true if activity has all fields not empty', async () => {
    const mockActivity = {
      tasks: 'Task A1',
      impact: 'Impact A1',
      impactCriterion: 'Impact Criterion A1',
      signsOfSuccess: 'Success A1',
      signsOfSuccessCriterion: 'Success Criterion A1',
      category: 'Category A1',
      keyPersonnel: 'Key Personnel A1',
      budget: 'Budget A1'
    };
    const response = { milestones: [], errors: [] };
    const rowNumber = 6;

    await expect(
      milestoneService.verifyActivity(mockActivity, response, rowNumber)
    ).toBe(true);
  });

  it('should return false if activity has at least one field empty', async () => {
    const mockActivity = {
      tasks: 'Task A1',
      impact: 'Impact A1',
      impactCriterion: 'Impact Criterion A1',
      signsOfSuccess: 'Success A1',
      signsOfSuccessCriterion: '',
      category: 'Category A1',
      keyPersonnel: 'Key Personnel A1',
      budget: 'Budget A1'
    };
    const response = { milestones: [], errors: [] };
    const rowNumber = 6;

    await expect(
      milestoneService.verifyActivity(mockActivity, response, rowNumber)
    ).toBe(false);
  });
});

describe('Testing milestoneService createMilestone', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const project = 12;
  const newMilestoneId = 1;

  const mockMilestone = {
    quarter: 'Quarter 1',
    tasks: 'Milestone Tasks',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 123
  };

  const incompleteMilestone = {
    quarter: 'Quarter 1',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 123
  };

  beforeAll(() => {
    milestoneDao = {
      async saveMilestone({ milestone, projectId }) {
        if (projectId === 0) {
          throw Error('Error saving milestone');
        }
        const toSave = {
          ...milestone,
          project: projectId,
          id: newMilestoneId
        };
        return toSave;
      }
    };

    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
    });
  });

  it('should return a new created milestone', async () => {
    const expected = { ...mockMilestone, project, id: newMilestoneId };

    const response = await milestoneService.createMilestone(
      mockMilestone,
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
    const response = await milestoneService.createMilestone(mockMilestone, 0);

    const expected = { status: 500, error: 'Error creating Milestone' };

    return expect(response).toEqual(expected);
  });
});

describe('Testing milestoneService updateMilestone', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const milestoneId = 15;

  const mockMilestone = {
    quarter: 'Quarter 1',
    tasks: 'Milestone Tasks',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 123,
    id: milestoneId,
    project: 12
  };

  const incompleteMilestone = {
    quarter: 'Quarter 1',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 123,
    id: milestoneId,
    project: 12
  };

  beforeAll(() => {
    milestoneDao = {
      async updateMilestone(milestone, id) {
        if (id === '') {
          throw Error('Error updating milestone');
        }
        if (id === 0) {
          return undefined;
        }
        return milestone;
      }
    };

    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
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

describe('Testing milestonesService delete milestone', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;
  const mockMilestone = [
    {
      id: 1,
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
          impact: '',
          impactCriterion: '',
          signsOfSuccess: '',
          signsOfSuccessCriterion: '',
          category: 'Category A1',
          keyPersonnel: 'Key Personnel A1',
          budget: ''
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
      impact: '',
      impactCriterion: '',
      signsOfSuccess: 'Success M2',
      signsOfSuccessCriterion: 'Success Criterion M2',
      category: 'Category M2',
      keyPersonnel: 'Key Personnel M2',
      budget: '',
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
  ];

  beforeAll(() => {
    milestoneDao = {
      async deleteMilestone(milestoneId) {
        if (milestoneId === 1) return mockMilestone;
        return [];
      }
    };
    activityService = {};

    milestoneService = require('../rest/core/milestoneService')({
      fastify,
      milestoneDao,
      activityService
    });
  });

  it('should return the deleted milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(1);
    await expect(milestone).toBe(mockMilestone);
  });

  it('should return empty list when try delete a non-existent milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(2);
    await expect(milestone).toEqual([]);
  });
});
