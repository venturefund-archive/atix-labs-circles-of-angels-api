pragma solidity ^0.5.8;

import '@openzeppelin/upgrades/contracts/Initializable.sol';

contract MockContract is Initializable {

    function initialize() public initializer {}

    function mockSum(uint16 x, uint16 y) public pure returns (uint16) {
        return x + y;
    }
}
