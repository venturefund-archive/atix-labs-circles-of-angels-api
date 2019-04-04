const fastify = { log: { info: console.log, error: console.log } };

describe('Testing activityService createActivities', () => {
  let activityDao;
  let activityService;
  beforeAll(() => {
    activityDao = {
      async saveActivity({ activity, milestoneId }) {
        const toSave = {
          ...activity,
          milestone: milestoneId
        };
        return toSave;
      }
    };
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao
    });
  });

  it('should create activities and associate them to a milestone', async () => {
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
        tasks: '',
        impact: '',
        impactCriterion: '',
        signsOfSuccess: '',
        signsOfSuccessCriterion: '',
        category: '',
        keyPersonnel: '',
        budget: ''
      }
    ];

    const compareActivities = [
      {
        tasks: 'Task A1',
        impact: '',
        impactCriterion: '',
        signsOfSuccess: '',
        signsOfSuccessCriterion: '',
        category: 'Category A1',
        keyPersonnel: 'Key Personnel A1',
        budget: '',
        milestone: 2
      },
      {
        tasks: 'Task A2',
        impact: 'Impact A2',
        impactCriterion: 'Impact Criterion A2',
        signsOfSuccess: 'Success A2',
        signsOfSuccessCriterion: 'Success Criterion A2',
        category: 'Category A2',
        keyPersonnel: 'Key Personnel A2',
        budget: 'Budget A2',
        milestone: 2
      }
    ];

    const milestoneId = 2;
    const activities = await activityService.createActivities(
      mockActivities,
      milestoneId
    );

    expect(activities).toEqual(compareActivities);
  });
});

describe('Testing activityService delete activity', async () => {
  let activityDao;
  let activityService;
  const mockActivity = {
    id: 1,
    tasks: 'Task A1',
    impact: '',
    impactCriterion: '',
    signsOfSuccess: '',
    signsOfSuccessCriterion: '',
    category: 'Category A1',
    keyPersonnel: 'Key Personnel A1',
    budget: ''
  };

  beforeAll(() => {
    activityService = {};
    activityDao = {
      async deleteActivity(activityId) {
        if (activityId === 1) return mockActivity;
        return [];
      }
    };
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao
    });
  });

  it('should return the deleted activity', async () => {
    const activity = await activityService.deleteActivity(1);
    await expect(activity).toBe(mockActivity);
  });

  it('should return empty list when try delete a non-existent activity', async () => {
    const activity = await activityService.deleteActivity(2);
    await expect(activity).toEqual([]);
  });
});
