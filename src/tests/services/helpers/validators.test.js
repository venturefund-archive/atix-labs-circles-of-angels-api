const errors = require('../../../rest/errors/exporter/ErrorExporter');
const validators = require('../../../rest/services/helpers/projectStatusValidators/validators');

const { projectStatuses, userRoles } = require('../../../rest/util/constants');
const { injectMocks } = require('../../../rest/util/injection');

let dbUsers = [];
let dbMilestones = [];
let dbProjects = [];

const resetDB = () => {
  dbUsers = [];
  dbMilestones = [];
  dbProjects = [];
};

const entrepreneurUser = {
  id: 2,
  firstName: 'Social',
  lastName: 'Entrepreneur',
  role: userRoles.ENTREPRENEUR,
  email: 'seuser@email.com',
  address: '0x02222222'
};

const newProject = {
  id: 1,
  projectName: 'New Project',
  location: 'Location',
  timeframe: '12 months',
  goalAmount: 5000,
  owner: entrepreneurUser.id,
  cardPhotoPath: 'cardPhotoPath.jpg',
  coverPhotoPath: 'coverPhotoPath.jpg',
  problemAddressed: 'Problem',
  proposal: 'Proposal',
  mission: 'Mission',
  status: projectStatuses.NEW
};

const newProjectMilestones = [
  { id: 1, project: newProject.id },
  { id: 2, project: newProject.id }
];

const projectService = {
  getProjectMilestones: id =>
    dbMilestones.filter(milestone => milestone.project === id)
};

describe('Testing project status validators', () => {
  describe('From NEW status', () => {
    beforeAll(() => {
      injectMocks(validators, {
        projectService
      });
    });
    describe('to TO REVIEW status', () => {
      beforeEach(() => {
        resetDB();
        dbProjects.push(newProject);
        dbUsers.push(entrepreneurUser);
        dbMilestones.push(...newProjectMilestones);
      });
      it('should resolve and return true if the project is completed', async () => {
        await expect(
          validators.fromNew({
            user: entrepreneurUser,
            newStatus: projectStatuses.TO_REVIEW,
            project: newProject
          })
        ).resolves.toBe(true);
      });
      it('should throw an error if the user is not the project owner', async () => {
        await expect(
          validators.fromNew({
            user: { ...entrepreneurUser, id: 0 },
            newStatus: projectStatuses.TO_REVIEW,
            project: newProject
          })
        ).rejects.toThrow(errors.user.UserIsNotOwnerOfProject);
      });
      it('should throw an error if the project thumbnail is not completed', async () => {
        await expect(
          validators.fromNew({
            user: entrepreneurUser,
            newStatus: projectStatuses.TO_REVIEW,
            project: { ...newProject, projectName: undefined }
          })
        ).rejects.toThrow(errors.project.IsNotCompleted);
      });
      it('should throw an error if the project detail is not completed', async () => {
        await expect(
          validators.fromNew({
            user: entrepreneurUser,
            newStatus: projectStatuses.TO_REVIEW,
            project: { ...newProject, problemAddressed: undefined }
          })
        ).rejects.toThrow(errors.project.IsNotCompleted);
      });
      it('should throw an error if the project does not have milestones', async () => {
        dbMilestones = [];
        await expect(
          validators.fromNew({
            user: entrepreneurUser,
            newStatus: projectStatuses.TO_REVIEW,
            project: newProject
          })
        ).rejects.toThrow(errors.project.IsNotCompleted);
      });
    });
  });

  test.todo('Test rest of status transitions when coded');
});
