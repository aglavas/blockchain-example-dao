<template>
  <div>
    <h1>Contribute</h1>
    <form @submit="contributeEth">
        <br>
        <div class="form-group">
            <label for="contributeAmount">Contribution Amount</label>
            <input v-model="contribute.amount" type="number" class="form-control" id="contributeAmount"/>
        </div>
        <br>
        <p class="h3">{{ contribute.result }}</p>
        <ValidationErrors :errors="contribute.errors"></ValidationErrors>
        <button class="btn btn-primary">Contribute</button>
    </form>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { useStore } from '../../store/dao.js'
import ValidationErrors from '../ValidationErrors.vue';

export default {
  name: 'Contribute',
  components: {
    ValidationErrors,
  },
  data() {
    return {
      contribute: {
        amount: null,
        result: null,
        errors: [],
      }
    }
  },
  computed: {
    ...mapStores(useStore)
  },
  methods: {
    contributeEth: async function (e) {
      e.preventDefault();

      let error = false;
      this.contribute.errors = [];

      if (!this.contribute.amount) {
        this.contribute.errors.push('Contribution ammount is required.');
        error = true;
      }

      if (error) {
        return false;
      }

      let contributePromise = this.daoStore.contract.methods.contribute().send({from: this.daoStore.currentAccount, value: this.contribute.amount, gas: 3000000});

      contributePromise.then(() => {
        this.contribute.result = `ETH has been contributed.`;
        this.contribute.amount = '';
        this.daoStore.refreshBalance();
      }).catch((error) => {
        this.contribute.result = error;
      });
    }
  }
}
</script>

