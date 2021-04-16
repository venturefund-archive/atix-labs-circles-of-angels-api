const { run, deployments, ethers, upgrades } = require('@nomiclabs/buidler');
const { assert } = require('chai');
const { utils } = require('ethers');

// @title UPGRADABILITY TESTS for all the contracts
// There's a describe for each upgradable contract, each test inside the describe
// may be dependant of the previous one to prove the stored values in the contract
// remain the same and the storage got migrated

// eslint-disable-next-line func-names, no-undef
contract('Upgradability ==>> ', async ([creator, other]) => {
  let claimsRegistryContract;
  let coaContract;
  let proxyAdmin;
  const projectData = {
    id: 1,
    name: 'New Project'
  };
  let project1;

  // eslint-disable-next-line func-names, no-undef
  before(async function() {
    this.timeout(1 * 60 * 1000);
    await run('deploy', { reset: true });

    [claimsRegistryContract] = await deployments.getDeployedContracts(
      'ClaimsRegistry'
    );
    [coaContract] = await deployments.getDeployedContracts('COA');

    [proxyAdmin] = await deployments.getDeployedContracts('ProxyAdmin');

    // create a project to be used along several tests
    await coaContract.createProject(projectData.id, projectData.name);
    project1 = await coaContract.projects(0);
  });

  describe('Upgradability Contracts Tests', () => {
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

      it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
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

    describe('[COA] contract should', () => {
      it('Get project length before and after creating a project', async () => {
        let retProjectLength = await coaContract.getProjectsLength();
        assert.equal(retProjectLength.toString(), '1');

        const newProjectData = {
          id: 2,
          name: 'New Project 2'
        };
        await coaContract.createProject(newProjectData.id, newProjectData.name);
        retProjectLength = await coaContract.getProjectsLength();
        assert.equal(retProjectLength.toString(), '2');
      });

      it('Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
        const mockContract = await ethers.getContractFactory('COAV2');
        const coaV2 = await upgrades.upgradeProxy(
          coaContract.address,
          mockContract,
          {
            unsafeAllowCustomTypes: true
          }
        );

        const retProjectLength = await coaV2.getProjectsLength();
        assert.equal(retProjectLength.toString(), '2');

        await coaV2.setTest('test');
        const retTest = await coaV2.test();
        assert.equal(retTest, 'test');
      });
    });

    describe('[Super DAO] and [DAO] contract should: ', () => {
      let superDao;
      let dao1;
      const superDaoName = 'Super DAO';
      const newDaoData = {
        name: 'New Dao',
        daoCreator: other
      };
      // eslint-disable-next-line func-names, no-undef
      before(async function() {
        superDao = await coaContract.daos(0);
        await coaContract.createDAO(newDaoData.name, newDaoData.daoCreator);
        dao1 = await coaContract.daos(1);
      });

      it('[SuperDAO] retrieve stored value as Super DAO', async () => {
        const superDaoInstance = await deployments.getContractInstance(
          'SuperDAO',
          superDao,
          creator
        );

        const retNameSuper = await superDaoInstance.name();
        assert.equal(retNameSuper, superDaoName);
      });

      it('[SuperDAO] Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
        const factory = await ethers.getContractFactory('SuperDAOV2');
        const mockContract = await factory.deploy({});
        const proxyInstance = await deployments.getContractInstance(
          'AdminUpgradeabilityProxy',
          superDao,
          creator
        );

        await proxyAdmin.upgrade(proxyInstance.address, mockContract.address);

        const superDAOV2 = await deployments.getContractInstance(
          'SuperDAOV2',
          superDao,
          other
        );

        const retName = await superDAOV2.name();
        assert.equal(retName, superDaoName);

        await superDAOV2.setTest('test');
        const retTest = await superDAOV2.test();
        assert.equal(retTest, 'test');
      });

      it('[DAO] retrieve stored value as New DAO', async () => {
        const daoInstance = await deployments.getContractInstance(
          'DAO',
          dao1,
          creator
        );

        const retNameDao = await daoInstance.name();
        assert.equal(retNameDao, newDaoData.name);
      });

      it('[DAO] Get Upgraded - return stored value - execute new function from upgraded contract', async () => {
        const factory = await ethers.getContractFactory('DAOV2');
        const mockContract = await factory.deploy({});
        const proxyInstance = await deployments.getContractInstance(
          'AdminUpgradeabilityProxy',
          dao1,
          creator
        );

        await proxyAdmin.upgrade(proxyInstance.address, mockContract.address);

        const daoV2 = await deployments.getContractInstance(
          'DAOV2',
          dao1,
          other
        );

        const retName = await daoV2.name();
        assert.equal(retName, newDaoData.name);

        await daoV2.setTest('test');
        const retTest = await daoV2.test();
        assert.equal(retTest, 'test');
      });
    });
  });
});
