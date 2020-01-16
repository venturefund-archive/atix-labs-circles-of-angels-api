pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import "./Project.sol";
import "./ClaimsRegistry.sol";
import "./DAO.sol";
import "./SuperDAO.sol";

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
        createSuperDAO();
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

    // function success() public returns(uint) {
    //     return 42;
    // }
    // function fail() public {
    //     revert();
    // }
    // function emitEvent() public {
    //     emit DAOCreated(address(this));
    // }

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

    function createSuperDAO() internal {
        DAO dao = new SuperDAO("Super DAO", address(this));
        daos.push(dao);
        emit DAOCreated(address(dao));

    }
}
