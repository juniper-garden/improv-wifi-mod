import BLEServer from "bleserver";
import GAP from 'gap';
import { uuid } from "btutils";
import BLEExports from './consts';
const StateCodes = BLEExports.StateCodes;
const ErrorCodes = BLEExports.ErrorCodes;
const Commands = BLEExports.Commands;

// FYI class definition for BLEServer can be found @ <moddable-project-dir>/modules/network/ble/bleserver.js
export default class ImprovWifi extends BLEServer {
    deviceName;
    ssid;
    state;
    error;
    stateCharacteristic;
    errorCharacteristic;
    rpcCharacteristic;
    onCredentialsRecieved;
    notify;
    constructor({ deviceName, onCredentialsRecieved }) {
        super();
        this.deviceName = deviceName;
        this.state = StateCodes.STATE_AUTHORIZED;
        this.error = ErrorCodes.ERROR_NONE;
        this.onCredentialsRecieved = onCredentialsRecieved;
    }
    startImprov() {
        trace("Starting Improv\n");
        let advertisingData = {
            flags: GAP.ADFlag.LE_GENERAL_DISCOVERABLE_MODE,
            completeUUID128List: [uuid `00467768-6228-2272-4663-277478268000`],
            completeName: this.deviceName,
            shortName: this.deviceName,
        };
        this.startAdvertising({ advertisingData });
    }
    onDisconnected() {
        trace("Disconnected\n");
        this.state = StateCodes.STATE_AUTHORIZED;
        this.error = ErrorCodes.ERROR_NONE;
        this.errorCharacteristic = null;
        this.stateCharacteristic = null;
        this.startImprov();
    }
    onReady() {
        trace("Ready\n");
        this.startImprov();
    }
    onCharacteristicRead(characteristic) {
        trace(`Read: ${JSON.stringify(characteristic)}\n`);
        switch(characteristic.name){
            case "ERROR":
                return this.error;
            case "STATE":
            case "RPC_RESULT":
                return this.state;
            default:
                trace(`I have no idea what ${characteristic.name} is supposed to be`);
                return this.error
        }
    }
    onConnected() {
        trace("Connected\n");
        this.state = StateCodes.STATE_AUTHORIZED;
        this.error = ErrorCodes.ERROR_NONE;
    }
    onCharacteristicNotifyDisabled(characteristic) {
        trace('onCharacteristicNotifyDisabled\n');
        switch (characteristic.name) {
            case 'STATE':
                this.stateCharacteristic = null;
                break;
            case 'ERROR':
                this.errorCharacteristic = null;
                break;
            case 'RPC_RESULT':
                this.rpcCharacteristic = null;
                break;
            case 'CAPABILITIES':
                break;
            default:
                this.error = ErrorCodes.ERROR_UNKNOWN;
                this.notifyError();
                break;
        }
    }
    onCharacteristicNotifyEnabled(characteristic) {
        trace(`onCharacteristicNotifyEnabled: characteristic: ${characteristic.name} \n`);
        this.notify = characteristic;
        switch (characteristic.name) {
            case 'STATE':
                this.stateCharacteristic = characteristic;
                this.notifyState();
                break;
            case 'ERROR':
                this.errorCharacteristic = characteristic;
                this.notifyValue(this.notify, this.error);
                break;
            case 'RPC_COMMAND':
                break;
            case 'RPC_RESULT':
                this.rpcCharacteristic = characteristic;
                break;
            case 'CAPABILITIES':
                this.notifyValue(this.notify, 0x01);
                break;
            default:
                this.error = ErrorCodes.ERROR_UNKNOWN;
                this.notifyError();
                break;
        }
    }
    onCharacteristicWritten(characteristic, value) {
        trace(`Written: ${characteristic.name}, in state ${characteristic.state}, with value ${value}, value[0] is ${value?.[0]}, which is a type ${typeof value?.[0]} \n`);
        // this is where we go and update state again if necessary
        switch (characteristic.name) {
            case "RPC_COMMAND":
                this.ssid = value;
                if (value[0] === Commands.WIFI_SETTINGS) {
                    trace("Handling wifi settings\n");
                    this.state = StateCodes.STATE_PROVISIONING;
                    this.notifyState();
                    this.handleInboundWifiSettings(value);
                }
                else {
                    this.error = ErrorCodes.ERROR_UNKNOWN_RPC;
                    this.notifyError();
                }
                break;
            default:
                this.error = ErrorCodes.ERROR_UNKNOWN;
                this.notifyState();
                break;
        }
    }
    handleInboundWifiSettings(data) {
        trace("Handling inbound wifi settings\n");
        const ssid_length = data[2];
        const ssid_start = 3;
        const ssid_end = ssid_start + ssid_length;
        const pass_length = data[ssid_end];
        const pass_start = ssid_end + 1;
        const pass_end = pass_start + pass_length;
        const ssid = this.buildValue(data, ssid_start, ssid_end);
        const password = this.buildValue(data, pass_start, pass_end);
        let result = this.onCredentialsRecieved({ ssid, password });
        trace(`Result of onCredentialsRecieved is ${result}\n`);
        if (!result) {
            trace("Credentials weren't authorized :( \n");
            this.state = StateCodes.ERROR_UNKNOWN;
            this.error = ErrorCodes.ERROR_NOT_AUTHORIZED;
            this.notifyError();
            return;

        }
        trace("Credentials were authorized :) \n");
        this.state = StateCodes.STATE_PROVISIONED;
        this.notifyState();
    }
    buildValue(data, start, end) {
        trace(`Building value from ${start} to ${end}\n`);
        let str = '';
        for (var i = start; i < end; i++) {
            str += String.fromCharCode(data[i]);
        }
        return str;
    }
    notifyState() {
        trace(`Notifying state: ${this.state}\n`);
        if (!this.stateCharacteristic)
            return;
        this.notifyValue(this.stateCharacteristic, this.state);
    }
    notifyError() {
        trace(`Notifying this characteristic: ${this.errorCharacteristic?.name} this error:  ${this.error}\n`);
        if (!this.errorCharacteristic)
            return;

        this.notifyValue(this.errorCharacteristic, this.error);
    }
    couldNotConnect() {
        trace("Could not connect\n");
        this.error = ErrorCodes.ERROR_UNABLE_TO_CONNECT;
        this.notifyError();
    }
}
