const fastify = { log: { info: console.log, error: console.log } };

describe('Testing activityService createActivities', () => {
  let activityDao;
  let activityService;
  beforeAll(() => {
    activityDao = {
      async saveActivity(activity, milestoneId) {
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
    const milestoneId = 2;

    const mockActivities = [
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
    ];

    const activities = await activityService.createActivities(
      mockActivities,
      milestoneId
    );

    expect(activities).toEqual(compareActivities);
  });
});

describe('Testing activityService createActivity', () => {
  let activityDao;
  let activityService;

  const newActivityId = 1;
  const milestoneId = 12;

  const mockActivity = {
    tasks: 'Activity Tasks',
    impact: 'Impact Activity',
    impactCriterion: 'Criterion Activity',
    signsOfSuccess: 'Success A1',
    signsOfSuccessCriterion: 'Success Criterion A1',
    category: 'Category A1',
    keyPersonnel: 'Key Personnel A1',
    budget: 123
  };

  const incompleteActivity = {
    tasks: 'Activity Tasks',
    impact: 'Impact Activity',
    impactCriterion: 'Criterion Activity',
    signsOfSuccess: 'Success A1',
    signsOfSuccessCriterion: 'Success Criterion A1',
    category: 'Category A1',
    keyPersonnel: 'Key Personnel A1'
  };

  beforeAll(() => {
    activityDao = {
      async saveActivity(activity, milestone) {
        if (milestone === 0) {
          throw Error('Error creating activity');
        }
        const toSave = {
          ...activity,
          milestone,
          id: newActivityId
        };
        return toSave;
      }
    };
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao
    });
  });

  it('should return the created activity', async () => {
    const expected = {
      ...mockActivity,
      milestone: milestoneId,
      id: newActivityId
    };
    const response = await activityService.createActivity(
      mockActivity,
      milestoneId
    );
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity is incomplete', async () => {
    const response = await activityService.createActivity(
      incompleteActivity,
      milestoneId
    );
    const expected = {
      status: 409,
      error: 'Activity is missing mandatory fields'
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity could not be created', async () => {
    const response = await activityService.createActivity(mockActivity, 0);
    const expected = { status: 500, error: 'Error creating Activity' };
    return expect(response).toEqual(expected);
  });
});

describe('Testing activityService updateActivity', () => {
  let activityDao;
  let activityService;

  const activityId = 12;

  const mockActivity = {
    tasks: 'Activity Tasks',
    impact: 'Impact Activity',
    impactCriterion: 'Criterion Activity',
    signsOfSuccess: 'Success A1',
    signsOfSuccessCriterion: 'Success Criterion A1',
    category: 'Category A1',
    keyPersonnel: 'Key Personnel A1',
    budget: 123,
    id: activityId,
    milestone: 12
  };

  const incompleteActivity = {
    tasks: 'Activity Tasks',
    impact: 'Impact Activity',
    impactCriterion: 'Criterion Activity',
    signsOfSuccess: 'Success A1',
    signsOfSuccessCriterion: 'Success Criterion A1',
    category: 'Category A1',
    keyPersonnel: 'Key Personnel A1',
    id: activityId,
    milestone: 12
  };

  beforeAll(() => {
    activityDao = {
      async updateActivity(activity, id) {
        if (id === '') {
          throw Error('Error updating activity');
        }
        if (id === 0) {
          return undefined;
        }
        return activity;
      }
    };
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao
    });
  });

  it('should return the updated activity', async () => {
    const expected = mockActivity;

    const response = await activityService.updateActivity(
      mockActivity,
      activityId
    );

    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity is incomplete', async () => {
    const response = await activityService.updateActivity(
      incompleteActivity,
      activityId
    );
    const expected = {
      status: 409,
      error: 'Activity is missing mandatory fields'
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity does not exist', async () => {
    const response = await activityService.updateActivity(mockActivity, 0);
    const expected = {
      status: 404,
      error: 'Activity does not exist'
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity could not be created', async () => {
    const response = await activityService.updateActivity(mockActivity, '');
    const expected = { status: 500, error: 'Error updating Activity' };
    return expect(response).toEqual(expected);
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
