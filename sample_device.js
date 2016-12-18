// Modified simple_sample_device.js from 
// https://github.com/Azure/azure-iot-sdks
// with licence:
//     Copyright (c) Microsoft. All rights reserved.
//     Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Added 
// - child_process to read real sensor data from Python-program.
//   In this case two values are received and they are split to JSON package
//   and send to cloud
// - child_process to call Python-program if certain command is received
//   from cloud. Run pre-defined Python program
// - read twin at startup and update if needed
// - invoke device methods
//

'use strict';

//var Protocol = require('azure-iot-device-amqp').Amqp;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp-ws').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var ConnectionString = require('azure-iot-device').ConnectionString;

// String containing Hostname, Device Id & Device Key in the following formats:
//  "HostName=<iothub_host_name>;DeviceId=<device_id>;SharedAccessKey=<device_key>"
var connectionString = '';

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

// Device meta data
var deviceId = ConnectionString.parse(connectionString).DeviceId;

var sendDelay = 60;
var humidity = 50;
var externalTemperature = 55;

var deviceMetaData = {
  'ObjectType': 'DeviceInfo',
  'IsSimulatedDevice': 0,
  'Version': '1.0',
  'DeviceProperties': {
    'DeviceID': deviceId,
    'DeviceState': 'normal',
    'UpdatedTime': null,
    'Manufacturer': 'Oy',
    'ModelNumber': 'Raspberry Pi 3',
    'SerialNumber': 'SER9090',
    'FirmwareVersion': '1.10',
    'Platform': 'node.js',
    'Processor': 'ARM',
    'InstalledRAM': '64 MB',
    'Latitude': 62.617025,
    'Longitude': 22.191285
  },
  'Commands': [{
    'Name': 'SetDelay',
    'Parameters': [{
      'Name': 'SendDelay',
      'Type': 'int minutes'
    }]
  },
    {
      'Name': 'SetHumidity',
      'Parameters': [{
        'Name': 'Humidity',
        'Type': 'double'
      }]
    }]
};

//console.log('Device metadata:\n' + JSON.stringify(deviceMetaData.Commands[0].Parameters[0].Type));

var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
    setTimeout(function(){
		clearInterval(sendInterval);
		client.removeAllListeners();
		client.open(connectCallback);
		}, 15*1000)
  } else {
    console.log('Client connected');
    startupTwinOperations();
    onGetMeasurement();
    client.on('message', function (msg) {
		console.log(msg.data.toString());
		client.complete(msg, printResultFor('completed'));
		// reject and abandon follow the same pattern.
		// /!\ reject and abandon are not available with MQTT

		var v = msg.data.toString();
		var v = JSON.parse(v);
		//var v = v['text'];
	if(v == "foo" ) {
		console.log("Received message to turn LED on. ", v);
		var spawn1 = require('child_process').spawn,
			py1 = spawn1('python', ['05_laser.py']);
		py1.stdout.on('data',(data) =>{});// console.log("test",data.toString() );});
	} 
	else if (v == "bar") {
		var spawn2 = require('child_process').spawn,
			py1 = spawn2('python', ['05_laser-off.py']);
		console.log("Reveiced message to turn off LED. ", v);
		py1.stdout.on('data',(data) =>{});// console.log("test",data.toString() );});
	}
	else if (v == "getMeasurement") {
		console.log("Executing: ", v);
		onGetMeasurement();
	}
	else {console.log("Rxd unrecognized msg. ", v);}
    }); //end of client.on



    // Create a message and send it to the IoT Hub every second
    var sendInterval = setInterval(function () {
      var spawn = require('child_process').spawn,
		py = spawn('python', ['28_humiture.py']);
		
		py.stdout.on('data',(data) =>{console.log(data.toString());
		var sensorDataArray = data.toString();
		sensorDataArray = sensorDataArray.split(" ");
		var sensorData1 = Number(sensorDataArray[0]);
		var sensorData2 = Number(sensorDataArray[1]);
		var sensorData3 = Number(sensorDataArray[2]);
		var dataToCloud = JSON.stringify({ temp: sensorData1, hum: sensorData2, VOC: sensorData3 });

      var message = new Message(dataToCloud);
      //message.properties.add('myproperty', 'myvalue');
      console.log('Sending message: ' + message.getData());
      client.sendEvent(message, printResultFor('send'));
      console.log('Send delay: ' + sendDelay);
})
    }, sendDelay*60*1000);

    client.on('error', function (err) {
      console.error('Errol ' + err.message);
      //clearInterval(sendInterval);
      //client.removeAllListeners();
      //client.open(connectCallback);
    });

    client.on('disconnect', function () {
		console.log('Disconnected');
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
    
    client.onDeviceMethod('onGetDeviceLog', onGetDeviceLog);
    client.onDeviceMethod('reboot', onReboot);
    
  }
};


function onGetMeasurement() {
    // print method name
    console.log('Received message to get measurement.');
	var spawn = require('child_process').spawn,
		py = spawn('python', ['28_humiture.py']);
		
		py.stdout.on('data',(data) =>{console.log(data.toString());
		var sensorDataArray = data.toString();
		sensorDataArray = sensorDataArray.split(" ");
		var sensorData1 = Number(sensorDataArray[0]);
		var sensorData2 = Number(sensorDataArray[1]);
		var sensorData3 = Number(sensorDataArray[2]);
		var dataToCloud = JSON.stringify({ temp: sensorData1, hum: sensorData2, VOC: sensorData3 });

    var message = new Message(dataToCloud);
    console.log('Sending requested message: ' + message.getData());
    client.sendEvent(message, printResultFor('send'));
	})
}


function onGetDeviceLog(request, response) {
    // print method name
    console.log('Received method call for method \'' + request.methodName + '\'');

    // if there's a payload just do a default console log on it
    if(!!(request.payload)) {
        console.log('Payload:\n' + request.payload);
    }

    // Implement actual logic here.
    var devMeta = JSON.stringify(deviceMetaData)
    // complete the response
    response.send(200, devMeta, function(err) {
        if(!!err) {
            console.error('An error ocurred when sending a method response:\n' +
                err.toString());
        } else {
            console.log('Response to method \'' + request.methodName +
                '\' sent successfully.' );
        }
    });
}


function onReboot(request, response) {
      response.send(200, 'Reboot started', function(err) {
        if (err) {
          console.error('An error occured when sending a method response:\n' + err.toString());
        } else {
          console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
      });
      
      // Get device Twin
      client.getTwin(function(err, twin) {
        if (err) {
          console.error('could not get twin');
        } else {
          console.log('twin acquired');
          
          // Update the reported properties for this device through the 
          // twin.  This enables the back end app to query for all device that
          // have completed a reboot based on the lastReboot property.
          twin.properties.reported.update({
            iothubDM : {
              reboot : {
                startedRebootTime : new Date().toISOString(),
              }
            }
          }, function(err) {
            if (err) console.error('Error updating twin');
            else console.log('Device reboot twin state reported')
          });  
        }
      });
      
      // Add your device's reboot API for physical restart.
      console.log('Rebooting!');
      var spawn1 = require('child_process').spawn,
			py1 = spawn1('sudo', ['reboot']);      
}


function startupTwinOperations(){
	client.getTwin(function(err, twin) {
             if (err) {
                 console.error('could not get twin');
             } else {
                 console.log('retrieved device twin');
                 twin.properties.reported.telemetryConfig = {
                     configId: "0",
                     sendFrequency: sendDelay
                 }
                 twin.on('properties.desired', function(desiredChange) {
                     console.log("received change: "+JSON.stringify(desiredChange));
                     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
                     if (desiredChange.telemetryConfig &&desiredChange.telemetryConfig.configId !== currentTelemetryConfig.configId) {
                         initConfigChange(twin);
                     }
                 });
             }
         });
}


 var initConfigChange = function(twin) {
     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
     currentTelemetryConfig.pendingConfig = twin.properties.desired.telemetryConfig;
     currentTelemetryConfig.status = "Pending";

     var patch = {
     telemetryConfig: currentTelemetryConfig
     };
     twin.properties.reported.update(patch, function(err) {
         if (err) {
             console.log('Could not report properties');
         } else {
             console.log('Reported pending config change: ' + JSON.stringify(patch));
             setTimeout(function() {completeConfigChange(twin);}, 20000);
         }
     });
 }

 var completeConfigChange =  function(twin) {
     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
     currentTelemetryConfig.configId = currentTelemetryConfig.pendingConfig.configId;
     currentTelemetryConfig.sendFrequency = currentTelemetryConfig.pendingConfig.sendFrequency;
     currentTelemetryConfig.status = "Success";
     delete currentTelemetryConfig.pendingConfig;

     var patch = {
         telemetryConfig: currentTelemetryConfig
     };
     patch.telemetryConfig.pendingConfig = null;
	 
	 //console.log('Curre: ' + currentTelemetryConfig.sendFrequency);
	 sendDelay = currentTelemetryConfig.sendFrequency
     
     twin.properties.reported.update(patch, function(err) {
         if (err) {
             console.error('Error reporting properties: ' + err);
         } else {
             console.log('Reported completed config change: ' + JSON.stringify(patch));
         }
     });
 };


function main(){
	client.open(connectCallback);
}


// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
	  console.log('Helper function');
    if (err) console.log(op + ' error: ' + err.toString());
    //if (err) {
	//	console.log(op + ' error: ' + err.toString());
		//setTimeout(function(){
	//	clearInterval(sendInterval);
	//	client.removeAllListeners();
	//	client.open(connectCallback);
		//}, 60*1000)
	//	}
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}


main();
