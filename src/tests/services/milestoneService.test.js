/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed upon
 * by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { injectMocks } = require('../../rest/util/injection');
const COAError = require('../../rest/errors/COAError');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const milestoneService = require('../../rest/services/milestoneService');
const {
  projectStatuses,
  userRoles,
  claimMilestoneStatus
} = require('../../rest/util/constants');

describe('Testing milestoneService', () => {
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];
  let dbTask = [];

  const resetDb = () => {
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
    dbTask = [];
  };

  const newMilestoneParams = {
    description: 'NewDescription',
    category: 'NewCategory'
  };

  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
  };

  const userBankoperator = {
    id: 2,
    role: userRoles.BANK_OPERATOR
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
    project: newProject.id,
    description: 'UpdatableDescription',
    category: 'UpdatableCategory'
  };

  const nonUpdatableMilestone = {
    id: 2,
    project: executingProject.id,
    description: 'NonUpdatableDescription',
    category: 'NonUpdatableCategory'
  };

  const claimableMilestone = {
    id: 3,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.CLAIMABLE
  };

  const nonClaimableMilestone = {
    id: 4,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.PENDING
  };

  const claimedMilestone = {
    id: 5,
    project: executingProject.id,
    claimStatus: claimMilestoneStatus.CLAIMED
  };

  const milestonesFile = {
    data: Buffer.from('milestone data'),
    name: 'milestones.xlsx',
    size: 10
  };

  const processErrors = {
    errors: [
      { rowNumber: 1, msg: 'Missing field' },
      { rowNumber: 2, msg: 'Invalid value' }
    ]
  };

  const processedMilestones = [
    {
      category: 'Category',
      tasks: 'Description',
      activityList: []
    },
    { activityList: [] },
    {
      category: 'Other Category',
      tasks: 'Other Description',
      activityList: []
    }
  ];

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

  const milestoneDao = {
    findById: id => dbMilestone.find(milestone => milestone.id === id),
    saveMilestone: ({ milestone, projectId }) => {
      const newMilestoneId =
        dbMilestone.length > 0 ? dbMilestone[dbMilestone.length - 1].id + 1 : 1;
      const newMilestone = {
        project: projectId,
        id: newMilestoneId,
        ...milestone
      };
      dbMilestone.push(newMilestone);
      return newMilestone;
    },
    updateMilestone: (params, milestoneId) => {
      const found = dbMilestone.find(milestone => milestone.id === milestoneId);
      if (!found) return;
      const updated = { ...found, ...params };
      dbMilestone[dbMilestone.indexOf(found)] = updated;
      return updated;
    },
    getMilestoneByIdWithProject: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found) return;
      return {
        ...found,
        project: dbProject.find(project => project.id === found.project)
      };
    },
    deleteMilestone: id => {
      const found = dbMilestone.find(milestone => milestone.id === id);
      if (!found) return;
      dbMilestone.splice(dbMilestone.indexOf(found), 1);
      return found;
    },
    getMilestonesByProjectId: projectId => {
      const found = dbMilestone.filter(
        milestone => milestone.project === projectId
      );
      if (!found) return [];
      return found.map(milestone => {
        const tasks = dbTask.filter(task => task.milestone === milestone.id);
        return { ...milestone, tasks };
      });
    },
    getMilestones: () =>
      dbMilestone.map(milestone => ({
        ...milestone,
        project: dbProject.find(p => p.id === milestone.project),
        tasks: dbTask.filter(t => t.milestone === milestone.id)
      }))
  };

  const projectService = {
    getProject: id => dbProject.find(project => project.id === id),
    getProjectById: id => dbProject.find(project => project.id === id)
  };

  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    }
  };

  beforeEach(() => resetDb());

  describe('Testing createMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbUser.push(userEntrepreneur);
    });

    it('should create the milestone and return its id', async () => {
      const response = await milestoneService.createMilestone(newProject.id, {
        userId: userEntrepreneur.id,
        milestoneParams: newMilestoneParams
      });
      const createdMilestone = dbMilestone.find(
        milestone => milestone.id === response.milestoneId
      );
      expect(response).toHaveProperty('milestoneId');
      expect(response.milestoneId).toBeDefined();
      expect(createdMilestone).toHaveProperty('id', response.milestoneId);
      expect(createdMilestone).toHaveProperty('project', newProject.id);
      expect(createdMilestone).toHaveProperty('description', 'NewDescription');
      expect(createdMilestone).toHaveProperty('category', 'NewCategory');
    });
    it('should throw an error if an argument is not defined', async () => {
      await expect(
        milestoneService.createMilestone(newProject.id, {
          milestoneParams: newMilestoneParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createMilestone'));
    });
    it('should throw an error if any mandatory milestone property is not defined', async () => {
      const missingMilestoneParams = {
        description: 'NewDescription'
      };
      await expect(
        milestoneService.createMilestone(newProject.id, {
          userId: userEntrepreneur.id,
          milestoneParams: missingMilestoneParams
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createMilestone'));
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        milestoneService.createMilestone(0, {
          userId: userEntrepreneur.id,
          milestoneParams: newMilestoneParams
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        milestoneService.createMilestone(newProject.id, {
          userId: 0,
          milestoneParams: newMilestoneParams
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });
    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        milestoneService.createMilestone(executingProject.id, {
          userId: userEntrepreneur.id,
          milestoneParams: newMilestoneParams
        })
      ).rejects.toThrow(
        errors.milestone.CreateWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
  });

  describe('Testing updateMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should update the milestone and return its id', async () => {
      const milestoneParams = {
        description: 'UpdatedDescription',
        category: 'UpdatedCategory'
      };
      const response = await milestoneService.updateMilestone(
        updatableMilestone.id,
        {
          userId: userEntrepreneur.id,
          milestoneParams
        }
      );
      expect(response).toEqual({ milestoneId: updatableMilestone.id });
      const updated = dbMilestone.find(
        milestone => milestone.id === response.milestoneId
      );
      expect(updated.description).toEqual(milestoneParams.description);
      expect(updated.category).toEqual(milestoneParams.category);
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        milestoneService.updateMilestone(updatableMilestone.id, {
          userId: userEntrepreneur.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateMilestone'));
    });

    it('should throw an error if milestone does not exist', async () => {
      await expect(
        milestoneService.updateMilestone(0, {
          userId: userEntrepreneur.id,
          milestoneParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        milestoneService.updateMilestone(updatableMilestone.id, {
          userId: 0,
          milestoneParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        milestoneService.updateMilestone(nonUpdatableMilestone.id, {
          userId: userEntrepreneur.id,
          milestoneParams: { description: 'wontupdate' }
        })
      ).rejects.toThrow(
        errors.milestone.UpdateWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
  });

  describe('Testing deleteMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbUser.push(userEntrepreneur);
    });

    it('should delete the milestone and return its id', async () => {
      const response = await milestoneService.deleteMilestone(
        updatableMilestone.id,
        userEntrepreneur.id
      );
      const deleted = dbMilestone.find(
        milestone => milestone.id === response.milestoneId
      );
      expect(response).toEqual({ milestoneId: updatableMilestone.id });
      expect(deleted).toEqual(undefined);
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        milestoneService.deleteMilestone(updatableMilestone.id)
      ).rejects.toThrow(errors.common.RequiredParamsMissing('deleteMilestone'));
    });

    it('should throw an error if milestone does not exist', async () => {
      await expect(
        milestoneService.deleteMilestone(0, userEntrepreneur.id)
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the project owner', async () => {
      await expect(
        milestoneService.deleteMilestone(updatableMilestone.id, 0)
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project status is not NEW', async () => {
      await expect(
        milestoneService.deleteMilestone(
          nonUpdatableMilestone.id,
          userEntrepreneur.id
        )
      ).rejects.toThrow(
        errors.milestone.DeleteWithInvalidProjectStatus(
          projectStatuses.EXECUTING
        )
      );
    });
  });

  describe('Testing deleteFieldsFromMilestone', () => {
    it(
      'should delete unneeded fields from the milestone object ' +
        'and return only description and category',
      () => {
        const fullMilestone = {
          impact: 'Impact',
          impactCriterion: 'ImpactCriterion',
          signsOfSuccess: 'SignsOfSuccess',
          signsOfSuccessCriterion: 'SignOfSuccessCriterion',
          keyPersonnel: 'KeyPersonnel',
          budget: 'Budget',
          tasks: 'Tasks',
          quarter: 'Quarter',
          category: 'Category',
          activityList: [],
          updatedAt: new Date(),
          transactionHash: '0x0',
          budgetStatus: 'BudgetStatus',
          blockchainStatus: 'BlockchainStatus'
        };
        const response = milestoneService.deleteFieldsFromMilestone(
          fullMilestone
        );
        expect(response).toEqual({
          category: 'Category',
          description: 'Tasks'
        });
      }
    );
  });

  describe('Testing deleteFieldsFromActivities', () => {
    it(
      'should add a description field to the activities ' +
        'with their tasks field value',
      () => {
        const fullActivities = [
          {
            tasks: 'Now Description',
            impactCriterion: 'New review criteria'
          },
          { tasks: 'Old tasks', impactCriterion: 'Old impact criterion' }
        ];
        const response = milestoneService.deleteFieldsFromActivities(
          fullActivities
        );
        expect(response).toEqual([
          {
            description: fullActivities[0].tasks,
            reviewCriteria: fullActivities[0].impactCriterion,
            impactCriterion: fullActivities[0].impactCriterion,
            tasks: fullActivities[0].tasks
          },
          {
            description: fullActivities[1].tasks,
            reviewCriteria: fullActivities[1].impactCriterion,
            impactCriterion: fullActivities[1].impactCriterion,
            tasks: fullActivities[1].tasks
          }
        ]);
      }
    );
  });

  describe('Testing createMilestones', () => {
    beforeAll(() => {
      milestoneService.processMilestones = jest.fn();
      injectMocks(milestoneService, {
        activityService: Object.assign({}, { createActivities: () => {} }),
        milestoneDao
      });
    });

    it('should return a list of processed milestones and save them to db', async () => {
      milestoneService.processMilestones.mockReturnValueOnce({
        milestones: processedMilestones,
        errors: []
      });

      const response = await milestoneService.createMilestones(
        milestonesFile,
        1
      );
      const foundMilestones = dbMilestone.filter(
        milestone => milestone.project === 1
      );
      expect(response).toHaveLength(3);
      expect(response.filter(r => !!r)).toEqual(foundMilestones);
    });

    it('should throw an error if the file does not have data', async () => {
      await expect(
        milestoneService.createMilestones({ name: 'file.xlsx' }, 1)
      ).rejects.toThrow(errors.milestone.CantProcessMilestonesFile);
    });

    it('should a list of errors if the processed file has errors', async () => {
      milestoneService.processMilestones.mockReturnValueOnce(processErrors);
      const response = await milestoneService.createMilestones(
        milestonesFile,
        1
      );
      expect(response).toEqual(processErrors);
    });

    it('should throw an error if the milestones processing failed', async () => {
      milestoneService.processMilestones.mockImplementationOnce(() =>
        Promise.reject()
      );
      await expect(
        milestoneService.createMilestones(milestonesFile, 2)
      ).rejects.toThrow(errors.milestone.ErrorCreatingMilestonesFromFile);
    });
  });

  test.todo(
    'Method processMilestones needs a big refactor to be able to test it easily'
  );

  describe('Testing isMilestoneEmpty', () => {
    it(
      'should return false if milestone has at least 1 field with data ' +
        'besides activityList',
      () => {
        const mockMilestone = {
          category: 'Category',
          activityList: []
        };

        expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(false);
      }
    );

    it(
      'should return true if milestone does not have any fields with data ' +
        'except activityList',
      () => {
        const mockMilestone = {
          activityList: []
        };
        expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(true);
      }
    );
  });

  describe('Testing isMilestoneValid', () => {
    it('should return true if milestone has quarter, tasks and impact not empty', () => {
      const mockMilestone = {
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        impact: 'Impact M1',
        activityList: []
      };

      expect(milestoneService.isMilestoneValid(mockMilestone)).toBe(true);
    });

    it('should return false if milestone has quarter, tasks or impact empty', () => {
      const mockMilestoneWithoutQuarter = {
        quarter: '',
        tasks: 'Task M1',
        impact: 'Impact M1',
        activityList: []
      };

      const mockMilestoneWithoutTasks = {
        quarter: 'Quarter 1',
        tasks: '',
        impact: 'Impact M1',
        activityList: []
      };

      const mockMilestoneWithoutImpact = {
        quarter: 'Quarter 1',
        tasks: 'Task M1',
        activityList: []
      };

      expect(
        milestoneService.isMilestoneValid(mockMilestoneWithoutQuarter)
      ).toBe(false);
      expect(milestoneService.isMilestoneValid(mockMilestoneWithoutTasks)).toBe(
        false
      );
      expect(
        milestoneService.isMilestoneValid(mockMilestoneWithoutImpact)
      ).toBe(false);
    });
  });

  describe('Testing verifyMilestone', () => {
    it('should return true if the milestone has tasks and category not empty', () => {
      const milestone = { tasks: 'Tasks', category: 'Category' };
      expect(milestoneService.verifyMilestone(milestone, () => {})).toBe(true);
    });

    it('should return false if activity has at least one field empty', () => {
      const milestone = { tasks: '' };
      expect(milestoneService.verifyMilestone(milestone, () => {})).toBe(false);
    });
  });

  describe('Testing verifyActivity', () => {
    it('should return true if the activity has all fields not empty', () => {
      const activity = {
        tasks: 'tasks',
        impact: 'impact',
        impactCriterion: 'impactCriterion',
        signsOfSuccess: 'signsOfSuccess',
        signsOfSuccessCriterion: 'signsOfSuccessCriterion',
        category: 'category',
        keyPersonnel: 'keyPersonnel',
        budget: 'budget'
      };
      expect(milestoneService.verifyActivity(activity, () => {})).toBe(true);
    });

    it('should return false if activity has at least one field empty', () => {
      const activity = {
        impact: 'impact',
        impactCriterion: '',
        signsOfSuccess: '',
        keyPersonnel: 'keyPersonnel',
        budget: 'budget'
      };
      expect(milestoneService.verifyActivity(activity, () => {})).toBe(false);
    });
  });

  describe('Testing getAllMilestonesByProject', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbMilestone.push(
        { ...updatableMilestone, project: executingProject.id },
        nonUpdatableMilestone
      );
      dbTask.push(nonUpdatableTask, updatableTask);
    });

    it("should return a list of the project's milestones with their activities", async () => {
      const response = await milestoneService.getAllMilestonesByProject(
        executingProject.id
      );
      expect(response).toHaveLength(2);
      expect(response).toEqual([
        {
          ...updatableMilestone,
          project: executingProject.id,
          tasks: [updatableTask]
        },
        { ...nonUpdatableMilestone, tasks: [nonUpdatableTask] }
      ]);
    });

    it('should return undefined if no milestones were retrieved from database', async () => {
      const response = await milestoneService.getAllMilestonesByProject(0);
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing getMilestoneById', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbMilestone.push(updatableMilestone);
    });

    it('should return the existing milestone if found', async () => {
      const response = await milestoneService.getMilestoneById(
        updatableMilestone.id
      );
      expect(response).toEqual(updatableMilestone);
    });

    it('should throw an error if milestone was not found', async () => {
      await expect(milestoneService.getMilestoneById(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('milestone', 0)
      );
    });
  });

  describe('Testing getMilestones', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao
      });
    });

    beforeEach(() => {
      dbProject.push(newProject, executingProject);
      dbMilestone.push(updatableMilestone, nonUpdatableMilestone);
      dbTask.push(updatableTask, nonUpdatableTask);
    });
    it('should return a list with all existing milestones', async () => {
      const response = await milestoneService.getMilestones();
      expect(response).toHaveLength(2);
      expect(response).toEqual([
        {
          ...updatableMilestone,
          project: newProject,
          tasks: [updatableTask]
        },
        {
          ...nonUpdatableMilestone,
          project: executingProject,
          tasks: [nonUpdatableTask]
        }
      ]);
    });
    it('should return an empty array if not milestones were found', async () => {
      resetDb();
      const response = await milestoneService.getMilestones();
      expect(response).toHaveLength(0);
    });
  });

  describe('Testing claimMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbMilestone = [];
      dbProject.push(executingProject);
      dbUser.push(userEntrepreneur);
      dbMilestone.push(claimableMilestone);
    });

    it('should claim the milestone and return its id', async () => {
      const response = await milestoneService.claimMilestone({
        userId: userEntrepreneur.id,
        milestoneId: claimableMilestone.id
      });

      expect(response).toEqual({ milestoneId: claimableMilestone.id });
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id
        })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('claimMilestone'));
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: 0
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the user is not the owner', async () => {
      await expect(
        milestoneService.claimMilestone({
          userId: 2,
          milestoneId: claimableMilestone.id
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(newProject);
      dbMilestone.push(updatableMilestone);

      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: updatableMilestone.id
        })
      ).rejects.toThrow(
        errors.project.InvalidStatusForClaimMilestone(projectStatuses.NEW)
      );
    });

    it('should throw an error if the milestone is not in claimable status', async () => {
      dbMilestone.push(nonClaimableMilestone);

      await expect(
        milestoneService.claimMilestone({
          userId: userEntrepreneur.id,
          milestoneId: nonClaimableMilestone.id
        })
      ).rejects.toThrow(
        errors.milestone.InvalidStatusForClaimMilestone(
          claimMilestoneStatus.PENDING
        )
      );
    });
  });

  describe('Testing transferredMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao,
        projectService,
        userService
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbMilestone = [];
      dbProject.push(executingProject);
      dbUser.push(userBankoperator);
      dbMilestone.push(claimedMilestone);
    });

    it('should claim the milestone and return its id', async () => {
      const response = await milestoneService.transferredMilestone({
        userId: userBankoperator.id,
        milestoneId: claimedMilestone.id
      });

      expect(response).toEqual({ milestoneId: claimedMilestone.id });
    });

    it('should throw an error if user is not a bank operator', async () => {
      dbUser.push(userEntrepreneur);

      await expect(
        milestoneService.transferredMilestone({
          userId: userEntrepreneur.id,
          milestoneId: claimedMilestone.id
        })
      ).rejects.toThrow(errors.common.UserNotAuthorized(userEntrepreneur.id));
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('transferredMilestone')
      );
    });

    it('should throw an error if the milestone does not exist', async () => {
      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: 0
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('milestone', 0));
    });

    it('should throw an error if the project is not in executing status', async () => {
      dbProject.push(newProject);
      dbMilestone.push(updatableMilestone);

      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: updatableMilestone.id
        })
      ).rejects.toThrow(
        errors.common.InvalidStatus('project', projectStatuses.NEW)
      );
    });

    it('should throw an error if the milestone is not in claimed status', async () => {
      dbMilestone.push(nonClaimableMilestone);

      await expect(
        milestoneService.transferredMilestone({
          userId: userBankoperator.id,
          milestoneId: nonClaimableMilestone.id
        })
      ).rejects.toThrow(
        errors.common.InvalidStatus('milestone', claimMilestoneStatus.PENDING)
      );
    });
  });
});
