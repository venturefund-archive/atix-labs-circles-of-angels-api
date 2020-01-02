pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

import "./ClaimsRegistry.sol";

contract Project is Ownable {
    using SafeMath for uint256;

    string public name;
    address public entrepreneurAddress;
    ClaimsRegistry public claimsRegistry;

    // Percentage of funds which will be saved in case of a project update.
    uint public emergencyPercentage;
    string agreementHash;

    address[] accountIndex;

    mapping (bytes32 => bool) public isClaimValidated;
    uint public total;
    ERC20 private token;


    constructor(string memory _name, string memory _agreementHash) Ownable() public {
        name = _name;
        agreementHash = _agreementHash;
    }

    function setEntrepreneur(address _entrepreneurAddress) public onlyOwner {
        entrepreneurAddress = _entrepreneurAddress;
    }

    function setClaimsRegistry(ClaimsRegistry _claimsRegistry) public onlyOwner {
        claimsRegistry = _claimsRegistry;
    }

    function setToken(ERC20 _token) public onlyOwner {
        token = _token;
    }

    // function notify(address _from, uint _amount) public onlyOwner {
    //     require(_from != address(0));
    //     require(_amount > 0);
    //     registerDonation(_from, _amount);
    // }

    // function registerDonation();

    // function validateOutcome(bytes32 _claimId, uint _value) public {
    //     require (msg.sender == validatorAddress);
    //     require (!isClaimValidated[_claimId]);

    //     // Can only validate claimed outcomes if claims registry is present.
    //     if (address(CLAIMS_REGISTRY) != address(0)) {
    //         uint claimedValue = uint(
    //             CLAIMS_REGISTRY.getClaim(beneficiaryAddress, address(this), _claimId));
    //         require (claimedValue == _value);
    //     }

    //     require (_value > 0 && _value <= total);

    //     getToken().transfer(beneficiaryAddress, _value);
    //     total = total.sub(_value);

    //     isClaimValidated[_claimId] = true;
    //     ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_claimId, _value);

    //     emit OutcomeEvent(_claimId, _value);
    // }

    // function validate(bytes32 _claimId, bytes32 _proof) public {
    //     claimsRegistry.approveClaim(address(this), _claimId, _proof);
    // }

    // function payBack(address account) public onlyOwner {
    //     uint balance = getBalance(account);
    //     if (balance > 0) {
    //         getToken().transfer(account, balance);
    //         total = total.sub(balance);
    //         ImpactRegistry(IMPACT_REGISTRY_ADDRESS).payBack(account);
    //     }
    // }

    // function getBalance(address _donor) public view returns(uint balance) {
    //     return ImpactRegistry(IMPACT_REGISTRY_ADDRESS).getBalance(_donor);
    // }

    // /* Extra security measure to save funds in case of critical error or attack */
    // function escape(address escapeAddress) public onlyOwner {
    //     getToken().transfer(escapeAddress, total);
    //     total = 0;
    // }


    function getToken() public view returns(ERC20) {
        return token;
    }

    function calculateSecurityAmount(uint256 _amount)
        private
        view
        returns(uint256 upfront, uint256 remainder) {
        // upfront = _amount.mul(upfrontPaymentPercentage).div(100);
        // remainder = _amount.sub(upfront);
        return (1, 1);
    }
}
