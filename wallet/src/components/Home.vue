<template>
  <div>
    <Toolbar/>
    <v-container>
      <h2 style="margin-bottom: 20px; color: black"><v-icon style="color: black">apps</v-icon>Home</h2>
      <pie-chart label="Your Tokens" height="200px" class="bounceIn" legend="bottom" :donut="true" :data="tokenChart" v-if="tokenChart.length > 0"></pie-chart>
      <Create/>
    </v-container>
      <v-list two-line style="max-width: 500px; margin-left: auto; margin-right: auto; padding: 0px">
        <template v-if="item.balance && item.balance > 0" v-for="item in orderedTokens">
          <li class="token" :key="item.symbol">
            <v-subheader :href="tokenUrl(item.symbol)">Token Name: {{item.name}}</v-subheader>
            <v-list-tile-content style="text-align: center">
            <v-list-tile-title style="margin-left: 20px">Balance: {{realBalance(item.balance, item.decimals)}} {{item.symbol}}</v-list-tile-title>
            <v-list-tile-sub-title style="margin-bottom: 8px">Issuer: {{$store.getters.getName(item.generator)}}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
          </li>
        </template>
      </v-list>
        <v-btn
          color="yellow darken-2"
          dark
          bottom
          right
          fab
        >
          <v-icon color="black">add</v-icon>
        </v-btn>
  </div>
</template>

<script>
import Toolbar from "./Toolbar.vue";
import Create from "./Create.vue";
import { BigNumber } from "bignumber.js";
import orderBy from "lodash.orderby";

export default {
  name: "home",
  data() {
    return {
      tokens: []
    };
  },
  methods: {
    tokenUrl: function(symbol) {
      return "/#/token/" + symbol;
    },
    realBalance: function(balance, decimals) {
      return new BigNumber(balance).div(10 ** decimals).toString(10);
    }
  },
  computed: {
    orderedTokens: function() {
      return orderBy(this.tokens, ["balance"], ["desc", "asc"]);
    },
    tokenChart: function() {
      var arr = [];
      for(var i = 0; i<this.tokens.length; i++){
        if(this.tokens[i].balance && this.tokens[i].balance > 0){
          var token = []
          token.push(this.tokens[i].symbol);
          token.push(this.realBalance(this.tokens[i].balance, this.tokens[i].decimals))
          arr.push(token)
        }
      }
      return arr
    }
  },
  components: {
    Toolbar,
    Create
  },
  created() {
    var self = this;
    // Get all tokens
    this.$contract.events.NewToken({ fromBlock: 0 }, function(err, event) {
      if (
        // Reject tokens with symbols that are not 100% uppercase. This frontend validation helps keep unique symbols.
        event.returnValues.symbol === event.returnValues.symbol.toUpperCase()
      ) {
        self.$contract.methods
          .getToken(event.returnValues.symbol)
          .call({ from: self.$store.state.wallet.address })
          .then(function(result) {
            result.symbol = event.returnValues.symbol;
            self.tokens.push(result);
          });
      }
    });
  }
};
</script>

<style scoped>
.bounceIn {
  opacity: 0;
  animation-name: bounceIn;
  animation-duration: 450ms;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-delay: 0.3s;
}
.token {
  -webkit-transition: all 0.7s; /* Safari */
  transition: all 0.7s;
}
.token:hover {
  background-color: #eee;
  cursor: pointer;
}

@keyframes bounceIn{
  0%{
    opacity: 0;
    transform: scale(0.3) translate3d(0,0,0);
  }
  50%{
    opacity: 0.9;
    transform: scale(1.1);
  }
  80%{
    opacity: 1;
    transform: scale(0.89);
  }
  100%{
    opacity: 1;
    transform: scale(1) translate3d(0,0,0);
  }
}
</style>

