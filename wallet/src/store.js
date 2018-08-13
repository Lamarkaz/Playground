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
  addresses: {},
  subscription: {},
};
var mutations = {
  UPSERTTOKEN: function(state, token) {
    state.tokens[token.symbol] = token;
  },
  CHANGEBALANCE: function(state, obj) {
    state.tokens[obj.symbol].balance = obj.balance;
  },
  UPSERTUSER: function(state, address, name) {
    state.users[address] = name;
  },
  UPSERTTX: function(state, tx) {
    state.tokens[tx.symbol].txs[tx.hash] = tx;
  },
  UPSERTNAME: function(state, obj) {
    state.names[obj.address] = obj.name;
    state.addresses[obj.name] = obj.address;
  },
  LOGIN: function(state, wallet, subscription) {
    state.wallet = wallet;
    state.subscription = subscription;
  },
  LOGOUT: function(state) {
    state.wallet = {};
  }
};
var actions = {
  bootstrap: function(context) {
    setTimeout(function() {
      // Get all tokens
      contract.events.NewToken({ fromBlock: 0 }, function(err, event) {
        if (
          event.returnValues.symbol === event.returnValues.symbol.toUpperCase()
        ) {
          // Reject tokens with symbols that are not 100% uppercase. This frontend validation helps keep unique symbols.
          event.returnValues.txs = {};
          event.returnValues.balance = {};
          context.commit("UPSERTTOKEN", event.returnValues);
        }
      });
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
    // Subscribe to txs
    var subscription = contract.events.Transfer({ fromBlock: 0 }, function(
      err,
      event
    ) {
      var tx = {
        hash: event.transactionHash,
        symbol: event.returnValues.symbol,
        sender: event.returnValues.sender,
        recipient: event.returnValues.recipient,
        value: new BigNumber(event.returnValues.value)
          .div(10 ** state.tokens[event.returnValues.symbol].decimals)
          .toString(10)
      };
      if (
        event.returnValues.recipient.toLowerCase() ===
        wallet.address.toLowerCase()
      ) {
        whitelistContract.methods
          .getName(event.returnValues.sender)
          .call()
          .then(function(result) {
            tx.recipientName = state.wallet.name;
            if (result != "") {
              tx.senderName = result;
            }
            context.commit("UPSERTTX", tx);
          });
        contract.methods
          .balanceOf(event.returnValues.symbol, wallet.address)
          .call()
          .then(function(result) {
            var token = state.tokens[event.returnValues.symbol];
            var balance = new BigNumber(result)
              .div(10 ** token.decimals)
              .toString(10);
            context.commit("CHANGEBALANCE", {symbol:token.symbol, balance:balance});
          });
      } else if (
        event.returnValues.sender.toLowerCase() ===
        wallet.address.toLowerCase()
      ) {
        whitelistContract.methods
          .getName(event.returnValues.recipient)
          .call()
          .then(function(result) {
            tx.senderName = state.wallet.name;
            if (result != "") {
              tx.recipientName = result;
            }
            context.commit("UPSERTTX", tx);
          });
        // Update user token balance on each new transaction involving him
        contract.methods
          .balanceOf(event.returnValues.symbol, wallet.address)
          .call()
          .then(function(result) {
            var token = state.tokens[event.returnValues.symbol];
            var balance = new BigNumber(result)
              .div(10 ** token.decimals)
              .toString(10);
            context.commit("CHANGEBALANCE", {symbol:token.symbol, balance:balance});
          });
      }
    });
    // Register wallet and subscription
    whitelistContract.methods
    .getName(wallet.address)
    .call()
    .then(function(result) {
      wallet.name = result;
      context.commit("LOGIN", wallet, subscription);
    });
    // Get my balance in each token
    for (var key in state.tokens) {
      var token = state.tokens[key];
      contract.methods
        .balanceOf(token.symbol, wallet.address)
        .call()
        .then(function(result) {
          var balance = new BigNumber(result)
            .div(10 ** token.decimals)
            .toString(10);
          context.commit("CHANGEBALANCE", {symbol:token.symbol, balance:balance});
        });
    }
  },
  logout: function(context) {
    context.commit("LOGOUT");
    state.subscription.unsubscribe();
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions
});
