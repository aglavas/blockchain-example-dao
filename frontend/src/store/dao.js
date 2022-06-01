import { defineStore } from 'pinia'
import { getWeb3, connect } from '../utils.js'
import DAO from '../../../build/contracts/ExampleDao.json'

export const useStore = defineStore('dao', {
  state: () => {
    return {
      web3: null,
      accounts: null,
      contract: null,
      networkId: null,
      admin: null,
      currentAccount: null,
      daoBalance: 0,
      share: {
        percent: 0,
        total: 0,
        quorum: 0,
      },
      proposals: [],
      ongoingProposals: [],
    }
  },

  getters: {
    investorOpenProposals(state) {

      return state.newArrivals;
    },

    isFetching(state) {
      return state.fetching;
    }
  },

  actions: {
    async registerWeb3() {
        this.web3 = await getWeb3();
        this.accounts = await this.web3.eth.getAccounts();
        this.networkId = await this.web3.eth.net.getId();

        let deployedNetwork = DAO.networks[this.networkId];
        
        this.contract = new this.web3.eth.Contract(
            DAO.abi,
            deployedNetwork && deployedNetwork.address,
        );
        
        this.admin = await this.contract.methods.admin().call();
        this.currentAccount = await connect();
        await this.refreshBalance();
        await this.refreshSharePercent();
        await this.refreshProposals();
    },
    async refreshBalance() {
      this.daoBalance = await this.contract.methods.shares(this.currentAccount).call();
    },
    async refreshSharePercent() {
      let [shares, totalShares, quorum] = await Promise.all([
        this.contract.methods.shares(this.currentAccount).call(),
        this.contract.methods.totalShares().call(),
        this.contract.methods.quorum().call()
      ]);

      this.share.percent = ((shares * 100) / totalShares).toFixed(2);
      this.share.total = parseInt(totalShares);
      this.share.shares = parseInt(totalShares);
      this.share.quorum = parseInt(quorum);
    },
    async refreshProposals() {
      let proposals = await this.contract.methods.getAllProposals().call({from: this.admin});

      let allProposals = JSON.parse(JSON.stringify(proposals));

      for (let i = 0; i < allProposals.length; i++) { 
        let result = await this.contract.methods.votes(this.currentAccount, allProposals[i][0]).call({from: this.currentAccount});
        allProposals[i][7] = result; //bool, did current user already voted
        allProposals[i][8] = ((allProposals[i][6] == false) && (new Date(parseInt(allProposals[i][5]) * 1000)) > new Date().setHours(0, 0, 0, 0)); //is voting still valid
      }
      
      let inProgressProposals = allProposals.filter((proposal) => {
        return proposal[8] == true;
      });

      this.proposals = allProposals;
      this.ongoingProposals = inProgressProposals;
    }
  }
})