'use strict';

var Transport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;



var correlationIdStatus = {};

let setProps = (msg) => {
  
  if(!(msg && (msg.eventType == "RideEnd" || msg.eventType == "PhotoTriggered"))) {
    return;
  }

  let corrStatus = correlationIdStatus[msg.correlationId];
  
  if(!corrStatus) {
    corrStatus = {
      photoTriggered : false,
      endRide: false
    }
  }

  if(msg.eventType == "RideEnd") {
    corrStatus.endRide = true;
    corrStatus.endRideTime = msg.deviceTime;
  } 
  if(msg.eventType == "PhotoTriggered") {
    corrStatus.photoTriggered = true;
  }

  corrStatus.deviceTime = new Date(msg.deviceTime);
  corrStatus.rideId = msg.rideId;
  corrStatus.trainId = msg.trainId;
  correlationIdStatus[msg.correlationId] = corrStatus;
};

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');

        // Act on input messages to the module.
        client.on('inputMessage', (inputName, msg) => {
          client.complete(msg, printResultFor('Receiving message'));
          var message = msg.getBytes().toString('utf8');
          var messageBody = JSON.parse(message);
          if (messageBody) {
              console.log(`MessageBody ${JSON.stringify(messageBody)}`);
              setProps(messageBody);
          }
        });
      }
    });

      setInterval(() => {
        let evictTime = new Date(Date.now() - 300000);
        let ignoreTime = new Date(Date.now() - 3000000);

        console.log("Checking for offending rides.");
        Object.keys(correlationIdStatus).forEach((correlationId, index) => {
          let corrStatus = correlationIdStatus[correlationId];

          if(corrStatus.deviceTime < evictTime && corrStatus.endRide) {
            if(!corrStatus.photoTriggered) {
              var outputMsg = new Message();

              outputMsg.properties.add('rideId', corrStatus.rideId);
              outputMsg.properties.add('trainId', corrStatus.trainId);
              outputMsg.properties.add('correlationId', correlationId);
              outputMsg.properties.add('endRideTime', corrStatus.endRideTime);
              outputMsg.properties.add('deviceTime', new Date());
              outputMsg.properties.add('MessageType', 'PhotoNotTriggered');

              console.log(`Ride with correlation ID ${correlationId} did not have the camera triggered!!!!`);
              client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
            }

            delete correlationIdStatus[correlationId];
          }
          if(corrStatus.deviceTime < ignoreTime) {
            console.log(`end event never received for ${correlationId}, ignoring...`);
            delete correlationIdStatus[correlationId];
          }
        });
      }, 10000);

    }
});

/*
function processMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
        var messageBody = JSON.parse(message);
        if (messageBody) {
            //console.log(`Machine temperature ${messageBody.machine.temperature} exceeds threshold ${temperatureThreshold}`);
            var outputMsg = new Message(message);
            outputMsg.properties.add('MessageType', 'Alert');
            client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
        }
  }
}
*/

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
