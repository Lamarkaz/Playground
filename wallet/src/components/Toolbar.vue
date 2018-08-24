<template>
  <div>
    <v-progress-linear :indeterminate="true" height="5" color="yellow darken-2" style="margin: 0px"></v-progress-linear>
    <v-toolbar dark flat height="70">
      <v-toolbar-title style="color: #fbc02d; font-weight: 700; font-size: 18px">
        Playground Wallet
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip color="black" bottom>
        <v-btn dark icon slot="activator" @click="$router.push('/'); $store.commit('NOTIFICATIONS', false)">
          <v-icon :color="homeIcon">attach_money</v-icon>
        </v-btn>
        <span>Tokens</span>
      </v-tooltip>
      <v-tooltip color="black" bottom>
        <v-btn icon slot="activator" @click="$store.commit('CLEARNOTIFICATIONS'); $store.commit('NOTIFICATIONS', !$store.state.showNotifications)">
        <v-badge overlap :value="$store.state.notifications" color="red">
        <span slot="badge">{{$store.state.notifications}}</span>
          <v-icon :color="notifyIcon">notifications_none</v-icon>
          </v-badge>
        </v-btn>
        <span>Notifcations</span>
      </v-tooltip>
      <v-menu dark bottom :close-on-content-click="false" transition="slide-y-transition">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-avatar>
                <v-gravatar :hash="gravatarHash" class="vGravatar"/>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title style="color: #fbc02d">{{ $store.state.wallet.name }}</v-list-tile-title>
                <v-list-tile-sub-title style="word-break: break-all">{{ $store.state.wallet.address }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-tile>
              <v-list-tile-title style="cursor: pointer" @click="$web3.eth.accounts.wallet.clear() && $store.dispatch('logout') && $localStorage.remove('wallet')"><v-icon style="font-size: 20px; margin-right: 10px">exit_to_app</v-icon>Logout</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-menu>
    </v-toolbar>  
  </div>
</template>

<script>
import md5 from 'js-md5'

export default {
  data: () => ({
    dropdownBtns: [
      { title: 'Copy Address' },
      { title: 'Logout' }
    ],
  }),
  computed: {
    gravatarHash: function () {
      return md5(this.$store.state.wallet.address)
    },
    homeIcon: function () {
      if(this.$store.state.showNotifications) {
        return 'white'
      }else{
        return 'yellow darken-2'
      }
    },
    notifyIcon: function () {
      if(this.$store.state.showNotifications) {
        return 'yellow darken-2'
      }
      else {
        return 'white'
      }
    }
  }
}
</script>

<style scoped>
.v-list__tile {
  cursor: pointer !important;
}
.v-list__tile:hover {
  background: #4c4c4c !important;
}
</style>