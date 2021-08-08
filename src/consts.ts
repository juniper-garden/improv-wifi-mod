const SERVICES_MAP = {
    SERVICE : "00467768-6228-2272-4663-277478268000",
    STATE : "00467768-6228-2272-4663-277478268001",
    ERROR : "00467768-6228-2272-4663-277478268002",
    RPC_COMMAND : "00467768-6228-2272-4663-277478268003",
    RPC_RESULT: "00467768-6228-2272-4663-277478268004",
    CAPABILITIES: "00467768-6228-2272-4663-277478268005",    
}
Object.freeze(SERVICES_MAP)

const ErrorCodes = {
    ERROR_NONE: 0x00,
    ERROR_INVALID_RPC: 0x01,
    ERROR_UNKNOWN_RPC: 0x02,
    ERROR_UNABLE_TO_CONNECT: 0x03,
    ERROR_NOT_AUTHORIZED: 0x04,
    ERROR_UNKNOWN: 0xFF,
};
Object.freeze(ErrorCodes);

const StateCodes = {
    STATE_STOPPED: 0x00,
    STATE_AWAITING_AUTHORIZATION: 0x01,
    STATE_AUTHORIZED: 0x02,
    STATE_PROVISIONING: 0x03,
    STATE_PROVISIONED: 0x04
};
Object.freeze(StateCodes);

const Commands = {
    UNKNOWN: 0x00,
    WIFI_SETTINGS: 0x01,
    IDENTIFY: 0x02,
    BAD_CHECKSUM: 0xFF,
};
Object.freeze(Commands);

const exports = {
    Commands,
    SERVICES_MAP,
    StateCodes,
    ErrorCodes
}
Object.freeze(exports)

export default exports;