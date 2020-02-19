/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa, run } = require('@nomiclabs/buidler');
const files = require('../../rest/util/files');
const { projectStatuses, userRoles } = require('../../rest/util/constants');
const { injectMocks } = require('../../rest/util/injection');
const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const activityService = require('../../rest/services/activityService');

const TEST_TIMEOUT_MS = 10000;
const deployContracts = async () => {
  await run('deploy', { reset: true });
  const coaContract = await coa.getCOA();
  const superDaoAddress = await coaContract.daos(0);
  const { _address } = await coa.getSigner();
  return { coaContract, superDaoAddress, superUserAddress: _address };
};

describe('Testing activityService', () => {
  let dbTask = [];
  let dbTaskEvidence = [];
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];

  const resetDb = () => {
    dbTask = [];
    dbTaskEvidence = [];
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
  };

  const evidenceFile = { name: 'evidence.jpg', size: 20000 };

  const mockedDescription = 'Testing description';

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

  const taskEvidence = {
    id: 1,
    createdAt: '2020-02-13',
    description: mockedDescription,
    proof: '/file/taskEvidence',
    approved: true,
    task: nonUpdatableTask.id
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
      const populatedMilestone = dbMilestone.find(
        milestone => milestone.id === found.milestone
      );
      return {
        ...found,
        milestone: populatedMilestone
      };
    }
  };

  const taskEvidenceDao = {
    addTaskEvidence: ({ description, proof, approved, task }) => {
      const newTaskEvidenceId =
        dbTaskEvidence.length > 0
          ? dbTaskEvidence[dbTaskEvidence.length - 1].id + 1
          : 1;

      const newTaskEvidence = {
        id: newTaskEvidenceId,
        task,
        description,
        proof,
        approved
      };

      dbTaskEvidence.push(newTaskEvidence);
      return newTaskEvidence;
    },
    getEvidencesByTaskId: taskId => {
      const evidences = dbTaskEvidence.filter(
        evidence => evidence.task === taskId
      );

      return evidences;
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
    isOracleCandidate: jest.fn(),
    getProjectById: id => {
      const found = dbProject.find(project => project.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('project', id));
      return found;
    }
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

  describe.only('Testing addClaim', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        taskEvidenceDao,
        projectService
      });
    });

    beforeEach(async () => {
      dbUser.push(userEntrepreneur);
      dbTask.push({
        ...nonUpdatableTask,
        oracle: userEntrepreneur.id
      });
      dbMilestone.push(nonUpdatableMilestone);
      await deployContracts();
      const projectAddress = await run('create-project');
      dbProject.push({ ...executingProject, address: projectAddress });
    }, TEST_TIMEOUT_MS);

    it('should add an approved claim and return the claim id', async () => {
      const response = await activityService.addClaim({
        taskId: nonUpdatableTask.id,
        userId: userEntrepreneur.id,
        file: evidenceFile,
        description: mockedDescription,
        approved: true
      });
      expect(response).toEqual({ taskId: nonUpdatableTask.id });
    });

    it('should throw an error if the user is not the oracle assigned', async () => {
      await expect(
        activityService.addClaim({
          taskId: nonUpdatableTask.id,
          userId: 0,
          file: evidenceFile,
          description: mockedDescription,
          approved: true
        })
      ).rejects.toThrow(
        errors.task.OracleNotAssigned({
          userId: 0,
          taskId: nonUpdatableTask.id
        })
      );
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbTask.push(updatableTask);
      dbMilestone.push(updatableMilestone);
      dbProject.push(newProject);

      await expect(
        activityService.addClaim({
          taskId: updatableTask.id,
          userId: userEntrepreneur.id,
          file: evidenceFile,
          description: mockedDescription,
          approved: true
        })
      ).rejects.toThrow(
        errors.project.InvalidStatusForEvidenceUpload(newProject.status)
      );
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        activityService.addClaim({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: evidenceFile
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('addClaim'));
    });

    it('should throw an error if the file mtype is invalid', async () => {
      await expect(
        activityService.addClaim({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: { name: 'invalidclaim.exe', size: 2000 },
          description: mockedDescription,
          approved: true
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });

    it('should throw an error if the file has an invalid size', async () => {
      await expect(
        activityService.addClaim({
          taskId: nonUpdatableTask.id,
          userId: userEntrepreneur.id,
          file: { name: 'imbig.jpg', size: 500001 },
          description: mockedDescription,
          approved: true
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
  });

  describe('Testing getTaskEvidence', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        taskEvidenceDao
      });
    });

    beforeEach(() => {
      dbUser.push(userEntrepreneur);
      dbTask.push({
        ...nonUpdatableTask,
        oracle: userEntrepreneur.id
      });
      dbTaskEvidence.push(taskEvidence);
    });

    it('should return a list of all task evidences', async () => {
      const response = await activityService.getTaskEvidences({
        taskId: nonUpdatableTask.id
      });

      expect(response).toHaveLength(1);
      expect(response).toEqual([{ ...taskEvidence }]);
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

  describe('Testing createActivities', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject);
      dbMilestone.push(updatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should save all activities and return them', async () => {
      const newTask = {
        description: 'TaskDescription',
        reviewCriteria: 'TaskReview',
        category: 'TaskCategory',
        keyPersonnel: 'TaskPersonnel',
        budget: '5000'
      };
      const response = await activityService.createActivities(
        [newTask, newTask, newTask],
        updatableMilestone.id
      );
      expect(response).toHaveLength(3);
      const savedActivities = dbTask.filter(
        task => task.milestone === updatableMilestone.id
      );
      expect(response).toEqual(savedActivities);
    });

    it('should skip the empty activities and save and return the others', async () => {
      const newTask = {
        description: 'TaskDescription',
        reviewCriteria: 'TaskReview',
        category: 'TaskCategory',
        keyPersonnel: 'TaskPersonnel',
        budget: '5000'
      };
      const response = await activityService.createActivities(
        [
          newTask,
          {
            description: '',
            reviewCriteria: '',
            category: '',
            keyPersonnel: '',
            budget: ''
          },
          newTask
        ],
        updatableMilestone.id
      );
      expect(response).toHaveLength(2);
      const savedActivities = dbTask.filter(
        task => task.milestone === updatableMilestone.id
      );
      expect(response).toEqual(savedActivities);
    });

    it('should return an empty array if no activities were provided', async () => {
      const response = await activityService.createActivities(
        [],
        updatableMilestone.id
      );
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getMilestoneAndTaskFromId', () => {
    beforeAll(() => {
      injectMocks(activityService, {
        activityDao,
        userService,
        projectService
      });
    });

    beforeEach(() => {
      dbMilestone.push(updatableMilestone);
      dbTask.push(updatableTask);
    });

    it('should return the task and the milestone it belongs to', async () => {
      const response = await activityService.getMilestoneAndTaskFromId(
        updatableTask.id
      );
      expect(response.task).toEqual(updatableTask);
      expect(response.milestone).toEqual(updatableMilestone);
    });

    it('should throw an error if the task does not exist', async () => {
      await expect(
        activityService.getMilestoneAndTaskFromId(0)
      ).rejects.toThrow(errors.common.CantFindModelWithId('task', 0));
    });

    it('should throw an error if no milestone was found for the task', async () => {
      dbTask.push({ ...updatableTask, id: 2, milestone: 0 });
      await expect(
        activityService.getMilestoneAndTaskFromId(2)
      ).rejects.toThrow(errors.task.MilestoneNotFound(2));
    });
  });
});
