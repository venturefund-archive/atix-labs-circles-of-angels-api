pragma solidity ^0.5.8;

import './AbstractDAO.sol';

/// @title A DAO contract based on MolochDAO ideas
contract DAO is AbstractDAO {

    function initDao(
        string memory _name,
        address _creator,
        address _whitelist,
        address _coaAddress,
        address _relayHubAddr
    ) public initializer {
        AbstractDAO.initAbstractDao(_name, _creator, _whitelist, _coaAddress, _relayHubAddr);
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

    uint256[50] private _gap;
}
