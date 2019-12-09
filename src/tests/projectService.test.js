const errors = require('../rest/errors/exporter/ErrorExporter');
const COAError = require('../rest/errors/COAError');
const files = require('../rest/util/files');

const userDao = {
  findById: id => {
    if (id === 2) {
      return { id: 2 };
    }
    return undefined;
  }
};

const projectService = require('../rest/services/projectService');

const projectName = 'validProjectName';
const countryOfImpact = 'Argentina';
const timeframe = '12';
const goalAmount = 124123;
const mission = 'mission';
const problemAddressed = 'the problem';
const coverPhotoPath = 'detail.jpeg';
const proposal = 'proposal';
const ownerId = 2;
const file = { name: 'project.jpeg', size: 1234 };
const milestoneFile = { name: 'project.xlsx', size: 1234 };
const milestone = { id: 2, tasks: [{ id: 1 }, { id: 2 }, { id: 3 }] };

const pendingProject = {
  id: 3,
  projectName,
  countryOfImpact,
  timeframe,
  goalAmount,
  ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: 'pending',
  milestones: [milestone],
  milestonePath: 'milestonePath'
};
const draftProjectWithMilestone = {
  id: 10,
  projectName,
  countryOfImpact,
  timeframe,
  goalAmount,
  ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: 'draft',
  milestones: [milestone],
  milestonePath: 'milestonePath'
};
const draftProject = {
  id: 1,
  projectName,
  countryOfImpact,
  timeframe,
  goalAmount,
  ownerId,
  cardPhotoPath: 'cardPhotoPath',
  coverPhotoPath,
  problemAddressed,
  proposal,
  mission,
  status: 'draft'
};

const userDao = {
  findById: id => {
    if (id === 2) {
      return {
        id: 1
      };
    }
    return undefined;
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
    return undefined;
  }
};

const milestoneDao = {
  findById: id => {
    if (id === 2) {
      return milestone;
    }
    return undefined;
  },
  getMilestoneByProjectId: projectId => {
    if (projectId === 3) {
      return [milestone];
    }
    return undefined;
  }
};

const milestoneService = {
  createMilestones: (milestonePath, projectId) => {
    if (projectId === 1) {
      return [milestone];
    }
  }
};

describe('Project Service Test', () => {
  beforeAll(() => {
    files.saveFile = jest.fn();
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
      ).rejects.toThrow(COAError);
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

  describe('Update milestone', () => {
    beforeAll(() => {
      const milestoneDao = {
        updateMilestone: (fields, milestoneId) => {
          if (milestoneId === 1) {
            return { id: 1 };
          }
          return undefined;
        }
      };
      injectMocks(projectService, { milestoneDao });
    });
    it('When an update is done, it should return the id of the updated milestone', async () => {
      const projectUpdated = await projectService.updateMilestone(1, {
        field: 'field1',
        field2: 'field2'
      });
      expect(
        projectService.updateMilestone(1, {
          field: 'field1',
          field2: 'field2'
        })
      ).resolves.not.toThrow(COAError);
      expect(projectUpdated).toEqual(1);
    });
    it('Whenever there is no update, an error should be thrown', () => {
      expect(
        projectService.updateMilestone(3, {
          field: 'field1',
          field2: 'field2'
        })
      ).rejects.toThrow(COAError);
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
      ).rejects.toThrow(COAError);
    });
  });

  describe('Project thumbnail', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao, userDao });
    });

    describe('Create project thumbnail', () => {
      it('Should create a new project when all the fields are valid', async () => {
        const { projectId } = await projectService.createProjectThumbnail({
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not create a project when some field is missing and throw an error', async () => {
        expect(
          projectService.createProjectThumbnail({
            projectName,
            countryOfImpact,
            timeframe,
            ownerId
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not create a project when the fileType is not valid and throw an error', async () => {
        expect(
          projectService.createProjectThumbnail({
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId,
            file: { name: 'invalidFile.json' }
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not create a project when the owner does not exist and throw an error', async () => {
        expect(
          projectService.createProjectThumbnail({
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId: 34,
            file
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not create a project when the file is too big and throw an error', async () => {
        expect(
          projectService.createProjectThumbnail({
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId: 34,
            file: { name: 'project.jpeg', size: 123455555 }
          })
        ).rejects.toThrow(COAError);
      });
    });

    describe('Update project thumbnail', () => {
      it('Should update the project whenever the fields are valid and the project already exists', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          countryOfImpact,
          timeframe,
          goalAmount,
          ownerId,
          file
        });
        expect(projectId).toEqual(1);
      });

      it('Should not update the project whenever some fields are missing (not file since it is an optional field) and throw an error', () => {
        expect(
          projectService.updateProjectThumbnail(1, {
            projectName,
            countryOfImpact,
            timeframe,
            file
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not update the project whenever the fields are valid but the project does not exist and throw an error', () => {
        expect(
          projectService.updateProjectThumbnail(2, {
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId,
            file
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not update the project whenever the photo has an invalid file type and throw an error', () => {
        expect(
          projectService.updateProjectThumbnail(2, {
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId,
            file: { fileName: 'file.json', size: 1234 }
          })
        ).rejects.toThrow(COAError);
      });

      it('Should not update the project whenever the photo has an invalid size and throw an error', () => {
        expect(
          projectService.updateProjectThumbnail(2, {
            projectName,
            countryOfImpact,
            timeframe,
            goalAmount,
            ownerId,
            file: { fileName: 'file.jpeg', size: 90000000 }
          })
        ).rejects.toThrow(COAError);
      });

      it('Should update the project although file field is missing', async () => {
        const { projectId } = await projectService.updateProjectThumbnail(1, {
          projectName,
          countryOfImpact,
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
        expect(response.countryOfImpact).toEqual('Argentina');
        expect(response.timeframe).toEqual('12');
        expect(response.goalAmount).toEqual(124123);
        expect(response.imgPath).toEqual('cardPhotoPath');
      });
      it('Should throw an error when the project does not exist', () => {
        expect(projectService.getProjectThumbnail(4)).rejects.toThrow(COAError);
      });
    });
  });

  describe('Project detail', () => {
    beforeAll(() => {
      injectMocks(projectService, { projectDao, userDao });
    });
    describe('Create project detail', () => {
      it('Should create project detail when there is an existent project created and all the needed fields are present', async () => {
        const { projectId } = await projectService.createProjectDetail(1, {
          projectMission: mission,
          theProblem: problemAddressed,
          ownerId: 2,
          file
        });
        expect(projectId).toEqual(1);
      });
      it('Should not create project detail when there are not all the needed fields, and throw an error', () => {
        expect(
          projectService.createProjectDetail(1, { projectMission: mission })
        ).rejects.toThrow(COAError);
      });
      it('Should not create project detail when the owner does not exist, and throw an error', () => {
        expect(
          projectService.createProjectDetail(1, {
            projectMission: mission,
            theProblem: problemAddressed,
            ownerId: 3,
            file
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not create project detail when there is not an existent project created, and throw an error', () => {
        expect(
          projectService.createProjectDetail(2, {
            projectMission: mission,
            theProblem: problemAddressed,
            ownerId: 2,
            file
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not create project detail when the file type is not a valid, and throw an error', () => {
        expect(
          projectService.createProjectDetail(2, {
            projectMission: mission,
            theProblem: problemAddressed,
            ownerId: 2,
            file: { name: 'hi.json' }
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not create project detail when the file size is bigger than allowed, and throw an error', () => {
        expect(
          projectService.createProjectDetail(2, {
            projectMission: mission,
            theProblem: problemAddressed,
            ownerId: 2,
            file: { name: 'hi.jpeg', size: 12319023 }
          })
        ).rejects.toThrow(COAError);
      });
    });

    describe('Update project detail', () => {
      it('Should update the project if it exists and have all the fields and there are valids', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          projectMission: mission,
          theProblem: problemAddressed,
          file,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should update the project if it exists and have all the fields valids and file field is missing ', async () => {
        const { projectId } = await projectService.updateProjectDetail(1, {
          projectMission: mission,
          theProblem: problemAddressed,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should not update the project if it does not exists, and throw an error', () => {
        expect(
          projectService.updateProjectDetail(2, {
            projectMission: mission,
            theProblem: problemAddressed,
            file,
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project if it exists but some needed fields are missing and throw an error', () => {
        expect(
          projectService.updateProjectDetail(1, {
            projectMission: mission,
            file,
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project if it exists and have all valid fields but file size is bigger than allowed', () => {
        expect(
          projectService.updateProjectDetail(1, {
            projectMission: mission,
            theProblem: problemAddressed,
            file: { name: 'hi.jpeg', size: 1231232 },
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project if it exists and have all valid fields but file type is not a valid one', () => {
        expect(
          projectService.updateProjectDetail(1, {
            projectMission: mission,
            theProblem: problemAddressed,
            file: { name: 'hi.json', size: 4123 },
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project if owner does not exist', () => {
        expect(
          projectService.updateProjectDetail(1, {
            projectMission: mission,
            theProblem: problemAddressed,
            file: { name: 'hi.jpeg', size: 3123 },
            ownerId: 3
          })
        ).rejects.toThrow(COAError);
      });
    });

    describe('Get project detail', () => {
      it('Should return the project detail when the project exists', async () => {
        const response = await projectService.getProjectDetail(1);
        expect(response.mission).toEqual('mission');
        expect(response.problemAddressed).toEqual('the problem');
        expect(response.imgPath).toEqual('detail.jpeg');
      });
      it('Should throw an error when the project does not exist', () => {
        expect(projectService.getProjectDetail(4)).rejects.toThrow(COAError);
      });
    });
  });

  describe('Project proposal', () => {
    describe('Create project proposal', () => {
      it('Should create the project proposal on an existent project when all fields are valid', async () => {
        const { projectId } = await projectService.createProjectProposal(1, {
          ownerId: 2,
          projectProposal: proposal
        });
        expect(projectId).toEqual(1);
      });
      it('Should not create the project proposal when the project does not exist, and throw an error', () => {
        expect(
          projectService.createProjectProposal(2, {
            ownerId: 2,
            projectProposal: proposal
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not create the project proposal when the project exists but proposal is missing and throw an error', () => {
        expect(
          projectService.createProjectProposal(1, {
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not create the project proposal when the project exists but owner does not exist and throw an error', () => {
        expect(
          projectService.createProjectProposal(2, {
            ownerId: 3,
            projectProposal: proposal
          })
        ).rejects.toThrow(COAError);
      });
    });
    describe('Update project proposal', () => {
      it('Should update the project when the project exists and all the fields are valid', async () => {
        const { projectId } = await projectService.updateProjectProposal(1, {
          projectProposal: proposal,
          ownerId: 2
        });
        expect(projectId).toEqual(1);
      });
      it('Should not update the project when it does not exist and throw an error', () => {
        expect(
          projectService.updateProjectProposal(2, {
            projectProposal: proposal,
            ownerId: 2
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project when the project exists but proposal is missing and throw an error', () => {
        expect(
          projectService.updateProjectProposal(1, { ownerId: 2 })
        ).rejects.toThrow(COAError);
      });
      it('Should not update the project when the project exists, all fields are valid but owner does not exist and throw an error', () => {
        expect(
          projectService.updateProjectProposal(1, {
            projectProposal: proposal,
            ownerId: 3
          })
        ).rejects.toThrow(COAError);
      });
    });

    describe('Get project proposal', () => {
      it('Should return project proposal when the project exists', async () => {
        const response = await projectService.getProjectProposal(1);
        expect(response.proposal).toEqual('proposal');
      });
      it('Should throw an error when the project does not exist, and throw an error', () => {
        expect(projectService.getProjectProposal(2)).rejects.toThrow(COAError);
      });
    });
  });

  describe('Publish project', () => {
    it('Should publish project if it exists and its state is draft', async () => {
      const { projectId } = await projectService.publishProject(1);
      expect(projectId).toEqual(1);
    });
    it('Should not publish project if it does not exist, and throw an error', () => {
      expect(projectService.publishProject(2)).rejects.toThrow(COAError);
    });
    it('Should not publish project if it exist but is already published, and throw an error', () => {
      expect(projectService.publishProject(3)).rejects.toThrow(COAError);
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
      injectMocks(projectService, { milestoneDao, projectDao, userDao });
    });
    describe('Delete milestone of project', () => {
      it('Should delete milestone of project if project exists and milestone belongs to project', async () => {
        const { projectId } = await projectService.deleteMilestoneOfProject(
          3,
          2
        );
        expect(projectId).toEqual(3);
      });
      it('Should not delete milestone of project if project does not exist, and throw an error', () => {
        expect(projectService.deleteMilestoneOfProject(2, 2)).rejects.toThrow(
          COAError
        );
      });
      it('Should not delete milestone of project if project exists and milestone does not belongs to project, and throw an error', () => {
        expect(projectService.deleteMilestoneOfProject(3, 5)).rejects.toThrow(
          COAError
        );
      });
    });

    describe('Filter milestones', () => {
      it('Should filter milestone with id = milestoneId from milestones array', () => {
        const milestones = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const milestonesFiltered = projectService.filterMilestones(
          milestones,
          2
        );
        expect(milestonesFiltered[0]).toEqual({ id: 1 });
        expect(milestonesFiltered[1]).toEqual({ id: 3 });
      });
    });

    describe('Edit task of milestone', () => {}); // TODO

    describe('Delete task of milestone', () => {
      // TODO
      it('Should delete task of milestone if milestone exists and task belongs to milestone', () => {});
      it('Should not delete task of milestone if milestone does not exist, and throw an error', () => {});
      it('Should not delete task of milestone if milestone exists but task does not belongs to milestone, and throw an error', () => {});
    });

    describe('Upload milestone file', () => {
      it('Should add milestone file to an existent project', async () => {
        const { projectId } = await projectService.uploadMilestoneFile(
          1,
          milestoneFile
        );
        expect(projectId).toEqual(1);
      });
      it('Should not add milestone file to a non-existent project, and throw an error', () => {
        expect(
          projectService.uploadMilestoneFile(5, milestoneFile)
        ).rejects.toThrow(COAError);
      });
      it('Should not add milestone file to an existent project with a milestone file already uploaded, and throw an error', () => {
        expect(
          projectService.uploadMilestoneFile(3, milestoneFile)
        ).rejects.toThrow(COAError);
      });
      it('Should not add milestone file to an existent project if file has not a valid type, and throw an error', () => {
        expect(projectService.uploadMilestoneFile(3, file)).rejects.toThrow(
          COAError
        );
      });
      it('Should not add milestone file to an existent project if file has not a valid size, and throw an error', () => {
        expect(
          projectService.uploadMilestoneFile(3, {
            name: 'name.xslx',
            size: 1982319823
          })
        ).rejects.toThrow(COAError);
      });
      it('Should not add milestone file to an existent project if file field is missing, and throw an error', () => {
        expect(projectService.uploadMilestoneFile(3)).rejects.toThrow(COAError);
      });
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
        const { projectId } = await projectService.processMilestoneFile(1);
        expect(projectId).toEqual(1);
      });
      it('Should not create milestones and activities to a non-existent project, and throw an error', () => {
        expect(projectService.processMilestoneFile(2)).rejects.toThrow(
          COAError
        );
      });
      it('Should not create milestones and activities to an existent project with status different than draft', () => {
        expect(projectService.processMilestoneFile(3)).rejects.toThrow(
          COAError
        );
      });
    });

    describe('Get project milestones', () => {
      beforeAll(() => {
        injectMocks(projectService, { milestoneDao, projectDao, userDao });
      });

      it('Should return project milestones of an existent project', async () => {
        const milestones = await projectService.getProjectMilestones(3);
        expect(milestones).toHaveLength(1);
        expect(milestones[0].id).toEqual(2);
      });
      it('Should not return project milestones of a non-existent project, and throw an error', () => {
        expect(projectService.getProjectMilestones(4)).rejects.toThrow(
          COAError
        );
      });
    });
  });
  // TODO whenever mail is answered describe('Project milestone activities', () => {});
});
