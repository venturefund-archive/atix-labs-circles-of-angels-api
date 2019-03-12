const { assert } = require('chai');
const { isEmpty, createActivities } = require('../rest/core/activityService')();

describe('Testing activityService createActivities', () => {
  it('should create activities and associate them to a milestone', async () => {
    jest.mock('../rest/dao/activityDao');
    const mockActivities = [
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
    ];

    const milestoneId = 2;
    const activities = await createActivities(mockActivities, milestoneId);
    console.log(activities);
    //assert.deepEqual(milestones, mockMilestones);
  });
});

describe('Testing activityService isEmpty', () => {
  it('should return false if activity has at least 1 field with data', async () => {
    const mockActivity = {
      tasks: 'Task A1',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: ''
    };

    await assert.equal(isEmpty(mockActivity), false);
  });

  it('should return true if activity does not have any fields with data', async () => {
    const mockActivity = {
      tasks: '',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: ''
    };

    await assert.equal(isEmpty(mockActivity), true);
  });
});
