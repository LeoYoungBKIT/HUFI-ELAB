export interface IDeviceType {
    DeviceId?: String,
    DeviceName: String,
    DeviceType: String,
    Model: String,
    Origin: String,
    Unit: String,
    Standard: String,
    Quantity: Number,
    HasTrain: Number,
    ManufacturerId: Number,
    ManufacturerName?: String
}

export const dummyDeviceData: IDeviceType = { 
    "DeviceId": "", 
    "DeviceName": "", 
    "DeviceType": "", 
    "Model": "", 
    "Origin": "", 
    "Unit": "", 
    "Standard": "", 
    "Quantity": 0, 
    "HasTrain": 1, 
    "ManufacturerId": 0
}

export interface IDeviceSpecType {
    DeviceId?: String,
    DeviceName?: String,
    SpecsID: Number,
    SpecsName: String,
    SpecsValue: String
}

export const dummyDeviceSpecData: IDeviceSpecType = { 
    "DeviceId": "", 
    "SpecsID": -1, 
    "SpecsName": "", 
    "SpecsValue": "" 
}
