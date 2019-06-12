jest.mock('sha256');
const fs = require('fs');
let sha256 = require('sha256');
const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config'),
  eth: {
    uploadHashEvidenceToActivity: ethServicesMock.uploadHashEvidenceToActivity
  }
};

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
      testHelper.buildActivity({}),
      testHelper.buildActivity({}),
      testHelper.buildActivity({}),
      testHelper.buildEmptyActivity({})
    ];

    const toSend = mockActivities.map(activity => ({
      tasks: activity.tasks,
      impact: activity.impact,
      impactCriterion: activity.impactCriterion,
      signsOfSuccess: activity.signsOfSuccess,
      signsOfSuccessCriterion: activity.signsOfSuccessCriterion,
      category: activity.category,
      keyPersonnel: activity.keyPersonnel,
      budget: activity.budget
    }));

    const expected = mockActivities
      .filter(a => a.id !== undefined)
      .map(activity => ({
        tasks: activity.tasks,
        impact: activity.impact,
        impactCriterion: activity.impactCriterion,
        signsOfSuccess: activity.signsOfSuccess,
        signsOfSuccessCriterion: activity.signsOfSuccessCriterion,
        category: activity.category,
        keyPersonnel: activity.keyPersonnel,
        budget: activity.budget,
        milestone: milestoneId
      }));
    const activities = await activityService.createActivities(
      toSend,
      milestoneId
    );
    expect(activities).toEqual(expected);
  });
});

describe('Testing activityService createActivity', () => {
  let activityDao;
  let activityService;

  const newActivityId = 1;
  const milestoneId = 12;

  let mockActivity;
  let incompleteActivity;

  beforeEach(() => {
    const {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel,
      budget
    } = testHelper.buildActivity({});
    mockActivity = {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel,
      budget
    };

    incompleteActivity = {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel
    };
  });

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

  let mockActivity;
  let incompleteActivity;

  beforeEach(() => {
    const {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel,
      budget
    } = testHelper.buildActivity({});
    mockActivity = {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel,
      budget
    };

    incompleteActivity = {
      tasks,
      impact,
      impactCriterion,
      signsOfSuccess,
      signsOfSuccessCriterion,
      category,
      keyPersonnel
    };
  });

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

describe('Testing ActivityService addEvidenceFiles', () => {
  let activityService;
  let user = testHelper.buildUserOracle({});

  beforeEach(() => {
    activityService = require('../rest/core/activityService')({
      fastify,
      userService: {
        getUserById: () => {
          return user;
        }
      }
    });
    activityService.addEvidence = () => {
      return {
        fileHash: '23kfek32kek3edd'
      };
    };
  });

  it('user oracle add evidences files should update database and blockchain', async () => {
    const files = [
      testHelper.getMockFiles.projectCoverPhoto,
      testHelper.getMockFiles.projectCardPhoto
    ];
    const activityId = 1;

    const response = await activityService.addEvidenceFiles(
      activityId,
      files,
      user
    );

    expect(response).toEqual({
      success: 'The evidence was successfully uploaded!'
    });
  });
});

describe('Testing ActivityService addEvidence', () => {
  let activityService;
  let activity;
  let fileId = 1;
  let photoId = 2;
  let activityPhotoId = 1;
  let activityFileId = 1;
  const image = testHelper.getMockFiles().projectCoverPhoto;
  const file = testHelper.getMockFiles().projectAgreement;

  beforeEach(() => {
    activity = testHelper.buildActivity({ id: 1 });
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao: {
        getActivityById: activityId => {
          return activity;
        }
      },
      fileService: {
        saveFile: filePath => {
          return { id: fileId };
        },
        checkEvidenceFileType: f => {
          const type = f.name.split('.')[1];
          return type !== 'error';
        }
      },
      photoService: {
        savePhoto: filePath => {
          return { id: photoId };
        },
        checkEvidencePhotoType: f => {
          const type = f.name.split('.')[1];
          return type !== 'error';
        }
      },
      activityPhotoDao: {
        saveActivityPhoto: (activityId, savedPhotoId, fileHash) => {
          return {
            activity: activityId,
            photo: savedPhotoId,
            id: activityPhotoId,
            fileHash
          };
        }
      },
      activityFileDao: {
        saveActivityFile: (activityId, savedFileId, fileHash) => {
          return {
            activity: activityId,
            file: savedFileId,
            id: activityFileId,
            fileHash
          };
        }
      }
    });
    activityService.readFile = jest.fn();
    sha256.mockReturnValue('sha256mockreturnvalue');
  });

  it('should return activityPhoto object if send image', async () => {
    const response = await activityService.addEvidence(activity.id, image);
    expect(response).toEqual({
      activity: 1,
      photo: 2,
      id: 1,
      fileHash: 'sha256mockreturnvalue'
    });
  });

  it('should return activityFile object if send file', async () => {
    const response = await activityService.addEvidence(activity.id, file);
    expect(response).toEqual({
      activity: 1,
      file: 1,
      id: 1,
      fileHash: 'sha256mockreturnvalue'
    });
  });
});

describe('Testing ActivityService assignOracleToActivity', () => {
  const oracle = testHelper.buildUserOracle({ id: 3 });
  oracle.role = { id: oracle.role };

  const user = testHelper.buildUserSe({ id: 2 });
  user.role = { id: user.role };
  let activityService;
  let activity;

  beforeEach(() => {
    activity = testHelper.buildActivity({ id: 1 });
    activityService = require('../rest/core/activityService')({
      fastify,
      activityDao: {
        getActivityById: activityId => {
          return activity;
        }
      },
      userService: {
        getUserById: id => {
          if (id === oracle.id) return oracle;
          if (id === user.id) return user;
          return null;
        }
      },
      oracleActivityDao: {
        getOracleFromActivity: activityId => {
          return { user: activity.oracle };
        },
        assignOracleToActivity: (userId, activityId) => {
          return oracle;
        }
      }
    });
    activityService.unassignOracleToActivity = activityId => true;
  });
  it('must return oracle user object when assign a valid oracle to an activity', async () => {
    const response = await activityService.assignOracleToActivity(
      oracle.id,
      activity.id
    );
    expect(response).toEqual(oracle);
  });

  it('must return error when assign a non oracle user to an activity', async () => {
    const response = await activityService.assignOracleToActivity(
      user.id,
      activity.id
    );
    expect(response).toEqual({ error: 'User is not an oracle', status: 409 });
  });

  it('must return error when assign a non existent user to an activity', async () => {
    const response = await activityService.assignOracleToActivity(
      -1,
      activity.id
    );
    expect(response).toEqual({ error: 'User not found', status: 404 });
  });
});
