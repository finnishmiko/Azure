"""
Module Name:  c2dMsgSender_Receiver.py

To the D2CMsgSender class from
https://github.com/Azure-Samples/iot-hub-python-get-started
two functions were added: receiveC2DMsg and completeC2DMsg
"""

import base64
import hmac
import hashlib
import time
import requests
import urllib

import json

class D2CMsgSender:
    
    API_VERSION = '2016-02-03'
    TOKEN_VALID_SECS = 10
    TOKEN_FORMAT = 'SharedAccessSignature sig=%s&se=%s&skn=%s&sr=%s'
    
    def __init__(self, connectionString=None):
        if connectionString != None:
            iotHost, keyName, keyValue = [sub[sub.index('=') + 1:] for sub in connectionString.split(";")]
            self.iotHost = iotHost
            self.keyName = keyName
            self.keyValue = keyValue
            
    def _buildExpiryOn(self):
        return '%d' % (time.time() + self.TOKEN_VALID_SECS)
    
    def _buildIoTHubSasToken(self, deviceId):
        resourceUri = '%s/devices/%s' % (self.iotHost, deviceId)
        targetUri = resourceUri.lower()
        expiryTime = self._buildExpiryOn()
        toSign = '%s\n%s' % (targetUri, expiryTime)
        key = base64.b64decode(self.keyValue.encode('utf-8'))
        signature = urllib.quote(
            base64.b64encode(
                hmac.HMAC(key, toSign.encode('utf-8'), hashlib.sha256).digest()
            )
        ).replace('/', '%2F')
        return self.TOKEN_FORMAT % (signature, expiryTime, self.keyName, targetUri)

    def sendD2CMsg(self, deviceId, message):
        sasToken = self._buildIoTHubSasToken(deviceId)
        url = 'https://%s/devices/%s/messages/events?api-version=%s' % (self.iotHost, deviceId, self.API_VERSION)
        r = requests.post(url, headers={'Authorization': sasToken}, data=message)
        return r.text, r.status_code

    def receiveC2DMsg(self, deviceId):
        sasToken = self._buildIoTHubSasToken(deviceId)
        url = 'https://%s/devices/%s/messages/devicebound?api-version=%s' % (self.iotHost, deviceId, self.API_VERSION)
        r = requests.get(url, headers={'Authorization': sasToken})
        return r#.headers#, r.text, r.status_code#, r.json()

    def completeC2DMsg(self, deviceId, etag):
        sasToken = self._buildIoTHubSasToken(deviceId)
        url = 'https://%s/devices/%s/messages/devicebound/%s?api-version=%s' % (self.iotHost, deviceId, etag, self.API_VERSION)
        print(url)
        r = requests.delete(url, headers={'Authorization': sasToken})
        return r.status_code

    
    
if __name__ == '__main__':
    connectionString = 'HostName=<iot-hub-name>.azure-devices.net;SharedAccessKeyName=device;SharedAccessKey=<device-policy-key>'
    d2cMsgSender = D2CMsgSender(connectionString)
    deviceId = 'WriteDevIdHere'
    #message = 'Hello, IoT Hub'
    
    message = json.dumps('{"Sensor":"530"}')
    print d2cMsgSender.sendD2CMsg(deviceId, message)

    cloudMessage = d2cMsgSender.receiveC2DMsg(deviceId)
    content_length = cloudMessage.headers['Content-Length']
    print (content_length)
    if (int(content_length) > 0):
        print('Message')
        etag = cloudMessage.headers['etag']
        etag = etag.replace("\"", "")
        print (etag)
        print cloudMessage.text
        print d2cMsgSender.completeC2DMsg(deviceId, etag)

    else:
        print('No messages')
        print cloudMessage.status_code
    #print type(cloudMessage)
