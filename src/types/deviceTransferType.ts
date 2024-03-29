import { IInstrumentSerial } from './instrumentType'

export interface IDeviceTransfer {
	listDeviceInfo?: IDeviceSerial[]
	listInstrument?: IInstrumentSerial[]
	LabId: String
	LabName: String
	Location: String
}

export interface IDeviceSerial {
	DeviceInfoId?: String | string
	InstrumentId?: String | string
	DeviceName: String
	Unit: String
	EmployeeName: String
	InstrumentDeptId?: String
	QuantityTotal?: Number
	isTransfered?: boolean
}

export interface IDeviceTransferHistoryItem {
	LabId: String;
	LabName: String;
	Location: String;
	DateTransfer: String;
	ExportLabId: String;
	EmployeeName: String;
}

export const dummyDeviceTransferData = {
	listDeviceInfo: [],
	listInstrument: [],
	LabId: '',
	LabName: '',
	Location: '',
};
