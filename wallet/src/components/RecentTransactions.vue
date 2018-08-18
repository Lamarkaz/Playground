<template>
<div>
    <div v-for="item in orderedEvents" :key="item.hash">
        <div v-if="item.type === 'transfer' && item.sender !=  '0x0000000000000000000000000000000000000000'">
             <span v-if="item.senderName">{{item.senderName}} </span>
             <span v-else>{{item.sender}} </span>
             sent
             <span>{{item.value}} {{item.symbol}} </span>
             to
             <span v-if="item.recipientName">{{item.recipientName}} </span>
             <span v-else>{{item.recipient}} </span>
             <span>{{item.timestamp}}</span>
            <br>
        </div>
        <div v-if="item.type === 'transfer' && item.sender ===  '0x0000000000000000000000000000000000000000'">
             <span v-if="item.recipientName">{{item.recipientName}} </span>
             <span v-else>{{item.recipient}} </span>
             created
             <span>a new token called {{item.symbol}} </span>
             <span>{{item.timestamp}}</span>
            <br>
        </div>
        <div v-if="item.type === 'whitelist'">
          <span>{{item.name}} was whitelisted {{item.timestamp}}</span>
        </div>
    </div>
</div>
</template>
<script>
import orderBy from 'lodash.orderby';
import moment from "moment";
import { BigNumber } from "bignumber.js";
export default {
  data() {
    return {
      events: []
    };
  },
  computed:{
      orderedEvents:function(){
        return orderBy(this.events, ["blockNumber"], ["desc", "asc"]);
      }
  },
  created() {
    var self = this;
    this.$whitelistContract.events.Whitelisted({fromBlock: 0}, function(err, event) {
          if (!err) {
        self.$web3.eth.getBlock(event.blockNumber, function(err, block) {
              var newEvent = {
                type: "whitelist",
                user: event.returnValues.user,
                name: event.returnValues.name,
                unixTimestamp: block.timestamp,
                blockNumber: event.blockNumber,
                timestamp: moment(block.timestamp * 1000)
                  .startOf("second")
                  .fromNow()
              };
              self.events.push(newEvent);
        })
      }
    });
    this.$contract.events.Transfer({ fromBlock: 0 }, function(err, event) {
      if (!err) {
        self.$web3.eth.getBlock(event.blockNumber, function(err, block) {
          self.$contract.methods
            .getToken(event.returnValues.symbol)
            .call({from:  self.$store.state.wallet.address})
            .then(function(result) {
              var tx ={
                type: "transfer",
                hash: event.transactionHash,
                symbol: event.returnValues.symbol,
                sender: event.returnValues.sender,
                recipient: event.returnValues.recipient,
                blockNumber: event.blockNumber,
                unixTimestamp: block.timestamp,
                timestamp: moment(block.timestamp * 1000)
                  .startOf("second")
                  .fromNow(),
                value: new BigNumber(event.returnValues.value)
                  .div(10 ** parseInt(result.decimals))
                  .toString(10)
              };
            if (typeof self.$store.state.names[tx.sender] != "undefined") {
                tx.senderName = self.$store.state.names[tx.sender];
            }
            if (typeof self.$store.state.names[tx.recipient] != "undefined") {
                tx.recipientName = self.$store.state.names[tx.recipient];
            }
            self.events.push(tx);

            })
        });
      } else {
        console.log("ERROR: ", err);
      }
    });

    // Update event timestamp every minute
    setInterval(function() {
        var newArr = [];
        for (var i = 0; i < self.events.length; i++) {
        var event = self.event[i];
        event.timestamp = moment(event.unixTimestamp * 1000)
            .startOf("second")
            .fromNow();
        newArr.push(event);
        }
        self.events = newArr;
    }, 60000);
  }
};
</script>
