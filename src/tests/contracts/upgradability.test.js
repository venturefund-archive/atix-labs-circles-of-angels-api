const { run, deployments, ethers, upgrades } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');

// @title UPGRADABILITY TESTS for all the contracts
// There's a describe for each upgradable contract, each test inside the describe
// may be dependant of the previous one to prove the stored values in the contract
// remain the same and the storage got migrated

contract('ClaimsRegistry.sol', async ([creator, other]) => {
  let abstractDaoContract;
  let claimsRegistryContract;
  let coaContract;
  const projectData = {
    id: 1,
    name: 'New Project'
  };
  let project1;

  // eslint-disable-next-line func-names, no-undef
  before(async function() {
    this.timeout(1 * 60 * 1000);
    await run('deploy', { reset: true });
    // [abstractDaoContract] = await deployments.getDeployedContracts(
    //   'AbstractDAO'
    // );

    [claimsRegistryContract] = await deployments.getDeployedContracts(
      'ClaimsRegistry'
    );
    [coaContract] = await deployments.getDeployedContracts('COA');

    // create a project to be used along several tests
    await coaContract.createProject(projectData.id, projectData.name);
    project1 = await coaContract.projects(0);
  });

  describe.only('Upgradability Tests', () => {
    describe('[ClaimRegistry] contract should: ', () => {
      it('Store value on the Registry mapping', async () => {
        const claimHash = utils.id('this is a claim');
        const proofHash = utils.id('this is the proof');
        const milestoneHash = utils.id('this is the milestone');
        await claimsRegistryContract.addClaim(
          project1,
          claimHash,
          proofHash,
          true,
          milestoneHash
        );
        const claim = await claimsRegistryContract.registry(
          project1,
          creator,
          claimHash
        );
        assert.strictEqual(claim.proof, proofHash);
      });
      it('Get Upgraded, return the stored value and execute a new function of the upgraded contract', async () => {
        const claimHash = utils.id('this is a claim');
        const proofHash = utils.id('this is the proof');

        const mockContract = await ethers.getContractFactory(
          'ClaimsRegistryV2'
        );
        const claimsRegistryV2 = await upgrades.upgradeProxy(
          claimsRegistryContract.address,
          mockContract,
          { unsafeAllowCustomTypes: true }
        );
        const claim = await claimsRegistryV2.registry(
          project1,
          creator,
          claimHash
        );
        assert.equal(claim.proof, proofHash);

        await claimsRegistryV2.setTest('test');
        assert.equal(await claimsRegistryV2.test(), 'test');
      });
    });

    describe('[Project] contract should', () => {
      it('Store value of the name when deployed', async () => {
        const projectInstance = await deployments.getContractInstance(
          'Project',
          project1,
          other
        );
        const retName = await projectInstance.name();
        assert.equal(retName, projectData.name);
      });

      it('Get Upgraded, return the stored value and execute a new function of the upgraded contract', async () => {
        const factory = await ethers.getContractFactory('ProjectV2');
        const mockContract = await factory.deploy({});
        const proxyInstance = await deployments.getContractInstance(
          'AdminUpgradeabilityProxy',
          project1,
          creator
        );
        await proxyInstance.upgradeTo(mockContract.address);
        const projectV2 = await deployments.getContractInstance(
          'ProjectV2',
          project1,
          other
        );
        const retName = await projectV2.name();
        assert.equal(retName, projectData.name);

        await projectV2.setTest('test');
        const retTest = await projectV2.test();
        assert.equal(retTest, 'test');
      });
    });
  });
});
