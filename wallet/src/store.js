import Vue from "vue";
import Vuex from "vuex";
import Web3 from "web3";
import config from "../../config.json";
import { BigNumber } from "bignumber.js";

Vue.use(Vuex);

var web3 = new Web3(config.RPC);
var whitelistContract = new web3.eth.Contract(
  require("../../contracts/Whitelist.json"),
  config.whitelistContract
);

var state = {
  tokens: {},
  wallet: {},
  names: {},
  namesArr: [],
  addresses: {},
  notifications:0,
  showNotifications:false
};
var mutations = {
  NOTIFY: function(state) {
    state.notifications++;
  },
  NOTIFICATIONS: function(state, value) {
    state.showNotifications = value
  },
  CLEARNOTIFICATIONS: function(state) {
    state.notifications = 0;
  },
  UPSERTNAME: function(state, obj) {
    state.names[obj.address] = obj.name;
    state.addresses[obj.name] = obj.address;
    state.namesArr.push(obj.name);
  },
  LOGIN: function(state, wallet) {
    state.wallet = wallet;
  },
  LOGOUT: function(state) {
    state.wallet = {};
  },
  REMOVENAME: function(state, name) {
    var address = state.addresses[name];
    delete state.addresses[name];
    delete state.names[address];
    var index = state.namesArr.indexOf(name);
    if (index > -1) {
      state.namesArr.splice(index, 1);
    }
  }
};
var actions = {
  bootstrap: function(context) {
      // Get all names
      whitelistContract.events.Whitelisted({ fromBlock: 0 }, function(
        err,
        event
      ) {
        whitelistContract.methods
          .whitelist(event.returnValues.user)
          .call()
          .then(function(result) {
            if (result.whitelisted) {
              context.commit("UPSERTNAME", {
                address: event.returnValues.user,
                name: result.name
              });
            }
          });
      });
  },
  login: function(context, wallet) {
    // Get name and register wallet
    whitelistContract.methods
      .getName(wallet.address)
      .call()
      .then(function(result) {
        wallet.name = result;
        context.commit("LOGIN", wallet);
      });
  },
  logout: function(context) {
    context.commit("LOGOUT");
  }
};

var getters = {
  getName: (state) => (address) => {
    if(address.toUpperCase() === state.wallet.address.toUpperCase()) {
      return "You"
    } else if(address === "0x0000000000000000000000000000000000000000") {
      return "Token Mint"
    } else if(typeof state.names[address] != 'undefined') {
      return state.names[address]
    } else {
      return 'Unknown (' + address + ')'
    }
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
});
