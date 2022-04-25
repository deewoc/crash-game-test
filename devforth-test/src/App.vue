<template>
  <div class="container">
    <div class="top-board">
      <div class="be-ready">
        <p v-if="timer !== 0 ">BE READY FOR A ROUND</p>
        <div v-if="timer !== 0 " class="timer">{{ timer }}</div>
        <div v-else class="multiplier">x{{ multiplier }}</div>
        <div>
          <div v-if="winner" class="winner">WON {{ winner_bet }} x {{ winner_multiplier }}</div>
          <div v-if="!winner && winner !== undefined" class="crashed">CRASHED! YOU LOOSE</div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="bottom-board">

      <div class="balance">
        <p>BALANCE</p>
        <span>${{ balance }}</span>
      </div>
      <input class="bet-value"
             placeholder="BET VALUE"
             @keypress="isNumber($event)"
             @input="checkRange()"
             v-model="bet_input"
             :disabled="disabled"
             :class="{disabled: disabled}"/>
      <div>
        <div v-if="!bet" class="place-a-bet-circle"
             :class="{disabled: disabled}">
          <button class="place-a-bet"
                  v-on:click="onPlaceABet()"
                  :disabled="disabled"
          >PLACE A BET
          </button>
        </div>
        <div v-else class="take-a-bet-circle">
          <button class="take-a-bet"
                  v-on:click="onTake()">TAKE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      disabled: false,
      winner: undefined,
      timer: 5,
      multiplier: 0,
      winner_multiplier: null,
      balance: 0,
      bet: null,
      bet_input: null,
      winner_bet: null,
      connection: null
    };
  },

   methods: {
    onPlaceABet() {
      this.bet = this.bet_input;
      const message = {
        message: 'make_bet',
        value: this.bet
      }
      this.connection.send(JSON.stringify(message))
    },


    onTake() {
      this.winner_multiplier = this.multiplier;
      this.winner_bet = this.bet;
      this.bet = 0;
      this.winner = true;
      const message = {
        message: 'take',
        multiplier: this.multiplier,
      }
      this.connection.send((JSON.stringify(message)))
    },


    isNumber(val) {
      console.log(val);
      if (isNaN(Number(val.key))) {
        return val.preventDefault();
      }
    },


    checkRange() {
      if (+this.bet_input > +this.balance) {
        this.bet_input = this.balance;
      }
    },
  },

  mounted() {
    this.connection = new WebSocket("ws:/localhost:9000")
    this.connection.onmessage = (event) => {
      let response = JSON.parse(event.data);
      switch (response.message) {
        case 'round_countdown':
          this.winner = undefined;
          this.disabled = false;
          this.multiplier = 0;
          this.timer = response.countdown;
          break;
        case 'multiplier_update':
          if (!this.bet) {
            this.disabled = true;
          }
          this.multiplier = response.multiplier;
          break;
        case 'new_balance':
          this.balance = response.balance
          break;
        case 'crash':
          if (!this.winner && this.bet) {
            this.winner = false;
          }
          this.bet = null;
      }
    }
    this.connection.onopen = () => {
      console.log("successfully connected")
    }
    this.connection.onclose = () => {
      console.log('connection closed');
    }
  },
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', serif;
  text-align: center;
  background: #16171B;
}

.container {
  width: 449px;
  height: 340px;
  background: #34393D;
  border: 3px solid #3D4249;
  border-radius: 20px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.top-board {
  width: 443px;
  height: 158px;
  display: flex;
  align-items: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.bottom-board {
  width: 443px;
  height: 175px;
  /*display: flex;*/
  align-items: center;
  text-align: center;
  display: flex;
}

.divider {
  width: 443px;
  left: 463px;
  top: 445px;
  border: 3px solid #1D1E24;
}

.be-ready {
  margin: 0 auto;
  display: block;
}

.timer {
  margin-top: 16px;
  font-weight: 400;
  font-size: 40px;
  line-height: 47px;
}

.balance {
  margin-left: 42px;
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  color: rgba(255, 255, 255, 0.4);
}

.bet-value {
  text-align: center;
  margin-left: 30px;
  width: 132px;
  height: 54px;
  background: #282B30;
  box-shadow: inset 4px 4px 6px rgba(0, 0, 0, 0.2), inset -4px -4px 6px rgba(255, 255, 255, 0.12);
  border-radius: 15px;
  outline: none;
  font-weight: 400;
  font-size: 18px;
  line-height: 21px;
  color: rgba(255, 255, 255, 0.4);
  border: none;
}

.place-a-bet-circle {
  margin-left: 30px;
  display: flex;
  justify-content: center;
  text-align: center;
  width: 93px;
  height: 93px;
  border-radius: 50%;
  background: #292C33;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3), -5px -5px 20px rgba(255, 255, 255, 0.12), inset -4px -4px 10px rgba(255, 255, 255, 0.12), inset 4px 4px 10px rgba(0, 0, 0, 0.25);
}

.place-a-bet {
  margin: auto;
  width: 83px;
  height: 83px;
  border-radius: 50%;
  border: none;
  background: #292C33;
  box-shadow: inset 4px 4px 20px rgba(255, 255, 255, 0.12), inset -4px -4px 20px rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
}

.multiplier {
  font-weight: 700;
  font-size: 55px;
  line-height: 64px;
  color: #C27500;
  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
}

.take-a-bet-circle {
  margin-left: 30px;
  display: flex;
  justify-content: center;
  text-align: center;
  width: 93px;
  height: 93px;
  border-radius: 50%;
  background: #882424;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3), -5px -5px 20px rgba(255, 255, 255, 0.12), inset -4px -4px 10px rgba(255, 255, 255, 0.12), inset 4px 4px 10px rgba(0, 0, 0, 0.25);
}

.take-a-bet {
  margin: auto;
  width: 83px;
  height: 83px;
  border-radius: 50%;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
  background: #882424;
  box-shadow: inset 4px 4px 20px rgba(255, 255, 255, 0.12), inset -4px -4px 20px rgba(0, 0, 0, 0.25);
}

.disabled {
  opacity: 0.1;
}

.winner {
  font-weight: 700;
  font-size: 30px;
  line-height: 35px;
  color: #00C208;
  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
}

.crashed {
  font-weight: 700;
  font-size: 30px;
  line-height: 35px;
  color: #C20000;
  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
}

p {
  margin: 0;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
}


</style>
