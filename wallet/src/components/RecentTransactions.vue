<template>
  <v-container style="max-width: 600px">
    <h2 style="margin-bottom: 20px; color: black"><v-icon style="color: black">notifications_none</v-icon>Notifications</h2>
    <v-list two-line style="margin-left: auto; margin-right: auto; padding: 0px; word-break: 10">
      <template v-for="item in orderedEvents">
          <li class="token" :key="item.hash">
            <div :style="item.background" v-if="item.type === 'transfer' && item.sender !=  '0x0000000000000000000000000000000000000000'">
              <v-list-tile-sub-title style="height: 80px; font-weight: 500; padding-top: 20px; text-align: left; padding-left: 25px">
                <span>{{getName(item.sender)}} </span>
                sent
                <span>{{item.value}} {{item.symbol}} </span>
                to
                <span>{{getName(item.recipient)}} </span>
                <br/>
                <span><v-icon class="timeIcon">access_time</v-icon>{{item.timestamp}}</span>
              </v-list-tile-sub-title>
              <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
            </div>

            <div v-if="item.type === 'transfer' && item.sender ===  '0x0000000000000000000000000000000000000000'">
              <v-list-tile-sub-title style="height: 90px; font-weight: 500; padding-top: 20px; text-align: left; padding-left: 25px">{{item.name}}
                <span>{{getName(item.recipient)}} </span>
                created
                <span>a new token called {{item.symbol}} </span>
                <br/>
                <span><v-icon class="timeIcon">access_time</v-icon>{{item.timestamp}}</span>
              </v-list-tile-sub-title>
              <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
            </div>

            <div v-if="item.type === 'whitelist'">
              <v-list-tile-sub-title style="height: 80px; font-weight: 500; padding-top: 20px; text-align: left; padding-left: 25px">
                <span>{{item.name}} was whitelisted</span>
                <br/>
                <span><v-icon class="timeIcon">access_time</v-icon>{{item.timestamp}}</span>
              </v-list-tile-sub-title>
              <v-divider style="margin: 0px auto; max-width: 80%; margin-right: auto; margin-left: auto"></v-divider>
            </div>
          </li>
      </template>
    </v-list>
  </v-container>
</template>
<script scoped>
import orderBy from 'lodash.orderby';
import { BigNumber } from "bignumber.js";
import { mapGetters } from 'vuex'

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
      ...mapGetters([
      'getName'
      // ...
      ]),
      orderedEvents:function(){
        return orderBy(this.events, ["blockNumber"], ["desc", "asc"]);
      }
  },
  mounted() {
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
                  timestamp: self.$dayjs(block.timestamp * 1000)
                    .startOf("second")
                    .fromNow()
                };
                if(newEvent.timestamp === "a few seconds ago") {
                  self.$store.commit('NOTIFY')
                }
                if(newEvent.timestamp === "a few seconds ago") {
                  newEvent.background = 'background:#ffc6c6'
                } else {
                  newEvent.background = 'background:white'
                }
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
              var tx = {
                type: "transfer",
                hash: event.transactionHash,
                symbol: event.returnValues.symbol,
                sender: event.returnValues.sender,
                recipient: event.returnValues.recipient,
                blockNumber: event.blockNumber,
                unixTimestamp: block.timestamp,
                timestamp: self.$dayjs(block.timestamp * 1000)
                  .startOf("second")
                  .fromNow(),
                value: new BigNumber(event.returnValues.value)
                  .div(10 ** parseInt(result.decimals))
                  .toString(10)
              };
              if(tx.timestamp === "a few seconds ago") {
                self.$store.commit('NOTIFY')
              }
              if(tx.timestamp === "a few seconds ago") {
                tx.background = 'background:#ffc6c6'
              } else {
                tx.background = 'background:white'
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
        var event = self.events[i];
        event.timestamp = self.$dayjs(event.unixTimestamp * 1000)
            .startOf("second")
            .fromNow();
        if(event.timestamp === "a few seconds ago") {
          event.background = 'background:#ffc6c6'
        } else {
          event.background = 'background:white'
        }
        newArr.push(event);
        }
        self.events = newArr;
    }, 60000);
  }
};
</script>

<style scoped>
.timeIcon {
  font-size: 14px;
  margin-right: 5px;
}
</style>

