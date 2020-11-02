pragma solidity ^0.5.8;

import './AbstractDAO.sol';

/// @title A DAO contract based on MolochDAO ideas
contract DAO is AbstractDAO {

    function initialize(string memory _name, address _creator) public initializer {
        AbstractDAO.initialize(_name, _creator);
    }
    
    function processNewDaoProposal(string memory _name, address applicant)
        internal
    {
        // Do nothing as reverting will mark the proposal as not executed
        // TODO: Emit an event
    }

    function requireProposalTypeIsValid(ProposalType _proposalType) internal {
        require(
            _proposalType == ProposalType.NewMember ||
                _proposalType == ProposalType.AssignBank ||
                _proposalType == ProposalType.AssignCurator,
            'Invalid Proposal Type'
        );
    }
}
