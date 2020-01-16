pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import './COA.sol';
import './DAO.sol';

contract SuperDAO is DAO {

    using SafeMath for uint256;

    COA coa;

    constructor(string memory _name, address _creator, address _coaAddress) DAO(_name, _creator) public {
        coa = COA(_coaAddress);
    }

    // overrides DAO's processProposal
    function processProposal(uint256 proposalIndex) public canProcess(proposalIndex) {
        Proposal storage proposal = proposalQueue[proposalIndex];

        // TODO : this require is needed!
        // require(proposal.proposalType == ProposalType.NewMember, "only new members proposal");

        proposal.processed = true;

        bool didPass = proposal.yesVotes > proposal.noVotes;

        if (didPass) {
            // PROPOSAL PASSED
            proposal.didPass = true;
            if (proposal.proposalType == ProposalType.NewMember) {
                processNewMemberProposal(proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignBank) {
                processAssignBankProposal(proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignCurator) {
                processAssignCuratorProposal(proposalIndex);
            } else if (proposal.proposalType == ProposalType.NewDAO) {
                processNewDAOProposal(proposalIndex);
            }
        } else {
            // PROPOSAL FAILED
        }

        emit ProcessProposal(
            proposalIndex,
            proposal.applicant,
            proposal.proposer,
            proposal.proposalType,
            didPass
        );
    }

    function processNewDAOProposal(uint256 proposalIndex) private {
        Proposal storage proposal = proposalQueue[proposalIndex];
        require(proposal.proposalType == ProposalType.NewDAO, "only new dao proposals");

        coa.createDAO("A DAO", proposal.applicant);
    }

}
