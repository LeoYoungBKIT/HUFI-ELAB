import { IExportDeviceType } from './exportDeviceType';

export interface IDeviceDepartmentType {
	QuantityOriginal: Number;
	QuantityExport: Number;
	QuantityRemain: Number;
	listDeviceDetail?: IDeviceDetailType[];
	listExportDevice?: IExportDeviceType[];
	DeviceId: String;
	DeviceName: String;
	DeviceType: 'Thiết bị' | 'Công cụ' | 'Dụng cụ';
	Standard: String;
	Unit: String;
	HasTrain: String;
	DeviceDetailId?: String;
}

export const dummyDeviceDepartmentData: IDeviceDepartmentType = {
	QuantityOriginal: -1,
	QuantityExport: -1,
	QuantityRemain: -1,
	listDeviceDetail: [],
	DeviceId: '',
	DeviceName: '',
	DeviceType: 'Thiết bị',
	Standard: '',
	Unit: '',
	HasTrain: '',
	DeviceDetailId: '',
	listExportDevice:[]
};

export interface IDeviceDetailType {
	QuantityExport: Number;
	QuantityRemain: Number;
	OrderDate: String;
	ManufacturerName: String;
	listDeviceDept: IDeviceDeptType[];
	DeviceDetailId: String;
	QuantityOriginal: Number;
	Price: Number;
	Model: String;
	Origin: String;
	ManufacturerId: Number;
	DeviceId: String;
	OrderId: String;
}

export const dummyDeviceDetailData: IDeviceDetailType = {
	QuantityExport: -1,
	QuantityRemain: -1,
	OrderDate: '',
	ManufacturerName: '',
	listDeviceDept: [],
	DeviceDetailId: '',
	QuantityOriginal: -1,
	Price: -1,
	Model: '',
	Origin: '',
	ManufacturerId: -1,
	DeviceId: '',
	OrderId: '',
};

export interface IDeviceDeptType {
	QuantityExport: Number;
	QuantityRemain: Number;
	ExpDeviceDeptId: String;
	QuantityOriginal: Number;
	Unit: String;
	DeviceDetailId: String;
	DepartmentId: Number;
}

export const dummyIDeviceDeptData: IDeviceDeptType = {
	QuantityExport: -1,
	QuantityRemain: -1,
	ExpDeviceDeptId: '',
	QuantityOriginal: -1,
	Unit: '',
	DeviceDetailId: '',
	DepartmentId: 0,
};
