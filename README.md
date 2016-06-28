# Azure
## Send data to IoT Hub - no SDKs needed
With Python's [Requests](http://docs.python-requests.org/en/master/)
- d2cMsgSender_Receiver.py

With paho MQTT
- mqtt_send_single_message.py

## Send data to IoT Hub with azure-iot-sdks
Nodejs seems to work in Raspberry Pi
- nodejs-send_d2c_data_from_python.js

These Python programs are called with the nodejs application
- Sensor_to_Nodejs.py
- 05_laser.py
- 05_laser-off.py

## Send data to Event Hub
Install Azure SDK:
- Raspian: sudo pip install azure-servicebus
- Windows: python -m pip install azure-servicebus
- Connect_to_Azure_Event_hub.py

Create a new policy to the Event Hub and then following information from Azure are needed to make a connection:
- Event Hub name
- Namespace name
- Shared Access Key Name
- Shared Access Key
