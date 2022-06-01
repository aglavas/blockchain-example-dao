<template>
  <div>
    <h1>Create Proposal</h1>
    <form @submit="propose">
        <br>
        <div class="form-group">
            <label for="proposalName">Proposal Name</label>
            <input v-model="proposal.name" type="text" class="form-control" id="proposalName"/>
        </div>
        <div class="form-group">
            <label for="proposalAmount">Proposal Amount</label>
            <input v-model="proposal.amount" type="number" class="form-control" id="proposalAmount"/>
        </div>
        <div class="form-group">
            <label for="proposalAddress">Address</label>
            <input v-model="proposal.address" type="text" class="form-control" id="proposalAddress"/>
        </div>
        <br>
        <p class="h3">{{ proposal.result }}</p>
        <ValidationErrors :errors="proposal.errors"></ValidationErrors>
        <button class="btn btn-primary">Create</button>
    </form>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
import ValidationErrors from '../ValidationErrors.vue';

export default {
  name: 'CreateProposal',
  components: {
    ValidationErrors,
  },
  data() {
    return {
      proposal: {
        name: null,
        amount: 0,
        address: null,
        result: null,
        errors: [],
      }
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    propose: async function (e) {
      e.preventDefault();

      let error = false;
      this.proposal.errors = [];

      if (!this.proposal.name) {
        this.proposal.errors.push('Proposal name is required.');
        error = true;
      }

      if (!this.proposal.amount) {
        this.proposal.errors.push('Proposal amount is required.');
        error = true;
      }

      if (!this.proposal.address) {
        this.proposal.errors.push('Proposal address is required.');
        error = true;
      }

      if (error) {
        return false;
      }

      let proposalPromise = this.daoStore.contract.methods.createProposal(this.proposal.name, this.proposal.amount, this.proposal.address).send({from: this.daoStore.currentAccount, gas: 3000000});

      proposalPromise.then(() => {
        this.proposal.result = `Proposal has been created.`;
        this.proposal.name = '';
        this.proposal.amount = '';
        this.proposal.address = '';
        this.daoStore.refreshProposals();
      }).catch((error) => {
        this.proposal.result = error;
      });
    }
  }
}
</script>

