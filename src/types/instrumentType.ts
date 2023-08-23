export interface IDeviceType {
	OrderId?: String
	DeviceId?: String
	DeviceName: String
	DeviceType: String
	Model: String
	Origin: String
	Unit: String
	Standard: String
	Quantity: Number
	HasTrain: Number
	ManufacturerId: Number
	ManufacturerName?: String
	Price?: Number
}

export interface IInstrumentType {
	InstrumentId: string
	InstrumentName: string
	QuantityAvailable: number
	QuantityDistribute: number
	QuantityExport: number
	QuantityImport: number
	QuantityInStock: number
	Specification: string
	Unit: string
	listInstrumentDistribute: IInstrumentDetailType[]
}

export interface IInstrumentSerial {
	InstrumentId: string
	InstrumentName: string
	QuantityTotal: number
	isTransfered?: boolean
}

export interface IInstrumentDetailType {
	InstrumentId: string
	InstrumentName: string
	LabId: string
	QuantityAvailable: number
	QuantityDistribute: number
	QuantityExport: number
	Specification: string
	Unit: string
}

export interface IInstrumentGeneral {
	InstrumentId: string
	InstrumentName: string
	Quantity?: number
	Specification: string
	Unit: string
}

export interface ILessonDeviceType {
	LessonId: String
	DeviceId: String
	DeviceName: String
	Standard: String
	Unit: String
	Quantity: Number
	Note: String
}
export const dummyDeviceData: IDeviceType = {
	DeviceId: '',
	DeviceName: '',
	DeviceType: '',
	Model: '',
	Origin: '',
	Unit: '',
	Standard: '',
	Quantity: 0,
	HasTrain: 1,
	ManufacturerId: 0,
}

export interface IDeviceSpecType {
	DeviceId?: String
	DeviceName?: String
	SpecsID: Number
	SpecsName: String
	SpecsValue: String
}

export const dummyDeviceSpecData: IDeviceSpecType = {
	DeviceId: '',
	SpecsID: -1,
	SpecsName: '',
	SpecsValue: '',
}

export interface ILiquidateDeptInstrument {
	InstrumentDeptId: String
	DeviceId: String
	DeviceName: String
	Unit: String
	QuantityTotal: Number
	Quantity: Number
}
