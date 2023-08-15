export interface IDeviceType {
    OrderId?: String,
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
    ManufacturerName?: String,
    Price?: Number,
    listDeviceInfo?: any[]
}

export interface ILessonDeviceType {
    LessonId: String,
    DeviceId: String,
    DeviceName: String,
    Standard: String,
    Unit: String,
    Quantity: Number,
    Note: String
}

export interface IDeviceGeneral {
	DepartmentImportId?: string
	DepartmentImportName?: string
	DeviceInfoId: string
	DeviceId?: string
	DeviceName: string
	DeviceEnglishName?: string
	Model?: string
	SerialNumber?: string
	Specification?: string
	Manufacturer?: string
	Origin?: string
	Status?: string
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
    "ManufacturerId": 0,
    "listDeviceInfo": []
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

export interface ILiquidateDeptDevice {
    "DeviceInfoId": String,
    "SerialNumber": String,
    "DeviceId": String,
    "DeviceName": String,
    "Unit": String,
}
