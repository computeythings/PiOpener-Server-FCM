"use strict"
const GPIO = require('pigpio').Gpio;
const sleep = require('sleep');

const OPEN = 'OPEN';
const CLOSED = 'CLOSED';

class Opener {
  constructor(openPin, closedPin, relayPin) {
    // socketClients will be alerted on state changes
    this.socketClients = [];
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

    this.isFullyOpen = !this.openPin.digitalRead();
    this.isFullyClosed = !this.closedPin.digitalRead();
    this.isOpening = false;
    this.isClosing = false;
    this.want = 0; // Changed per user request


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
      this.relayPin.trigger(200000, 0);
    }

    this.toggleGarage = function() {
      if (this.isOpening || this.isFullyOpen)
        this.closeGarage();
      else if (this.isClosing || this.isFullyClosed)
        this.openGarage();
      else {
        console.log('Status unverifiable: toggling garage.')
        this.toggle();
      }
    }

    this.openGarage = function() {
      console.log('Opening garage');
      if (!this.isFullyOpen) {
        this.want = OPEN;
        this.toggle();
        this.updateClient();
      } else
        console.log('Garage is already open.');
    }

    this.closeGarage = function() {
      console.log('Closing garage');
      if (!this.isFullyClosed) {
        this.want = CLOSE;
        this.toggle();
        this.updateClient();
      } else
        console.log('Garage is already closed.');
    }

    /* This is run when the openPin switch is connected */
    this.opened = function() {
      console.log('Garage is now open.');
      this.isFullyOpen = true;
      this.isOpening = false;
      if (this.want == CLOSED) // Toggle again if the intent was to close
        this.closeGarage();
      else
        this.want = 'NONE';
      this.updateClient();
    }

    /* This is run when the closedPin switch is disconnected */
    this.closing = function() {
      console.log('Garage is no longer open.');
      this.isClosing = true;
      this.isFullyOpen = false;
      this.updateClient();
    }

    /* This is run when the closedPin switch is connected */
    this.closed = function() {
      console.log('Garage is now closed.');
      this.isFullyClosed = true;
      this.isClosing = false;
      if (this.want == OPEN) // Toggle again if the intent was to open
        this.openGarage();
      else
        this.want = 'NONE';
      this.updateClient();
    }

    /* This is run when the openPin switch is disconnected */
    this.opening = function() {
      console.log('Garage is no longer closed.');
      this.isOpening = true;
      this.isFullyClosed = false;
      this.updateClient();
    }

    /* Returns status info */
    this.status = function() {
      var data = {};
      data.OPEN = this.isFullyOpen;
      data.CLOSED = this.isFullyClosed;
      data.OPENING = this.isOpening;
      data.CLOSING = this.isClosing;
      return data;
    }

    /* Add a client to be updated on state changes */
    this.addClient = function(client) {
      this.socketClients.push(client);
    }

    /* Remove from client update list */
    this.removeClient = function(client) {
      this.socketClients.splice(socketClients.indexOf(client), 1);
    }

    /*
      This is run on any state change and will return data to a socket
      client that has implemented an update callback method.
    */
    this.updateClient = function() {
      this.socketClients.forEach((client) => {
        element.update(this.status());
      });
    }
  }

  get isOpen() {
    return this.isFullyOpen;
  }
  get isClosed() {
    return this.isFullyClosed;
  }
}
