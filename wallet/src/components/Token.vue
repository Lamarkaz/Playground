<template>
  <div>
    <div v-if="typeof $store.state.tokens[$route.params.symbol] != 'undefined'">
    <ul>
      <li v-for="item in $store.state.tokens[$route.params.symbol].txs" :key="item.hash">
        Sender: {{item.senderName}}
        <br>
        Recipient: {{item.recipientName}}
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
export default {
  name: "home"
};
</script>
