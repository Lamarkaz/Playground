import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";
import Token from "./components/Token.vue";
import Recent from "./components/RecentTransactions.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/token/:symbol",
      name: "token",
      component: Token
    },
    {
      path: "/recent",
      name: "recent",
      component: Recent
    }
  ]
});
