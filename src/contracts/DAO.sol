pragma solidity ^0.5.8;

import '@openzeppelin/contracts/ownership/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';


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
        FundProject
        // KickMember,
    }

    uint256 public periodDuration;
    uint256 public votingPeriodLength;
    uint256 public gracePeriodLength;
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
        // Role role;
        bool exists;
        uint shares;        
        // address delegateKey;
    }

    struct Proposal {
        address proposer;
        address applicant;
        ProposalType proposalType;

        uint256 goal;

        uint256 yesVotes;
        uint256 noVotes;
        bool didPass;
        
        bytes32 description; // ipfs / rif storage hash

        mapping (address => Vote) votesByMember;

        uint256 startingPeriod; // the period in which voting can start for this proposal}
        bool processed;
    }

    constructor(string memory _name) public {
        name = _name;
        creationTime = now;
        addMember(msg.sender);
    }

    function addMember(address memberAddress) private {
        Member memory member = Member({
            // role: Role.Activist,
            exists: true,
            shares: 1
            // delegateKey: memberAddress
        });
        members[memberAddress] = member;
    }
    
    function submitProposal(
        address _applicant,
        uint8 _proposalType,
        uint256 _goal,
        bytes32 _description
    ) public {
        // require msg.sender is a member.
        address memberAddress = msg.sender;
        require(_proposalType < 2, "invalid type");
        Proposal memory proposal = Proposal({
            proposer: memberAddress,
            description: _description,
            proposalType: ProposalType.NewMember,
            applicant: _applicant,
            goal: _goal,
            yesVotes: 0,
            noVotes: 0,
            didPass: false,
            startingPeriod: 0,
            processed: false 
        });

        proposalQueue.push(proposal);
    }

    function submitVote(uint _proposalIndex, uint8 _vote) public {
        address memberAddress = msg.sender;
        Member storage member = members[memberAddress];
        // require(member.shares > 0, "no voting power");
        require(_proposalIndex < proposalQueue.length, "Moloch::submitVote - proposal does not exist");
        Proposal storage proposal = proposalQueue[_proposalIndex];

        require(_vote < 3, "_vote must be less than 3");
        Vote vote = Vote(_vote);

        require(getCurrentPeriod() >= proposal.startingPeriod, "voting period has not started");
        require(!hasVotingPeriodExpired(proposal.startingPeriod), "proposal voting period has expired");
        // require(proposal.votesByMember[memberAddress] == Vote.Null, "member has already voted on this proposal");
        require(vote == Vote.Yes || vote == Vote.No, "vote must be either Yes or No");

        // store vote
        // proposal.votesByMember[memberAddress] = vote;

        // count vote
        if (vote == Vote.Yes) {
            proposal.yesVotes = proposal.yesVotes.add(member.shares);
            // TODO : can I leave the DAO at any moment?
            // TODO : notion of shared within the dao?

        } else if (vote == Vote.No) {
            proposal.noVotes = proposal.noVotes.add(member.shares);
        }

        emit SubmitVote(_proposalIndex, memberAddress, _vote);
    }

    function processProposal(uint256 proposalIndex) public {
        require(proposalIndex < proposalQueue.length, "proposal does not exist");
        Proposal storage proposal = proposalQueue[proposalIndex];

        require(getCurrentPeriod() >= proposal.startingPeriod.add(votingPeriodLength).add(gracePeriodLength), "proposal is not ready to be processed");
        require(proposal.processed == false, "proposal has already been processed");
        require(proposalIndex == 0 || proposalQueue[proposalIndex.sub(1)].processed, "previous proposal must be processed");

        proposal.processed = true;

        // TODO : a different resolution method can be used, maybe use a library.
        bool didPass = proposal.yesVotes > proposal.noVotes;

        // PROPOSAL PASSED
        if (didPass) {

            proposal.didPass = true;

            // TODO : proposalType is unnecesary if the actual money is fiat.
            //        we could just assume that if no applicant is given, then is a fund project proposal,
            //        otherwise the applicant is present and it's a new member proposal.
            if (proposal.proposalType == ProposalType.NewMember) {
                if (members[proposal.applicant].exists) {
                    // member already exists, do nothing.
                } else {
                    addMember(proposal.applicant);
                }
            } else if (proposal.proposalType == ProposalType.FundProject) {
                // The money is fiat, so no need for any token transfers.
                // ^ I don't think this is the right thing to handle this.

                // TODO : Should accepted SEs be members of the dao? Maybe a member with no voting power?
                //        ^ consider using shares:
                //        : 1 shares => 1 vote  
                //        : 0 shares => no vote
                //        : n shares => n votes? maybe quadratic voting?
            }
        // PROPOSAL FAILED
        } else {
            // ?? 
        }

        emit ProcessProposal(
            proposalIndex,
            proposal.applicant,
            proposal.proposer,
            proposal.proposalType,
            didPass
        );
    }

    function getCurrentPeriod() public view returns (uint256) {
        return now.sub(creationTime).div(periodDuration);
    }

    function hasVotingPeriodExpired(uint256 startingPeriod) public view returns (bool) {
        return getCurrentPeriod() >= startingPeriod.add(votingPeriodLength);
    }

}
