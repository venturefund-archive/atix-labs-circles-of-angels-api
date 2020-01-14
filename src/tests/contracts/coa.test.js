const {
  artifacts,
  ethereum,
  web3,
  run,
  deployments
} = require('@nomiclabs/buidler');
const { utils } = require('ethers');

let coa;
let registry;
const COA = artifacts.require('./COA');
const ClaimsRegistry = artifacts.require('./ClaimsRegistry');

async function getProjectAt(address) {
  const project = await deployments.getContractInstance('Project', address);

  return project;
}
async function getProject(id) {
  const address = await coa.getProject(id);
  return getProjectAt(address);
}

contract(
  'COA application',
  ([creator, social, funder, oracle, ...otherAccounts]) => {
    describe('COA main contract', async () => {
      before('deploy contracts', async () => {
        await run('deploy');
        [registry] = await deployments.getDeployedContracts('ClaimsRegistry');
        [coa] = await deployments.getDeployedContracts('COA');
      });

      describe('constructor', () => {
        it('deploy params are ok', async () => {
          const { address } = registry;
          assert.equal(await coa.registry(), address);
        });
      });
      describe('members', () => {

        it('should create a member', async () => {
          const userData = ['first user profile'];
          await coa.createMember(...userData);
          assert.equal(await coa.members(creator), userData);
        });
      });

      describe('projects', () => {
        it('should create a project', async () => {
          const project = {
            name: 'a good project',
            agreementHash: 'an IPFS/RIF Storage hash'
          };
          await coa.createProject(project.name, project.agreementHash);
          const instance = await getProjectAt(await coa.projects(0));
          assert.equal(await instance.name(), project.name);
          assert.equal(await instance.agreementHash(), project.agreementHash);
        });
      });
    });

    describe('claims registry', () => {
      before(async () => {
        await run('deploy');
        [registry] = await deployments.getDeployedContracts('ClaimsRegistry');
        [coa] = await deployments.getDeployedContracts('COA');

        const project = {
          name: 'a good project',
          agreementHash: 'an IPFS/RIF Storage hash'
        };
        await coa.createProject(project.name, project.agreementHash);
      });

      it('should add a claim', async () => {
        const project = await coa.projects(0);
        const claimHash = utils.id('a very useful task');
        const proof = utils.id('an authentic proof');
        const approved = true;
        await registry.addClaim(project, claimHash, proof, approved);
        const claim = await registry.registry(project, creator, claimHash);
        assert.equal(claim.proof, proof);
        assert.equal(claim.approved, approved);
      });
    });
  }
);
