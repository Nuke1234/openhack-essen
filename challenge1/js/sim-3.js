// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

// The device connection string to authenticate the device with your IoT hub.
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application
// or use an HSM or an x509 certificate.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security
var connectionString = 'HostName=Wingtip-IOT.azure-devices.net;DeviceId=sim3;SharedAccessKey=G8OI0zUlFyIncSjocWe8ZRF3unKfYu1H3zLiDfXBkKg=';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
//   Run 'npm install azure-iot-device-mqtt' to install the required libraries for this application
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

const uuidv1 = require('uuid/v1')

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Print results.
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Create a message and send it to the IoT hub every second
setInterval(function(){
  // Simulate telemetry.
  var ticketId = uuidv1();
  let entryTime = new Date();

  // Add the telemetry to the message body.
  var data = JSON.stringify({ ticketId, entryTime });
  var message = new Message(data);

  console.log('Sending message: ' + message.getData());

  // Send the message.
  client.sendEvent(message, printResultFor('send'));
}, 1000);