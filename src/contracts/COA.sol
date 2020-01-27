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

    Project[] public projects;
    mapping (address => Member) public members;
    DAO[] public daos;
    ClaimsRegistry public registry;

    event DAOCreated(address addr);

    * @dev Adds a new member in COA.
    * @param _profile - string of the member's profile.
    */
    constructor(address _registryAddress) Ownable() public {
        registry = ClaimsRegistry(_registryAddress);
        createSuperDAO();
    }

    // the profile can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    /**
    * @dev Adds a new member in COA.
    * @param _profile - string of the member's profile.
    */
    function createMember(string memory _profile) public {
            // role: Role.Activist,
        Member memory member = Member({
            profile: _profile
        });
        members[msg.sender] = member;
    }

    // the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    /**
    * @dev Create a Project
    * @param _name - string of the Project's name.
    * @param _agreementHash - string of the agreement's hash.
    */
    function createProject(string memory _name, string memory _agreementHash) public returns(uint256) {
        Project project = new Project(_name, _agreementHash);
        projects.push(project);
        return projects.length - 1;
    }

    /**
    * @dev Create a DAO
    * @param _name - string of the DAO's name.
    * @param _creator - address of the first member of the DAO (i.e. its creator)
    */
    function createDAO(string memory _name, address _creator) public {
        DAO dao = new DAO(_name, _creator);
        daos.push(dao);
        emit DAOCreated(address(dao));
    }


    /**
    * @dev Create a SuperDAO
    *      It's the DAO that can be used to create other DAOs.
    */
    function createSuperDAO() internal {
        DAO dao = new SuperDAO("Super DAO", msg.sender, address(this));
        daos.push(dao);
        emit DAOCreated(address(dao));

    }

    function getDaosLength() public view returns(uint256) {
        return daos.length;
    }
}
