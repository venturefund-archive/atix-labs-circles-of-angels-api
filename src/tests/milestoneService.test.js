const { assert } = require('chai');
const milestoneService = require('../rest/core/milestoneService')();

describe.skip('Testing milestoneService createMilestones', () => {
  const fs = require('fs');
  const { promisify } = require('util');
  const readFile = promisify(fs.readFile);
  jest.mock('../rest/dao/milestoneDao');

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
        activities: [
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
        activities: []
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

    await assert.deepEqual(milestones, mockMilestones);
  });
});

describe.skip('Testing milestoneService readMilestone', () => {
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

    assert.deepEqual(milestones, mockMilestones);
  });

  it('should throw an error when file not found', async () => {
    await expect(milestoneService.readMilestones('')).rejects.toEqual(
      Error('Error reading excel file')
    );
  });
});

describe.skip('Testing milestoneService isEmpty', () => {
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

    await assert.equal(milestoneService.isEmpty(mockMilestone), false);
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

    await assert.equal(milestoneService.isEmpty(mockMilestone), true);
  });
});
