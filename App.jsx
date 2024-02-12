/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import {
 View, Text, Alert, Button, ScrollView, TouchableOpacity, TextInput
} from 'react-native';
import BluetoothControler from './src/controllers/BluetoothControler';
import base64 from 'react-native-base64'

function App(){

  //don't allow duplicates
  const bluetoothDevicesList = new Set()

  const SERVICE_UUID = "734b5896-7faf-457a-bb83-15c0e3bc2453"
  const WRITE_CHARACTERISTIC_UUID = "36ac8b55-5dc7-4686-8dd2-99267a3341d8"
  const READ_CHARACTERISTIC_UUID =  "ce527533-3c33-4346-8cbf-83e079805460"

  const [showDevices,setShowDevices] = useState([])
  const [scanning,setScanning] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [deviceId,setDeviceID] = useState('')
  const [msg,setMsg] = useState('')


  useEffect(()=>{

    startup = async () =>{

      const permissions = await BluetoothControler.requirePermissions()
      if(permissions === false)
      {
        Alert.alert("Please, grant all requested permissions to use this app");
      }

      //checking if BLE is activated
      const BleOn = await BluetoothControler.isBluetoothActivated();

      if(BleOn === false)
      {
        Alert.alert("Please, turn on the Bluetooth");
      }

    }

    startup();

  },[]);

  function scanCallback(erro,device){
    if(device.name === "RN_BLE_IOT")
    {
       bluetoothDevicesList.add(`{\"name\":\"${device.name}\", \"id\": \"${device.id}\"}`);
       setShowDevices(Array.from(bluetoothDevicesList));
    }
  }

  function disconnectedCallback(erro,device){
    console.log(`Device: ${device.id} Disconnected`)

    setDeviceConnected(false);
  }

  function notificationCallback(erro,characteristic)
  {
    try{
      console.log("Notification triggered");

      const value = base64.decode(characteristic.value);
 
      console.log(value)

      Alert.alert(`Notification received: ${value}`)
    }
    catch(err)
    {
      console.log(`Notification erro: ${err}`)
    }

  }

  function startScan(){
    setScanning(true)
    BluetoothControler.startScan(scanCallback)
  }

  function stopScan(){
    setScanning(false)
    BluetoothControler.stopScan()
  }

  async function click_device(id){
    const bleConnected = await BluetoothControler.connectToDevice(id,disconnectedCallback);

    setDeviceConnected(bleConnected);

    if(bleConnected === true)
    {
      Alert.alert("Connected!!");
      setDeviceID(id)

      //turn on notifications
      BluetoothControler.enableNotifications(id,SERVICE_UUID,READ_CHARACTERISTIC_UUID,notificationCallback)
    }

  }

  async function send_msg()
  {
    try{
      await BluetoothControler.sendMessageToDevice(deviceId,msg,SERVICE_UUID,WRITE_CHARACTERISTIC_UUID);
      Alert.alert("Message Sent")
    }
    catch(err)
    {
      Alert.alert("Couldn't send message to device");
      console.log(err)
    }
  }

  return(
    <View>
      <Text>Final App!</Text>
      <Button onPress={scanning ? stopScan : startScan} title={scanning === true ? ("Stop Scan") : ("Start Scan")}></Button>
    <View>

    <View>
      {
        deviceConnected ? (<View>
                              <Text>Send Message to device </Text>
                              <TextInput value={msg}
                              onChangeText={(text)=>{setMsg(text)}}/>
                              <Button title='Send message to Device' onPress={send_msg}></Button>
                          </View>) : (<View></View>)
      }
    </View>
    
        <ScrollView>
          {
            showDevices.map((data, index)=>{
              const jData = JSON.parse(data);
              return(
                <TouchableOpacity key={index} onPress={()=>click_device(jData.id)}>
                <Text>{jData.name}</Text>
                <Text>{jData.id}</Text>
              </TouchableOpacity>
              )

            })
          }
        </ScrollView>
      </View>
    </View>
  )
}




export default App;
