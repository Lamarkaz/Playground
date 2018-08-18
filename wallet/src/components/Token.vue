<template>
  <div>
    <div v-if="token != {}">
    Token Name: {{token.name}}
    <br>
    Balance: {{balance}} {{$route.params.symbol}}
    <br>
    Issuer: {{$store.state.names[token.generator]}}
    <br>
    <Send :token="token" :balance="balance"/>
    <br>
      <div v-for="item in orderedTxs" :key="item.hash">
        <span v-if="item.senderName">{{item.senderName}} </span>
        <span v-else>{{item.sender}} </span>
        sent
        <span>{{item.value}} {{$route.params.symbol}} </span>
        to
        <span v-if="item.recipientName">{{item.recipientName}} </span>
        <span v-else>Recipient: {{item.recipient}} </span>
        <span>{{item.timestamp}}</span>
        <br>
      </div>
    </div>
    <div v-else>
        This token does not exist
    </div>
  </div>
</template>

<script>
import { BigNumber } from "bignumber.js";
import Send from "./Send.vue";
import orderBy from "lodash.orderby";
import moment from "moment";
export default {
  name: "home",
  data() {
    return {
      token: {},
      balance: 0,
      txs: []
    };
  },
  created() {
    var self = this;
    // Get token info
    this.$contract.methods
      .getToken(this.$route.params.symbol)
      .call({ from: this.$store.state.wallet.address })
      .then(function(result) {
        self.balance = new BigNumber(result.balance)
          .div(10 ** result.decimals)
          .toString(10);
        delete result.balance;
        result.symbol = self.$route.params.symbol;
        self.token = result;
        // Subscribe to txs
        self.$contract.events.Transfer(
          {
            filter: [
              { sender: self.$store.state.wallet.address },
              { recipient: self.$store.state.wallet.address }
            ],
            fromBlock: 0
          },
          function(err, event) {
            if (event.returnValues.symbol === self.$route.params.symbol) {
              self.$web3.eth.getBlock(event.blockNumber, function(err, block) {
                var tx = {
                  hash: event.transactionHash,
                  symbol: event.returnValues.symbol,
                  sender: event.returnValues.sender,
                  recipient: event.returnValues.recipient,
                  blockNumber: event.blockNumber,
                  unixTimestamp: block.timestamp,
                  timestamp: moment(block.timestamp * 1000)
                    .startOf("second")
                    .fromNow(),
                  value: new BigNumber(event.returnValues.value)
                    .div(10 ** self.token.decimals)
                    .toString(10)
                };
                if (
                  tx.recipient.toLowerCase() ===
                  self.$store.state.wallet.address.toLowerCase()
                ) {
                  self.$whitelistContract.methods
                    .getName(event.returnValues.sender)
                    .call()
                    .then(function(result) {
                      tx.recipientName = self.$store.state.wallet.name;
                      if (result != "") {
                        tx.senderName = result;
                      } else if (
                        tx.sender ===
                        "0x0000000000000000000000000000000000000000"
                      ) {
                        tx.senderName = "Token Mint";
                      }
                      self.txs.push(tx);
                    });
                  // Update user token balance on each new transaction involving them
                  self.$contract.methods
                    .balanceOf(
                      self.$route.params.symbol,
                      self.$store.state.wallet.address
                    )
                    .call()
                    .then(function(result) {
                      self.balance = new BigNumber(result)
                        .div(10 ** self.token.decimals)
                        .toString(10);
                    });
                } else if (
                  tx.sender.toLowerCase() ===
                  self.$store.state.wallet.address.toLowerCase()
                ) {
                  self.$whitelistContract.methods
                    .getName(event.returnValues.recipient)
                    .call()
                    .then(function(result) {
                      tx.senderName = self.$store.state.wallet.name;
                      if (result != "") {
                        tx.recipientName = result;
                      }
                      self.txs.push(tx);
                    });
                  // Update user token balance on each new transaction involving them
                  self.$contract.methods
                    .balanceOf(
                      self.$route.params.symbol,
                      self.$store.state.wallet.address
                    )
                    .call()
                    .then(function(result) {
                      self.balance = new BigNumber(result)
                        .div(10 ** self.token.decimals)
                        .toString(10);
                    });
                }
              });
            }
          }
        );
        // Update tx relative time every minute
        setInterval(function() {
          var newArr = [];
          for (var i = 0; i < self.txs.length; i++) {
            var tx = self.txs[i];
            tx.timestamp = moment(tx.unixTimestamp * 1000)
              .startOf("second")
              .fromNow();
            newArr.push(tx);
          }
          self.txs = newArr;
        }, 60000);
      });
  },
  computed: {
    orderedTxs: function() {
      return orderBy(this.txs, ["blockNumber"], ["desc", "asc"]);
    }
  },
  components: {
    Send
  }
};
</script>
