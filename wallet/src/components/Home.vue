<template>
  <div>
    <Create/>
    <ul>
      <li v-if="item.balance && item.balance > 0" v-for="item in orderedTokens" :key="item.symbol">
        <a :href="tokenUrl(item.symbol)">Token Name: {{item.name}}</a>
        <br>
        Balance: {{realBalance(item.balance, item.decimals)}} {{item.symbol}}
        <br>
        Issuer: {{$store.state.names[item.generator]}}
      </li>
    </ul>
  </div>
</template>

<script>
import Create from "./Create.vue";
import { BigNumber } from "bignumber.js";
import orderBy from 'lodash.orderby';

export default {
  name: "home",
  data () {
    return {
      tokens: []
    }
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
      orderedTokens: function () {
          return orderBy(this.tokens, ['balance'], ['desc', 'asc'])
      }
  },
  components: {
    Create
  },
  created () {
    var self = this;
    // Get all tokens
    this.$contract.events.NewToken({ fromBlock: 0 }, function(err, event) {
      if (
        // Reject tokens with symbols that are not 100% uppercase. This frontend validation helps keep unique symbols.
        event.returnValues.symbol === event.returnValues.symbol.toUpperCase()
      ) {
        self.$contract.methods.getToken(event.returnValues.symbol).call({from:self.$store.state.wallet.address}).then(function(result){
          result.symbol = event.returnValues.symbol;
          self.tokens.push(result);
        })
      }
    });
  }
};
</script>
