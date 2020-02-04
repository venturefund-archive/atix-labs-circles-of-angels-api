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
const files = require('../../rest/util/files');
const testHelper = require('../testHelper');
const {
  projectStatus,
  projectStatuses,
  activityStatus,
  userRoles
} = require('../../rest/util/constants');
const { injectMocks } = require('../../rest/util/injection');
const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const activityService = require('../../rest/services/activityService');

describe('Testing activityService', () => {
  let dbTask = [];
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];

  const resetDb = () => {
    dbTask = [];
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
  };

  const newMilestoneParams = {
    description: 'NewDescription',
    category: 'NewCategory',
    projectId: 1
  };

  const newTaskParams = {
    description: 'NewDescription',
    reviewCriteria: 'NewReviewCriteria',
    category: 'NewCategory',
    keyPersonnel: 'NewKeyPersonnel',
    budget: 5000
  };

  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userSupporter = {
    id: 2,
    role: userRoles.PROJECT_SUPPORTER
  };

  const newProject = {
    id: 1,
    status: projectStatuses.NEW,
    owner: userEntrepreneur.id
  };

  const executingProject = {
    id: 2,
    status: projectStatuses.EXECUTING,
    owner: userEntrepreneur.id
  };

  const updatableMilestone = {
    id: 1,
    project: newProject.id
  };

  const nonUpdatableMilestone = {
    id: 2,
    project: executingProject.id
  };

  const updatableTask = {
    id: 1,
    description: 'TaskDescription',
    reviewCriteria: 'TaskReview',
    category: 'TaskCategory',
    keyPersonnel: 'TaskPersonnel',
    budget: '5000',
    milestone: updatableMilestone.id
  };

  const nonUpdatableTask = {
    id: 2,
    milestone: nonUpdatableMilestone.id
  };

  const activityDao = {
    findById: id => dbTask.find(task => task.id === id),
    updateActivity: (params, activityId) => {
      const found = dbTask.find(task => task.id === activityId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbTask[dbTask.indexOf(found)] = updated;
      return updated;
    },
    deleteActivity: id => {
      const found = dbTask.find(task => task.id === id);
      if (!found) return;
      dbTask.splice(dbTask.indexOf(found), 1);
      return found;
    },
    saveActivity: (activity, milestoneId) => {
      const newTaskId =
        dbTask.length > 0 ? dbTask[dbTask.length - 1].id + 1 : 1;
      const newTask = {
        milestone: milestoneId,
        id: newTaskId,
        ...activity
      };
      dbTask.push(newTask);
      return newTask;
    },
    getTaskByIdWithMilestone: taskId => {
      const found = dbTask.find(task => task.id === taskId);
      if (!found) return;
      return {
        ...found,
        milestone: newMilestoneParams
      };
    }
  };

  const milestoneService = {
    getProjectFromMilestone: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('milestone', id));
      return dbProject.find(project => project.id === found.project);
    }
  };

  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    }
  };

  const projectService = {
    isOracleCandidate: jest.fn()
  };

  beforeAll(() => {
    files.saveFile = jest.fn(() => '/dir/path');
  });

  beforeEach(() => resetDb());

  describe('Testing updateTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbTask.push(updatableTask, nonUpdatableTask);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should update the task and return its id', async () => {
      const taskParams = {
        description: 'UpdatedDescription',
        category: 'UpdatedCategory'
      };
      const response = await activityService.updateTask(updatableTask.id, {
        userId: userEntrepreneur.id,
        taskParams
      });
      expect(response).toEqual({ taskId: updatableTask.id });
      const updated = dbTask.find(task => task.id === response.taskId);
      expect(updated.description).toEqual(taskParams.description);
      expect(updated.category).toEqual(taskParams.category);
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        activityService.updateTask(updatableTask.id, {
          userId: userEntrepreneur.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateTask'));
    });

    it('should throw an error if task does not exist', async () => {
      await expect(
        activityService.updateTask(0, {
          userId: userEntrepreneur.id,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.updateTask(updatableTask.id, {
          userId: 0,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.updateTask(nonUpdatableTask.id, {
          userId: userEntrepreneur.id,
          taskParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(
        errors.task.UpdateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing deleteTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbTask.push(updatableTask, nonUpdatableTask);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should delete the task and return its id', async () => {
      const response = await activityService.deleteTask(
        updatableTask.id,
        userEntrepreneur.id
      );
      const updated = dbTask.find(task => task.id === response.taskId);
      expect(response).toEqual({ taskId: updatableTask.id });
      expect(updated).toEqual(undefined);
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        activityService.deleteTask(updatableTask.id)
      ).rejects.toThrow(errors.common.RequiredParamsMissing('deleteTask'));
    });

    it('should throw an error if task does not exist', async () => {
      await expect(
        activityService.deleteTask(0, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.deleteTask(updatableTask.id, 0)
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.deleteTask(nonUpdatableTask.id, userEntrepreneur.id)
      ).rejects.toThrow(
        errors.task.DeleteWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing createTask', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        milestoneService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should create the task and return its id', async () => {
      const response = await activityService.createTask(updatableMilestone.id, {
        userId: userEntrepreneur.id,
        taskParams: newTaskParams
      });
      const createdTask = dbTask.find(task => task.id === response.taskId);
      expect(response).toHaveProperty('taskId');
      expect(response.taskId).toBeDefined();
      expect(createdTask).toHaveProperty('id', response.taskId);
      expect(createdTask).toHaveProperty('milestone', updatableMilestone.id);
      expect(createdTask).toHaveProperty('description', 'NewDescription');
      expect(createdTask).toHaveProperty('reviewCriteria', 'NewReviewCriteria');
      expect(createdTask).toHaveProperty('category', 'NewCategory');
      expect(createdTask).toHaveProperty('keyPersonnel', 'NewKeyPersonnel');
      expect(createdTask).toHaveProperty('budget', 5000);
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        activityService.createTask(updatableMilestone.id, {
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createTask'));
    });

    it('should throw an error if any mandatory task property is not defined', async () => {
      const missingTaskParams = {
        description: 'NewDescription',
        reviewCriteria: 'NewReviewCriteria'
      };
      await expect(
        activityService.createTask(updatableMilestone.id, {
          userId: userEntrepreneur.id,
          taskParams: missingTaskParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createTask'));
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        activityService.createTask(0, {
          userId: userEntrepreneur.id,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        activityService.createTask(updatableMilestone.id, {
          userId: 0,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        activityService.createTask(nonUpdatableMilestone.id, {
          userId: userEntrepreneur.id,
          taskParams: newTaskParams
        })
      ).rejects.toThrow(
        errors.task.CreateWithInvalidProjectStatus(projectStatuses.EXECUTING)
      );
    });
  });

  describe('Testing addClaim', () => {
    beforeAll(() => {
      injectMocks(activityService, { activityDao });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur);
    });

    it('should add an approved claim and return the task id', async () => {
      const file = { name: 'evidence.jpg', size: 20000 };
      const newTask = {
        id: 1,
        description: 'NewDescription',
        category: 'NewCategory',
        oracle: userEntrepreneur.id
      };

      dbTask.push(newTask);

      const response = await activityService.addClaim({
        taskId: newTask.id,
        userId: userEntrepreneur.id,
        file,
        approved: true
      });

      expect(response).toEqual({ taskId: newTask.id });
    });

    it('should throw an error if the user is not the oracle assigned', async () => {
      const file = { name: 'evidence.jpg', size: 20000, md5: 'aaa' };
      const newTask = {
        id: 1,
        description: 'NewDescription',
        category: 'NewCategory',
        oracle: userEntrepreneur.id + 1
      };

      dbTask.push(newTask);

      await expect(
        activityService.addClaim({
          taskId: newTask.id,
          userId: userEntrepreneur.id,
          file,
          approved: true
        })
      ).rejects.toThrow(
        errors.task.OracleNotAssigned({
          userId: userEntrepreneur.id,
          taskId: newTask.id
        })
      );
    });
  });

  describe('Testing assignOracle', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur, userSupporter);
      dbProject.push({ ...newProject, status: projectStatuses.CONSENSUS });
      dbMilestone.push(updatableMilestone);
      dbTask.push(updatableTask);
    });

    it(
      'should assign an oracle to an existing activity if the oracle ' +
        'applied as candidate for the project',
      async () => {
        projectService.isOracleCandidate.mockReturnValueOnce(true);
        const response = await activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        );
        const updated = dbTask.find(task => task.id === updatableTask.id);
        expect(response).toEqual({ taskId: updatableTask.id });
        expect(updated.oracle).toEqual(userSupporter.id);
      }
    );
    it('should throw an error if any of the required params is missing', async () => {
      await expect(
        activityService.assignOracle(updatableTask.id, userSupporter.id)
      ).rejects.toThrow(errors.common.RequiredParamsMissing('assignOracle'));
    });
    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.assignOracle(0, userSupporter.id, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });
    it("should throw an error if the user is not the task's project owner", async () => {
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userSupporter.id
        )
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });
    it('should throw an error if the oracle id does not belong to a supporter', async () => {
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userEntrepreneur.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(errors.user.IsNotSupporter);
    });
    it("should throw an error if the task's project is not in consensus phase", async () => {
      dbProject.push(executingProject);
      dbMilestone.push(nonUpdatableMilestone);
      dbTask.push(nonUpdatableTask);
      await expect(
        activityService.assignOracle(
          nonUpdatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(
        errors.task.AssignOracleWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
    it('should throw an error if the supporter has not applied as an oracle', async () => {
      projectService.isOracleCandidate.mockReturnValueOnce(false);
      await expect(
        activityService.assignOracle(
          updatableTask.id,
          userSupporter.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(errors.task.NotOracleCandidate);
    });
  });
});

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
    activityService = require('../../rest/services/activityService');
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
      async findById(id) {
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
    activityService = require('../../rest/services/activityService');
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
      async findById(id) {
        if (id === '') {
          throw Error('Error getting activity');
        }
        if (id === 0) {
          return undefined;
        }
        return testHelper.buildActivity({ id });
      }
    };

    activityService = require('../../rest/services/activityService');
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

    activityService = require('../../rest/services/activityService');
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

    activityService = require('../../rest/services/activityService');
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
