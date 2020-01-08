pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import "./Project.sol";
import "./ClaimsRegistry.sol";
import "./DAO.sol";

contract COA is Ownable {

    enum Role {
        Funder,
        Activist
    }

    struct Member {
        string profile;
        // Role role;
    }

    // Circle of Angels' members aka angels
    Project[] public projects;
    mapping (address => Member) public members;
    DAO[] public daos;
    ClaimsRegistry public registry;

    event DAOCreated(address addr);

    constructor(address _registryAddress) Ownable() public {
        registry = ClaimsRegistry(_registryAddress);
    }

    // the profile can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    function createMember(string memory _profile) public {
            // role: Role.Activist,
        Member memory member = Member({
            profile: _profile
        });
        members[msg.sender] = member;
    }

    function success() public returns(uint) {
        return 42;
    }
    function fail() public {
        revert();
    }
    function emitEvent() public {
        emit DAOCreated(address(this));
    }

    // the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    function createProject(string memory _name, string memory _agreementHash) public returns(uint256) {
        Project project = new Project(_name, _agreementHash);
        projects.push(project);
        return projects.length - 1;
    }

    function createDAO(string memory _name) public {
        DAO dao = new DAO(_name);
        daos.push(dao);
        emit DAOCreated(address(dao));
    }

    function approveClaim(address project, bytes32 claim, bytes32 proof) public {
        registry.addClaim(project, claim, proof, true);
    }

    // ugly name
    function disapproveClaim(address project, bytes32 claim, bytes32 proof) public {
        registry.addClaim(project, claim, proof, false);
    }

    // function processProposal(uint proposalIndex) {

    // }

    function getDAO(uint256 _index) public view returns(address) {
        return address(daos[_index]);
    }

    function getProject(uint256 _index) public view returns(address) {
        return address(projects[_index]);
    }

    function getMember(address _address) public view returns(string memory) {
        Member memory member = members[_address];
            // member.role,
        return (
            member.profile
        );
    }

}
