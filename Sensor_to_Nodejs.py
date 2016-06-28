import time
import sys
import json
import RPi.GPIO as GPIO

TRIG = 11
ECHO = 12

def setup():
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(TRIG, GPIO.OUT)
    GPIO.setup(ECHO, GPIO.IN)

def distance():
    GPIO.output(TRIG, 0)
    time.sleep(0.000002)

    GPIO.output(TRIG, 1)
    time.sleep(0.00001)
    GPIO.output(TRIG, 0)

    
    while GPIO.input(ECHO) == 0:
        a = 0
    time1 = time.time()
    while GPIO.input(ECHO) == 1:
        a = 1
    time2 = time.time()

    during = time2 - time1
    return during * 340 / 2 * 100

def loop():
    i=1067
    #while True:
    dis = distance()
    
    # send value two times to demonstrate sending
    # data from two different sensors to cloud
    print dis, dis/100 #'cm, m'
##    return dis

def destroy():
    GPIO.cleanup()


if __name__ == "__main__":

    setup()
    
    
    #print "Press Ctrl-C to quit."   
    try:
        loop()
    except KeyboardInterrupt:
        destroy()

    destroy()


