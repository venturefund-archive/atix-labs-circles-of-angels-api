pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract Project is Initializable, Ownable {

    string public name;
    
    function initialize(string memory _name) public payable initializer {
        Ownable.initialize(msg.sender);
        name = _name;
    }

    uint256[50] private _gap;
}
