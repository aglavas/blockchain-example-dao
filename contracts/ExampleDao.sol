// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ExampleDao {
  struct Proposal {
    uint id;
    string name;
    uint amount;
    address payable recipient;
    uint votes;
    uint end;
    bool executed;
  }

  mapping(address => mapping(uint => bool)) public votes;
  mapping(uint => Proposal) public proposals;
  mapping(address => bool) public investors;
  mapping(address => uint) public shares;
  uint public totalShares;
  uint public totalFunds;
  uint public contributionEnd;
  uint public nextProposalId;
  uint public voteTime;
  uint public quorum;
  address public admin;
  
  constructor(uint contributionPeriod, uint quorumValue, uint votingTime)  {
    require(quorumValue > 0 && quorumValue < 100, 'Quorum must be between 0 and 100.');
    contributionEnd = block.timestamp + contributionPeriod;
    voteTime = votingTime;
    quorum = quorumValue;
    admin = msg.sender;
  }

  function contribute() payable external {
    require(block.timestamp < contributionEnd, "Contribution has ended.");
    investors[msg.sender] = true;
    shares[msg.sender] += msg.value;
    totalShares += msg.value;
    totalFunds += msg.value;
  }

  function redeem(uint amount) external {
    require(shares[msg.sender] >= amount, 'Share balance too low.');
    require(totalFunds >= amount, 'Cannot redeem. Liquidity too low.');
    shares[msg.sender] -= amount;
    totalFunds -= amount;
    payable(msg.sender).transfer(amount);
  }

  function transferShare(uint amount, address to) external {
    require(shares[msg.sender] >= amount, 'Share balance too low.');
    shares[msg.sender] -= amount;
    shares[to] += amount;
    investors[to] = true;
  }

  function createProposal(string memory name, uint amount, address payable recipient) external onlyInvestors() {
    require(amount <= totalFunds, 'Contract balance too low for this proposal.');
    proposals[nextProposalId] = Proposal(nextProposalId, name, amount, recipient, 0, block.timestamp + voteTime, false);
    totalFunds -= amount;
    nextProposalId++;
  }

  function vote(uint proposalId) external onlyInvestors() {
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp < proposal.end, "Voting has ended.");
    require(votes[msg.sender][proposalId] == false, 'Investor can only vote once for a proposal.');
    votes[msg.sender][proposalId] = true;
    proposal.votes += shares[msg.sender];
  }

  function executeProposal(uint proposalId) external onlyAdmin() {
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp >= proposal.end, "Proposal has expired.");
    require(proposal.executed == false, "Proposal can be executed only once.");
    require(((proposal.votes * 100) / totalShares) >= quorum, "Not enough votes to execute proposal.");
    proposal.executed = true;
    transferEther(proposal.amount, proposal.recipient);
  }

  function withdrawEther(uint amount, address payable to) external onlyAdmin() {
    transferEther(amount, to);
  }

  function transferEther(uint amount, address payable to) internal {
    require(amount <= totalFunds, "Amount is higher than total balance.");
    totalFunds -= amount;
    to.transfer(amount);
  }

  receive() external payable {
    totalFunds += msg.value;
  }

  modifier onlyInvestors() {
    require(investors[msg.sender] == true, 'Only investor action.');
    _;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, 'Only admin.');
    _;
  }
}
