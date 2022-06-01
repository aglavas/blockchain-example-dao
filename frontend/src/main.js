import Vue from 'vue';
import App from './App.vue';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { createPinia, PiniaVuePlugin } from 'pinia';
//import { useStore } from './store/dao.js'

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

//const daoStore = useStore();

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  pinia
}).$mount('#app');

