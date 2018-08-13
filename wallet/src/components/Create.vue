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
                    @input="symbol = symbol.toUpperCase()"
                    :rules="symbolRules"
                    :counter="3"
                    label="Token Symbol"
                    required
                    ></v-text-field>
                    <p style="color:red" v-if="unavailableSymbol">This token symbol is unavailable. Please try another.</p>
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
                    :disabled="!valid || unavailableSymbol"
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
    failure: false,
    valid: true,
    name: "Example Coin",
    symbol: "",
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
      var self = this;
      if (this.$refs.form.validate()) {
          console.log(new BigNumber(this.supply).times(10 ** this.decimals).toString(10))
          this.$contract.methods.generate(this.symbol, this.name, this.decimals, new BigNumber(this.supply).times(10 ** this.decimals).toString(10)).send({from:this.$store.state.wallet.address, gasPrice:0, gas:4000000}, function(err, result){
              if(!err){
                self.clear();
                self.success = true;
              }else{
                  self.failure = true;
              }

          })
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  },
  computed: {
    unavailableSymbol: function() {
      return typeof this.$store.state.tokens[this.symbol] != "undefined";
    }
  }
};
</script>
