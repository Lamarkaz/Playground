<template>
  <v-app>
    <div id="app">
      <v-container v-if="typeof $store.state.wallet.address != 'undefined'">
        {{$store.state.wallet.name}}
        <br>
        {{$store.state.wallet.address}}
        <br>
        <v-btn @click="$web3.eth.accounts.wallet.clear() && $store.dispatch('logout') && $localStorage.remove('wallet')">Logout</v-btn>
        <router-view/>
      </v-container>
      <Auth v-else/>
    </div>
  </v-app>
</template>

<script>
import Auth from "./components/Auth.vue";
export default {
  components: {
    Auth
  },
  created() {
    var self = this;
    window.onload = function() {
      self.$store.dispatch("bootstrap");
    };
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Raleway:300,400,500");

* {
  padding: 0;
  margin: 0;
}
html,
body,
#fullheight {
  min-height: 100% !important;
  height: 100%;
  background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%) !important;
}
#app {
  font-family: "Raleway", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  font-family: "Raleway", sans-serif;
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
