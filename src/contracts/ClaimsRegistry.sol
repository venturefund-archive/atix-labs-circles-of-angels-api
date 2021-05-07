pragma solidity ^0.5.8;

import '@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol';

import "./UpgradeableToV1.sol";
import './UsersWhitelist.sol';
import "./old/ClaimsRegistry_v0.sol";
/**
 * @title This contract holds information about claims made buy COA members
 * @dev loosely based on ERC780 Ethereum Claims Registry https://github.com/ethereum/EIPs/issues/780 now it has been heavily changed.
 */
contract ClaimsRegistry is ClaimsRegistry_v0, UpgradeableToV1, GSNRecipient {

    address public coaAddress;
    UsersWhitelist public whitelist;

    modifier onlyCoa() {
        require(
            address(coaAddress) == msg.sender,
            'Only COA can call this function'
        );
        _;
    }

    function claimUpgradeToV1(address _whitelist, address _coaAddress, address _relayHubAddr) public upgraderToV1 {
        coaAddress = _coaAddress;
        // Initialize ClaimsRegistry
        whitelist = UsersWhitelist(_whitelist);
        if (_relayHubAddr != GSNRecipient.getHubAddr()) {
            GSNRecipient._upgradeRelayHub(_relayHubAddr);
        }
    }

    function setDefaultRelayHub() public onlyCoa {
        super.setDefaultRelayHub();
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

    function withdrawDeposits(
        uint256 amount,
        address payable destinationAddress
    ) external onlyCoa {
        require(destinationAddress != address(0), 'Address cannot be empty');
        require(amount > 0, 'Amount cannot be ZERO');
        _withdrawDeposits(amount, destinationAddress);
    }

    uint256[49] private _gap;
}
