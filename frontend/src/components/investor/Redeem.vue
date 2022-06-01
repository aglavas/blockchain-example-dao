<template>
  <div>
    <h1>Redeem</h1>
    <form @submit="redeemEth">
        <div class="form-group">
        <label>Current balance in DAO: {{ daoStore.daoBalance }} WEI </label>
        </div>
        <div class="form-group">
        <label for="redeemAmount">Redeem Amount</label>
        <input v-model="redeem.amount" type="number" class="form-control" id="redeemAmount" />
        </div>
        <br>
        <p class="h3">{{ redeem.result }}</p>
        <ValidationErrors :errors="redeem.errors"></ValidationErrors>
        <button class="btn btn-primary">Redeem</button>
    </form>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
import ValidationErrors from '../ValidationErrors.vue';

export default {
  name: 'Redeem',
  components: {
    ValidationErrors,
  },
  data() {
    return {
      redeem: {
        amount: null,
        result: null,
        errors: [],
      },
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    redeemEth: async function (e) {
      e.preventDefault();

      let error = false;
      this.redeem.errors = [];

      if (!this.redeem.amount) {
        this.redeem.errors.push('Redeem amount is required.');
        error = true;
      }

      if (error) {
        return false;
      }

      let redeemPromise = this.daoStore.contract.methods.redeem(this.redeem.amount).send({from: this.daoStore.currentAccount});

      redeemPromise.then(() => {
        this.redeem.result = `ETH has been redeemed.`;
        this.redeem.amount = '';
        this.daoStore.refreshBalance();
      }).catch((error) => {
        this.redeem.result = error;
      });
    }
  }
}
</script>

