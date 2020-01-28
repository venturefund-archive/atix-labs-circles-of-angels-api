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
    }
    return true;
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

  async fromConsensus() {
    // TODO add validations for funding case
    // - At least one oracle and one supporter assigned to each milestone/activity
    // - Time of consensus has finished

    // TODO add validations for rejected case
    // - Project doesn't reach specifications and the time has finished
    throw new COAError(errors.project.ChangingStatus);
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
