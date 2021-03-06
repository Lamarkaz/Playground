<template>
    <v-container>
      <v-expansion-panel style="max-width: 500px; margin-right: auto; margin-left: auto">
        <v-expansion-panel-content
          expand-icon="add"
        >
        <div slot="header">Create a Token</div>
        <v-card style="margin: 15px; max-width: 80%; margin-right: auto; margin-left: auto">
          <v-form ref="form" v-model="valid">
            <v-text-field
            v-model="name"
            :rules="nameRules"
            :counter="20"
            label="Token Name"
            required
            ></v-text-field>
            <v-text-field
            v-model="symbol"
            @input="upperAndValidate"
            :rules="symbolRules"
            :counter="4"
            label="Token Symbol"
            required
            ></v-text-field>
            <p style="color:red" v-if="unavailable">This token symbol is unavailable. Please try another.</p>
            <v-text-field
            v-model="decimals"
            :rules="decimalRules"
            :counter="2"
            label="Token Decimals"
            required
            ></v-text-field>
            <v-text-field
            v-model="supply"
            :rules="supplyRules"
            :counter="20"
            label="Total Token Supply"
            required
            ></v-text-field>
            <v-btn
            :disabled="!valid || unavailable"
            :loading="loading"
            @click="submit"
            >
            Create
            </v-btn>
            <v-btn @click="clear">clear</v-btn>
          </v-form>
        </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-container>
</template>

<script scoped>
import { BigNumber } from "bignumber.js";
import swal from "sweetalert";

export default {
  data: () => ({
    loading: false,
    valid: false,
    name: "Example Coin",
    symbol: "",
    unavailable: false,
    supply: "1000000",
    decimals: "18",
    nameRules: [
      v => !!v || "Token name is required",
      v =>
        (v && v.length <= 20) || "Token name must be less than 20 characters",
      v => (v && v.length >= 4) || "Token name must be longer than 4 characters"
    ],
    symbolRules: [
      v => !!v || "Token symbol is required",
      v =>
        (v && v.length >= 3 && v.length <= 4) ||
        "Token symbol must be 3 or 4 characters long"
    ],
    decimalRules: [
      v => !!v || "Token decimals is required",
      v =>
        (v && v.length <= 2) ||
        "Token decimals must be smaller than or equal to 2 characters",
      v => (v && !isNaN(v)) || "Token decimals must be a number"
    ],
    supplyRules: [
      v => !!v || "Token supply is required",
      v =>
        (v && v.length <= 20) ||
        "Token supply must be smaller than or equal to 20 characters",
      v => (v && !isNaN(v)) || "Token supply must be a number"
    ]
  }),
  methods: {
    submit() {
      this.loading = true;
      var self = this;
      if (this.$refs.form.validate()) {
        var generate = this.$contract.methods
          .generate(
            this.symbol,
            this.name,
            this.decimals,
            new BigNumber(this.supply).times(10 ** this.decimals)
          )
          .send({
            from: this.$store.state.wallet.address,
            gasPrice: 0,
            gas: 4000000
          });
        generate.on("receipt", function() {
          self.loading = false;
          swal(
            "Success!",
            "You have successfully issued " +
              self.supply +
              " " +
              self.symbol +
              "s",
            "success"
          );
          self.clear();
        });
        generate.on("error", function() {
          self.loading = false;
          swal("Error", "Something went wrong. Please try again", "error");
        });
      }
    },
    clear() {
      this.$refs.form.reset();
    },
    upperAndValidate: function() {
      if (this.symbol) {
        this.symbol = this.symbol.toUpperCase();
      }
      var self = this;
      this.$contract.methods
        .getToken(this.symbol.toUpperCase())
        .call()
        .then(function(result) {
          if (result.totalSupply === "0") {
            self.unavailable = false;
          } else {
            self.unavailable = true;
          }
        });
    }
  }
};
</script>
