import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import Web3 from "web3";
import config from "../../config.json";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

Vue.config.productionTip = false;

Vue.prototype.$web3 = new Web3(config.RPC);
Vue.prototype.$contract = new Vue.prototype.$web3.eth.Contract(
  require("../../contracts/TokenGenerator.json"),
  config.tokenGeneratorContract
);
window.contract = Vue.prototype.$contract;
Vue.prototype.$whitelistContract = new Vue.prototype.$web3.eth.Contract(
  require("../../contracts/Whitelist.json"),
  config.whitelistContract
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
