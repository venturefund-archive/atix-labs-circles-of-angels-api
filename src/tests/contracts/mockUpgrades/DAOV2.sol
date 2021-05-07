pragma solidity ^0.5.8;

import '../../../contracts/AbstractDAO.sol';

/// @title A DAO contract based on MolochDAO ideas
contract DAOV2 is AbstractDAO {
    string public test;

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

    function setTest(string memory _test) public {
        test = _test;
    }

    uint256[49] private _gap;
}
