<template>
        <v-expansion-panel>
            <v-expansion-panel-content
            >
            <div slot="header">Send {{token.symbol}}</div>
                <v-form ref="form" v-model="valid" style="margin: 15px; max-width: 80%; margin-right: auto; margin-left: auto">
                    <v-autocomplete
                    :items="$store.state.namesArr"
                    v-model="select"
                    class="mx-3"
                    flat
                    hide-no-data
                    hide-details
                    hide-selected
                    label="Enter Recipient Name"
                    solo-inverted
                    :rules="nameRules"
                    chips
                    ></v-autocomplete>
                    <p style="color:red" v-if="!nameIsCorrect && select">This recipient name is not registered.</p>
                    <v-text-field
                    v-model="amount"
                    :counter="20"
                    label="Enter amount of tokens"
                    :rules="amountRules"
                    required
                    ></v-text-field>
                    <p style="color:red" v-if="insufficientBalance">Your {{token.symbol}} balance is insufficient to make this transaction.</p>
                    <v-btn
                    :disabled="!valid || !nameIsCorrect || select === undefined || insufficientBalance || isNaN(amount)"
                    :loading="loading"
                    @click="submit"
                    >
                    Send Now
                    </v-btn>
                    <v-btn @click="clear">clear</v-btn>
                </v-form>
            </v-expansion-panel-content>
        </v-expansion-panel>
</template>

<script scoped>
import { BigNumber } from "bignumber.js";
import swal from "sweetalert";

export default {
  props: ["token", "balance"],
  data: () => ({
    select: undefined,
    valid: true,
    amount: "",
    loading: false,
    amountRules: [
      v => !!v || "Amount is required",
      v => (v && !isNaN(v) && v > 0) || "Amount must be a number bigger than 0"
    ],
    nameRules: [v => !!v || "Name is required"]
  }),
  methods: {
    submit() {
      this.loading = true;
      var self = this;
      if (this.$refs.form.validate()) {
        var transfer = this.$contract.methods
          .transfer(
            this.token.symbol,
            this.$store.state.addresses[this.select],
            new BigNumber(this.amount)
              .times(10 ** this.token.decimals)
              .toString(10)
          )
          .send({
            from: this.$store.state.wallet.address,
            gasPrice: 0,
            gas: 4000000
          });
        transfer.on("receipt", function() {
          self.loading = false;
          swal(
            "Success!",
            "You have sent " +
              self.amount +
              " " +
              self.token.symbol +
              " to " +
              self.select,
            "success"
          );
          self.clear();
        });
        transfer.on("error", function() {
          self.loading = false;
          swal("Error", "Something went wrong. Please try again", "error");
        });
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  },
  computed: {
    insufficientBalance: function() {
      return parseInt(this.amount) > this.balance;
    },
    nameIsCorrect: function() {
      return typeof this.$store.state.addresses[this.select] != "undefined";
    }
  }
};
</script>
