<template>
  <v-app>
    <div id="app">
      <div v-if="typeof $store.state.wallet.address != 'undefined'">
        <Toolbar/>
        <RecentTransactions onlyUser v-show='$store.state.showNotifications'/>
        <router-view v-show="!$store.state.showNotifications"/>
      </div>
      <Auth v-else/>
    </div>
  </v-app>
</template>

<script>
import Auth from "./components/Auth.vue";
import Toolbar from "./components/Toolbar.vue";
import RecentTransactions from "./components/RecentTransactions.vue"
export default {
  components: {
    Auth,
    Toolbar,
    RecentTransactions
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

* { padding: 0; margin: 0; }
html, body, #fullheight {
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
.swal-modal {
  font-family: 'Raleway', sans-serif !important;
}
.swal-button {
  background-color: #fbc02d;
  color: black;
  border: none;
  text-shadow: none;
}
</style>
