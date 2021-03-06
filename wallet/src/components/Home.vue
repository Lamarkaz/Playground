<template>
  <div>
    <v-container>
      <h2 style="margin-bottom: 20px; color: black"><v-icon style="color: black">monetization_on</v-icon>Tokens</h2>
      <pie-chart label="Your Tokens" height="200px" class="bounceIn" legend="bottom" :donut="true" :data="tokenChart" v-if="tokenChart.length > 0"></pie-chart>
      <Create/>
    </v-container>
      <v-list two-line style="max-width: 500px; margin-left: auto; margin-right: auto; padding: 0px">
        <template v-if="item.balance && item.balance > 0" v-for="item in orderedTokens">
          <a :href="tokenUrl(item.symbol)" :key="item.symbol" style="text-decoration: none">
            <v-tooltip left color="black">
              <li class="token" slot="activator">
                <v-subheader>{{item.name}}</v-subheader>
                <v-list-tile-content>
                <v-list-tile-title style="margin-left: 23px; color: black">{{realBalance(item.balance, item.decimals)}} {{item.symbol}}</v-list-tile-title>
                <v-list-tile-sub-title style="margin-bottom: 8px; margin-left: 23px">Issued by {{getName(item.generator)}}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
              </li>
              <span>{{ uglyBal(item.balance, item.decimals) }} {{item.symbol}}</span>
            </v-tooltip>
          </a>
        </template>
      </v-list>
  </div>
</template>

<script>
import Create from "./Create.vue";
import { BigNumber } from "bignumber.js";
import orderBy from "lodash.orderby";
import numeral from "numeral";
import { mapGetters } from "vuex";

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
      if (
        BigNumber(balance)
          .div(10 ** decimals)
          .gt(1)
      ) {
        return new numeral(
          BigNumber(balance)
            .div(10 ** decimals)
            .toString(10)
        ).format("0a");
      } else {
        return new numeral(
          BigNumber(balance)
            .div(10 ** decimals)
            .toString(10)
        ).format("0.000a");
      }
    },
    uglyBal: function(balance, decimals) {
      return new BigNumber(balance).div(10 ** decimals).toNumber();
    }
  },
  computed: {
    ...mapGetters([
      "getName"
      // ...
    ]),
    orderedTokens: function() {
      var arr = [];
      for (var i = 0; i < this.tokens.length; i++) {
        var token = this.tokens[i];
        token.uglyBalance = new BigNumber(token.balance)
          .div(10 ** token.decimals)
          .toNumber();
        arr.push(token);
      }
      return orderBy(this.tokens, ["uglyBalance"], ["desc", "asc"]);
    },
    tokenChart: function() {
      var arr = [];
      for (var i = 0; i < this.tokens.length; i++) {
        if (this.tokens[i].balance && this.tokens[i].balance > 0) {
          var token = [];
          token.push(this.tokens[i].symbol);
          token.push(
            new BigNumber(this.tokens[i].balance).div(
              10 ** this.tokens[i].decimals
            )
          );
          arr.push(token);
        }
      }
      return arr;
    }
  },
  components: {
    Create
  },
  created() {
    var self = this;
    // Get all tokens
    this.$web3.eth.net.isListening().then(function() {
      self.$contract.events.NewToken({ fromBlock: 0 }, function(err, event) {
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
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translate3d(0, 0, 0);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(0.89);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate3d(0, 0, 0);
  }
}
</style>
