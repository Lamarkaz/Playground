<template>
  <div>
    <div v-if="token.totalSupply > 0" style="margin-top: 15px; max-width: 600px; margin-left: auto; margin-right: auto">
      <div class="tokenBalance">
        <h3 style="color: black; font-size: 18px">{{prettyBalance}} </h3>
        <h1 style="color: black; font-size: 32px">{{$route.params.symbol}}</h1>
      </div>
      Token Name: {{token.name}}
      <br>
      Issuer: {{$store.state.names[token.generator]}}
      <Send :token="token" :balance="balance" style="margin-top: 15px"/>
      <br>
      <v-list two-line style="margin-left: auto; margin-right: auto; padding: 0px; word-break: 10">
        <template v-for="item in orderedTxs">
            <li class="token" :key="item.hash">
              <div v-if="$store.getters.getName(item.sender) !=  'Token Mint'">
                <v-list-tile-sub-title style="height: 80px; font-weight: 500; padding-top: 20px">
                  <span>{{$store.getters.getName(item.sender)}} </span>
                  <span></span>
                  sent
                  <span>{{item.value}} {{$route.params.symbol}} </span>
                  to
                  <span>{{$store.getters.getName(item.recipient)}} </span>
                  <br/>
                  <span>{{item.timestamp}}</span>
                </v-list-tile-sub-title>
                <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
              </div>

              <div v-if="$store.getters.getName(item.sender) ===  'Token Mint'">
                <v-list-tile-sub-title style="height: 80px; font-weight: 500; padding-top: 20px">{{item.name}}
                  <span>{{$store.getters.getName(item.recipient)}} </span>
                  created
                  <span>a new token called {{$route.params.symbol}} </span>
                  <br/>
                  <span>{{item.timestamp}}</span>
                </v-list-tile-sub-title>
                <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
              </div>
            </li>
        </template>
      </v-list>
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
import numeral from "numeral";
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
            if (event.returnValues.symbol === self.$route.params.symbol && (event.returnValues.sender === self.$store.state.wallet.address || event.returnValues.recipient === self.$store.state.wallet.address)) {
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
    this.getToken()
  },
  computed: {
    orderedTxs: function() {
      return orderBy(this.txs, ["blockNumber"], ["desc", "asc"]);
    },
    prettyBalance: function() {
      if(this.balance > 1){
        return numeral(this.balance).format('0a');
      }
      else {
        return numeral(this.balance).format('0.00a');
      }
      
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

<style scoped>
.tokenBalance {
  background-color: rgb(251, 192, 45);
  width: 170px;
  height: 170px;
  border-radius: 999px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 15px;
  margin-bottom: 15px;
  padding-top: 45px;
}
</style>
