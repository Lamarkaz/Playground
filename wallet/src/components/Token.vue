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
    <ul>
      <li v-for="item in txs" :key="item.hash">
        <p v-if="item.senderName">Sender: {{item.senderName}}</p>
        <p v-else>Sender: {{item.sender}}</p>
        <br>
        <p v-if="item.recipientName">Recipient: {{item.recipientName}}</p>
        <p v-else>Recipient: {{item.recipient}}</p>
        <br>
        Amount: {{item.value}} {{$route.params.symbol}}
      </li>
    </ul>
    </div>
    <div v-else>
        This token does not exist
    </div>
  </div>
</template>

<script>
import { BigNumber } from "bignumber.js";
import Send from './Send.vue';
export default {
  name: "home",
  data () {
      return {
          token:{},
          balance:0,
          txs:[]
      }
  },
  created () {
    var self = this;
    // Get token info
    this.$contract.methods.getToken(this.$route.params.symbol).call({from:this.$store.state.wallet.address}).then(function(result){
        self.balance = result.balance;
        delete result.balance;
        result.symbol = self.$route.params.symbol;
        self.token = result;
        // Subscribe to txs
        self.$contract.events.Transfer({ filter:[{sender: self.$store.state.wallet.address}, {recipient: self.$store.state.wallet.address}], fromBlock: 0 }, function(
        err,
        event
        ) {
        if(event.returnValues.symbol === self.$route.params.symbol) {
            var tx = {
                hash: event.transactionHash,
                symbol: event.returnValues.symbol,
                sender: event.returnValues.sender,
                recipient: event.returnValues.recipient,
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
                    }else if (tx.sender === "0x0000000000000000000000000000000000000000"){
                        tx.senderName = "Token Mint"
                    }
                    self.txs.push(tx);
                });
                // Update user token balance on each new transaction involving them
                self.$contract.methods
                .balanceOf(self.$route.params.symbol, self.$store.state.wallet.address)
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
                whitelistContract.methods
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
                .balanceOf(self.$route.params.symbol, self.$store.state.wallet.address)
                .call()
                .then(function(result) {
                    self.balance = new BigNumber(result)
                    .div(10 ** self.token.decimals)
                    .toString(10);
                });
            }
        }
        
        });
    })
  },
  components:{
      Send
  }
};
</script>
