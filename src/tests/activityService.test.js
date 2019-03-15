const fastify = { log: { info: console.log, error: console.log } };

describe('Testing activityService createActivities', () => {
  let activityDao;
  let activityService;
  beforeAll(() => {
    activityDao = {
      async saveActivity({ activity, milestoneId }) {
        const toSave = Object.assign({}, activity, { milestone: milestoneId });
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
