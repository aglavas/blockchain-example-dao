<template>
  <div>
    <div class="row">
        <div class="col-sm-12">
            <h2>Proposals</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Recipient</th>
                        <th>Votes</th>
                        <th>Ends on</th>
                        <th>Executed</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(proposal, index) in daoStore.proposals" :key="index">
                        <td>{{ proposal[0] }}</td>
                        <td>{{ proposal[1] }}</td>
                        <td>{{ proposal[2] }}</td>
                        <td>{{ proposal[3] }}</td>
                        <td>{{ getVotesPercent(proposal[4]) }} ({{ daoStore.share.quorum }}% needed)</td>
                        <td>{{( new Date(parseInt(proposal[5]) * 1000)).toLocaleString() }}</td>
                        <td>{{ proposal[6] }}</td>
                        <td v-if="proposal[6] == false">
                          <form @submit="executeProposal($event, proposal[0], index)">
                              <button class="btn btn-primary">Execute Proposal</button>
                          </form>
                          <p v-bind:id="'executeResult_' + index"></p>
                        </td>
                        <td v-else>
                          Executed successfully
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
export default {
  name: 'AdminProposalList',
  data() {
    return {
      results: []
    }
  },
  computed: {
    ...mapStores(useStore),
  },
  methods: {
    executeProposal(e, proposalId, index) {
      e.preventDefault();
      
      document.getElementById('executeResult_' + index).innerHTML = '';
      let executePromise = this.daoStore.contract.methods.executeProposal(proposalId).send({from: this.daoStore.currentAccount, gas: 3000000});

      executePromise.then(() => {
        this.daoStore.refreshProposals();
        this.daoStore.refreshSharePercent();
        document.getElementById('executeResult_' + index).innerHTML = "Execute successful.";
      }).catch((error) => {
        document.getElementById('executeResult_' + index).innerHTML = error;
      });
    },
    getVotesPercent(votes) {
      return ((votes * 100) / this.daoStore.share.total).toFixed(2) + '%';
    }
  }
}
</script>

