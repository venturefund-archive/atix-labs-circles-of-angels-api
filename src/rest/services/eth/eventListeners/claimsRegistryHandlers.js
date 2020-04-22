const logger = require('../../../logger');
const {
  claimMilestoneStatus,
  txFunderStatus,
  txEvidenceStatus
} = require('../../../util/constants');
// TODO: see if we can inject this service
const milestoneService = require('../../milestoneService');
const transferService = require('../../transferService');
const activityService = require('../../activityService');

module.exports = {
  ClaimApproved: async (
    claimId,
    projectId,
    validator,
    claim,
    approved,
    proof,
    verifiedAt,
    milestoneIdHex
  ) => {
    logger.info(
      '[ClaimsRegistry] :: Incoming event ClaimApproved - claim:',
      claim
    );
    const milestoneId = Number(milestoneIdHex);
    if (milestoneId === 0) {
      logger.info('[ClaimsRegistry] :: Transfer fund claim created');
      const status = approved
        ? txFunderStatus.VERIFIED
        : txFunderStatus.CANCELLED;
      await transferService.updateTransfer(claimId, {
        status
      });
      logger.info(
        `[ClaimsRegistry] :: Transfer ${claimId} status updated to ${status}`
      );
      return;
    }
    logger.info('[ClaimsRegistry] :: Evidence claim created');

    await activityService.updateEvidenceStatus(
      claimId,
      txEvidenceStatus.CONFIRMED
    );
    logger.info(
      `[ClaimsRegistry] :: Evidence ${claimId} status updated to ${
        txEvidenceStatus.CONFIRMED
      }`
    );

    const milestoneCompleted = await milestoneService.isMilestoneCompleted(
      milestoneId
    );

    const milestone = await milestoneService.getMilestoneById(milestoneId);
    if (
      milestoneCompleted &&
      milestone.claimStatus === claimMilestoneStatus.TRANSFERRED
    ) {
      logger.info(
        `[ClaimsRegistry] :: Milestone ${milestoneId} completed. Marking next as claimable`
      );
      await milestoneService.setNextAsClaimable(milestoneId);
    }
  }
};
