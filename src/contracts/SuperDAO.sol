pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import './COA.sol';
import './AbstractDAO.sol';

/// @title This contracts is a DAO but will also process new dao creation proposals
contract SuperDAO is AbstractDAO {
    COA coa;

    function initialize(string memory _name,
        address _creator,
        address _coaAddress,
        address _whitelist) public initializer {
        AbstractDAO.initialize(_name, _creator, _whitelist);
        coa = COA(_coaAddress);
    }

    function processNewDaoProposal(string memory _name, address _applicant)
        internal
    {
        coa.createDAO(_name, _applicant);
    }

    function requireProposalTypeIsValid(ProposalType _proposalType) internal {
        require(
            _proposalType == ProposalType.NewMember ||
                _proposalType == ProposalType.AssignBank ||
                _proposalType == ProposalType.AssignCurator ||
                _proposalType == ProposalType.NewDAO,
            'Invalid Proposal Type'
        );
    }

    uint256[50] private _gap;
}
