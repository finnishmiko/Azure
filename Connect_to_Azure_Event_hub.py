## Send data from Raspberry Pi to Azure Event hub ##

import time
import sys
from azure.servicebus import ServiceBusService
import json

## Event hub ##
NamespaceName = "<add namespace name here>"
## Namespace is called "Endpoint" in Azure connection string.  ##
## From Namespace ignore "sb://" and "servicebus.windows.net/" ##

## Policy ##
## To the Event Hub create a new policy and use these keys for connection ##
SharedAccessKeyName="<add event hub policy name here>"
SharedAccessKey="<add policy key here>"
EntityPath="<add event hub name here>" # This is same as EventHub name with lower case letters

## Create service bus connection ##
sbs = ServiceBusService(NamespaceName,shared_access_key_name=SharedAccessKeyName, shared_access_key_value=SharedAccessKey)

## Test with sending some JSON data ##
print "Press Ctrl-C to quit."
i=1000
while(True):
    i += 1
    temp = {'DeviceId': "RaspberryPi", 'Temperature': float(i)}
    print temp
    sbs.send_event(EntityPath, json.dumps(temp))
    
    time.sleep(3)

