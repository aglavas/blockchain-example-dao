<template>
  <div>
    <div class="row">
        <div class="col-sm-12">
            <h2>Withdraw ETH</h2>
            <form @submit="withdrawEth">
                <div class="form-group">
                <label for="name">Recipient Address</label>
                <input v-model="withdraw.recipient" type="text" class="form-control" id="name" />
                </div>
                <div class="form-group">
                <label for="choices">Amount</label>
                <input v-model="withdraw.amount" type="text" class="form-control" id="choices" />
                </div>
                <br>
                <p class="h1">{{withdraw.result}}</p>
                <ValidationErrors :errors="withdraw.errors"></ValidationErrors>
                <button class="btn btn-primary">Submit</button>
            </form>
        </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
import ValidationErrors from '../ValidationErrors.vue';

export default {
  name: 'Withdraw',
  components: {
    ValidationErrors,
  },
  data() {
    return {
      withdraw: {
        recipient: null,
        amount: null,
        result: null,
        errors: []
      }
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    withdrawEth: async function (e) {
      e.preventDefault();

      let error = false;
      this.withdraw.errors = [];

      if (!this.withdraw.recipient) {
        this.withdraw.errors.push('Withdraw recipient is required.');
        error = true;
      }

      if (!this.withdraw.amount) {
        this.withdraw.errors.push('Withdraw ammount is required.');
        error = true;
      }

      if (error) {
        return false;
      }

      let withdrawPromise = this.daoStore.contract.methods.withdrawEther(this.withdraw.amount, this.withdraw.recipient).send({from: this.daoStore.currentAccount, gas: 3000000});

      withdrawPromise.then(() => {
        this.withdraw.result = `ETH has been withdrawn.`;
        this.withdraw.amount = '';
        this.withdraw.recipient = '';
        this.daoStore.refreshBalance();
        this.daoStore.refreshSharePercent();
      }).catch((error) => {
        this.withdraw.result = error;
      });
    }
  }
}
</script>

