/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const sha256 = require('sha256');
const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();
const { projectStatus, activityStatus } = require('../rest/util/constants');
const { injectMocks } = require('../rest/util/injection');

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config'),
  eth: {
    uploadHashEvidenceToActivity: ethServicesMock.uploadHashEvidenceToActivity
  }
};

jest.mock('sha256');

describe.skip('Testing activityService createActivities', () => {
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
    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
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

describe.skip('Testing activityService createActivity', () => {
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
    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
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

describe.skip('Testing activityService updateActivity', () => {
  let activityDao;
  let activityService;

  const activityId = 12;

  let mockActivity;
  let invalidActivity;

  beforeEach(() => {
    mockActivity = testHelper.buildActivity({});
    invalidActivity = { ...mockActivity, tasks: '' };
  });

  beforeAll(() => {
    activityDao = {
      async getActivityById(id) {
        if (id === '') {
          throw Error('Error getting activity');
        }
        if (id === 0) {
          return undefined;
        }
        return testHelper.buildActivity({ id });
      },

      async updateActivity(activity) {
        return activity;
      }
    };
    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
      activityDao
    });

    activityService.getProjectByActivity = activity => {
      if (activity.id === activityId) {
        return testHelper.buildProject(1, 1, {
          status: projectStatus.PUBLISHED
        });
      }

      return testHelper.buildProject(1, 1, {
        status: projectStatus.IN_PROGRESS
      });
    };
  });

  it('should return the updated activity', async () => {
    const response = await activityService.updateActivity(
      mockActivity,
      activityId
    );
    const expected = mockActivity;
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity project is IN PROGRESS', async () => {
    const response = await activityService.updateActivity(
      invalidActivity,
      activityId + 1
    );
    const expected = {
      error:
        'Activity cannot be updated. Project has already started or sent to the blockchain.',
      status: 409
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity has empty mandatory fields', async () => {
    const response = await activityService.updateActivity(
      invalidActivity,
      activityId
    );
    const expected = {
      status: 409,
      error: 'Activity has empty mandatory fields'
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity does not exist', async () => {
    const response = await activityService.updateActivity(mockActivity, 0);
    const expected = {
      status: 404,
      error: "Activity doesn't exist"
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if an exception is caught', async () => {
    const response = await activityService.updateActivity(mockActivity, '');
    const expected = { status: 500, error: 'Error updating Activity' };
    return expect(response).toEqual(expected);
  });
});

describe.skip('Testing activityService updateStatus', () => {
  let activityDao;
  let activityService;

  const activityId = 12;

  let mockActivity;

  beforeEach(() => {
    mockActivity = testHelper.buildActivity({
      id: activityId,
      status: activityStatus.PENDING
    });
  });

  beforeAll(() => {
    activityDao = {
      async getActivityById(id) {
        if (id === '') {
          throw Error('Error getting activity');
        }
        if (id === 0) {
          return undefined;
        }
        return { ...mockActivity, id };
      },

      async updateStatus(id, status) {
        if (status === 0) {
          return undefined;
        }
        return { ...mockActivity, status };
      }
    };
    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
      activityDao
    });

    activityService.getProjectByActivity = activity => {
      if (activity.id === activityId) {
        return testHelper.buildProject(1, 1, {
          status: projectStatus.IN_PROGRESS
        });
      }

      return testHelper.buildProject(1, 1, {
        status: projectStatus.PUBLISHED
      });
    };

    activityService.completeActivity = jest.fn();
  });

  it('should the activity with the updated status', async () => {
    const status = activityStatus.VERIFIED;
    const expected = { ...mockActivity, status };
    const response = await activityService.updateStatus(status, activityId);

    expect(response).toEqual(expected);
  });

  it('should return an error if the activity does not exist', async () => {
    const response = await activityService.updateStatus(
      activityStatus.VERIFIED,
      0
    );
    const expected = {
      status: 404,
      error: "Activity doesn't exist"
    };
    return expect(response).toEqual(expected);
  });

  it('should return an error if the activity project is not IN PROGRESS', async () => {
    const response = await activityService.updateStatus(
      activityStatus.VERIFIED,
      activityId + 1
    );
    const expected = {
      error: 'Activity status cannot be updated. Project is not started.',
      status: 409
    };
    return expect(response).toEqual(expected);
  });

  it('should call completeActivity if the new status is COMPLETED', async () => {
    await activityService.updateStatus(activityStatus.COMPLETED, activityId);
    return expect(activityService.completeActivity).toBeCalled();
  });

  it('should return an error if the activity could not be updated', async () => {
    const response = await activityService.updateStatus(0, activityId);
    const expected = {
      status: 409,
      error: ' Could not update Activity status'
    };
    return expect(response).toEqual(expected);
  });

  it('should throw an error if an exception is caught', async () =>
    expect(
      activityService.updateStatus(activityStatus.VERIFIED, '')
    ).rejects.toEqual(Error('Error updating Activity status')));
});

describe.skip('Testing ActivityService addEvidenceFiles', () => {
  let activityService;
  let activityDao;
  const user = testHelper.buildUserOracle({});

  beforeEach(() => {
    activityDao = {
      async getActivityById(id) {
        if (id === '') {
          throw Error('Error getting activity');
        }
        if (id === 0) {
          return undefined;
        }
        return testHelper.buildActivity({ id });
      }
    };

    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
      //FIXME
      activityDao
    });

    activityService.addEvidence = () => {
      return {
        fileHash: '23kfek32kek3edd'
      };
    };

    activityService.getProjectByActivity = () =>
      testHelper.buildProject(1, 1, {
        status: projectStatus.IN_PROGRESS
      });
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

describe.skip('Testing ActivityService addEvidence', () => {
  let activityService;
  let activity;
  const fileId = 1;
  const photoId = 2;
  const activityPhotoId = 1;
  const activityFileId = 1;
  const image = testHelper.getMockFiles().projectCoverPhoto;
  const file = testHelper.getMockFiles().projectAgreement;

  beforeEach(() => {
    activity = testHelper.buildActivity({ id: 1 });
    // activityService = activityServiceBuilder({
    //   fastify,
    //   activityDao: {
    //     getActivityById: activityId => {
    //       return activity;
    //     }
    //   },
    //   fileService: {
    //     saveFile: filePath => {
    //       return { id: fileId };
    //     },
    //     checkEvidenceFileType: f => {
    //       const type = f.name.split('.')[1];
    //       return type !== 'error';
    //     }
    //   },
    //   photoService: {
    //     savePhoto: filePath => {
    //       return { id: photoId };
    //     },
    //     checkEvidencePhotoType: f => {
    //       const type = f.name.split('.')[1];
    //       return type !== 'error';
    //     }
    //   },
    //   activityPhotoDao: {
    //     saveActivityPhoto: (activityId, savedPhotoId, fileHash) => {
    //       return {
    //         activity: activityId,
    //         photo: savedPhotoId,
    //         id: activityPhotoId,
    //         fileHash
    //       };
    //     }
    //   },
    //   activityFileDao: {
    //     saveActivityFile: (activityId, savedFileId, fileHash) => {
    //       return {
    //         activity: activityId,
    //         file: savedFileId,
    //         id: activityFileId,
    //         fileHash
    //       };
    //     }
    //   }
    // });

    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
      //FIXME
      activityDao
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

describe.skip('Testing ActivityService assignOracleToActivity', () => {
  const oracle = testHelper.buildUserOracle({ id: 3 });
  oracle.role = { id: oracle.role };

  const user = testHelper.buildUserSe({ id: 2 });
  user.role = { id: user.role };
  let activityService;
  let activity;

  beforeEach(() => {
    activity = testHelper.buildActivity({ id: 1 });
    // activityService = activityServiceBuilder({
    //   fastify,
    //   activityDao: {
    //     getActivityById: activityId => {
    //       return activity;
    //     }
    //   },
    //   userService: {
    //     getUserById: id => {
    //       if (id === oracle.id) return oracle;
    //       if (id === user.id) return user;
    //       return null;
    //     }
    //   },
    //   oracleActivityDao: {
    //     getOracleFromActivity: activityId => {
    //       return { user: activity.oracle };
    //     },
    //     assignOracleToActivity: (userId, activityId) => {
    //       return oracle;
    //     }
    //   }
    // });

    activityService = require('../rest/services/activityService');
    injectMocks(activityService, {
      //FIXME
      activityDao
    });
    activityService.unassignOracleToActivity = () => true;
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
