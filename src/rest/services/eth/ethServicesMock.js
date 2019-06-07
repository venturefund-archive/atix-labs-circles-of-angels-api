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
    '0x0d8cd6fd460d607b2590fb171a3dff04e33285830add91a2f9a4e43ced1ed01a'
});

module.exports = ethServicesMock;
