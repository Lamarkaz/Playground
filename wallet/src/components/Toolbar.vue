<template>
  <div>
    <v-progress-linear :indeterminate="true" height="5" color="yellow darken-2" style="margin: 0px"></v-progress-linear>
    <v-toolbar dark flat height="70">
      <v-toolbar-title style="color: #fbc02d; font-weight: 700">Playground Wallet</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <v-btn dark icon slot="activator">
          <v-icon>list_alt</v-icon>
        </v-btn>
        <span>Home</span>
      </v-tooltip>
      <v-tooltip bottom>
        <v-btn icon slot="activator">
          <v-icon>notification_important</v-icon>
        </v-btn>
        <span>Notifcations</span>
      </v-tooltip>
      <v-menu dark bottom open-on-hover :close-on-content-click="false" transition="slide-y-transition">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-avatar>
                <v-gravatar :hash="getHash($store.state.wallet.address)" class="vGravatar"/>
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
              <v-list-tile-title style="cursor: pointer" @click=""><v-icon style="margin-right: 3px">short_text</v-icon>Copy Address</v-list-tile-title>
            </v-list-tile>

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
export default {
  data: () => ({
    dropdownBtns: [
      { title: 'Copy Address' },
      { title: 'Logout' }
    ],
  }),
  methods: {
    getHash: function (buffer, algo = "SHA-256") {
      return crypto.subtle.digest(algo, buffer)
        .then(hash => {
          // here hash is an arrayBuffer, so we'll convert it to its hex version
          let result = '';
          const view = new DataView(hash);
          for (let i = 0; i < hash.byteLength; i += 4) {
            result += ('00000000' + view.getUint32(i).toString(16)).slice(-8);
          }
          return result;
        });
    }
  },
  computed: {
    gravatarHash: function () {
      return getHash($store.state.wallet.address)
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