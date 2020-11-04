const { web3, run, deployments, ethers } = require('@nomiclabs/buidler');
const { getSigner } = require('../../plugins/deployments');

const { throwsAsync } = require('./testHelpers');

let coa;
let registry;

async function getProjectAt(address, consultant) {
  const project = await deployments.getContractInstance(
    'Project',
    address,
    consultant
  );
  return project;
}

contract('COA.sol', ([creator, founder, other]) => {
  beforeEach('deploy contracts', async () => {
    await run('deploy', { reset: true });
    [registry] = await deployments.getDeployedContracts('ClaimsRegistry');
    [coa] = await deployments.getDeployedContracts('COA');
  });

  it('Deployment works', async () => {
    const { address } = registry;
    assert.equal(await coa.registry(), address);
  });

  describe('Members method', () => {
    it('Should create a member', async () => {
      const userData = ['first user profile'];
      await coa.createMember(...userData);
      assert.equal(await coa.members(creator), userData);
    });
    it('Should migrate an existing member', async () => {
      const userData = ['first user profile'];
      await coa.migrateMember(...userData, founder);
      assert.equal(await coa.members(founder), userData);
    });
  });

  describe('Project methods', () => {
    it('Should create a project', async () => {
      const project = {
        id: 1,
        name: 'a good project'
      };
      await coa.createProject(project.id, project.name);
      const instance = await getProjectAt(await coa.projects(0), other);
      assert.equal(await instance.name(), project.name);
    });
    it('Should allow the owner to add an agreement to a project', async () => {
      const agreementHash = 'an IPFS/RIF Storage hash';
      await coa.addAgreement(coa.address, agreementHash);
      const agreementAdded = await coa.agreements(coa.address);
      assert.equal(agreementAdded, agreementHash);
    });
    it('Should fail when trying to add an agreement if not owner', async () => {
      const signers = await ethers.getSigners();
      const agreementHash = 'an IPFS/RIF Storage hash';
      await throwsAsync(
        coa
          .connect(signers[signers.length - 1])
          .addAgreement(coa.address, agreementHash),
        'VM Exception while processing transaction: revert Ownable: caller is not the owner'
      );
    });
  });

  describe('DAO creation', () => {
    it('Should succeed when creating a dao', async () => {
      const daosLengthBeforeCreation = await coa.getDaosLength();
      await coa.createDAO('the dao', founder);
      const daosLengthAfterCreation = await coa.getDaosLength();
      const daoAddress = await coa.daos(daosLengthAfterCreation - 1);
      const dao = await deployments.getContractInstance(
        'DAO',
        daoAddress,
        founder
      );
      const daoMember = await dao.members(founder);

      assert.equal(
        daosLengthAfterCreation.toNumber(),
        daosLengthBeforeCreation.add(1).toNumber()
      );

      assert.equal(await dao.name(), 'the dao');
      assert.notEqual(daoMember, undefined); // he is a member
    });
  });

  describe('Transaction', () => {
    it('Should revert when sending a tx to the contract', async () => {
      await throwsAsync(
        web3.eth.sendTransaction({
          from: other,
          to: coa.address,
          value: '0x16345785d8a0000'
        }),
        "Returned error: Transaction reverted: function selector was not recognized and there's no fallback function"
      );
    });
  });

  describe('Upgrade Project contract', () => {
    it('Should upgrade a new version of project', async () => {
      const project = {
        id: 1,
        name: 'a good project'
      };
      await coa.createProject(project.id, project.name);
      const factory = await ethers.getContractFactory('ProjectV2');
      const mockContract = await factory.deploy({});
      const instance = await deployments.getContractInstance(
        'AdminUpgradeabilityProxy',
        await coa.projects(0),
        creator
      );
      await instance.upgradeTo(mockContract.address);
      const newVersion = await deployments.getContractInstance(
        'ProjectV2',
        await coa.projects(0),
        other
      );
      newVersion.setTest('test');
      assert.equal(await newVersion.name(), project.name);
      assert.equal(await newVersion.test(), 'test');
    });
  });
});
