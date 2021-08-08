import BLEServer from "bleserver";
import GAP from 'gap';
import { uuid } from "btutils";
import BLEExports from './consts';
const StateCodes = BLEExports.StateCodes;
const ErrorCodes = BLEExports.ErrorCodes;
const Commands = BLEExports.Commands;
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
        let advertisingData = {
            flags: GAP.ADFlag.LE_GENERAL_DISCOVERABLE_MODE,
            completeName: this.deviceName,
            shortName: this.deviceName,
            serviceDataUUID128: [uuid `00467768-6228-2272-4663-277478268000`],
            completeUUID128List: [
                uuid `00467768-6228-2272-4663-277478268000`,
                uuid `00467768-6228-2272-4663-277478268001`,
                uuid `00467768-6228-2272-4663-277478268002`,
                uuid `00467768-6228-2272-4663-277478268003`,
                uuid `00467768-6228-2272-4663-277478268004`,
                uuid `00467768-6228-2272-4663-277478268005`
            ],
            solicitationUUID128List: [
                uuid `00467768-6228-2272-4663-277478268000`,
                uuid `00467768-6228-2272-4663-277478268001`,
                uuid `00467768-6228-2272-4663-277478268002`,
                uuid `00467768-6228-2272-4663-277478268003`,
                uuid `00467768-6228-2272-4663-277478268004`,
                uuid `00467768-6228-2272-4663-277478268005`
            ]
        };
        this.startAdvertising({ advertisingData });
    }
    onDisconnected() {
        this.state = StateCodes.STATE_AUTHORIZED;
        this.error = ErrorCodes.ERROR_NONE;
        this.errorCharacteristic = null;
        this.stateCharacteristic = null;
        this.startImprov();
    }
    onReady() {
        this.startImprov();
    }
    onCharacteristicRead(characteristic) {
        if (characteristic.name === "STATE") {
            return this.state;
        }
        if (characteristic.name === "ERROR") {
            return this.error;
        }
    }
    onConnected() {
        this.state = StateCodes.STATE_AUTHORIZED;
        this.error = ErrorCodes.ERROR_NONE;
    }
    onCharacteristicNotifyDisabled(characteristic) {
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
        // this is where we go and update state again if necessary
        switch (characteristic.name) {
            case "RPC_COMMAND":
                this.ssid = value;
                if (value[0] === Commands.WIFI_SETTINGS) {
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
        const ssid_length = data[2];
        const ssid_start = 3;
        const ssid_end = ssid_start + ssid_length;
        const pass_length = data[ssid_end];
        const pass_start = ssid_end + 1;
        const pass_end = pass_start + pass_length;
        const ssid = this.buildValue(data, ssid_start, ssid_end);
        const password = this.buildValue(data, pass_start, pass_end);
        let result = this.onCredentialsRecieved({ ssid, password });
        if (!result) {
            this.state = StateCodes.STATE_STOPPED;
            this.notifyState();
        }
        else {
            this.state = StateCodes.STATE_PROVISIONED;
            this.notifyState();
        }
    }
    buildValue(data, start, end) {
        let str = '';
        for (var i = start; i < end; i++) {
            str += String.fromCharCode(data[i]);
        }
        return str;
    }
    notifyState() {
        if (!this.stateCharacteristic)
            return;
        this.notifyValue(this.stateCharacteristic, this.state);
    }
    notifyError() {
        if (!this.errorCharacteristic)
            return;
        this.notifyValue(this.errorCharacteristic, this.error);
    }
    couldNotConnect() {
        this.error = ErrorCodes.ERROR_UNABLE_TO_CONNECT;
        this.notifyError();
    }
}
