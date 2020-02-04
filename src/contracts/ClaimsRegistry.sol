pragma solidity ^0.5.8;

/**
   @dev loosely based on ERC780 Ethereum Claims Registry
        https://github.com/ethereum/EIPs/issues/780
        now it has been heavily changed.
 */
contract ClaimsRegistry {

    struct Claim {
        bool approved;
        bytes32 proof;
    }

    // Claim[] can be used to amend previous verifications 
    // Claim by project address => validator address => claim's hash => claim.
    mapping(address => mapping(address => mapping(bytes32 => Claim))) public registry;

    // project => validators[]
    // mapping(address => address[]) public projectValidators;

    event ClaimApproved(
        address indexed project,
        address indexed validator,
        bytes32 indexed claim,
        bool _approved,
        bytes32 proof,
        uint verifiedAt
    );

    /**
    * @dev Adds a claim into the registry.
    * @param _project - address of a project.
    * @param _claim - bytes32 of the claim's hash.
    * @param _proof - bytes32 of the proof's hash.
    * @param _approved - true if the claim is approved, false otherwise. 
    */
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

        emit ClaimApproved(_project, validator, _claim, _approved, _proof, now);
    }

    /**
    * @dev Checks whether the tasks from a project's milestone are approved).
    * @param _project - address of a project.
    * @param _validators - array of addresses of the validators.
    * @param _claims - array of bytes32 hashes of the claims.
    */
    function areApproved(
        address _project,
        address[] memory _validators,
        bytes32[] memory _claims
    ) public view returns (bool) {
        require(_validators.length == _claims.length, "arrays must be equal size");
        bool approved = true;
        for (uint i = 0; i < _claims.length; i++) {
            Claim memory claim = registry[_project][_validators[i]][_claims[i]];
            approved = approved && claim.approved;
        }
        return approved;
    }
}
