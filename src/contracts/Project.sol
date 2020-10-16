pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

import "./ClaimsRegistry.sol";

contract Project is Ownable, Initializable {
    using SafeMath for uint256;

    string public name;
    address public entrepreneurAddress;

    mapping (bytes32 => bool) public isClaimValidated;

    function initialize(string memory _name) public payable initializer {
        Ownable.__Ownable_init();
        name = _name;
    }
}
