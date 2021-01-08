const { describe, it, beforeAll, beforeEach, expect } = global;
const { config } = require('@nomiclabs/buidler');
const { readArtifactSync } = require('@nomiclabs/buidler/plugins');
const {
  getOrDeployContract,
  getOrDeployUpgradeableContract,
  buildGetOrDeployUpgradeableContract,
  getSigner,
  getContractFactory
} = require('../../plugins/deployments');

describe('Deployments tests', () => {
  let creator;

  beforeAll(async () => {
    creator = await getSigner(0);
  });

  const validContractName = 'ClaimsRegistry';
  const invalidContractName = 'NotContractName';

  describe('Static functions', () => {
    describe('with a contract deployed', () => {
      let contract1;

      beforeAll(async () => {
        contract1 = await getOrDeployContract(
          validContractName,
          [],
          creator,
          true
        );
      });

      it("getOrDeployContract should deploy if the contract doesn't exists", async () => {
        expect(contract1).toBeDefined();
      });

      it('getOrDeployContract should return the deployed contract if the contract was already deployed', async () => {
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

    describe('with an upgradeable contract deployed', () => {
      let contract1;

      beforeEach(async () => {
        contract1 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator,
          false,
          undefined,
          true
        );
      });

      it("getOrDeployUpgradeableContract should deploy if the contract doesn't exists", async () => {
        expect(contract1).toBeDefined();
      });

      it('getOrDeployUpgradeableContract should return the deployed contract if the contract was already deployed', async () => {
        const contract2 = await getOrDeployUpgradeableContract(
          validContractName,
          [],
          creator
        );
        expect(contract1.address).toEqual(contract2.address);
      });

      it('getOrDeployUpgradeableContract should throw an error if the contractName is invalid', () => {
        expect(
          getOrDeployUpgradeableContract(
            invalidContractName,
            [],
            creator,
            false,
            undefined,
            true
          )
        ).rejects.toThrow();
      });

      it('getOrDeployUpgradeableContract should upgrade the implementation if there is a new implementation', async () => {
        // Mocking readArtifactSync
        const mockedClaimsRegistryArtifactFun = () =>
          readArtifactSync(config.paths.artifacts, 'ClaimsRegistryV2');

        // Mocking getContractFactory
        const mockedClaimsRegistryFactFun = () =>
          getContractFactory('ClaimsRegistryV2', creator);

        const contract2 = await buildGetOrDeployUpgradeableContract(
          mockedClaimsRegistryArtifactFun,
          mockedClaimsRegistryFactFun
        )(validContractName, [], creator, true, {
          unsafeAllowCustomTypes: true
        });

        const testingWord = 'Testing';
        await contract2.setTest(testingWord);
        expect(await contract2.test()).toEqual(testingWord);
      });

      it('getOrDeployUpgradeableContract should throw an error if the doUpgrade param is not passed or false', async () => {
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
