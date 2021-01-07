const { describe, it, beforeEach, beforeAll, expect } = global;
const { ethereum, config, upgrades } = require('@nomiclabs/buidler');
const { readArtifactSync } = require('@nomiclabs/buidler/plugins');
const {
  getOrDeployContract,
  getOrDeployUpgradeableContract,
  buildGetOrDeployUpgradeableContract,
  readState,
  writeState,
  getSigner,
  getContractFactory
} = require('../../plugins/deployments');

async function revertSnapshot(snapshot) {
  writeState(snapshot.state);
  return ethereum.send('evm_revert', [snapshot.evm]);
}

async function createSnapshot() {
  return {
    evm: await ethereum.send('evm_snapshot', []),
    state: readState()
  };
}

describe('Deployments tests', () => {
  let snapshot;
  let creator;
  let otherUser;

  beforeAll(async () => {
    snapshot = await createSnapshot();
    creator = await getSigner(0);
    otherUser = await getSigner(1);
  });

  beforeEach(() => revertSnapshot(snapshot));

  const validContractName = 'ClaimsRegistry';
  const invalidContractName = 'NotContractName';

  describe('Static functions', () => {
    beforeEach(() => revertSnapshot(snapshot));

    describe('getOrDeployContract tests', () => {
      beforeEach(() => revertSnapshot(snapshot));

      it("getOrDeployContract should deploy if the contract doesn't exists", async () => {
        const contract = await getOrDeployContract(
          validContractName,
          [],
          creator,
          false
        );
        expect(contract).toBeDefined();
      });

      it('getOrDeployContract should return the deployed contract if the contract was already deployed', async () => {
        const contract1 = await getOrDeployContract(
          validContractName,
          [],
          creator,
          false
        );
        const contract2 = await getOrDeployContract(
          validContractName,
          [],
          creator,
          false
        );
        expect(contract1.address).toEqual(contract2.address);
      });

      it('getOrDeployContract should throw an error if the contractName is invalid', () => {
        expect(
          getOrDeployContract(invalidContractName, [], false)
        ).rejects.toThrow();
      });
    });

    describe('getOrDeployUpgradeableContract tests', () => {
      beforeEach(() => {
        jest.resetModules();
        revertSnapshot(snapshot);
      });

      it("getOrDeployUpgradeableContract should deploy if the contract doesn't exists", async () => {
        const contract = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator
        );
        expect(contract).toBeDefined();
      });

      it('getOrDeployUpgradeableContract should return the deployed contract if the contract was already deployed', async () => {
        const contract1 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator
        );
        const contract2 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator
        );
        expect(contract1.address).toEqual(contract2.address);
      });

      it('getOrDeployUpgradeableContract should throw an error if the contractName is invalid', () => {
        expect(
          getOrDeployUpgradeableContract(invalidContractName, [], creator)
        ).rejects.toThrow();
      });

      it('getOrDeployUpgradeableContract should upgrade the implementation if there is a new implementation', async () => {
        await getOrDeployUpgradeableContract(validContractName, [], creator);

        // Mocking readArtifactSync
        const mockedClaimsRegistryArtifactFun = () =>
          readArtifactSync(config.paths.artifacts, 'ClaimsRegistryV2');

        // Mocking getContractFactory
        const mockedClaimsRegistryFactFun = () =>
          getContractFactory('ClaimsRegistryV2', creator);

        const contract = await buildGetOrDeployUpgradeableContract(
          mockedClaimsRegistryArtifactFun,
          mockedClaimsRegistryFactFun
        )(validContractName, [], creator, true, {
          unsafeAllowCustomTypes: true
        });

        const testingWord = 'Testing';
        await contract.setTest(testingWord);
        expect(await contract.test()).toEqual(testingWord);
      });

      it('getOrDeployUpgradeableContract should throw an error if the doUpgrade param is not passed or false', async () => {
        await getOrDeployUpgradeableContract(validContractName, [], creator);

        // Mocking readArtifactSync
        const mockedClaimsRegistryArtifactFun = () =>
          readArtifactSync(config.paths.artifacts, 'ClaimsRegistryV2');

        // Mocking getContractFactory
        const mockedClaimsRegistryFactFun = () =>
          getContractFactory('ClaimsRegistryV2', creator);

        expect(
          buildGetOrDeployUpgradeableContract(
            mockedClaimsRegistryArtifactFun,
            mockedClaimsRegistryFactFun
          )(validContractName, [], creator)
        ).rejects.toThrow();
      });
    });
  });
});
