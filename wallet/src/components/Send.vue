<template>
        <v-expansion-panel>
            <v-expansion-panel-content
            >
            <div slot="header">Send {{token.symbol}}</div>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <p style="color:green" v-if="success">Tokens sent successfully!</p>
                    <p style="color:red" v-if="failure">Something went wrong. Please try again.</p>
                    <v-autocomplete
                    :items="$store.state.namesArr"
                    v-model="select"
                    class="mx-3"
                    flat
                    :filter="autofilter"
                    hide-no-data
                    hide-details
                    hide-selected
                    label="Enter Recipient Name"
                    solo-inverted
                    ></v-autocomplete>
                    <v-text-field
                    v-model="amount"
                    :counter="100"
                    label="Enter number of tokens"
                    :rules="amountRules"
                    required
                    ></v-text-field>
                    <p style="color:red" v-if="insufficientBalance">Your {{token.symbol}} balance is insufficient to make this transaction.</p>
                    <v-btn
                    :disabled="!valid || insufficientBalance"
                    @click="submit"
                    >
                    Send Now
                    </v-btn>
                    <v-btn @click="clear">clear</v-btn>
                </v-form>
            </v-expansion-panel-content>
        </v-expansion-panel>
</template>

<script>
import { BigNumber } from "bignumber.js";

export default {
  props:['token','balance'],
  data: () => ({
    items: [],
    search: null,
    select: null,
    success: false,
    failure: false,
    valid: true,
    amount: '',
    amountRules: [
      v => !!v || "Amount is required",
      v =>
        (v && !isNaN(v) && v > 0) ||
        "Amount must be a number bigger than 0"
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
    autofilter (item) {
        return item != this.$store.state.wallet.name;
    },
    clear() {
      this.$refs.form.reset();
    }
  },
  computed: {
    insufficientBalance: function() {
      return parseInt(this.amount) > this.balance;
    }
  },
  watch: {
    search (val) {
        val && val !== this.select && this.querySelections(val)
    }
  }
    
};
</script>
