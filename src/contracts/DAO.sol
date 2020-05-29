pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import './COA.sol';

contract DAO {

    using SafeMath for uint256;

    mapping (address => Member) public members;
    // mapping (address => address) public memberAddressByDelegateKey;
    Proposal[] public proposalQueue;
    // DAO's name.
    string public name;
    uint public creationTime;

    enum ProposalType {
        NewMember,
        NewDAO,
        AssignBank,
        AssignCurator
    }

    enum Role {
        Normal,
        Bank,
        Curator
    }

    // TODO: actually define these numbers
    uint256 public periodDuration = 17280; // seconds
    uint256 public votingPeriodLength = 35; // periods
    uint256 public gracePeriodLength = 35;
    // TODO : use this to avoid proposal spamming
    uint256 public proposalDeposit;
    
    // Events 
    event SubmitProposal(
        uint256 proposalIndex,
        address indexed memberAddress,
        address indexed applicant,
        uint256 tokenTribute,
        uint256 sharesRequested
    );

    event SubmitVote(
        uint256 indexed proposalIndex,
        address indexed memberAddress,
        uint8 vote
    );
    event ProcessProposal(
        uint256 indexed proposalIndex,
        address indexed applicant,
        address indexed memberAddress,
        ProposalType proposalType,
        bool didPass
    );

    enum Vote {
        Null,
        Yes,
        No
    }

    struct Member {
        Role role;
        bool exists;
        uint shares;
        // address delegateKey;
    }

    struct Proposal {
        address proposer;
        address applicant;
        ProposalType proposalType;

        uint256 yesVotes;
        uint256 noVotes;
        bool didPass;
        
        string description; // ipfs / rif storage hash

        mapping (address => Vote) votesByMember;

        uint256 startingPeriod; // the period in which voting can start for this proposal}
        bool processed;
    }

    constructor(string memory _name, address _creator) public {
        name = _name;
        creationTime = now;
        addMember(_creator);
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

    function submitProposal(
        address _applicant,
        uint8 _proposalType,
        string memory _description
    ) public {
        // require msg.sender is a member.
        address memberAddress = msg.sender;
        uint256 startingPeriod = max(
            getCurrentPeriod(),
            proposalQueue.length == 0
                ? 0
                : proposalQueue[proposalQueue.length.sub(1)].startingPeriod
            ).add(1);
        require(_proposalType < 4, "invalid type");
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

    function submitVote(uint _proposalIndex, uint8 _vote) public {
        address memberAddress = msg.sender;
        Member storage member = members[memberAddress];
        require(member.shares > 0, "no voting power");
        require(_proposalIndex < proposalQueue.length, "Moloch::submitVote - proposal does not exist");
        Proposal storage proposal = proposalQueue[_proposalIndex];

        require(_vote < 3, "_vote must be less than 3");
        Vote vote = Vote(_vote);
        require(getCurrentPeriod() >= proposal.startingPeriod, "voting period has not started");

        // FIXME : uncomment this
        // require(!hasVotingPeriodExpired(proposal.startingPeriod), "proposal voting period has expired");
        require(proposal.votesByMember[memberAddress] == Vote.Null, "member has already voted on this proposal");
        require(vote == Vote.Yes || vote == Vote.No, "vote must be either Yes or No");

        // store vote
        proposal.votesByMember[memberAddress] = vote;

        // count vote
        if (vote == Vote.Yes) {
            proposal.yesVotes = proposal.yesVotes.add(member.shares);

        } else if (vote == Vote.No) {
            proposal.noVotes = proposal.noVotes.add(member.shares);
        }

        emit SubmitVote(_proposalIndex, memberAddress, _vote);
    }

    function processProposal(uint256 proposalIndex) public canProcess(proposalIndex) {
        Proposal storage proposal = proposalQueue[proposalIndex];

        // TODO : this require is needed!
        // require(proposal.proposalType == ProposalType.NewMember, "only new members proposal");
        proposal.processed = true;

        bool didPass = proposal.yesVotes > proposal.noVotes;

        if (didPass) {
            // PROPOSAL PASSED
            proposal.didPass = true;
            if (proposal.proposalType == ProposalType.NewMember) {
                processNewMemberProposal(proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignBank) {
                processAssignBankProposal(proposalIndex);
            } else if (proposal.proposalType == ProposalType.AssignCurator) {
                processAssignCuratorProposal(proposalIndex);
            }
        } else {
            // PROPOSAL FAILED
        }

        emit ProcessProposal(
            proposalIndex,
            proposal.applicant,
            proposal.proposer,
            proposal.proposalType,
            didPass
        );
    }

    function processNewMemberProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];
        require(proposal.proposalType == ProposalType.NewMember, "only new members proposal");

        if (members[proposal.applicant].exists) {
            // member already exists, do nothing.
        } else {
            addMember(proposal.applicant);
        }
    }

    function processAssignBankProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(proposal.proposalType == ProposalType.AssignBank, "only assign bank proposal");
        
        members[proposal.applicant].role = Role.Bank;
    }

    function processAssignCuratorProposal(uint256 proposalIndex) internal {
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(proposal.proposalType == ProposalType.AssignCurator, "only assign curator proposal");
        
        members[proposal.applicant].role = Role.Curator;
    }

    modifier canProcess(uint256 proposalIndex) {
        require(proposalIndex < proposalQueue.length, "proposal does not exist");
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(getCurrentPeriod() >= proposal.startingPeriod.add(votingPeriodLength).add(gracePeriodLength), "proposal is not ready to be processed");
        require(proposal.processed == false, "proposal has already been processed");
        require(proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed, "previous proposal must be processed");
        _;
    }

    function getCurrentPeriod() public view returns (uint256) {
        return now.sub(creationTime).div(periodDuration);
    }

    function hasVotingPeriodExpired(uint256 startingPeriod) public view returns (bool) {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

    function getProposalQueueLength() public view returns(uint256) {
        return proposalQueue.length;
    }

}
