const COAError = require('../rest/errors/COAError');
const files = require('../rest/util/files');
const {
  userRoles,
  projectStatuses,
  txFunderStatus
} = require('../rest/util/constants');
const errors = require('../rest/errors/exporter/ErrorExporter');
const validators = require('../rest/services/helpers/projectStatusValidators/validators');

const { injectMocks } = require('../rest/util/injection');

const projectService = require('../rest/services/projectService');

const sha3 = (a, b, c) => `${a}-${b}-${c}`;
const projectName = 'validProjectName';
const location = 'Argentina';
const timeframe = '12';
const goalAmount = 124123;
const mission = 'mission';
const problemAddressed = 'the problem';
const coverPhotoPath = 'detail.jpeg';
const proposal = 'proposal';
const ownerId = 2;
const file = { name: 'project.jpeg', size: 1234 };
const milestoneFile = { name: 'project.xlsx', size: 1234 };
const milestone = {
  id: 2,
  description: 'Milestone description',
  tasks: [
    {
      id: 1,
      oracle: '0x11111111',
      description: 'Task 1 Description',
      reviewCriteria: 'Task 1 Review',
      category: 'Task 1 Category',
      keyPersonnel: 'Task 1 KeyPersonnel',
      budget: 3500
    },
    {
      id: 2,
      oracle: '0x22222222',
      description: 'Task 2 Description',
      reviewCriteria: 'Task 2 Review',
      category: 'Task 2 Category',
      keyPersonnel: 'Task 2 KeyPersonnel',
      budget: 1000
    },
    {
      id: 3,
      oracle: '0x33333333',
      description: 'Task 3 Description',
      reviewCriteria: 'Task 3 Review',
      category: 'Task 3 Category',
      keyPersonnel: 'Task 3 KeyPersonnel',
      budget: 500
    }
  ]
};

const entrepreneurUser = {
  id: 2,
  firstName: 'Social',
  lastName: 'Entrepreneur',
  role: userRoles.ENTREPRENEUR,
  email: 'seuser@email.com',
  address: '0x02222222'
};

const anotherSupporterUser = {
  id: 3,
  firstName: 'Project',
  lastName: 'Supporter',
  role: userRoles.PROJECT_SUPPORTER,
  email: 'suppuser@email.com',
  address: '0x03333333'
};

const pendingProject = {
  id: 3,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.TO_REVIEW,
  milestones: [milestone],
  milestonePath: 'milestonePath'
};
const draftProjectWithMilestone = {
  id: 10,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.NEW,
  milestones: [milestone],
  milestonePath: 'milestonePath'
};
const draftProject = {
  id: 1,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.NEW
};
const executingProject = {
  id: 15,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'path/to/cardPhoto.jpg',
  coverPhotoPath: 'path/to/coverPhoto.jpg',
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.EXECUTING,
  milestones: [milestone],
  milestonePath: 'path/to/milestone.xls'
};

const supporterUser = {
  id: 5,
  firstName: 'Supporter',
  lastName: 'User',
  role: userRoles.PROJECT_SUPPORTER,
  email: 'suppuser@email.com',
  address: '0x05555555'
};

const verifiedTransfers = [
  {
    id: 1,
    sender: supporterUser,
    status: txFunderStatus.VERIFIED
  }
];

const consensusProject = {
  id: 4,
  projectName,
  location,
  timeframe,
  goalAmount,
  owner: ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: projectStatuses.CONSENSUS
};

const userService = {
  getUserById: id => {
    if (id === 2 || id === 3) {
      return {
        id,
        role: userRoles.ENTREPRENEUR
      };
    }
    throw new COAError(errors.common.CantFindModelWithId('user', id));
  }
};

const projectDao = {
  saveProject: project => {
    if (project.projectName === 'validProjectName') {
      return {
        id: 1
      };
    }
    return undefined;
  },
  updateProject: (fields, projectId) => {
    if (projectId === 1 || projectId === 3) {
      return {
        projectName: 'projectUpdateado',
        ...fields,
        id: projectId
      };
    }
    return undefined;
  },
  findById: id => {
    if (id === 1) {
      return draftProject;
    }
    if (id === 3) {
      return pendingProject;
    }
    if (id === 10) {
      return draftProjectWithMilestone;
    }
    if (id === 15) {
      return executingProject;
    }
    return undefined;
  },
  findOneByProps: (filters, populate) => {
    if (filters && filters.id === 15) {
      if (populate && populate.owner) {
        return {
          ...executingProject,
          owner: entrepreneurUser,
          milestones: undefined
        };
      }
      return { ...executingProject, milestones: undefined };
    }
    if (filters && filters.id === 4) {
      if (populate && populate.owner) {
        return {
          ...consensusProject,
          owner: entrepreneurUser
        };
      }
      return { ...consensusProject };
    }
    return undefined;
  },
  findProjectWithUsersById: projectId => {
    if (projectId === 4) {
      return {
        ...consensusProject,
        owner: entrepreneurUser,
        followers: [supporterUser],
        funders: [supporterUser],
        oracles: [supporterUser, supporterUser]
      };
    }
    return undefined;
  }
};

const milestoneDao = {
  findById: id => {
    if (id === 2) {
      return milestone;
    }
    return undefined;
  }
};

const milestoneService = {
  createMilestones: (milestonePath, projectId) => {
    if (projectId === 1) {
      return [milestone];
    }
  },
  getAllMilestonesByProject: projectId => {
    if (projectId === 3 || projectId === 15) {
      return [milestone];
    }
    return undefined;
  }
};

const transferService = {
  getAllTransfersByProps: props => {
    const { filters } = props || {};
    if (filters && filters.project === 15) {
      return verifiedTransfers;
    }
  }
};

describe('Project Service Test', () => {
  beforeAll(() => {
    files.saveFile = jest.fn();
    // mock all validators
    Object.keys(validators).forEach(validator => {
      validators[validator] = jest.fn();
    });
  });

  describe('Update project', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao });
    });

    it('Whenever there is no update, an error should be thrown', async () => {
      expect(
        projectService.updateProject(3, {
          field: 'field1',
          field2: 'field2'
        })
      ).rejects.toThrow(errors.project.CantUpdateProject(3));
    });
    it('When an update is done, it should return the id of the updated project', async () => {
      const projectUpdated = await projectService.updateProject(1, {
        field: 'field1',
        field2: 'field2'
      });
      expect(
        projectService.updateProject(1, {
          field: 'field1',
          field2: 'field2'
        })
      ).resolves.not.toThrow(COAError);
      expect(projectUpdated).toEqual(1);
    });
  });

  describe('Save project', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao });
    });

    it('Whenever a project is saved, it should return the id of the project', async () => {
      const id = await projectService.saveProject({
        projectName: 'validProjectName'
      });
      expect(id).toEqual(1);
    });

    it('Whenever an error occurs and the project cant be saved, an error should be thrown', () => {
      expect(
        projectService.saveProject({ projectName: 'invalidProject' })
      ).rejects.toThrow(errors.project.CantSaveProject);
    });
  });

  describe('Project thumbnail', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao, userService });
    });

    describe('Create project thumbnail', () => {
      it('Should create a new project when all the fields are valid', async () => {
        const { projectId } = await projectService.createProjectThumbnail({
          projectName,
          location,
          timeframe,
          goalAmount,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not create a project when some field is missing and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            ownerId
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('createProjectThumbnail')
        );
      });

      it('Should not create a project when the fileType is not valid and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId,
            file: { name: 'invalidFile.json' }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not create a project when the owner does not exist and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId: 34,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });

      it('Should not create a project when the file is too big and throw an error', async () => {
        await expect(
          projectService.createProjectThumbnail({
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId,
            file: { name: 'project.jpeg', size: 123455555 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });

    describe('Update project thumbnail', () => {
      it('Should update the project whenever the fields are valid and the project already exists', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          location,
          timeframe,
          goalAmount,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not update the project whenever the fields are valid but the project does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(2, {
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });

      it('Should not update the project whenever the fields are valid and the project does exist but user is not owner of the project, and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId: 3,
            file
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });

      it('Should not update the project whenever the photo has an invalid file type and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId,
            file: { name: 'file.json', size: 1234 }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });

      it('Should not update the project whenever the photo has an invalid size and throw an error', async () => {
        await expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            location,
            timeframe,
            goalAmount,
            ownerId,
            file: { name: 'file.jpeg', size: 90000000 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });

      it('Should update the project although file field is missing', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          location,
          timeframe,
          goalAmount,
          ownerId
        });
        expect(projectId).toEqual(1);
      });
    });

    describe('Get project thumbnail', () => {
      it('Should return the project thumbnail when the project exists', async () => {
        const response = await projectService.getProjectThumbnail(1);
        expect(response.projectName).toEqual('validProjectName');
        expect(response.location).toEqual('Argentina');
        expect(response.timeframe).toEqual('12');
        expect(response.goalAmount).toEqual(124123);
        expect(response.imgPath).toEqual('cardPhotoPath');
      });
      it('Should throw an error when the project does not exist', async () => {
        await expect(projectService.getProjectThumbnail(4)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 4)
        );
      });
    });
  });

  describe('Project detail', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao, userService });
    });
    describe('Create project detail', () => {
      it('Should create project detail when there is an existent project created and all the needed fields are present', async () => {
        const { projectId } = await projectService.createProjectDetail(1, {
          mission,
          problemAddressed,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });
      it('Should not create project detail when there are not all the needed fields, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, { mission })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('createProjectDetail')
        );
      });
      it('Should not create project detail when the owner does not exist, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId: 34,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });
      it('Should not create project detail when the user is not the owner of the project, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId: 3,
            file
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
      it('Should not create project detail when there is not an existent project created, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(2, {
            mission,
            problemAddressed,
            ownerId: 2,
            file
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });
      it('Should not create project detail when the file type is not a valid, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId,
            file: { name: 'hi.json' }
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });
      it('Should not create project detail when the file size is bigger than allowed, and throw an error', async () => {
        await expect(
          projectService.createProjectDetail(1, {
            mission,
            problemAddressed,
            ownerId,
            file: { name: 'hi.jpeg', size: 12319023 }
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
    });

    describe('Update project detail', () => {
      it('Should update the project if it exists and have all the fields and there are valids', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          mission,
          problemAddressed,
          file,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should update the project if it exists and have all the fields valids and file field is missing ', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          mission,
          problemAddressed,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should not update the project if it does not exists, and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(2, {
            mission,
            problemAddressed,
            file,
            ownerId: 2
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });
      it('Should not update the project if it exists but some needed fields are missing and throw an error', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            file
          })
        ).rejects.toThrow(
          errors.common.RequiredParamsMissing('updateProjectDetail')
        );
      });
      it('Should not update the project if it exists and have all valid fields but file size is bigger than allowed', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            file: { name: 'hi.jpeg', size: 1231232 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
      });
      it('Should not update the project if it exists and have all valid fields but file type is not a valid one', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            file: { name: 'hi.json', size: 4123 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
      });
      it('Should not update the project if owner does not exist', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            file: { name: 'hi.jpeg', size: 3123 },
            ownerId: 34
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });
      it('Should not update the project if user is not owner', async () => {
        await expect(
          projectService.updateProjectDetail(1, {
            mission,
            problemAddressed,
            file: { name: 'hi.jpeg', size: 3123 },
            ownerId: 3
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
    });

    describe('Get project detail', () => {
      it('Should return the project detail when the project exists', async () => {
        const response = await projectService.getProjectDetail(1);
        expect(response.mission).toEqual('mission');
        expect(response.problemAddressed).toEqual('the problem');
        expect(response.imgPath).toEqual('detail.jpeg');
      });
      it('Should throw an error when the project does not exist', async () => {
        await expect(projectService.getProjectDetail(4)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 4)
        );
      });
    });
  });

  describe('Project proposal', () => {
    describe('Update project proposal', () => {
      it('Should update the project when the project exists and all the fields are valid', async () => {
        const { projectId } = await projectService.updateProjectProposal(1, {
          proposal,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should not update the project when it does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(2, {
            proposal,
            ownerId: 2
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });
      it('Should not update the project when the project exists but proposal is missing and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, { ownerId: 2 })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project when the project exists, all fields are valid but owner does not exist and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, {
            proposal,
            ownerId: 34
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('user', 34));
      });
      it('Should not update the project when user is not owner, and throw an error', async () => {
        await expect(
          projectService.updateProjectProposal(1, {
            proposal,
            ownerId: 3
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
    });

    describe('Get project proposal', () => {
      it('Should return project proposal when the project exists', async () => {
        const response = await projectService.getProjectProposal(1);
        expect(response.proposal).toEqual('proposal');
      });
      it('Should throw an error when the project does not exist, and throw an error', async () => {
        await expect(projectService.getProjectProposal(2)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 2)
        );
      });
    });
  });

  describe('Publish project', () => {
    it('Should publish project if it exists and its state is draft', async () => {
      const { projectId } = await projectService.publishProject(1, {
        ownerId: 2
      });
      expect(projectId).toEqual(1);
    });
    it('Should not publish project if it does not exist, and throw an error', () => {
      expect(
        projectService.publishProject(2, {
          ownerId: 2
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
    });
    it('Should not publish project if it exist but is already published, and throw an error', () => {
      expect(
        projectService.publishProject(3, {
          ownerId: 2
        })
      ).rejects.toThrow(errors.project.ProjectIsNotPublishable);
    });
    it('Should not publish project if it exist but user is not the owner of it, and throw an error', () => {
      expect(
        projectService.publishProject(3, {
          ownerId: 15
        })
      ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
    });
  });

  describe('Get projects', () => {
    beforeAll(() => {});
    it('Should return an empty list if no projects are published', () => {
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: () => []
        })
      });
      expect(projectService.getProjects()).resolves.toHaveLength(0);
    });
    it('Should return an array of projects if there is any project published', () => {
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: () => [pendingProject]
        })
      });
      expect(projectService.getProjects()).resolves.toHaveLength(1);
    });
  });

  describe('Project milestone', () => {
    beforeAll(() => {
      injectMocks(projectService, { milestoneDao, projectDao, userService });
    });

    describe('Process milestone file', () => {
      beforeAll(() => {
        injectMocks(projectService, {
          milestoneDao,
          projectDao,
          milestoneService
        });
      });
      it('Should create milestones and activities to an existent project without an already process file', async () => {
        const { projectId } = await projectService.processMilestoneFile(1, {
          file: milestoneFile,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should not create milestones and activities to a non-existent project, and throw an error', async () => {
        await expect(
          projectService.processMilestoneFile(2, {
            file: milestoneFile,
            ownerId: 2
          })
        ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
      });
      it('Should not create milestones and activities to an existent project with status different than new', async () => {
        await expect(
          projectService.processMilestoneFile(3, {
            file: milestoneFile,
            ownerId: 2
          })
        ).rejects.toThrow(errors.project.InvalidStatusForMilestoneFileProcess);
      });
      it('Should not create milestones and activities to an existent project whenever user is not the owner of it', async () => {
        await expect(
          projectService.processMilestoneFile(1, {
            file: milestoneFile,
            ownerId: 5
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
      it('Should not create milestones and activities to an existent project whenever the file type is not valid', async () => {
        await expect(
          projectService.processMilestoneFile(1, {
            file: { name: 'project.pdf', size: 1234 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.file.MilestoneFileTypeNotValid);
      });
      it('Should not create milestones and activities to an existent project if it already has a milestone file', async () => {
        await expect(
          projectService.processMilestoneFile(10, {
            file: { name: 'project.xls', size: 1234 },
            ownerId: 2
          })
        ).rejects.toThrow(errors.project.MilestoneFileHasBeenAlreadyUploaded);
      });
    });

    describe('Get project milestones', () => {
      beforeAll(() => {
        injectMocks(projectService, {
          milestoneService,
          projectDao,
          userService
        });
      });

      it('Should return project milestones of an existent project', async () => {
        const milestones = await projectService.getProjectMilestones(3);
        expect(milestones).toHaveLength(1);
        expect(milestones[0].id).toEqual(2);
      });
      it('Should not return project milestones of a non-existent project, and throw an error', () => {
        expect(projectService.getProjectMilestones(4)).rejects.toThrow(
          errors.common.CantFindModelWithId('project', 4)
        );
      });
    });
  });
  // TODO whenever mail is answered describe('Project milestone activities', () => {});

  describe('Get projects by owner', () => {
    beforeAll(() => {
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: filter => {
            const projects = [
              { id: 1, owner: 3 },
              { id: 2, owner: 2 },
              { id: 3, owner: 3 }
            ];
            return projects.filter(project =>
              Object.keys(filter).every(key => project[key] === filter[key])
            );
          }
        })
      });
    });

    it('should return an array of projects for the specified onwer', async () => {
      const response = await projectService.getProjectsByOwner(3);
      expect(response).toHaveLength(2);
    });

    it('should return an empty array of projects if none were found', async () => {
      const response = await projectService.getProjectsByOwner(0);
      expect(response).toHaveLength(0);
    });
  });

  describe('Get public projects', () => {
    let dbProject = [
      { id: 1, status: projectStatuses.EXECUTING },
      { id: 2, status: projectStatuses.NEW },
      { id: 3, status: projectStatuses.DELETED },
      { id: 3, status: projectStatuses.FINISHED }
    ];
    beforeAll(() => {
      injectMocks(projectService, {
        projectDao: Object.assign({}, projectDao, {
          findAllByProps: filter =>
            dbProject.filter(project =>
              Object.keys(filter).every(key => {
                if (filter[key].in) {
                  return filter[key].in.includes(project[key]);
                }
                return project[key] === filter[key];
              })
            )
        })
      });
    });

    it('should return an array of projects with public statuses', async () => {
      const response = await projectService.getPublicProjects();
      expect(response).toHaveLength(2);
    });

    it('should return an empty array if no public projects were found', async () => {
      dbProject = [
        { id: 2, status: projectStatuses.NEW },
        { id: 3, status: projectStatuses.DELETED }
      ];
      const response = await projectService.getPublicProjects();
      expect(response).toHaveLength(0);
    });
  });

  describe('Generate project agreement', () => {
    beforeAll(() => {
      injectMocks(projectService, {
        milestoneService,
        transferService,
        projectDao
      });
    });

    it('should return a stringified JSON with the project information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.name).toEqual(executingProject.projectName);
      expect(parsedResponse.mission).toEqual(executingProject.mission);
      expect(parsedResponse.problem).toEqual(executingProject.problemAddressed);
    });

    it('should return a stringified JSON with the milestones and tasks information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.milestones).toHaveLength(1);
      expect(parsedResponse.milestones[0].goal).toEqual(5000);
      expect(parsedResponse.milestones[0].tasks).toHaveLength(3);
      expect(parsedResponse.milestones[0].tasks[0].id).toEqual(
        sha3(executingProject.id, '0x11111111', 1)
      );
    });

    it('should return a stringified JSON with the funders information', async () => {
      const response = await projectService.generateProjectAgreement(
        executingProject.id
      );

      const parsedResponse = JSON.parse(response);
      expect(parsedResponse.funders).toHaveLength(1);
      expect(parsedResponse.funders[0].address).toEqual(supporterUser.address);
    });

    it(
      'should not return duplicated funders if there is ' +
        'more than one transfer sent by the same user',
      async () => {
        verifiedTransfers.push({
          id: 2,
          sender: supporterUser,
          status: txFunderStatus.VERIFIED
        });
        const response = await projectService.generateProjectAgreement(
          executingProject.id
        );
        const parsedResponse = JSON.parse(response);
        expect(parsedResponse.funders).toHaveLength(1);
      }
    );

    it('should throw an error if the project does not exist', async () => {
      await expect(projectService.generateProjectAgreement(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });

  describe('Get users related to a project', () => {
    beforeAll(() => {
      injectMocks(projectService, {
        projectDao
      });
    });
    it(
      'should return an object with the information ' +
        'of the users related to the project',
      async () => {
        const response = await projectService.getProjectUsers(
          consensusProject.id
        );
        expect(response.owner).toEqual(entrepreneurUser);
        expect(response.followers).toHaveLength(1);
        expect(response.funders).toHaveLength(1);
        expect(response.oracles).toHaveLength(2);
      }
    );

    it('should throw an error if the project does not exist', async () => {
      await expect(projectService.getProjectUsers(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });
  });

  describe('Update project status', () => {
    beforeAll(() => {
      injectMocks(projectService, {
        projectDao
      });
    });
    it('should update a project if the status transition is valid', async () => {
      const response = await projectService.updateProjectStatus(
        entrepreneurUser,
        draftProject.id,
        projectStatuses.TO_REVIEW
      );
      expect(response).toEqual({ projectId: draftProject.id });
    });
    it('should throw an error if required params are missing', async () => {
      await expect(
        projectService.updateProjectStatus(
          undefined,
          draftProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('updateProjectStatus')
      );
    });
    it('should throw an error if the project does not exist', async () => {
      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          0,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
    it('should throw an error if the status transition does not exist', async () => {
      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          pendingProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.project.InvalidProjectTransition);
    });
    it('should throw an error if the transition validator fails', async () => {
      validators.fromNew.mockImplementation(() => {
        throw new COAError(errors.project.IsNotCompleted);
      });

      await expect(
        projectService.updateProjectStatus(
          entrepreneurUser,
          draftProject.id,
          projectStatuses.TO_REVIEW
        )
      ).rejects.toThrow(errors.project.IsNotCompleted);
    });
  });

  describe('Get featured projects', () => {
    beforeAll(() => {
      injectMocks(projectService, {
        featuredProjectDao: Object.assign(
          {},
          {
            findAllByProps: () => {
              const projects = [
                { id: 1, project: pendingProject },
                { id: 2, project: executingProject },
                { id: 3, project: consensusProject }
              ];
              return projects;
            }
          }
        )
      });
    });

    it('should return a list of all featured projects', async () => {
      const response = await projectService.getFeaturedProjects();
      expect(response).toHaveLength(3);
      expect(response).toEqual([
        { ...pendingProject },
        { ...executingProject },
        { ...consensusProject }
      ]);
    });
  });
});
