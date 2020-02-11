const errors = require('../../../rest/errors/exporter/ErrorExporter');
const originalValidators = require('../../../rest/services/helpers/projectStatusValidators/validators');

const { projectStatuses, userRoles } = require('../../../rest/util/constants');
const { injectMocks } = require('../../../rest/util/injection');

let validators = Object.assign({}, originalValidators);
const restoreValidators = () => {
  validators = Object.assign({}, originalValidators);
};

const mockValidatorsDependencies = dependencies => {
  restoreValidators();
  injectMocks(validators, dependencies);
};

let dbUsers = [];
let dbMilestones = [];
let dbProjects = [];
let dbProjectFunders = [];

const resetDB = () => {
  dbUsers = [];
  dbMilestones = [];
  dbProjects = [];
  dbProjectFunders = [];
};

const curatorUser = {
  id: 1,
  firstName: 'Project',
  lastName: 'Curator',
  role: userRoles.PROJECT_CURATOR,
  email: 'curator@email.com',
  address: '0x01111111'
};

const entrepreneurUser = {
  id: 2,
  firstName: 'Social',
  lastName: 'Entrepreneur',
  role: userRoles.ENTREPRENEUR,
  email: 'seuser@email.com',
  address: '0x02222222'
};

const supporterUser = {
  id: 3,
  firstName: 'Project',
  lastName: 'Supporter',
  role: userRoles.PROJECT_SUPPORTER,
  email: 'supp@email.com',
  address: '0x03333333'
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

const toReviewProject = {
  id: 2,
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
  status: projectStatuses.TO_REVIEW
};

const consensusProject = {
  id: 3,
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
  status: projectStatuses.CONSENSUS
};

const newProjectMilestones = [
  { id: 1, project: newProject.id },
  { id: 2, project: newProject.id }
];

const taskWithOracle = {
  id: 1,
  oracle: 1
};

const consensusProjectMilestonesCompleted = [
  { id: 1, project: consensusProject.id, tasks: [taskWithOracle] },
  { id: 2, project: consensusProject.id, tasks: [taskWithOracle] }
];

const consensusProjectMilestonesIncomplete = [
  { id: 1, project: consensusProject.id, tasks: [taskWithOracle] },
  { id: 2, project: consensusProject.id, tasks: [{ id: 2, oracle: null }] }
];

const projectService = {
  getProjectMilestones: id =>
    dbMilestones.filter(milestone => milestone.project === id),
  getProjectUsers: id => ({
    funders: dbProjectFunders.filter(funder => funder.project === id),
    owner: dbProjects.find(project => project.id === id).owner,
    followers: [],
    oracles: []
  })
};

describe('Testing project status validators', () => {
  describe('From NEW status', () => {
    beforeAll(() =>
      mockValidatorsDependencies({
        projectService
      })
    );
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

  describe('From TO REVIEW status', () => {
    beforeAll(() =>
      mockValidatorsDependencies({
        projectService
      })
    );
    describe('to PUBLISHED or CONSENSUS status', () => {
      beforeEach(() => {
        resetDB();
        dbProjects.push(toReviewProject);
        dbUsers.push(curatorUser, entrepreneurUser);
      });
      it('should resolve and return true if the user is a curator', async () => {
        await expect(
          validators.fromToReview({
            user: curatorUser
          })
        ).resolves.toBe(true);
      });
      it('should resolve and return true if the user is not a curator', async () => {
        await expect(
          validators.fromToReview({
            user: entrepreneurUser
          })
        ).rejects.toThrow(errors.user.IsNotProjectCurator);
      });
    });
  });

  describe('From CONSENSUS status', () => {
    beforeAll(() =>
      mockValidatorsDependencies({
        projectService
      })
    );

    describe('to FUNDING status', () => {
      beforeEach(() => {
        resetDB();
        dbProjects.push(consensusProject);
        dbUsers.push(entrepreneurUser);
      });
      it(
        'should return true if the project has all oracles assigned ' +
          'and at least one candidate funder',
        async () => {
          dbMilestones.push(...consensusProjectMilestonesCompleted);
          dbProjectFunders.push({
            id: 1,
            user: supporterUser.id,
            project: consensusProject.id
          });
          await expect(
            validators.fromConsensus({
              newStatus: projectStatuses.FUNDING,
              project: consensusProject
            })
          ).resolves.toBe(true);
        }
      );

      it('should throw an error if no milestones were found for the project', async () => {
        await expect(
          validators.fromConsensus({
            newStatus: projectStatuses.FUNDING,
            project: consensusProject
          })
        ).rejects.toThrow(
          errors.project.MilestonesNotFound(consensusProject.id)
        );
      });

      it('should throw an error if any task has no assigned oracle', async () => {
        dbMilestones.push(...consensusProjectMilestonesIncomplete);
        await expect(
          validators.fromConsensus({
            newStatus: projectStatuses.FUNDING,
            project: consensusProject
          })
        ).rejects.toThrow(
          errors.project.NotAllOraclesAssigned(consensusProject.id)
        );
      });

      it('should throw an error if the project has no funder candidate', async () => {
        dbMilestones.push(...consensusProjectMilestonesCompleted);
        await expect(
          validators.fromConsensus({
            newStatus: projectStatuses.FUNDING,
            project: consensusProject
          })
        ).rejects.toThrow(
          errors.project.NoFunderCandidates(consensusProject.id)
        );
      });
    });
  });

  test.todo('Test rest of status transitions when coded');
});
