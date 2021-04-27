pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/InitializableUpgradeabilityProxy.sol';
import '@openzeppelin/upgrades/contracts/upgradeability/ProxyAdmin.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/cryptography/ECDSA.sol';

import './Project.sol';
import './ClaimsRegistry.sol';
import './DAO.sol';
import './SuperDAO.sol';
import './UsersWhitelist.sol';

/// @title COA main contract to store projects related information
contract COA is Initializable, Ownable, GSNRecipient {
    using ECDSA for bytes32;
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

    address internal proxyAdmin;
    address internal implProject;
    address internal implSuperDao;
    address internal implDao;
    UsersWhitelist public whitelist;

    function coaInitialize(
        address _registryAddress,
        address _proxyAdmin,
        address _implProject,
        address _implSuperDao,
        address _implDao,
        address _whitelist
    ) public initializer {
        Ownable.initialize(msg.sender);
        GSNRecipient.initialize();
        registry = ClaimsRegistry(_registryAddress);
        proxyAdmin = _proxyAdmin;
        implProject = _implProject;
        implSuperDao = _implSuperDao;
        implDao = _implDao;
        whitelist = UsersWhitelist(_whitelist);
        createSuperDAO();
    }

    /**
     * @notice Adds a new member in COA.
     * @param _profile - string of the member's profile.
     *
     * @dev the profile can be bytes32 but IPFS hashes are 34 bytes long due to multihash. We could strip the first two bytes but for now it seems unnecessary.
     */
    function createMember(string calldata _profile) external {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[msg.sender] = member;
    }

    /**
     * @dev Migrates an old member in COA.
     * @param _profile - string of the member's profile.
     * @param _existingAddress - address of the old member
     */
    function migrateMember(string calldata _profile, address _existingAddress)
        external
        onlyOwner
    {
        // role: Role.Activist,
        Member memory member = Member({profile: _profile});
        members[_existingAddress] = member;
    }

    /**
     * @dev Create a Project
     * @param _name - string of the Project's name.
     * @return address - the address of the new project
     */
    function createProject(uint256 _id, string calldata _name)
        external
        returns (address)
    {
        bytes memory payload = abi.encodeWithSignature("initialize(string)", _name);
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(implProject, proxyAdmin, payload);
        projects.push(proxy);
        emit ProjectCreated(_id, address(proxy));
        return address(proxy);
    }

    /**
     * @dev Create a DAO
     * @param _name - string of the DAO's name.
     * @param _creator - address of the first member of the DAO (i.e. its creator)
     * @return address - the address of the new dao
     */
    function createDAO(string calldata _name, address _creator)
        external
        returns (address)
    {
        require(proxyAdmin != _creator, "The creator can not be the proxy admin.");
        bytes memory payload = abi.encodeWithSignature("initialize(string,address,address)", _name, _creator, address(whitelist));
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(implDao, proxyAdmin, payload);
        daos.push(proxy);
        emit DAOCreated(address(proxy));
        return address(proxy);
    }

    /**
     * @dev Create a SuperDAO
     *      It's the DAO that can be used to create other DAOs.
     */
    function createSuperDAO() internal {
        require(proxyAdmin != owner(), "The creator can not be the admin proxy.");
        bytes memory payload = abi.encodeWithSignature("initialize(string,address,address,address)", 'Super DAO', owner(), address(this), address(whitelist));
        AdminUpgradeabilityProxy proxy = new AdminUpgradeabilityProxy(implSuperDao, proxyAdmin, payload);
        daos.push(proxy);
        emit DAOCreated(address(proxy));
    }

    // the agreement hash can be bytes32 but IPFS hashes are 34 bytes long due to multihash.
    // we could strip the first two bytes but for now it seems unnecessary
    /**
     * @dev Adds an agreement hash to the agreements map. This can only be run by the admin
     * @param _project - address of the project the agreement belongs to
     * @param _agreementHash - string of the agreement's hash.
     */
    function addAgreement(address _project, string calldata _agreementHash)
        external
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

    function setWhitelist(address _whitelist) external onlyOwner() {
        whitelist = UsersWhitelist(_whitelist);
    }

    function acceptRelayedCall(
        address ,
        address from,
        bytes calldata,
        uint256 ,
        uint256 ,
        uint256 ,
        uint256 ,
        bytes calldata ,
        uint256
    ) external view returns (uint256, bytes memory) {
        if (whitelist.users(from)) {
            return _approveRelayedCall();
        } else {
            return _rejectRelayedCall(0);
        }
    }

    function _preRelayedCall(bytes memory) internal returns (bytes32) {
        return 0;
    }

    function _postRelayedCall(bytes memory, bool, uint256, bytes32) internal {}

    uint256[49] private _gap;
}
