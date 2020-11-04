const { run, deployments, web3, upgrades } = require('@nomiclabs/buidler');
const { utils } = require('ethers');
const { throwsAsync, waitForEvent } = require('./testHelpers');

const addClaim = async (
  claimsRegistry,
  project,
  theClaim = {
    claim: 'this is a claim',
    proof: 'this is the proof',
    milestone: 'the milestone',
    approved: true
  }
) => {
  const { claim, proof, milestone, approved } = theClaim;
  const claimHash = utils.id(claim || 'this is a claim');
  const proofHash = utils.id(proof || 'this is the proof');
  const milestoneHash = utils.id(milestone || 'this is the milestone');
  await claimsRegistry.addClaim(
    project,
    claimHash,
    proofHash,
    approved,
    milestoneHash
  );
  return {
    claimHash,
    proofHash,
    approved,
    milestoneHash
  };
};

contract('ClaimsRegistry.sol', ([creator, otherUser]) => {
  let coa;
  let registry;
  let project;

  beforeEach('deploy contracts', async () => {
    await run('deploy', { reset: true });
    [registry] = await deployments.getDeployedContracts('ClaimsRegistry');
    [coa] = await deployments.getDeployedContracts('COA');
    await coa.createProject(1, 'a project');
    project = await coa.projects(0);
  });

  it('Should add a claim and emit an event when doing so', async () => {
    const { proofHash, claimHash, approved, milestoneHash } = await addClaim(
      registry,
      project
    );

    const claim = await registry.registry(project, creator, claimHash);
    const [
      eventProject,
      eventValidator,
      eventClaim,
      eventApproved,
      eventProof,
      ,
      eventMilestone
    ] = await waitForEvent(registry, 'ClaimApproved');

    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, approved);
    // `claim Approved event is emitted properly
    assert.equal(eventProject, project);
    assert.equal(eventValidator, creator);
    assert.equal(eventClaim, claimHash);
    assert.equal(eventApproved, approved);
    assert.equal(eventProof, proofHash);
    assert.equal(eventMilestone.toHexString(), milestoneHash);
  });

  it('Should override a claim when adding it twice', async () => {
    const { proofHash, claimHash } = await addClaim(registry, project);
    const claim = await registry.registry(project, creator, claimHash);
    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    assert.equal(claim.approved, true);
    // Update the claim
    const { proofHash: proof2Hash } = await addClaim(registry, project, {
      approved: false,
      proof: 'another proof'
    });
    const claim2 = await registry.registry(project, creator, claimHash);
    // Check the claim hash changed
    assert.equal(claim2.proof, proof2Hash);
    assert.equal(claim2.approved, false);
  });

  it('It should return true when checking for only approved claims', async () => {
    const { claimHash: claim1Hash } = await addClaim(registry, project, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await addClaim(registry, project, {
      claim: 'claim 2',
      approved: true
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      project,
      [creator, creator],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, true);
  });

  it('It should return false when checking if one of the claims is not approved', async () => {
    const { claimHash: claim1Hash } = await addClaim(registry, project, {
      claim: 'claim 1',
      approved: true
    });

    const { claimHash: claim2Hash } = await addClaim(registry, project, {
      claim: 'claim 2',
      approved: false
    });
    // Check claim hashes are not equal
    assert.notEqual(claim1Hash, claim2Hash);

    const approved = await registry.areApproved(
      project,
      [creator, creator],
      [claim1Hash, claim2Hash]
    );
    assert.equal(approved, false);
  });
  it('It should handle large set of claims to be checked', async () => {
    const claims = [];
    const validators = [];
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line no-await-in-loop
      const { claimHash } = await addClaim(registry, project, {
        claim: `claim ${i}`,
        approved: true
      });
      claims.push(claimHash);
      validators.push(creator);
    }
    const approved = await registry.areApproved(project, validators, claims);
    assert.equal(approved, true);
  });

  it('It should revert when sending a tx to the contract', async () => {
    await throwsAsync(
      web3.eth.sendTransaction({
        from: creator,
        to: registry.address,
        value: '0x16345785d8a0000'
      }),
      "Returned error: Transaction reverted: function selector was not recognized and there's no fallback function"
    );
  });

  it('Should upgrade a new version of claimsregistry contract', async () => {
    const { proofHash, claimHash } = await addClaim(registry, project);
    const mockContract = await ethers.getContractFactory('ClaimsRegistryV2');
    const registryV2 = await upgrades.upgradeProxy(
      registry.address,
      mockContract,
      { unsafeAllowCustomTypes: true }
    );
    const claim = await registryV2.registry(project, creator, claimHash);
    // Claim is stored properly
    assert.equal(claim.proof, proofHash);
    await registryV2.setTest('test');
    assert.equal(await registryV2.test(), 'test');
  });
});
