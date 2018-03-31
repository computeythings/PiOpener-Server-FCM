"use strict"
const GPIO = require('pigpio').Gpio;
const sleep = require('sleep');

const OPEN = 'OPEN';
const CLOSED = 'CLOSED';
const OPENING = 'OPENING';
const CLOSING = 'CLOSING';
const NONE = 'NONE';

module.exports = class Opener {
  constructor(openPin, closedPin, relayPin) {
    // Setup GPIO pins
    this.openPin = new GPIO(openPin,
      {
        mode: GPIO.INPUT,
        pullUpDown: GPIO.PUD_UP,
        edge: GPIO.EITHER_EDGE
      }
    );

    this.closedPin = new GPIO(closedPin,
      {
        mode: GPIO.INPUT,
        pullUpDown: GPIO.PUD_UP,
        edge: GPIO.EITHER_EDGE
      }
    );
    this.relayPin = new GPIO(relayPin, {mode: GPIO.OUTPUT});
    this.relayPin.digitalWrite(1);

    this.lastTriggered = 0; // Debounce variable
    this.openPin.on('interrupt', (level) => {
      var now = Date.now();
      if (now - this.lastTriggered > 300) {
        this.openTrigger(level);
        this.lastTriggered = now;
      }
    });
    this.closedPin.on('interrupt', (level) => {
      var now = Date.now();
      if (now - this.lastTriggered > 300) {
        this.closeTrigger(level);
        this.lastTriggered = now;
      }
    });

    if (!this.openPin.digitalRead())
      this.state = OPEN;
    else if (!this.closedPin.digitalRead())
      this.state = CLOSED;
    else
      this.state = NONE;
    this.want = NONE; // Changed per user request


    this.openTrigger = function(level) {
      if (level)
        this.closing();
      else
        this.opened();
    }
    this.closeTrigger = function(level) {
      if (level)
        this.opening();
      else
        this.closed();
    }

    /**
      Since there's no open/close wire to connect to, we can only toggle the door.
      A software check is run to determine whether or not we should toggle
      given each command.

      If the garage is in a middle state (i.e. not fully open OR closed) when the
      command is run, the door will be toggled once and then again if the desired
      state was not reached.
    **/

    /* Quickly toggle a relay closed and open to simulate a button press */
    this.toggle = function() {
      this.relayPin.digitalWrite(0);
      setTimeout(() => {
        this.relayPin.digitalWrite(1);
      }, 200);
    }

    this.toggleGarage = function() {
      if (this.state === OPEN || this.state === OPENING)
        this.closeGarage();
      else if (this.state === CLOSING || this.state === CLOSED)
        this.openGarage();
      else {
        console.log('Status unverifiable: toggling garage.')
        this.toggle();
      }
    }

    this.openGarage = function() {
      console.log('Opening garage');
      if (this.state !== OPEN) {
        this.want = OPEN;
        this.toggle();
        this.updateServer();
      } else
        console.log('Garage is already open.');
    }

    this.closeGarage = function() {
      console.log('Closing garage');
      if (this.state !== CLOSED) {
        this.want = CLOSED;
        this.toggle();
        this.updateServer();
      } else
        console.log('Garage is already closed.');
    }

    /* This is run when the openPin switch is connected */
    this.opened = function() {
      console.log('Garage is now open.');
      this.state = OPEN;
      if (this.want == CLOSED) // Toggle again if the intent was to close
        this.closeGarage();
      else
        this.want = NONE;
      this.updateServer();
    }

    /* This is run when the closedPin switch is disconnected */
    this.closing = function() {
      console.log('Garage is no longer open.');
      this.state = CLOSING;
      this.updateServer();
    }

    /* This is run when the closedPin switch is connected */
    this.closed = function() {
      console.log('Garage is now closed.');
      this.state = CLOSED;
      if (this.want == OPEN) // Toggle again if the intent was to open
        this.openGarage();
      else
        this.want = NONE;
      this.updateServer();
    }

    /* This is run when the openPin switch is disconnected */
    this.opening = function() {
      console.log('Garage is no longer closed.');
      this.state = OPENING;
      this.updateServer();
    }

    /* Returns status info */
    this.status = function() {
      return {STATE: this.state};
    }

    /* Set a Firebase document to be updated on state changes */
    this.setUpstream = function(doc) {
      this.upstreamServerDoc = doc;
      this.updateServer();
    }

    /*
      This is run on any state change and will send data to an upstream
      Firebase server document.
    */
    this.updateServer = function() {
      if(!this.upstreamServerDoc)
        return;

      console.log('updating with ',this.status());
      this.upstreamServerDoc.update(this.status())
      .catch((err) => {
        console.error('Error updating server: ', err)
      });
    }
  }

  get isOpen() {
    return this.state === OPEN;
  }
  get isClosed() {
    return this.state === CLOSED;
  }
}
