<template>
  <div>
    <h1>Transfer Share</h1>
    <form @submit="transferShare">
        <br>
        <div class="form-group">
            <label for="transferAmount">Transfer Amount</label>
            <input v-model="transfer.amount" type="number" class="form-control" id="transferAmount"/>
        </div>
        <div class="form-group">
            <label for="transferAddress">Transfer Address</label>
            <input v-model="transfer.address" type="text" class="form-control" id="transferAddress"/>
        </div>
        <br>
        <p class="h1">{{transfer.result}}</p>
        <ValidationErrors :errors="transfer.errors"></ValidationErrors>
        <button class="btn btn-primary">Transfer</button>
    </form>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
import ValidationErrors from '../ValidationErrors.vue';

export default {
  name: 'TransferShare',
  components: {
    ValidationErrors,
  },
  data() {
    return {
      transfer: {
        amount: null,
        address: null,
        result: null,
        errors: [],
      },
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    transferShare: async function (e) {
      e.preventDefault();

      let error = false;
      this.transfer.errors = [];

      if (!this.transfer.amount) {
        this.transfer.errors.push('Transfer amount is required.');
        error = true;
      }

      if (!this.transfer.address) {
        this.transfer.errors.push('Transfer address is required.');
        error = true;
      }

      if (error) {
        return false;
      }

      let transferPromise = this.daoStore.contract.methods.transferShare(this.transfer.amount, this.transfer.address).send({from: this.daoStore.currentAccount});

      transferPromise.then(() => {
        this.transfer.result = `ETH has been transfered.`;
        this.transfer.amount = '';
        this.transfer.address = '';
        this.daoStore.refreshBalance();
      }).catch((error) => {
        this.transfer.result = error;
      });
    }
  }
}
</script>

