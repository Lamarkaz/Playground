<template>
<div>
    <div v-for="item in orderedEvents" :key="item.hash">
        <div v-if="item.type === 'transfer' && item.sender !=  '0x0000000000000000000000000000000000000000'">
             <span>{{$store.getters.getName(item.sender)}} </span>
             sent
             <span>{{item.value}} {{item.symbol}} </span>
             to
             <span>{{$store.getters.getName(item.recipient)}} </span>
             <span>{{item.timestamp}}</span>
            <br>
        </div>
        <div v-if="item.type === 'transfer' && item.sender ===  '0x0000000000000000000000000000000000000000'">
             <span>{{$store.getters.getName(item.recipient)}} </span>
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
<script scoped>
import orderBy from 'lodash.orderby';
import moment from "moment";
import { BigNumber } from "bignumber.js";
export default {
  props: {
    onlyUser: {
      type: Boolean,
      default: false
    }
  },
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
    if(!this.onlyUser){
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
    }
    var options = {
      fromBlock:0
    };
    if(this.onlyUser) {
      options.filter = [
        { sender: this.$store.state.wallet.address },
        { recipient: this.$store.state.wallet.address }
      ]
    }
    this.$contract.events.Transfer(options, function(err, event) {
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
