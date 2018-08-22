<template>
  <div>
    <div v-if="token.totalSupply > 0">
    Token Name: {{token.name}}
    <br>
    Balance: {{balance}} {{$route.params.symbol}}
    <br>
    Issuer: {{$store.state.names[token.generator]}}
    <br>
    <Send :token="token" :balance="balance"/>
    <br>
      <div v-for="item in orderedTxs" :key="item.hash">
        <div v-if="$store.getters.getName(item.sender) !=  'Token Mint'">
             <span>{{$store.getters.getName(item.sender)}} </span>
             sent
             <span>{{item.value}} {{$route.params.symbol}} </span>
             to
             <span>{{$store.getters.getName(item.recipient)}} </span>
             <span>{{item.timestamp}}</span>
            <br>
        </div>
        <div v-if="$store.getters.getName(item.sender) ===  'Token Mint'">
             <span>{{$store.getters.getName(item.recipient)}} </span>
             created
             <span>a new token called {{$route.params.symbol}} </span>
             <span>{{item.timestamp}}</span>
            <br>
        </div>
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
      txs: [],
      sub:false,
      interval:false
    };
  },
  methods:{
    getToken:function(){
    this.token = {}
    this.txs = []
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
        if(self.sub != false){
          self.sub.unsubscribe();
        }
        // Subscribe to txs
        self.sub = self.$contract.events.Transfer(
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
                self.txs.push(tx);
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
              });
            }
          }
        );
        if(self.interval != false) {
          clearInterval(self.interval)
        }
        // Update tx relative time every minute
        self.interval = setInterval(function() {
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
    }
  },
  created() {

  },
  computed: {
    orderedTxs: function() {
      return orderBy(this.txs, ["blockNumber"], ["desc", "asc"]);
    }
  },
  components: {
    Send
  },
  watch: {
    '$route.params.symbol':function() {
      this.getToken()
    }
  }
};
</script>
