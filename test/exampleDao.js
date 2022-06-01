const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ExampleDao = artifacts.require('ExampleDao');

contract('ExampleDao', (accounts) => {
  let dao;

  const [investor1, investor2, investor3] = [accounts[1], accounts[2], accounts[3]];
  before(async () => {
    dao = await ExampleDao.new(2, 50, 2);
  });

  it('Should accept ETH contribution', async () => {
    await dao.contribute({from: investor1, value: 100});
    await dao.contribute({from: investor2, value: 200});
    await dao.contribute({from: investor3, value: 300});

    const shares1 = await dao.shares(investor1);
    const shares2 = await dao.shares(investor2);
    const shares3 = await dao.shares(investor3);
    const isInvestor1 = await dao.investors(investor1);
    const isInvestor2 = await dao.investors(investor2);
    const isInvestor3 = await dao.investors(investor3);
    const totalShares = await dao.totalShares();
    const totalFunds = await dao.totalFunds();

    assert(shares1.toNumber() === 100 );
    assert(shares2.toNumber() === 200 );
    assert(shares3.toNumber() === 300 );
    assert(isInvestor1 === true);
    assert(isInvestor2 === true);
    assert(isInvestor3 === true);
    assert(totalShares.toNumber() === 600);
    assert(totalFunds.toNumber() === 600);
  });

  it('Should not accept ETH contribution after contribution has ended', async () => {
    await time.increase(2001); 
    await expectRevert(dao.contribute({from: investor1, value: 100}), 'Contribution has ended.');
  });

  it('Should not create proposal if not investor', async () => {
    await expectRevert(dao.createProposal('proposal XY', 100, accounts[8], {from: accounts[5]}), 'Only investor action.');
  });

  it('Should NOT create proposal if amount too big', async () => {
    await expectRevert(dao.createProposal('proposal CZ', 1000, accounts[8], {from: investor1}), 'Contract balance too low for this proposal.');
  });

  it('Should create proposal', async () => {
    await dao.createProposal('correct proposal', 100, accounts[8], {from: investor1});
    const proposal = await dao.proposals(0);
    assert(proposal.name === 'correct proposal');
    assert(proposal.recipient === accounts[8]);
    assert(proposal.amount.toNumber() === 100);
    assert(proposal.votes.toNumber() === 0);
    assert(proposal.executed === false);
  });

  it('Should NOT vote if not investor', async () => {
    await expectRevert(dao.vote(0, {from: accounts[8]}), 'Only investor action.');
  });

  it('Should vote', async () => {
    await dao.vote(0, {from: investor1});
  });

  it('Should NOT vote if already voted', async () => {
    await expectRevert(dao.vote(0, {from: investor1}), 'Investor can only vote once for a proposal.');
  });

  it('Should NOT vote if voting has ended', async () => {
    await time.increase(2001); 
    expectRevert(dao.vote(0, {from: investor1}), 'Voting has ended.');
  });

  it('Should execute proposal', async () => {
    await dao.createProposal('proposal X', 100, accounts[8], {from: investor1});
    await dao.vote(1, {from: investor1});
    await dao.vote(1, {from: investor3});
    await time.increase(2001);
    await dao.executeProposal(1);
  });

  it('Should NOT execute proposal if not enough votes', async () => {
    await dao.createProposal('proposal Y', 100, accounts[8], {from: investor1});
    await dao.vote(2, {from: investor1});
    await time.increase(2001);
    await expectRevert(dao.executeProposal(2), 'Not enough votes to execute proposal.');
  });

  it('Should NOT execute proposal twice', async () => {
    await expectRevert(dao.executeProposal(1), 'Proposal can be executed only once.');  
  });

  it('Should NOT execute proposal before end date', async () => {
    await dao.createProposal('proposal Z', 50, accounts[8], {from: investor1});
    await dao.vote(3, {from: investor1});
    await dao.vote(3, {from: investor2});
    expectRevert(dao.executeProposal(3), 'Cannot execute proposal before end date.');
  });

  it('Should NOT withdraw ETH if not admin', async () => {
    await expectRevert(dao.withdrawEther(10, accounts[8], {from: investor1}), 'Only admin.');
  });

  it('Should NOT withdraw ether if amount too big', async () => {
    await expectRevert(dao.withdrawEther(1000, accounts[8]), 'Amount is higher than total balance.');
  });
   
  it('Should withdraw ether', async () => {
    const balanceBefore = await web3.eth.getBalance(accounts[8]);
    await dao.withdrawEther(10, accounts[8]);
    const balanceAfter = await web3.eth.getBalance(accounts[8]);
    balanceAfterBN = web3.utils.toBN(balanceAfter);
    balanceBeforeBN = web3.utils.toBN(balanceBefore);
    assert(balanceAfterBN.sub(balanceBeforeBN).toNumber() === 10);
  });  
});