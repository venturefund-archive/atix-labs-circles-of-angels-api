const errors = require('../../../errors/exporter/ErrorExporter');
const COAError = require('../../../errors/COAError');
const validateOwnership = require('../validateOwnership');

const { projectStatuses, userRoles } = require('../../../util/constants');

const isOwner = (user, ownerId) => validateOwnership(ownerId, user.id);

const isCurator = user => {
  if (user.role !== userRoles.PROJECT_CURATOR)
    throw new COAError(errors.user.IsNotProjectCurator);
  return true;
};

module.exports = {
  async fromNew({ user, newStatus, project }) {
    isOwner(user, project.owner);
    if (newStatus === projectStatuses.TO_REVIEW) {
      // TODO: check what fields are mandatory to send to review
      const hasThumbnail =
        !!project.projectName &&
        !!project.timeframe &&
        !!project.location &&
        !!project.goalAmount;
      const hasDetails = !!project.problemAddressed && !!project.mission;
      const hasProposal = !!project.proposal;

      const projectMilestones = await this.projectService.getProjectMilestones(
        project.id
      );
      const hasMilestones = projectMilestones && projectMilestones.length > 0;

      const isCompleted =
        hasThumbnail && hasDetails && hasProposal && hasMilestones;
      if (!isCompleted) throw new COAError(errors.project.IsNotCompleted);
      return true;
    }
  },

  async fromToReview({ user }) {
    return isCurator(user);
  },
  async fromRejected({ user, project }) {
    return isOwner(user, project.owner);
  },

  async fromPublished() {
    // TODO add validation to check that time set already happen
    throw new COAError(errors.project.ChangingStatus);
  },

  async fromConsensus({ newStatus, project }) {
    if (newStatus === projectStatuses.FUNDING) {
      // The project has at least one defined Oracle for each milestone and activity
      const projectMilestones = await this.projectService.getProjectMilestones(
        project.id
      );
      if (!projectMilestones || !projectMilestones.length)
        throw new COAError(errors.project.MilestonesNotFound(project.id));

      const hasAllOraclesAssigned = projectMilestones
        .map(milestone =>
          milestone.tasks ? milestone.tasks.every(task => !!task.oracle) : false
        )
        .every(validation => !!validation);

      if (!hasAllOraclesAssigned)
        throw new COAError(errors.project.NotAllOraclesAssigned(project.id));

      // The project has at least one supporter interested in funding the project.
      const projectUsers = await this.projectService.getProjectUsers(
        project.id
      );
      if (
        !projectUsers ||
        !projectUsers.funders ||
        !projectUsers.funders.length
      )
        throw new COAError(errors.project.NoFunderCandidates(project.id));
      return true;
    }
  },

  async fromFunding() {
    // TODO add validation to check that time set already happen
    throw new COAError(errors.project.ChangingStatus);
  },

  async fromExecuting({ user, newStatus, project }) {
    if (
      newStatus === projectStatuses.ABORTED ||
      newStatus === projectStatuses.CHANGING_SCOPE
    ) {
      return isOwner(user, project.owner);
    }

    if (newStatus === projectStatuses.FINISHED) {
      // TODO check that project has each milestone in done
      throw new COAError(errors.project.ChangingStatus);
    }
  },

  async fromChangingScope({ user, project }) {
    return isOwner(user, project.owner);
  },

  async fromAborted() {
    // TODO add validation to check that time set already happen
    throw new COAError(errors.project.ChangingStatus);
  },

  async fromFinished() {
    // TODO add validation to check that time set already happen
    throw new COAError(errors.project.ChangingStatus);
  }
};
