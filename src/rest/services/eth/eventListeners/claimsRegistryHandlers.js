const logger = require('../../../logger');
const { claimMilestoneStatus } = require('../../../util/constants');
// TODO: see if we can inject this service
const milestoneService = require('../../milestoneService');

module.exports = {
  ClaimApproved: async (
    projectId,
    validator,
    claim,
    approved,
    proof,
    verifiedAt,
    milestoneIdHex
  ) => {
    logger.info(
      '[ClaimRegistry] :: Incoming event ClaimApproved - claim:',
      claim
    );
    const milestoneId = Number(milestoneIdHex);
    if (milestoneId === 0) {
      logger.info('[ClaimRegistry] :: Transfer fund claim created');
      return;
    }

    const milestoneCompleted = await milestoneService.isMilestoneCompleted(
      milestoneId
    );

    const milestone = await milestoneService.getMilestoneById(milestoneId);
    if (
      milestoneCompleted &&
      milestone.claimStatus === claimMilestoneStatus.TRANSFERRED
    ) {
      logger.info(
        `[ClaimRegistry] :: Milestone ${milestoneId} completed. Marking next as claimable`
      );
      await milestoneService.setNextAsClaimable(milestoneId);
    }
  }
};
