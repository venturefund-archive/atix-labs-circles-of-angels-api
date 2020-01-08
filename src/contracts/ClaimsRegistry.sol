pragma solidity ^0.5.8;

/**
   @dev initial based on ERC780 Ethereum Claims Registry
        https://github.com/ethereum/EIPs/issues/780
        now it has been heavily changed.
 */
contract ClaimsRegistry {

    struct Claim {
        bool approved;
        bytes32 proof;
    }

    // project => validator => task/claim id => Claim 
    // Claim[] can be used to amend previous verifications 
    mapping(address => mapping(address => mapping(bytes32 => Claim))) public registry;

    mapping(address => address[]) public projectValidators;

    event ClaimApproved(
        address indexed project,
        address indexed validator,
        bytes32 indexed claim,
        bool _approved,
        bytes32 proof,
        uint verifiedAt
    );

    // function getClaim(address project, address validator, bytes32 claim)
    // public view returns(Claim) {
    //     return registry[project][validator][claim];
    // }

    // no proof => no positive verification? probably not a good idea (???)
    function addClaim(
        address _project,
        bytes32 _claim,
        bytes32 _proof,
        bool _approved
    )
        public
    {
        address validator = msg.sender;
        registry[_project][validator][_claim] = Claim({
            approved: _approved,
            proof: _proof
        });

        // too much args?
        emit ClaimApproved(_project, validator, _claim, _approved, _proof, now);
    }
}
