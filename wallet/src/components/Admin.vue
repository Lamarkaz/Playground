<template>
    <v-container>
        <div v-if="isAdmin">
            <p style="color:red" v-if="addressExists">This address already exists. Please try again.</p>
            <p style="color:red" v-if="failure">Something went wrong. Please try again.</p>
            <p style="color:green" v-if="success">Success!</p>
            <h3>Add to whitelist</h3>
            <v-form v-model="valid" ref="form" lazy-validation>
                <v-text-field
                v-model="address"
                :rules="addressRules"
                :counter="42"
                label="Address"
                @input="checkAddress"
                required
                ></v-text-field>
                <v-text-field
                v-model="name"
                :rules="nameRules"
                :counter="100"
                label="Name"
                required
                ></v-text-field>
                <v-text-field
                v-model="org"
                :rules="orgRules"
                :counter="100"
                label="Organization"
                required
                ></v-text-field>
                <v-btn
                :disabled="!valid || addressExists"
                @click="submit"
                :loading="loading"
                >
                Whitelist
                </v-btn>
                <v-btn @click="clear">Clear</v-btn>
            </v-form>
            <h3>Whitelist</h3>
            <p class="name" v-for="name in $store.state.namesArr" :key="name">
                {{name}}
                <v-btn @click="remove(name)">Remove</v-btn>
            </p>
        </div>
        <div v-else>
            You are not authorized to access this page.
        </div>
    </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      valid: false,
      isAdmin: false,
      success: false,
      failure: false,
      addressExists: false,
      address: "",
      name: "",
      org: "",
      nameRules: [v => !!v || "Name is required"],
      orgRules: [v => !!v || "Organization is required"],
      addressRules: [
        v => !!v || "Address is required",
        v => /^0x[a-fA-F0-9]{40}$/.test(v) || "Address is invalid"
      ]
    };
  },
  created() {
    var self = this;
    this.$whitelistContract.methods
      .owner()
      .call()
      .then(function(result) {
        if (result === self.$store.state.wallet.address) {
          self.isAdmin = true;
        }
      });
  },
  methods: {
    remove: function(name) {
      var self = this;
      var remove = this.$whitelistContract.methods
        .remove(this.$store.state.addresses[name])
        .send({
          from: this.$store.state.wallet.address,
          gasPrice: 0,
          gas: 4000000
        });
      remove.on("receipt", function() {
        self.success = true;
        self.failure = false;
        self.$store.commit("REMOVENAME", name);
      });
      remove.on("error", function(e) {
        console.log(e);
        self.success = false;
        self.failure = true;
      });
    },
    checkAddress: function() {
      if (typeof this.$store.state.names[this.address] != "undefined") {
        this.addressExists = true;
      } else {
        this.addressExists = false;
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var name = this.name + " (" + this.org + ")";
        var whitelist = this.$whitelistContract.methods
          .add(this.address, name)
          .send({
            from: this.$store.state.wallet.address,
            gasPrice: 0,
            gas: 4000000
          });
        var self = this;
        whitelist.on("receipt", function() {
          self.success = true;
          self.failure = false;
          self.loading = false;
          self.clear();
        });
        whitelist.on("error", function() {
          self.success = false;
          self.failure = true;
          self.loading = false;
        });
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>

<style scoped>
.name {
  text-align: left;
}
</style>
