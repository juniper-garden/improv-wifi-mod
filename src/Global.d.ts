declare var uuid;
declare module "bleserver" {
    class BLEServer  {
        constructor(){}
        onReady(args?:any){}
        onConnected(device: Device){}
        startAdvertising(params: IStartAdvertisingParams){}
        stopAdvertising(){}
        onDisconnected(device: Device){}
        onCharacteristicNotifyEnabled(characteristic: Characteristic){}
        onCharacteristicNotifyDisabled(characteristic: Characteristic){}
        onCharacteristicWritten(characteristic: Characteristic, value: any){}
        onCharacteristicRead(characteristic: Characteristic){}
        disconnect(){}
        notifyValue(characteristic: Characteristic, value: any){}
        close(){}
    }
    export {BLEServer as default};
}

declare module "gap" {
    const gap:any = {};
    export {gap as default};
}

declare module "btutils" {
    const uuid:any
    export {uuid};
}
interface IStartAdvertisingParams {
    advertisingData: any;
    connectable?: boolean;
    discoverable?: any;
    fast?: boolean;
    filterPolicy?:number;
    scanResponseData?: any;
}

class Device {
    connection: number;
    address: string;
    addressType: string;
    scanResponse: any;
    rssi: number;

    exchangeMTU(mtu:number){}
    onMTUExchanged(device:Device, mtu:number){}
    onConnected(device:Device){}
    onDisconnected(){}
    readRSSI(device: Device, rssi:number){}
    discoverAllPrimaryServices(){}
    discoverPrimaryService(uuid:string){}
    findServiceByUUID(uuid:string){}
}

class Service {
    connection: number;
    uuid: string;
    start: number;
    end: number;
    characteristics: Characteristic[];

    discoverAllCharacteristics(){}
    discoverCharacteristic(uuid:string){}
    findCharacteristicByUUID(uuid:string){}
    onCharacteristics(characteristics: Characteristic[]){}
}

class Characteristic {
    connection: number;
    uuid: string;
    service: string;
    handle: number;
    name:string;
    type:string;
    descriptors: any[];

    discoverAllDescriptors(){}
    onDescriptors(descriptors:any[]){}
    findCharacteristicByUUID(uuid:string){}
    onCharacteristics(characteristics: Characteristic[]){}
    enableNotifications(){}
    onCharacteristicNotificationEnabled(characteristic:Characteristic){}
    disableNotifications(){}
    onCharacteristicNotificationDisabled(characteristic:Characteristic){}
}