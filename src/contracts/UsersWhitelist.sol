pragma solidity ^0.5.8;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';

contract UsersWhitelist is Initializable, Ownable {

    mapping (address => bool) public users;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    function initialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function addUser(address _user) public onlyOwner {
        users[_user] = true;
        emit AddedToWhitelist(_user);
    }

    function removeUser(address _user) public onlyOwner {
        require(users[_user] != 0, "The user is not in the whitelist.");
        delete users[_user];
        emit RemovedFromWhitelist(_user);
    }
}