import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import Web3 from "web3";
import config from "../../config.json";
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

Vue.use(Vuetify);

Vue.config.productionTip = false;

Vue.$web3 = new Web3(config.RPC);
Vue.$contract = new Vue.$web3.eth.Contract(
  require("../../contracts/TokenGenerator.json"),
  config.tokenGeneratorContract
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");