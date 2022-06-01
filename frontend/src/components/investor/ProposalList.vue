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
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(proposal, index) in daoStore.ongoingProposals" :key="index">
                        <td>{{ proposal[0] }}</td>
                        <td>{{ proposal[1] }}</td>
                        <td>{{ proposal[2] }}</td>
                        <td>{{ proposal[3] }}</td>
                        <td>{{ votesPercent }}</td>
                        <td>{{( new Date(parseInt(proposal[5]) * 1000)).toLocaleString() }}</td>
                        <td>
                          <div v-if="!proposal[7]">
                            <form @submit="vote($event, proposal[0])">
                              <button class="btn btn-primary">Vote</button>
                            </form>
                          </div>
                          <div v-else>
                            You already voted
                          </div>
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
  name: 'InvestorProposalList',
  data() {
    return {
      
    }
  },
  computed: {
    ...mapStores(useStore),
    votesPercent() {
      return this.daoStore.share.percent + '%';
    }
  },
  methods: {
    vote(e, proposalId) {
      e.preventDefault();
      let votePromise = this.daoStore.contract.methods.vote(proposalId).send({from: this.daoStore.currentAccount, gas: 3000000});

      votePromise.then(() => {
        this.daoStore.refreshProposals();
        this.daoStore.refreshSharePercent();
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}
</script>

