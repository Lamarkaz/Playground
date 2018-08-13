<template>
  <div>
    <Create/>
    <ul>
      <li v-if="item.balance" v-for="item in $store.state.tokens" :key="item.symbol">
        <a :href="tokenUrl(item.symbol)">Token Name: {{item.name}}</a>
        <br>
        Balance: {{$store.state.tokens[item.symbol].balance}} {{item.symbol}}
        <br>
        Issuer: {{$store.state.names[item.generator]}}  
      </li>
    </ul>
  </div>
</template>

<script>
import Create from "./Create.vue";
export default {
  name: "home",
  methods: {
    tokenUrl: function(symbol) {
      return "/#/token/" + symbol;
    }
  },
  components: {
    Create
  }
};
</script>
