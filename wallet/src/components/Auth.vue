<template>
    <v-layout class="authLayout">
        <v-container class="Geninstr authOverlay" v-if="generated">
          <center>
            <div class="iconWrapper">
              <v-icon style="color: black; font-size: 39px">done_all</v-icon>
            </div>
          </center>
          <h3>You are almost done!</h3>
          <h2 style="margin-bottom: 30px">Just a few more steps:</h2>
          <v-card style="padding: 25px">
            <div class="instrText">
              <div class="txt">1. Keep the downloaded identity file on your device. Make sure you keep a few backups. Without this file, you won't be able to access your account.</div>
              <div class="txt">2. Send an email to playground@lamarkaz.com with your newly generated address (0x{{tempWallet.address}}), your name and your organization's name.</div>
              <div class="txt">3. Wait for an email response then come back to this webpage to login.</div>
            </div>
          </v-card>
        </v-container>
        <v-container class="authOverlay" v-else>
            <v-flex style="margin-left: auto; margin-right: auto; margin-top: 30px; max-width: 480px">
                <v-card class="authCard">
                    <v-alert v-if="error" color="error" icon="warning" value="true" style="margin-top: -45px">
                    Error: please make sure you upload a valid identity file and enter the correct decryption password
                    </v-alert>
                    <div class="walletLogo">
                      <img src="../assets/wallet-dark.png" width="60px"/>
                    </div>
                    <h3 class="walletTypo">Playground <span style="color: #F5B50D">Wallet</span></h3>
                    <div class="dividerStyle"></div>
                    <div style="text-align: center; margin-bottom: 30px; font-size: 16px; font-weight: 600">ALREADY A USER?<br/><span style="color: grey; font-size: 15px; font-weight: 300">Import your Identity file and credentials to start</span></div>
                    <form class="authForm">
                      <v-text-field class="inputStyle"
                      prepend-icon="attach_file" single-line
                      v-model="filename" :label="label"
                      @click.native="onFocus"
                      :disabled="disabled"
                      :rules="[v => !!v || 'Identity file is required!']"
                      ref="fileTextField"
                      color="yellow darken-3"
                      loading
                      required
                      ></v-text-field>
                      <input type="file" :multiple="false" :disabled="disabled" ref="fileInput" @change="onFileChange"/>
                      <v-text-field class="inputStyle"
                        v-model="password"
                        prepend-icon="lock" single-line
                        name="input-10-1"
                        label="Enter your password"
                        hint="At least 8 characters"
                        min="8"
                        :append-icon="passBol ? 'visibility' : 'visibility_off'"
                        :append-icon-cb="() => (passBol = !passBol)"
                        :type="passBol ? 'password' : 'text'"
                        color="yellow darken-3"
                        counter
                        required
                      ></v-text-field>
                      <v-btn :disabled="!valid" class="authBtn" :loading="authLoader" style="width: 100%; box-shadow: none" v-on:click="authenticate">
                          <v-icon style="font-size: 20px; padding-right: 10px;">vpn_key</v-icon>Authenticate
                      </v-btn>
                      <div class="dividerStyle"></div>
                      <span style="color: grey; font-size: 15px; font-weight: 300; margin-top: 10px">or create a new Identity</span>
                      <v-btn class="authBtn pulse" style="background-color: #F5B50D; margin-top: 15px; color: black; width: 100%; margin-bottom: 20px" v-on:click="dialog = true">
                        <v-icon style="font-size: 20px; padding-right: 10px; color: black">person_add</v-icon>Generate Identity
                      </v-btn>
                    </form>
                </v-card>
            </v-flex>
        </v-container>
        <!-- Password dialog -->
        <v-dialog v-model="dialog" persistent max-width="500px"> 
          <v-card class="genId">
            <v-card-title>
              <span class="headline" style="font-family: 'Raleway', sans-serif; font-size: 19px !important; font-weight: 600; color: black"><v-icon style="font-size: 23px; padding-right: 10px; margin-top: -6px; color: black">person_add</v-icon>Generate a new Identity</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md style="margin-top: -20px; margin-bottom: 10px">
                <v-layout wrap>
                  <v-flex xs12>
                    <v-text-field 
                    v-model="pw"
                    name="input-10-1"
                    color="black" 
                    hint="At least 8 characters"
                    :append-icon="newPassBol ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (newPassBol = !newPassBol)"
                    :type="newPassBol ? 'password' : 'text'"
                    counter
                    loading
                    label="Select Password" 
                    required
                    >
                      <v-progress-linear
                        slot="progress"
                        :value="pw_progress"
                        :color="pw_color"
                        height="3"
                      ></v-progress-linear>
                    </v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field 
                    v-model="confirmpw"
                    name="input-10-1"
                    color="black"
                    :append-icon="confPassBol ? 'visibility' : 'visibility_off'"
                    :append-icon-cb="() => (confPassBol = !confPassBol)"
                    :type="confPassBol ? 'password' : 'text'" 
                    counter
                    loading
                    label="Confirm Password" 
                    required
                    >
                      <v-progress-linear
                        slot="progress"
                        :value="confirmpw_progress"
                        :color="confirmpw_color"
                        height="3"
                      ></v-progress-linear>
                    </v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <div class="warningAlert" v-if="pw != confirmpw" type="error">
              <v-icon style="margin-right: 3px; font-size: 18px; color: #FF4151">warning</v-icon> passwords do not match
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red" @click.native="dialog = false" style="box-shadow: none; height: 55px; width: 40%; margin: 0px; float: left; border-radius: 0px; font-weight: 700"><v-icon style="font-size: 21px; padding-right: 3px">remove_circle_outline</v-icon></v-icon>Cancel</v-btn>
              <v-btn color="yellow darken-3" :loading="loader" @click.native="generate()" :disabled="(pw != confirmpw || pw.length < 8)" style="box-shadow: none; height: 55px; width: 60%; margin: 0px; border-radius: 0px; font-weight: 700"><v-icon style="font-size: 21px; padding-right: 5px">playlist_add_check</v-icon></v-icon>Generate Identity</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    </v-layout>
</template>


<script>
import ethers from "ethers";
import { saveAs } from "file-saver/FileSaver";
import '../assets/wallet-icon.svg'
import swal from 'sweetalert'

export default {
  props: {
    value: {
      type: [Array, String]
    },
    label: {
      type: String,
      default: "Select an identity file.."
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filename: "",
      passBol: true,
      newPassBol: true,
      confPassBol: true,
      password: "",
      newPassword: "",
      confPassword: "",
      json: {},
      ready: true,
      error: false,
      dialog: false,
      pw: "",
      confirmpw: "",
      loader: false,
      authLoader: false,
      tempWallet: {},
      generated: false
    };
  },
  watch: {
    value(v) {
      this.filename = v;
    }
  },
  mounted() {
    this.filename = this.value;
  },
  created() {
    var wallet = this.$localStorage.get("wallet", null);
    if (wallet != null) {
      this.$web3.eth.accounts.wallet.add(wallet);
      this.$store.dispatch("login", wallet);
    }
  },
  methods: {
    onFocus() {
      if (!this.disabled) {
        this.$refs.fileInput.click();
      }
    },
    onFileChange($event) {
      const files = $event.target.files || $event.dataTransfer.files;
      var reader = new FileReader();
      reader.readAsText(files[0], "UTF-8");
      var self = this;
      reader.onload = (function(file) {
        return function(e) {
          function tryParseJSON(jsonString) {
            try {
              var o = JSON.parse(jsonString);
              if (o && typeof o === "object") {
                return o;
              }
            } catch (e) {
              return false;
            }
            return false;
          }
          if (
            tryParseJSON(e.target.result) !== false &&
            typeof tryParseJSON(e.target.result.address) != "undefined"
          ) {
            self.json = e.target.result;
            if (files) {
              if (files.length > 0) {
                self.filename = [...files].map(file => file.name).join(", ");
              } else {
                self.filename = null;
              }
            } else {
              self.filename = $event.target.value.split("\\").pop();
            }
          } else {
            alert("Error: Invalid wallet file");
          }
        };
      })(files[0]);
    },
    authenticate() {
      var self = this;
      this.authLoader = true;
      this.ready = false;
      this.$whitelistContract.methods
        .isWhitelisted("0x" + JSON.parse(this.json).address)
        .call()
        .then(function(result) {
          if (result === true) {
            ethers.Wallet.fromEncryptedWallet(self.json, self.password)
              .then(function(wallet) {
                self.$web3.eth.accounts.wallet.add(wallet);
                self.$localStorage.set("wallet", wallet);
                self.$store.dispatch("login", wallet);
              })
              .catch(function(e) {
                swal("Error", 'Invalid password', "error", {
                  buttons: false,
                  timer: 3000,
                });
                self.authLoader = false;
              });
            self.ready = true;
          } else {
            self.ready = true;
            alert(
              "Your address is not yet whitelisted. Please send your address (" +
                "0x" +
                JSON.parse(self.json).address +
                ") to contact@lamarkaz.com along with your name and organization."
            );
          }
        });
    },
    generate: function() {
      var self = this;
      this.ready = false;
      this.loader = true;
      var wallet = ethers.Wallet.createRandom();
      var encrypted = wallet.encrypt(this.pw, function(pc) {
        if (pc === 1) {
          encrypted.then(function(json) {
            self.dialog = false;
            self.generated = true;
            self.tempWallet = JSON.parse(json);
            self.download()
          });
        }
      });
      swal("You are almost done!", 'Your Identity file is being generated', "info", {
        buttons: false,
        timer: 6000
      });
    },
    download: function() {
      var blob = new Blob([JSON.stringify(this.tempWallet)], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, "Identity.json");
    }
  },
  computed: {
    valid: function() {
      return this.json !== "" && this.password.length > 7;
    },
    pw_progress() {
      return Math.min(100, this.pw.length * 10);
    },
    confirmpw_progress() {
      return Math.min(100, this.confirmpw.length * 10);
    },
    pw_color() {
      return ["error", "warning", "success"][Math.floor(this.pw_progress / 40)];
    },
    confirmpw_color() {
      return ["error", "warning", "success"][
        Math.floor(this.confirmpw_progress / 40)
      ];
    }
  }
};
</script>


<style scoped>
.authOverlay {
  background: transparent;
  width: 100%;
  height: 100%;
  position: relative;
}
.mainAuth {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
}
.walletLogo {
  height: 105px;
  width: 100px;
  background: #fafafa;
  border-radius: 999px;
  padding: 15px;
  margin-right: auto;
  margin-left: auto;
}
.walletTypo {
  font-size: 21px;
  color: black;
  font-weight: 700;
  margin-top: 2px;
  margin-bottom: 25px;
}
input[type="file"] {
  position: absolute;
  left: -99999px;
}
.authCard {
  width: 100%;
  padding: 35px;
  padding-top: 0px;
  border-radius: 5px;
  margin-right: auto;
  margin-left: auto;
  box-shadow: none;
  padding-bottom: 5px;
  color: #F5B50D;
  background: transparent;
}
.authForm {
  padding-left: 10%;
  padding-right: 15%;
}
.inputStyle {
  color: white;
}
.dividerStyle {
  margin-top: 30px;
  margin-bottom: 30px;
  border-bottom: 1px grey solid;
  opacity: 0.2;
}
.authBtn {
  font-family: "Raleway", sans-serif;
  font-weight: 700;
  font-size: 14px;
  margin-top: 20px;
  color: white;
  box-shadow: none;
  height: 55px;
  border-radius: 999px;
}
.pulse {
  display: inline-block;
  cursor: pointer;
  box-shadow: 0 0 0 rgba(107, 32, 172, 0.4);
  animation: pulse 2s infinite;
}
.pulse:hover {
  animation: none;
}
.leftWrapper {
  position: absolute;
  left: 7.5%;
  top: 13%;
  margin-left: auto;
  margin-right: auto;
}
.logoShow {
  width: auto;
}
.v-card__actions {
  padding: 0px !important;
}
.genId {
  border-top: solid 4px #F5B50D;
  background: rgb(245, 245, 245) !important;
  padding: 0px;
}
.genBtn {
  font-weight: 700;
  font-size: 14px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 900px;
  box-shadow: none !important;
}
.authBtn:hover {
  background-color: #eee;
}
.warningAlert {
  left: 0px;
  position: absolute;
  bottom: 68px;
  left: 0px;
  margin-left: 25px;
  margin-top: 10px;
  margin-bottom: 15px;
  padding-left: 10px;
  color: #ff4151;
  font-weight: 500;
  font-size: 14px;
}
.application .theme--light.input-group input,
.application .theme--light.input-group textarea,
.theme--light .input-group input,
.theme--light .input-group textarea {
  color: black;
  margin-bottom: 11px;
}
.input-group__details {
  max-width: calc(100%) !important;
}
.input-group__counter {
  color: black !important;
}
.intro-carousel .carousel__controls {
  background: red !important;
}
.authOverlay {
  opacity: 0;
  animation-name: bounceIn;
  animation-duration: 450ms;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
.authOverlay{animation-delay: 0.3s;}
.Geninstr {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 25px;
}
.iconWrapper {
  width: 80px;
  height: 80px;
  padding: 20px;
  background-color: #fbc02d;
  border-radius: 999px;
  margin-bottom: 25px;
}
.instrText { 
  text-align: left;
  font-weight: 500;
  font-size: 16px;
}
.txt { 
  margin-bottom: 7px;
}
/* Animation */
@-webkit-keyframes pulse {
  0% {
    -webkit-box-shadow: 0 0 0 0 rgba(245, 181, 13, 0.4);
  }
  70% {
    -webkit-box-shadow: 0 0 0 12px rgba(245, 181, 13, 0.4);
  }
  100% {
    -webkit-box-shadow: 0 0 0 0 rgba(245, 181, 13, 0.4);
  }
}
@keyframes pulse {
  0% {
    -moz-box-shadow: 0 0 0 0 rgba(245, 181, 13, 0.4);
    box-shadow: 0 0 0 0 rgba(245, 181, 13, 0.4);
  }
  70% {
    -moz-box-shadow: 0 0 0 12px rgba(245, 181, 13, 0);
    box-shadow: 0 0 0 12px rgba(245, 181, 13, 0);
  }
  100% {
    -moz-box-shadow: 0 0 0 0 rgba(245, 181, 13, 0);
    box-shadow: 0 0 0 0 rgba(245, 181, 13, 0);
  }
}
@keyframes bounceIn{
  0%{
    opacity: 0;
    transform: scale(0.3) translate3d(0,0,0);
  }
  50%{
    opacity: 0.9;
    transform: scale(1.1);
  }
  80%{
    opacity: 1;
    transform: scale(0.89);
  }
  100%{
    opacity: 1;
    transform: scale(1) translate3d(0,0,0);
  }
}

</style>
