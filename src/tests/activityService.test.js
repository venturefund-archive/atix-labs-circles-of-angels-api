const { assert } = require('chai');
// const activityService = require('../rest/core/activityService')();
// const promisesUtil = require('../rest/util/promises');

describe.skip('Testing activityService createActivities', () => {
  it('should create activities and associate them to a milestone', async () => {
    activityService.activityDao = jest.mock('../rest/dao/activityDao');

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
      },
      {
        tasks: 'Task A3',
        impact: '',
        impactCriterion: '',
        signsOfSuccess: '',
        signsOfSuccessCriterion: '',
        category: '',
        keyPersonnel: '',
        budget: ''
      }
    ];

    promisesUtil.forEachPromise = jest.fn((items, fn, context) =>
      items.reduce(
        (promise, item) => promise.then(() => fn(item, context)),
        Promise.resolve()
      )
    );

    const milestoneId = 2;
    const activities = await activityService.createActivities(
      mockActivities,
      milestoneId
    );

    const compareActivities = mockActivities.slice(0, 2);
    assert.deepEqual(activities, compareActivities);
  });
});

describe.skip('Testing activityService isEmpty', () => {
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

    await assert.equal(activityService.isEmpty(mockActivity), false);
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

    await assert.equal(activityService.isEmpty(mockActivity), true);
  });
});
