const fastify = { log: { info: console.log, error: console.log } };

describe('Testing milestoneService createMilestones', () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const readFile = promisify(fs.readFile);

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
  });

  it('should return an array of created milestones associated to a project', async () => {
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
        project: 2
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
        project: 2
      }
    ];

    const filePath = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );

    const dataXls = await readFile(filePath);

    const mockMilestonesXls = {
      name: 'projectMilestones.xlsx',
      data: dataXls,
      mv: jest.fn()
    };

    const m = await milestoneService.readMilestones(filePath);

    milestoneService.readMilestones = jest.fn(() => m);

    const projectId = 2;
    const milestones = await milestoneService.createMilestones(
      mockMilestonesXls,
      projectId
    );

    await expect(milestones).toEqual(mockMilestones);
  });
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

  it('should return an array of milestones from an excel file', async () => {
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

    const mockXls = require('path').join(
      __dirname,
      './mockFiles/projectMilestones.xlsx'
    );
    const milestones = await milestoneService.readMilestones(mockXls);

    await expect(milestones).toEqual(mockMilestones);
  });

  it('should throw an error when file not found', async () => {
    await expect(milestoneService.readMilestones('')).rejects.toEqual(
      Error('Error reading excel file')
    );
  });
});

describe('Testing milestoneService isEmpty', () => {
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

    await expect(milestoneService.isEmpty(mockMilestone)).toBe(false);
    // await assert.equal(milestoneService.isEmpty(mockMilestone), false);
  });

  it('should return true if milestone does not have any fields with data', async () => {
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
    await expect(milestoneService.isEmpty(mockMilestone)).toBe(true);
  });
});

describe('Testing milestoneService createMilestone', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const project = 12;

  const mockMilestone = {
    quarter: 'Quarter 1',
    tasks: 'Milestone Tasks',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 'Budget M1'
  };

  const incompleteMilestone = {
    quarter: 'Quarter 1',
    impact: 'Impact Milestone',
    impactCriterion: 'Criterion Milestone',
    signsOfSuccess: 'Success M1',
    signsOfSuccessCriterion: 'Success Criterion M1',
    category: 'Category M1',
    keyPersonnel: 'Key Personnel M1',
    budget: 'Budget M1'
  };

  beforeAll(() => {
    milestoneDao = {
      async saveMilestone({ milestone, projectId }) {
        if (projectId === 0) {
          throw Error('Error saving milestone');
        }
        const toSave = {
          ...milestone,
          project: projectId
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
    const expected = { ...mockMilestone, project };

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
    budget: 'Budget M1',
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
    budget: 'Budget M1',
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
