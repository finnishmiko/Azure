// Modified simple_sample_device.js from 
// https://github.com/Azure/azure-iot-sdks/tree/master/node/device/samples
// Added 
// - child_process to read real sensor data from Python-program.
//   In this case two values are received and they are split to JSON package.
// - child_process to call Python-program if certain command is received
//   from cloud.

'use strict';

var Protocol = require('azure-iot-device-amqp').Amqp;
// Uncomment one of these transports and then change it in fromConnectionString to test other transports
// var Protocol = require('azure-iot-device-amqp-ws').AmqpWs;
// var Protocol = require('azure-iot-device-http').Http;
// var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

// String containing Hostname, Device Id & Device Key in the following formats:
var connectionString = 'HostName=<iothub_host_name>.azure-devices.net;DeviceId=<device_id>;SharedAccessKey=<device_key>';

// fromConnectionString must specify a transport constructor, coming from any transport package.
var client = Client.fromConnectionString(connectionString, Protocol);

var connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    
    // Receive c2d-message and run related Python-program
    client.on('message', function (msg) {
		
	console.log(msg.data.toString());
    client.complete(msg, printResultFor('completed'));
    // reject and abandon follow the same pattern.
    // /!\ reject and abandon are not available with MQTT
    
    var v = msg.data.toString();
	if(v == "foo" ) {
		//console.log("if", viesti, v);
		var spawn1 = require('child_process').spawn,
			py1 = spawn1('python', ['05_laser.py']);
		py1.stdout.on('data',(data) =>{});
	} 
	else if (v == "bar") {
		var spawn2 = require('child_process').spawn,
			py1 = spawn2('python', ['05_laser-off.py']);
		//console.log(v, "else", viesti );
		py1.stdout.on('data',(data) =>{});
	}
	else {console.log("else");}


    }); //end of client.on



    // Create a message and send it to the IoT Hub every second
    var sendInterval = setInterval(function () {
      var spawn = require('child_process').spawn,
		py = spawn('python', ['Sensor_to_Nodejs.py']);
	py.stdout.on('data',(data) =>{console.log(data.toString());
	var sensorDataArray = data.toString();
	sensorDataArray = sensorDataArray.split(" ");
	var sensorData1 = Number(sensorDataArray[0]);
	var sensorData2 = Number(sensorDataArray[1]);
	var dataToCloud = JSON.stringify({ Ultrasonic: sensorData1, Range: sensorData2 });

      var message = new Message(dataToCloud);
      message.properties.add('myproperty', 'myvalue');
      console.log('Sending message: ' + message.getData());
      client.sendEvent(message, printResultFor('send'));
})
    }, 2000);

    client.on('error', function (err) {
      console.error(err.message);
    });

    client.on('disconnect', function () {
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.connect(connectCallback);
    });
  }
};

client.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}
