/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed upon
 * by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const testHelper = require('./testHelper');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();
const {
  activityStatus,
  milestoneBudgetStatus,
  projectStatus,
  projectStatuses,
  userRoles
} = require('../rest/util/constants');
const { injectMocks } = require('../rest/util/injection');
const errors = require('../rest/errors/exporter/ErrorExporter');
const milestoneService = require('../rest/services/milestoneService');

const fastify = {
  log: { info: jest.fn(), error: jest.fn() },
  configs: require('config'),
  eth: {
    isTransactionConfirmed: ethServicesMock.isTransactionConfirmed
  }
};

describe('Testing milestoneService', () => {
  let dbMilestone = [];
  let dbProject = [];
  let dbUser = [];

  const resetDb = () => {
    dbMilestone = [];
    dbProject = [];
    dbUser = [];
  };

  const newMilestoneParams = {
    description: 'NewDescription',
    category: 'NewCategory'
  };

  const userEntrepreneur = {
    id: 1,
    role: userRoles.ENTREPRENEUR
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
      const found = dbMilestone.find(task => task.id === milestoneId);
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
    }
  };
  const projectService = {
    getProject: id => dbProject.find(project => project.id === id)
  };

  describe('Testing milestoneService createMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      resetDb();
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
  describe('Testing milestoneService updateMilestone', () => {
    beforeAll(() => {
      injectMocks(milestoneService, {
        milestoneDao,
        projectService
      });
    });

    beforeEach(() => {
      resetDb();
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
});

describe.skip('Testing milestoneService createMilestones', () => {
  let milestoneDao;
  let activityService;
  let mockProjects;

  const project = 2;
  let milestoneCount = 1;

  const mockMilestones = [
    testHelper.buildMilestone(0, { projectId: project, id: 1 }),
    testHelper.buildMilestone(0, { projectId: project, id: 2 })
  ];

  beforeAll(() => {
    mockProjects = testHelper.getMockProjects();
    milestoneDao = {
      async saveMilestone({ milestone, projectId }) {
        const toSave = {
          ...milestone,
          project: projectId,
          id: milestoneCount++
        };
        delete toSave.activityList;
        return toSave;
      },

      async getMilestonesByProject(projectId) {
        const getProject = mockProjects.find(
          mockProject => projectId === mockProject.id
        );
        return getProject.milestones;
      }
    };

    activityService = {
      async createActivities() {
        return null;
      }
    };

    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it(
    'should return an array of errors and an empty array of milestones ' +
      'if the milestones are invalid',
    async () => {
      const projectId = 2;
      const errors = [
        { rowNumber: 6, msg: 'Found a milestone without Tasks specified' },
        {
          rowNumber: 6,
          msg:
            'Found a milestone without Expected Changes/ Social Impact Targets specified'
        },
        {
          rowNumber: 7,
          msg:
            'Found an activity without an specified milestone or inside an invalid milestone'
        },
        {
          rowNumber: 8,
          msg:
            'Found an activity without an specified milestone or inside an invalid milestone'
        },
        {
          rowNumber: 10,
          msg:
            'Found a milestone without Expected Changes/ Social Impact Targets specified'
        },
        {
          rowNumber: 11,
          msg: 'Found a milestone without activities'
        },
        { rowNumber: 11, msg: 'Found a milestone without Tasks specified' }
      ];

      const filePath = testHelper.getMockFiles().milestonesErrors.path;

      // milestoneService.readMilestones.mockImplementation = jest.fn(() =>
      //   milestoneService.readMilestones(filePath)
      // );

      const milestones = await milestoneService.createMilestones(
        filePath,
        projectId
      );

      await expect(milestones.errors).toEqual(errors);
    }
  );
  it('should return an array of created milestones associated to a project', async () => {
    const filePath = testHelper.getMockFiles().projectMilestones.path;

    milestoneService.readMilestones = jest.fn(() => {
      const firstMilestone = { ...mockMilestones[0], activityList: [] };
      delete firstMilestone.id;
      delete firstMilestone.project;

      const secondMilestone = { ...mockMilestones[1], activityList: [] };
      delete secondMilestone.id;
      delete secondMilestone.project;

      const toCreateMilestones = [firstMilestone, secondMilestone];
      return { errors: [], milestones: toCreateMilestones };
    });

    const milestones = await milestoneService.createMilestones(
      filePath,
      project
    );

    await expect(milestones).toEqual(mockMilestones);
  });
});

describe.skip('Testing milestoneService getMilestoneActivities', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const milestoneId = 11;
  const projectId = 12;

  beforeAll(() => {
    milestoneDao = {
      async getMilestoneActivities(milestone) {
        const milestoneWithActivities = testHelper.buildMilestone(2, {
          id: milestone,
          projectId
        });
        return milestoneWithActivities;
      }
    };
    activityService = {
      getOracleFromActivity() {
        return { user: testHelper.buildUserOracle() };
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it.skip(
    'should return a milestone with its activities ' +
      'with quarter and type fields added to them',
    async () => {
      const mockMilestone = {
        ...testHelper.buildMilestone(0, {
          id: milestoneId,
          projectId
        }),
        activities: [{}, {}]
      };

      const expected = testHelper.buildMilestone(2, {
        id: mockMilestone.id,
        projectId
      });

      const response = await milestoneService.getMilestoneActivities(
        mockMilestone
      );

      await expect(response).toEqual(expected);
    }
  );
});

describe.skip('Testing milestoneService isMilestoneEmpty', () => {
  let milestoneService;
  let milestoneDao;

  beforeAll(() => {
    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it('should return false if milestone has at least 1 field with data', async () => {
    const mockMilestone = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(false);
  });

  it(
    'should return true if milestone does not have any fields with data ' +
      'except activityList',
    async () => {
      const mockMilestone = {
        activityList: []
      };
      await expect(milestoneService.isMilestoneEmpty(mockMilestone)).toBe(true);
    }
  );
});

describe.skip('Testing milestoneService isMilestoneValid', () => {
  let milestoneService;
  let milestoneDao;

  beforeAll(() => {
    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it('should return true if milestone has quarter, tasks and impact not empty', async () => {
    const mockMilestone = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(milestoneService.isMilestoneValid(mockMilestone)).toBe(true);
  });

  it('should return true if milestone has quarter, tasks or impact empty', async () => {
    const mockMilestoneWithoutQuarter = {
      quarter: '',
      tasks: 'Task M1',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    const mockMilestoneWithoutTasks = {
      quarter: 'Quarter 1',
      tasks: '',
      impact: 'Impact M1',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    const mockMilestoneWithoutImpact = {
      quarter: 'Quarter 1',
      tasks: 'Task M1',
      impact: '',
      impactCriterion: '',
      signsOfSuccess: '',
      signsOfSuccessCriterion: '',
      category: '',
      keyPersonnel: '',
      budget: '',
      activityList: []
    };

    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutQuarter)
    ).toBe(false);
    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutTasks)
    ).toBe(false);
    await expect(
      milestoneService.isMilestoneValid(mockMilestoneWithoutImpact)
    ).toBe(false);
  });
});

describe.skip('Testing milestoneService verifyActivity', () => {
  let milestoneService;
  let milestoneDao;

  const mockActivity = testHelper.buildActivity({ id: 1 });
  const response = { milestones: [], errors: [] };

  const pushError = rowNumber => msg => {
    response.errors.push({ rowNumber, msg });
  };

  beforeAll(() => {
    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it('should return true if activity has all fields not empty', async () => {
    await expect(milestoneService.verifyActivity(mockActivity, pushError)).toBe(
      true
    );
  });

  it('should return false if activity has at least one field empty', async () => {
    const incompleteActivity = { ...mockActivity, signsOfSuccess: '' };
    await expect(
      milestoneService.verifyActivity(incompleteActivity, pushError)
    ).toBe(false);
  });
});

describe.skip('Testing milestonesService deleteMilestone', () => {
  let milestoneDao;
  let milestoneService;

  const milestoneId = 1;
  const mockMilestone = testHelper.buildMilestone(1, { id: milestoneId });

  beforeAll(() => {
    milestoneDao = {
      async deleteMilestone(id) {
        if (id === milestoneId) return mockMilestone;
        return [];
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it('should return the deleted milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(milestoneId);
    await expect(milestone).toBe(mockMilestone);
  });

  it('should return empty list when try delete a non-existent milestone', async () => {
    const milestone = await milestoneService.deleteMilestone(2);
    await expect(milestone).toEqual([]);
  });
});

describe.skip('Testing milestoneService getProjectsAsOracle', () => {
  let milestoneDao;
  let activityService;
  let milestoneService;

  const oracleId = 4;
  const milestoneIdList = [11, 12];
  const projectIdList = [52, 54];
  const mockErrorMessage = {
    error: 'Error at getMilestonesAsOracle',
    status: 409
  };
  const mockMilestones = [
    testHelper.buildMilestone(0, {
      id: milestoneIdList[0],
      projectId: projectIdList[0]
    }),
    testHelper.buildMilestone(1, {
      id: milestoneIdList[1],
      projectId: projectIdList[1]
    })
  ];

  beforeAll(() => {
    milestoneDao = {
      async findById(id) {
        return mockMilestones.find(mockMilestone => mockMilestone.id === id);
      }
    };

    activityService = {
      async getMilestonesAsOracle(oracle) {
        if (!oracle) {
          throw Error('DB Error');
        }
        if (oracle !== oracleId) {
          return mockErrorMessage;
        }
        return milestoneIdList;
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it.skip('should return a list of project ids', async () => {
    const expected = projectIdList;

    const response = await milestoneService.getProjectsAsOracle(oracleId);
    return expect(response).toEqual(expected);
  });

  it.skip('should return an error if it fails to get milestones for an oracle', async () => {
    const expected = mockErrorMessage;

    return expect(
      await milestoneService.getProjectsAsOracle(oracleId + 1)
    ).toThrowError('Error');
  });

  it('should throw an error if an exception is caught', async () =>
    expect(milestoneService.getProjectsAsOracle()).rejects.toEqual(
      Error('Error getting Milestones')
    ));
});

describe.skip('Testing milestoneService getMilestonesByProject', () => {
  let milestoneDao;
  let milestoneService;

  const projectId = 52;
  const mockMilestones = [
    testHelper.buildMilestone(0, {
      id: 11,
      projectId
    }),
    testHelper.buildMilestone(1, {
      id: 12,
      projectId
    })
  ];

  const mockActivities = milestone => [
    testHelper.buildActivity({ id: 1, milestoneId: milestone }),
    testHelper.buildActivity({ id: 2, milestoneId: milestone })
  ];

  beforeAll(() => {
    milestoneDao = {
      async getMilestonesByProject(project) {
        if (!project) {
          throw Error('DB Error');
        }
        if (project !== projectId) {
          return undefined;
        }
        return mockMilestones;
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });

    milestoneService.getMilestoneActivities = milestone => {
      const milestoneWithActivities = {
        ...milestone,
        activities: mockActivities(milestone.id)
      };
      return milestoneWithActivities;
    };
  });

  it("should return a list of the project's milestones with their activities", async () => {
    const expected = [
      {
        ...mockMilestones[0],
        activities: mockActivities(mockMilestones[0].id)
      },
      { ...mockMilestones[1], activities: mockActivities(mockMilestones[1].id) }
    ];

    const response = await milestoneService.getMilestonesByProject(projectId);
    return expect(response).toEqual(expected);
  });

  it('should return undefined if no milestones were retrieved from database', async () => {
    const response = await milestoneService.getMilestonesByProject(
      projectId + 1
    );
    return expect(response).toBeUndefined();
  });

  it('should throw an error if an error was caugth getting the milestones', () =>
    expect(milestoneService.getMilestonesByProject()).rejects.toEqual(
      Error('Error getting Milestones')
    ));
});

describe.skip('Testing milestoneService tryCompleteMilestone', () => {
  let milestoneDao;
  let milestoneService;

  const milestoneId = 12;
  const mockMilestone = testHelper.buildMilestone(0, {
    id: milestoneId
  });
  const mockActivitiesCompleted = [
    {
      ...testHelper.buildActivity({
        id: 1,
        milestoneId
      }),
      status: activityStatus.COMPLETED,
      transactionHash: ethServicesMock.validateActivity()
    },
    {
      ...testHelper.buildActivity({
        id: 2,
        milestoneId
      }),
      status: activityStatus.COMPLETED,
      transactionHash: ethServicesMock.validateActivity()
    }
  ];

  const mockActivitiesIncompleted = [
    {
      ...testHelper.buildActivity({ id: 1 }),
      status: activityStatus.PENDING,
      transactionHash: ethServicesMock.validateActivity()
    },
    {
      ...testHelper.buildActivity({ id: 2 }),
      status: activityStatus.COMPLETED
    }
  ];

  beforeAll(() => {
    milestoneDao = {
      async getMilestoneActivities(milestone) {
        if (!milestone) {
          throw Error('DB Error');
        }

        const activities =
          milestone === milestoneId
            ? mockActivitiesCompleted
            : mockActivitiesIncompleted;

        const mockMilestoneWithActivities = {
          ...mockMilestone,
          activities
        };
        return mockMilestoneWithActivities;
      },

      async updateMilestoneStatus(id, status) {
        if (!id) {
          throw Error('DB Error');
        }

        if (id !== milestoneId) {
          return undefined;
        }

        return { ...mockMilestone, status };
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });
  });

  it('should return the updated milestone with status = COMPLETE', async () => {
    const response = await milestoneService.tryCompleteMilestone(milestoneId);
    const expected = { ...mockMilestone, status: activityStatus.COMPLETED };
    return expect(response).toEqual(expected);
  });

  it('should return false if an activity is not completed or confirmed', async () => {
    const response = await milestoneService.tryCompleteMilestone(1);
    return expect(response).toBe(false);
  });
});

describe.skip('Testing milestoneService updateBudgetStatus', () => {
  let milestoneDao;
  let milestoneService;

  const claimableMilestoneId = milestoneBudgetStatus.CLAIMABLE;
  const claimedMilestoneId = milestoneBudgetStatus.CLAIMED;
  const fundedMilestoneId = milestoneBudgetStatus.FUNDED;
  const blockedMilestoneId = milestoneBudgetStatus.BLOCKED;

  const user = testHelper.buildUserSe();

  const mockMilestone = budgetStatus => ({
    ...testHelper.buildMilestone(0, {
      id: budgetStatus,
      projectId: budgetStatus
    }),
    budgetStatus
  });

  beforeAll(() => {
    milestoneDao = {
      async getMilestoneByIdWithProject(id) {
        if (
          id !== claimableMilestoneId &&
          id !== claimedMilestoneId &&
          id !== fundedMilestoneId &&
          id !== blockedMilestoneId
        ) {
          return undefined;
        }

        return {
          ...mockMilestone(id),
          project: testHelper.buildProject(1, 1, {
            id: 1,
            status: projectStatus.IN_PROGRESS
          })
        };
      }
    };

    milestoneService = require('../rest/services/milestoneService');
    injectMocks(milestoneService, {
      milestoneDao
    });

    milestoneService.getMilestonesByProject = id => {
      switch (id) {
        case claimableMilestoneId:
          return [
            { ...mockMilestone(milestoneBudgetStatus.FUNDED) },
            { ...mockMilestone(id) },
            { ...mockMilestone(milestoneBudgetStatus.BLOCKED) }
          ];
        case claimedMilestoneId:
          return [
            { ...mockMilestone(milestoneBudgetStatus.FUNDED) },
            { ...mockMilestone(id) },
            { ...mockMilestone(milestoneBudgetStatus.BLOCKED) }
          ];
        case fundedMilestoneId:
          return [
            { ...mockMilestone(milestoneBudgetStatus.FUNDED) },
            { ...mockMilestone(id) },
            { ...mockMilestone(milestoneBudgetStatus.CLAIMABLE) }
          ];
        case blockedMilestoneId:
          return [
            { ...mockMilestone(milestoneBudgetStatus.CLAIMABLE) },
            { ...mockMilestone(id) },
            { ...mockMilestone(milestoneBudgetStatus.BLOCKED) }
          ];
        default:
          return undefined;
      }
    };
  });

  beforeEach(() => {
    fastify.eth.claimMilestone = jest.fn(() =>
      ethServicesMock.claimMilestone()
    );
    fastify.eth.setMilestoneFunded = jest.fn(() =>
      ethServicesMock.setMilestoneFunded()
    );
  });

  it.skip('should call claimMilestone if the new status is CLAIMED', async () => {
    await milestoneService.updateBudgetStatus(
      claimableMilestoneId,
      milestoneBudgetStatus.CLAIMED,
      user
    );

    await expect(fastify.eth.claimMilestone).toBeCalled();
    return expect(fastify.eth.setMilestoneFunded).not.toBeCalled();
  });

  it.skip('should call setMilestoneFunded if the new status is FUNDED', async () => {
    await milestoneService.updateBudgetStatus(
      claimedMilestoneId,
      milestoneBudgetStatus.FUNDED,
      user
    );

    await expect(fastify.eth.setMilestoneFunded).toBeCalled();
    return expect(fastify.eth.claimMilestone).not.toBeCalled();
  });

  it.skip('should return an error if the milestone could not be found', async () => {
    const response = await milestoneService.updateBudgetStatus(
      0,
      milestoneBudgetStatus.CLAIMED,
      user
    );

    const expected = {
      status: 404,
      error: 'Milestone does not exist'
    };

    return expect(response).toEqual(expected);
  });

  it.skip('should return an error if the budget status is not valid', async () => {
    const response = await milestoneService.updateBudgetStatus(
      claimableMilestoneId,
      0,
      user
    );

    const expected = {
      status: 404,
      error: 'Budget transfer status is not valid'
    };

    return expect(response).toEqual(expected);
  });

  it.skip(
    'should return an error if the milestone cannot be set to CLAIMABLE ' +
      'because it is not BLOCKED',
    async () => {
      const response = await milestoneService.updateBudgetStatus(
        claimableMilestoneId,
        milestoneBudgetStatus.CLAIMABLE,
        user
      );

      const expected = {
        status: 409,
        error:
          'All previous milestones need to be funded before making this milestone claimable.'
      };

      return expect(response).toEqual(expected);
    }
  );

  it.skip('should return an error if the milestone cannot be set to CLAIMED', async () => {
    const response = await milestoneService.updateBudgetStatus(
      blockedMilestoneId,
      milestoneBudgetStatus.CLAIMED,
      user
    );

    const expected = {
      status: 409,
      error: 'Only claimable milestones can be claimed'
    };

    return expect(response).toEqual(expected);
  });

  it.skip('should return an error if the milestone cannot be set to FUNDED', async () => {
    const response = await milestoneService.updateBudgetStatus(
      blockedMilestoneId,
      milestoneBudgetStatus.FUNDED,
      user
    );

    const expected = {
      status: 409,
      error:
        'The milestone needs to be Claimed in order to set the budget status to Funded'
    };

    return expect(response).toEqual(expected);
  });
});
