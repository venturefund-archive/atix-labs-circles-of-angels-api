pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

import "./ClaimsRegistry.sol";

contract Project is Ownable {
    using SafeMath for uint256;

    string public name;
    address public entrepreneurAddress;

    mapping (bytes32 => bool) public isClaimValidated;

    constructor(string memory _name) Ownable() public {
        name = _name;
    }
}
