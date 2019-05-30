"use strict"
require('dotenv').config();
const GPIO = null//require('pigpio').Gpio;

const STATE = 'STATE';
const OPEN = 'OPEN';
const CLOSED = 'CLOSED';
const OPENING = 'OPENING';
const CLOSING = 'CLOSING';
const NONE = 'NONE';
const DEBOUNCE_DELAY = 100; // debounce time in ms
const GARAGE_TIMEOUT = 30000;

const OPEN_PIN = process.env.OPEN_PIN;
const CLOSED_PIN = process.env.CLOSED_PIN;
const RELAY_PIN = process.env.RELAY_PIN;

module.exports = class Opener {
  constructor(upstream) {
    this.want = NONE; // changed per user request
    this.state = NONE; // updated once sensors are setup
    this.lastTriggered = 0; // debounce variable


    const setState = (state) => {
      console.log('Garage is now', state);
      this.state = state;
      if (this.want === state)
        this.want = NONE;
      updateServer();

      // once state is updated, decide on next action
      switch(state) {
        case OPEN:
          if (this.want === CLOSED) // toggle again if the intent was to close
            this.closeGarage();
          break;
        case CLOSED:
          if (this.want === OPEN) // toggle again if the intent was to open
            this.openGarage();
          break;
      }
    }

    /*
      This is run on any state change and will send data to an upstream
      Firebase server document and socket clients.
    */
    const updateServer = () => {
      if(!upstream) {
        console.warn('No upstream server available.');
        return;
      }
      // Probably don't want to save a NONE state to Firestore
      if(this.state !== NONE) {
        upstream.pushUpdate(status())
        .catch((err) => {
          console.error('Error updating server: ', err.message);
        });
      }
    }

    // setup GPIO pins
    const relayTrigger = new GPIO(RELAY_PIN, {mode: GPIO.OUTPUT});
    relayTrigger.digitalWrite(1); // relay should be on by default
    const openSensor = new GPIO(OPEN_PIN, {
        mode: GPIO.INPUT,
        pullUpDown: GPIO.PUD_UP,
        edge: GPIO.EITHER_EDGE
      });
    const closeSensor = new GPIO(CLOSED_PIN, {
        mode: GPIO.INPUT,
        pullUpDown: GPIO.PUD_UP,
        edge: GPIO.EITHER_EDGE
      });

    openSensor.on('interrupt', (level) => {
      var now = Date.now();
      if (now - this.lastTriggered > DEBOUNCE_DELAY) {
        this.lastTriggered = now;
        // wait DEBOUNCE_DELAY ms in order to ensure complete connection
        setTimeout(() => {
          setState(openSensor.digitalRead() ? CLOSING : OPEN)
        }, DEBOUNCE_DELAY);
      }
    });
    closeSensor.on('interrupt', (level) => {
      var now = Date.now();
      if (now - this.lastTriggered > DEBOUNCE_DELAY) {
        this.lastTriggered = now;
        // wait DEBOUNCE_DELAY ms in order to ensure complete connection
        setTimeout(() => {
          setState(closeSensor.digitalRead() ? OPENING : CLOSED);
        }, DEBOUNCE_DELAY);
      }
    });

    if (!openSensor.digitalRead()) { this.state = OPEN; }
    else if (!closeSensor.digitalRead()) { this.state = CLOSED; }
    updateServer();

    /* Quickly toggle a relay closed and open to simulate a button press */
    this.toggle = function(callback) {
      relayTrigger.digitalWrite(0);
      setTimeout(() => {
        relayTrigger.digitalWrite(1);
        this.updateServer();
        callback(null, status());
      }, 200);
    }
  }

  get status() {
    return {STATE: this.state};
  }
  get isOpen() {
    return this.state === OPEN;
  }
  get isClosed() {
    return this.state === CLOSED;
  }

  /**
    Since there's no open/close wire to connect to, we can only toggle the door.
    A software check is run to determine whether or not we should toggle
    given each command.

    If the garage is in a middle state (i.e. not fully open OR closed) when the
    command is run, the door will be toggled once and then again if the desired
    state was not reached.
  **/

  toggleGarage(callback) {
    if (this.state === OPEN)
      return this.closeGarage(callback);
    if (this.state === CLOSED)
      return this.openGarage(callback);

    callback(new Error('Status unverifiable: unable to toggle.'));
  }
  openGarage(callback) {
    console.log('Opening garage');
    if (this.state !== OPEN) {
      this.want = OPEN;
      return this.toggle(callback);
    }
    return callback(null, status());
  }
  closeGarage() {
    console.log('Closing garage');
    if (this.state !== CLOSED) {
      this.want = CLOSED;
      return this.toggle(callback);
    }
    return callback(null, status());
  }
}
