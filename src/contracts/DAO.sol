pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import './COA.sol';


/// @title A DAO contract based on MolochDAO ideas
contract DAO {
    using SafeMath for uint256;

    /// DAO members
    mapping(address => Member) public members;
    /// Array of DAO proposals inlcuding already processed ones
    Proposal[] public proposalQueue;
    /// DAO's name.
    string public name;
    uint256 public creationTime;

    enum ProposalType {
        NewMember, /// Adds a new member to the DAO
        NewDAO, /// Create a new dao
        AssignBank, /// Assigns bank role to a member
        AssignCurator /// Assigns curator role to a member
    }

    enum Role {Normal, Bank, Curator}

    /// TODO: actually define these numbers
    uint256 public periodDuration = 17280; /// seconds
    uint256 public votingPeriodLength = 35; /// periods
    uint256 public gracePeriodLength = 35;
    uint256 public processingPeriodLength = votingPeriodLength +
        gracePeriodLength;

    /// Emitted then a proposal was successfuly submitted
    event SubmitProposal(
        uint256 proposalIndex,
        address indexed memberAddress,
        address indexed applicant,
        uint256 tokenTribute,
        uint256 sharesRequested
    );
    /// Emitted when a vote was succesfuly received
    event SubmitVote(
        uint256 indexed proposalIndex,
        address indexed memberAddress,
        uint8 vote
    );
    /// Emitted when a proposal was successfuly been processed
    event ProcessProposal(
        uint256 indexed proposalIndex,
        address indexed applicant,
        address indexed memberAddress,
        ProposalType proposalType,
        bool didPass
    );

    enum Vote {Null, Yes, No}

    struct Member {
        Role role; /// Member current role
        bool exists; /// To check if it exists in the mapping
        uint256 shares; /// Amount of shares
    }

    struct Proposal {
        address proposer; /// Member that sent the proposal
        address applicant; ///
        ProposalType proposalType; /// The type of the proposal being voted
        uint256 yesVotes; /// Total amount of Yes votes
        uint256 noVotes; /// Total amount of No votes
        bool didPass; /// True if the proposal has been approved, no otherwise
        string description; /// ipfs / rif storage hash
        mapping(address => Vote) votesByMember; /// All the votes made for this proposal
        uint256 startingPeriod; /// the period in which voting can start for this proposal
        bool processed; /// True if it has been processed, false otherwise
    }

    /**
     * @param _name DAO name
     * @param _creator User that will be assigned as the first member
     */
    constructor(string memory _name, address _creator) public {
        name = _name;
        creationTime = now;
        addMember(_creator);
    }

    /**
     * @notice Function to be invoked in order to create a new proposal.
     *
     * @param _applicant Address of the user to be added as member. If _proposalType is NewDAO _applicant will be added as the first member.
     * @param _proposalType Type of the proposal to be voted
     * @param _description String description about the proposal
     */
    function submitProposal(
        address _applicant,
        uint8 _proposalType,
        string memory _description
    ) public {
        /// require msg.sender is a member.
        address memberAddress = msg.sender;
        uint256 startingPeriod = max(
            getCurrentPeriod(),
            proposalQueue.length == 0
                ? 0
                : proposalQueue[proposalQueue.length.sub(1)].startingPeriod
        )
            .add(1);
        require(_proposalType < 4, 'invalid type');
        Proposal memory proposal = Proposal({
            proposer: memberAddress,
            description: _description,
            proposalType: ProposalType(_proposalType),
            applicant: _applicant,
            yesVotes: 0,
            noVotes: 0,
            didPass: false,
            startingPeriod: startingPeriod,
            processed: false
        });

        proposalQueue.push(proposal);
    }

    /**
     * @notice Used to cast a vote. Keep in mind that only memers can vote, voting twice is not alloed and votes cannot be casted between starting period until expiration.
     * @param _proposalIndex Proposal to be voted to. It will revert if proposal doesn't exist at _propsoalIndex.
     * @param _vote The vote, Vote.Yes or Vote.No
     */
    function submitVote(uint256 _proposalIndex, uint8 _vote) public {
        address memberAddress = msg.sender;
        Member storage member = members[memberAddress];
        require(member.shares > 0, 'no voting power');
        require(
            _proposalIndex < proposalQueue.length,
            'Moloch::submitVote - proposal does not exist'
        );
        Proposal storage proposal = proposalQueue[_proposalIndex];

        require(_vote < 3, '_vote must be less than 3');
        Vote vote = Vote(_vote);
        require(
            getCurrentPeriod() >= proposal.startingPeriod,
            'voting period has not started'
        );

        // FIXME: uncomment this
        // require(!hasVotingPeriodExpired(proposal.startingPeriod), "proposal voting period has expired");
        require(
            proposal.votesByMember[memberAddress] == Vote.Null,
            'member has already voted on this proposal'
        );
        require(
            vote == Vote.Yes || vote == Vote.No,
            'vote must be either Yes or No'
        );

        // store user vote
        proposal.votesByMember[memberAddress] = vote;

        // count the vote in the corresponding proposal vote accumulator
        if (vote == Vote.Yes) {
            proposal.yesVotes = proposal.yesVotes.add(member.shares);
        } else if (vote == Vote.No) {
            proposal.noVotes = proposal.noVotes.add(member.shares);
        }

        emit SubmitVote(_proposalIndex, memberAddress, _vote);
    }

    /**
     * @notice Counts proposal votes and executes corresponding actions if Yes votes > No votes. If it didn't pass does nothing. Proposals can be processed just once.
     * @param _proposalIndex Proposal to ben processed. Previous proposals (the ones with index less than _proposalIndex) need to be processed first
     */
    function processProposal(uint256 _proposalIndex)
        public
        canProcess(_proposalIndex)
    {
        Proposal storage proposal = proposalQueue[_proposalIndex];

        /// TODO : this require is needed!
        /// require(proposal.proposalType == ProposalType.NewMember, "only new members proposal");
        proposal.processed = true;

        bool didPass = proposal.yesVotes > proposal.noVotes;

        if (didPass) {
            /// PROPOSAL PASSED
            proposal.didPass = true;
            if (proposal.proposalType == ProposalType.NewMember) {
                processNewMemberProposal(_proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignBank) {
                processAssignBankProposal(_proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignCurator) {
                processAssignCuratorProposal(_proposalIndex);
            }
        } else {
            /// PROPOSAL FAILED
        }

        emit ProcessProposal(
            _proposalIndex,
            proposal.applicant,
            proposal.proposer,
            proposal.proposalType,
            didPass
        );
    }

    /**
     * @notice Returns current period. It can be used to determine the actions that can be performed on a proposal (cast votes or process).
     */
    function getCurrentPeriod() public view returns (uint256) {
        return now.sub(creationTime).div(periodDuration);
    }

    /**
     * @notice Returns true if the voting has expired based on the current period
     * @param startingPeriod Proposal staring period
     */
    function hasVotingPeriodExpired(uint256 startingPeriod)
        public
        view
        returns (bool)
    {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

    /**
     * @notice Returns the proposals array length
     */
    function getProposalQueueLength() public view returns (uint256) {
        return proposalQueue.length;
    }

    /**
     * @notice Checks if a proposal can be processed or not. Checks to be made: proposal exists, if it's ready to be processed and has not expired and hasn't been yet processed. It also checks if the previoous proposal has been processed already.
     */
    modifier canProcess(uint256 proposalIndex) {
        require(
            proposalIndex < proposalQueue.length,
            'proposal does not exist'
        );
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(
            getCurrentPeriod() >=
                proposal.startingPeriod.add(processingPeriodLength),
            'proposal is not ready to be processed'
        );
        require(
            proposal.processed == false,
            'proposal has already been processed'
        );
        require(
            proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed,
            'previous proposal must be processed'
        );
        _;
    }

    function addMember(address memberAddress) private {
        Member memory member = Member({
            role: Role.Normal,
            exists: true,
            shares: 1
        });
        members[memberAddress] = member;
    }

    function max(uint256 x, uint256 y) internal pure returns (uint256) {
        return x >= y ? x : y;
    }

    function processNewMemberProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];
        require(
            proposal.proposalType == ProposalType.NewMember,
            'only new members proposal'
        );

        if (members[proposal.applicant].exists) {
            /// member already exists, do nothing.
        } else {
            addMember(proposal.applicant);
        }
    }

    function processAssignBankProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(
            proposal.proposalType == ProposalType.AssignBank,
            'only assign bank proposal'
        );

        members[proposal.applicant].role = Role.Bank;
    }

    function processAssignCuratorProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(
            proposal.proposalType == ProposalType.AssignCurator,
            'only assign curator proposal'
        );

        members[proposal.applicant].role = Role.Curator;
    }
}
