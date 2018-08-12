<template>
  <div id="app">
    <router-view v-if="$store.state.wallet === {}"/>
    <Auth v-else/>
  </div>
</template>

<script>
import Auth from "./components/Auth.vue";
export default {
  components: {
    Auth
  },
  created () {
    this.dispatch("bootstrap");
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
