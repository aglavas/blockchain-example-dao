<template>
  <div id="app" v-if="ready">
    <div class="container">
      <h1 class="text-center">ExampleDAO</h1>
      <div v-if="isAdminConnected"> 
        <h1>Admin</h1>
        <br>
        <AdminProposalList></AdminProposalList>
        <hr>
        <br>
        <Withdraw></Withdraw>
        <hr>
      </div>
      <div v-else>
        <h1>Investor</h1>
        <br>
        <InvestorProposalList></InvestorProposalList>
        <hr>
        <br>
        <div class="row">
          <div class="col-sm-4">
            <Contribute></Contribute>
          </div>
          <div class="col-sm-4">
            <Redeem></Redeem>
          </div>
          <div class="col-sm-4">
            <TransferShare></TransferShare>
          </div>
        </div>
        <br>
        <div class="row">
          <div class="col-sm-4">
            <CreateProposal></CreateProposal>
          </div>
          <div class="col-sm-4">
            
          </div>
          <div class="col-sm-4">
            
          </div>
        </div>
      </div>      
    </div>
  </div>
</template>

<script>
import AdminProposalList from './components/admin/ProposalList.vue';
import Withdraw from './components/admin/Withdraw.vue';
import InvestorProposalList from './components/investor/ProposalList.vue';
import Contribute from './components/investor/Contribute.vue';
import Redeem from './components/investor/Redeem.vue';
import TransferShare from './components/investor/TransferShare.vue';
import CreateProposal from './components/investor/CreateProposal.vue';
import { mapStores } from 'pinia'
import { useStore } from './store/dao.js'

export default {
  name: 'App',
  components: {
    InvestorProposalList,
    AdminProposalList,
    Withdraw,
    Contribute,
    Redeem,
    TransferShare,
    CreateProposal
  },
  data() {
    return {
      ready: false,
      proposals: []
    }
  },
  computed: {
    ...mapStores(useStore),
     isAdminConnected() {
        if (this.daoStore.currentAccount.toUpperCase() == this.daoStore.admin.toUpperCase()) {
          return true;
        }

        return false;
      }
  },
  async mounted() {
    await this.daoStore.registerWeb3();
    this.ready = true;
  },
  methods: {
    
  }
}
</script>


