pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/Proxy.sol';
import './Project.sol';
import './ClaimsRegistry.sol';
import './DAO.sol';
import './SuperDAO.sol';

import '@nomiclabs/buidler/console.sol';

/// @title COA main contract to store projects related information
contract COA is Initializable, Ownable {
    struct Member {
        string profile;
    }
    /// Projects list
    //Project[] public projects;
    AdminUpgradeabilityProxy[] public projects;
    /// COA members
    mapping(address => Member) public members;
    /// COA owned daos
    AdminUpgradeabilityProxy[] public daos;
    /// FIXME: Where is this used
    ClaimsRegistry public registry;
    // Agreements by project address => agreementHash
    mapping(address => string) public agreements;

    /// Emitted when a new DAO is created
    event DAOCreated(address addr);
    /// Emitted when a new Project is created
    event ProjectCreated(uint256 id, address addr);

    function initialize(address _registryAddress) public initializer {
        console.log("Creating COA..");
        Ownable.initialize(msg.sender);
        registry = ClaimsRegistry(_registryAddress);
        console.log("Creating superdao..");
        createSuperDAO();
        console.log("Superdao created..");
    }
    /**
     * @notice Adds a new member in COA.
     * @param _profile - string of the member's profile.
     *
     * @dev the profile can be bytes32 but IPFS hashes are 34 bytes long due to multihash. We could strip the first two bytes but for now it seems unnecessary.
     */
    function createMember(string memory _profile) public {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[msg.sender] = member;
    }

    /**
     * @dev Migrates an old member in COA.
     * @param _profile - string of the member's profile.
     * @param _existingAddress - address of the old member
     */
    function migrateMember(string memory _profile, address _existingAddress)
        public
        onlyOwner
    {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[_existingAddress] = member;
    }

    /**
     * @dev Create a Project
     * @param _name - string of the Project's name.
     */
    function createProject(uint256 _id, string memory _name)
        public
        returns (uint256)
    {
        Project project = new Project();
        bytes memory payload = abi.encodeWithSignature("initialize(string)", _name);
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(address(project), owner(), payload);
        projects.push(proxy);
        emit ProjectCreated(_id, address(project));
    }

    /**
     * @dev Create a DAO
     * @param _name - string of the DAO's name.
     * @param _creator - address of the first member of the DAO (i.e. its creator)
     */
    function createDAO(string memory _name, address _creator) public {
        require(owner() != _creator, "The creator can not be the coa owner.");
        DAO dao = new DAO();
        bytes memory payload = abi.encodeWithSignature("initialize(string,address)", _name, _creator);
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(address(dao), owner(), payload);
        daos.push(proxy);
        emit DAOCreated(address(dao));
    }

    /**
     * @dev Create a SuperDAO
     *      It's the DAO that can be used to create other DAOs.
     */
    function createSuperDAO() internal {
        console.log("Creating superdao");
        SuperDAO dao = new SuperDAO();
        address superDaoAdmin = 0x26C43a1D431A4e5eE86cD55Ed7Ef9Edf3641e901;
        bytes memory payload = abi.encodeWithSignature("initialize(string,address,address)", 'Super DAO', superDaoAdmin, address(this));
        console.log("Creating proxy");
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(address(dao), owner(), payload);
        daos.push(proxy);
        emit DAOCreated(address(dao));
    }

    // the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    /**
     * @dev Adds an agreement hash to the agreements map. This can only be run by the admin
     * @param _project - address of the project the agreement belongs to
     * @param _agreementHash - string of the agreement's hash.
     */
    function addAgreement(address _project, string memory _agreementHash)
        public
        onlyOwner()
    {
        agreements[_project] = _agreementHash;
    }

    function getDaosLength() public view returns (uint256) {
        return daos.length;
    }

    function getProjectsLength() public view returns (uint256) {
        return projects.length;
    }

    uint256[50] private _gap;
}
