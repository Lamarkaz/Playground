import Vue from "vue";
import Vuex from "vuex";
import Web3 from "web3";
import config from "../../config.json";

Vue.use(Vuex);

var web3 = new Web3(config.RPC);
var contract = new web3.eth.Contract(
  require("../../contracts/TokenGenerator.json"),
  config.tokenGeneratorContract
);

var state = {
  tokens: {},
  wallet: {},
  subscription: {}
};
var mutations = {
  UPSERTTOKEN: function(state, token) {
    state.tokens[token.symbol] = token;
  },
  UPSERTUSER: function(state, address, name) {
    state.users[address] = name;
  },
  UPSERTTX: function(state, tx) {
    state.tokens[tx.symbol].txs[tx.transactionHash] = tx;
  },
  LOGIN: function(state, wallet, subscription) {
    state.wallet = wallet;
    state.subscription = subscription;
  },
  LOGOUT: function(state) {
    state.wallet = {};
    state.subscription.unsubscribe();
  }
};
var actions = {
  bootstrap: function(context) {
    contract.events.NewCoin({ fromBlock: 0 }, function(err, _event) {
      _event.returnValues.txs = {};
      context.commit("UPSERTTOKEN", _event.returnValues);
    });
  },
  login: function(context, wallet) {
    var subscription = contract.events.Transfer({ fromBlock: 0 }, function(
      err,
      event
    ) {
      contract.methods
        .getName("0x" + wallet.address)
        .call()
        .then(function(result) {
          wallet.name = result;
          context.commit("LOGIN", wallet, subscription);
          var tx = {
            hash: event.transactionHash,
            symbol: event.returnValues.symbol,
            sender: event.returnValues.sender,
            recipient: event.returnValues.recipient,
            value: event.returnValues.value
          };
          if (
            event.returnValues.recipient.toLowerCase() ===
            "0x" + wallet.address.toLowerCase()
          ) {
            contract.methods
              .getName(event.returnValues.sender)
              .call()
              .then(function(result) {
                tx.recipientName = state.wallet.name;
                if (result != "") {
                  tx.senderName = result;
                }
                context.commit("UPSERTTX", tx);
              });
          } else if (
            event.returnValues.sender.toLowerCase() ===
            "0x" + wallet.address.toLowerCase()
          ) {
            contract.methods
              .getName(event.returnValues.recipient)
              .call()
              .then(function(result) {
                tx.senderName = state.wallet.name;
                if (result != "") {
                  tx.recipientName = result;
                }
                context.commit("UPSERTTX", tx);
              });
          }
        });
    });
    state.tokens.forEach(function(doc) {
      contract.methods
        .balanceOf(doc.symbol, "0x" + wallet.address)
        .call()
        .then(function(result) {
          doc.balance = result;
          context.commit("UPSERTTOKEN", doc);
        });
    });
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions
});
