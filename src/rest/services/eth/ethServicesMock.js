/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const ethServicesMock = () => ({
  createProject: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  isTransactionConfirmed: creationTransactionHash => !!creationTransactionHash,
  startProject: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  createAccount: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  createMilestone: () => true,
  createActivity: () => true,
  validateActivity: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  claimMilestone: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  setMilestoneFunded: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a',
  uploadHashEvidenceToActivity: () =>
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
});

module.exports = ethServicesMock;
