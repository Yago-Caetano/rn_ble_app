import { PermissionsAndroid, Platform } from "react-native"
import React from 'react';
import { BleManager } from "react-native-ble-plx"
import  base64  from "react-native-base64";

const manager = new BleManager();


export default BluetoothController = {

    async connectToDevice(id,disconnectedCallback)
    {
        try{
            const device = await manager.connectToDevice(id);
            await device.discoverAllServicesAndCharacteristics();
    
            device.onDisconnected(disconnectedCallback);

            return true
        }
        catch(err)
        {
            console.log(err)
            return false
        }


    },

    startScan(callback){
        manager.startDeviceScan(null,null,callback)
    },

    stopScan(){
        manager.stopDeviceScan()
    },

    async isBluetoothActivated(){
        const state = await manager.state();

        if(state === "PoweredOn")
        {
            return true;
        }
        return false;
    },

    async sendMessageToDevice(id,message,service_uuid,charact_uuid){
        await manager.writeCharacteristicWithoutResponseForDevice(id,service_uuid,charact_uuid,base64.encode(message))
    },

    enableNotifications(id,service_uid,charact_uuid,callback)
    {
        manager.monitorCharacteristicForDevice(id,service_uid,charact_uuid,callback);
    },

    async requirePermissions(){

        if(Platform.OS === 'ios')
        {
            return true
        }

        //take android version
        const apiLevel = parseInt(Platform.Version.toString(),10)

        if(apiLevel < 31)
        {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            return granted === PermissionsAndroid.RESULTS.GRANTED
        }
        else
        {
            const result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                                                                     PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                                                                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT])

            return(result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED);
        }

    }
}
