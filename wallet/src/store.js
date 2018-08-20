import Vue from "vue";
import Vuex from "vuex";
import Web3 from "web3";
import config from "../../config.json";
import { BigNumber } from "bignumber.js";

Vue.use(Vuex);

var web3 = new Web3(config.RPC);
var contract = new web3.eth.Contract(
  require("../../contracts/TokenGenerator.json"),
  config.tokenGeneratorContract
);
var whitelistContract = new web3.eth.Contract(
  require("../../contracts/Whitelist.json"),
  config.whitelistContract
);

var state = {
  tokens: {},
  wallet: {},
  names: {},
  namesArr: [],
  addresses: {}
};
var mutations = {
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
    setTimeout(function() {
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
    }, 500);
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
  getName: (state) => (address) =>{
    if(address.toUpperCase() === state.wallet.address.toUpperCase()) {
      return "You"
    } else if(address = "0x0000000000000000000000000000000000000000") {
      return "Token Mint"
    } else if(state.names[address] != null) {
      return state.names[address]
    } else {
      return address
    }
  }
}

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
});
