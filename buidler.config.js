usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-ethers');
usePlugin('solidity-coverage');

// const deployments = ;
const { lazyObject } = require('@nomiclabs/buidler/plugins');
const {
  createChainIdGetter
} = require('@nomiclabs/buidler/internal/core/providers/provider-utils');
const buidlerTasks = require('./src/rest/services/helpers/buidlerTasks');
const COA = require('./src/plugins/coa');

const INFURA_API_KEY = '';
const ROPSTEN_PRIVATE_KEY = '';
const MAINNET_PRIVATE_KEY = '';

// const Deployments = require("./scripts/deployments");

task('deploy', 'Deploys COA contracts')
  .addOptionalParam('reset', 'force deploy')
  .setAction(async ({ reset }, env) => {
    // Make sure everything is compiled
    // await run('compile');

    reset = reset === 'true';

    let [registry] = await env.deployments.getDeployedContracts(
      'ClaimsRegistry'
    );
    if (registry === undefined || reset === true) {
      [registry, receipt] = await env.deployments.deploy('ClaimsRegistry', []);
      await env.deployments.saveDeployedContract('ClaimsRegistry', registry);
      // console.log('ClaimsRegistry deployed. Address:', registry.address);
    }

    let [coa] = await env.deployments.getDeployedContracts('COA');
    // console.log(coa, registry.address)
    if (coa === undefined || reset === true) {
      [coa] = await env.deployments.deploy('COA', [registry.address]);
      await env.deployments.saveDeployedContract('COA', coa);
      // console.log('COA deployed. Address:', coa.address);
    }

    // console.log('Registry attached to', registry.address);
    // console.log('COA attached to', coa.address);
  });

task('create-member', 'Create COA member')
  .addOptionalParam('profile', 'New member profile')
  .setAction(async ({ profile }, env) =>
    buidlerTasks.createMember({ profile }, env)
  );

task('create-dao', 'Create DAO')
  .addOptionalParam('account', 'DAO creator address')
  .setAction(async ({ account }, env) =>
    buidlerTasks.createDao({ account }, env)
  );

task('propose-member-to-dao', 'Creates proposal to add member to existing DAO')
  .addParam('daoaddress', 'DAO address')
  .addParam('applicant', 'Applicant address')
  .addOptionalParam('proposer', 'Proposer address')
  .setAction(async ({ daoaddress, applicant, proposer }, env) =>
    buidlerTasks.proposeMemberToDao({ daoaddress, applicant, proposer }, env)
  );

task('vote-proposal', 'Votes a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index')
  .addOptionalParam('vote', 'Vote (true or false)')
  .addOptionalParam('voter', 'Voter address')
  .setAction(async ({ daoaddress, proposal, vote, voter }, env) =>
    buidlerTasks.voteProposal({ daoaddress, proposal, vote, voter }, env)
  );

task('process-proposal', 'Process a proposal')
  .addParam('daoaddress', 'DAO address')
  .addParam('proposal', 'Proposal index')
  .addOptionalParam('signer', 'Tx signer address')
  .setAction(async ({ daoaddress, proposal, signer }, env) =>
    buidlerTasks.processProposal({ daoaddress, proposal, signer }, env)
  );

const coaDeploySetup = {
  contracts: [
    {
      name: 'ClaimsRegistry'
    },
    {
      name: 'COA',
      params: context => [context.ClaimsRegistry.address]
    }
  ]
};

task('deploy2').setAction(async (args, env) => {
  const setup = env.deployments.getDeploymentSetup(coaDeploySetup);
  await setup.deploy();
});

extendEnvironment(env => {
  // console.log(createChainIdGetter);
  const chainIdGetter = createChainIdGetter(env.ethereum);
  env.coa = new COA(env);
  env.deployments = lazyObject(() => require('./src/plugins/deployments'));
});

module.exports = {
  paths: {
    tests: './src/tests/contracts',
    sources: './src/contracts'
  },
  defaultNetwork: 'develop',
  networks: {
    develop: {
      url: 'http://localhost:8545'
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ROPSTEN_PRIVATE_KEY]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
    },
    coverage: {
      url: 'http://localhost:8555'
    }
  },
  solc: {
    version: '0.5.8',
    evmVersion: 'byzantium'
  }
};
