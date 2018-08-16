<template>
    <div>
        <v-expansion-panel>
            <v-expansion-panel-content
            >
            <div slot="header">Create a Token</div>
            <v-card>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <p style="color:green" v-if="success">Token created successfully!</p>
                    <p style="color:red" v-if="failure">Something went wrong. Please try again.</p>
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
                    :counter="3"
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
                    :counter="100"
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
    </div>
</template>

<script>
import { BigNumber } from "bignumber.js";

export default {
  data: () => ({
    success: false,
    loading:false,
    failure: false,
    valid: true,
    name: "Example Coin",
    symbol: "",
    unavailable:false,
    supply: '1000000',
    decimals: '18',
    nameRules: [
      v => !!v || "Token name is required",
      v =>
        (v && v.length <= 20) || "Token name must be less than 20 characters",
      v => (v && v.length >= 3) || "Token name must be longer than 3 characters"
    ],
    symbolRules: [
      v => !!v || "Token symbol is required",
      v => (v && v.length === 3) || "Token symbol must be equal to 3 characters"
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
        (v && v.length <= 100) ||
        "Token supply must be smaller than or equal to 100 characters",
      v => (v && !isNaN(v)) || "Token supply must be a number"
    ]
  }),
  methods: {
    submit() {
      this.loading = true;
      var self = this;
      if (this.$refs.form.validate()) {
          var generate = this.$contract.methods.generate(this.symbol, this.name, this.decimals, new BigNumber(this.supply).times(10 ** this.decimals)).send({from:this.$store.state.wallet.address, gasPrice:0, gas:4000000});
          generate.on("receipt", function(){
            self.clear();
            self.success = true;
            self.failure = false;
            self.loading = false;
          })
          generate.on("error", function(){
            self.failure = true;
            self.success = false;
            self.loading = false;
          })
      }
    },
    clear() {
      this.$refs.form.reset();
    },
    upperAndValidate: function() {
      if(this.symbol) {
        this.symbol = this.symbol.toUpperCase()
      }
      var self = this;
      this.$contract.methods.getToken(this.symbol.toUpperCase()).call().then(function(result){
        if(result.totalSupply === "0") {
          self.unavailable = false;
        }else{
          self.unavailable = true;
        }
      })
    }
  }
};
</script>
