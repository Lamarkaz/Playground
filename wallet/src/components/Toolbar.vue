<template>
  <div>
    <v-progress-linear :indeterminate="true" height="5" color="yellow darken-2" style="margin: 0px"></v-progress-linear>
    <v-toolbar dark flat height="70">
      <v-toolbar-title style="color: #fbc02d; font-weight: 700; font-size: 18px">
        Playground Wallet
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip color="black" bottom>
        <v-btn dark icon slot="activator" @click="$router.push('/')">
          <v-icon>attach_money</v-icon>
        </v-btn>
        <span>Tokens</span>
      </v-tooltip>
      <!-- 
      <v-tooltip color="black" bottom>
        <v-btn icon slot="activator">
          <v-icon>notifications_none</v-icon>
        </v-btn>
        <span>Notifcations</span>
      </v-tooltip>
      -->
      <v-menu dark bottom open-on-hover :close-on-content-click="false" transition="slide-y-transition">
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