## Send single device to cloud message using paho MQTT
##
## Code from
##https://gist.github.com/tomconte/eef8c9bfb4434787672c303153eee500#file-send_iot-hub_paho_mqtt-py
##
## SAS-token was generated with Device Explorer (Management --> SAS Token...)
##

import paho.mqtt.publish as publish
import paho.mqtt.client as mqtt
import ssl

auth = {
  'username':"<your IoT-hub name here>.azure-devices.net/<your device name here>",
  'password':"SharedAccessSignature sr=iothubName.azure-devices.net%2fdevices%2fYourDeviceName&sig=XXX...X&se=XXX"
}

tls = {
  'ca_certs':"/etc/ssl/certs/ca-certificates.crt",
  'tls_version':ssl.PROTOCOL_TLSv1
}

publish.single("devices/<your device name here>/messages/events/",
  payload="hello world 1",
  hostname="<your IoT-hub name here>.azure-devices.net",
  client_id="HumidityTemp",
  auth=auth,
  tls=tls,
  port=8883,
  protocol=mqtt.MQTTv311)


