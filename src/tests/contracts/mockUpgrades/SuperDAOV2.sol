pragma solidity ^0.5.8;
import '@openzeppelin/contracts/math/SafeMath.sol';
import '../../../contracts/COA.sol';
import '../../../contracts/AbstractDAO.sol';

/// @title This contracts is a DAO but will also process new dao creation proposals
contract SuperDAOV2 is AbstractDAO {
    COA coa;
    string public test;

    function initialize(
        string memory _name,
        address _creator,
        address _coaAddress,
        address _whitelist
    ) public initializer {
        AbstractDAO.initialize(_name, _creator, _whitelist, _coaAddress);
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

    function setTest(string memory _test) public {
        test = _test;
    }

    uint256[49] private _gap;
}