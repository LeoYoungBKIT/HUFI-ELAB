export interface IDeviceUsageHours {
	DeviceInfoId: String
	DeviceName: String
	Unit: String
	Location: String
	DeviceEnglishName: String
	DeviceId: String
	listRecordHours: IDeviceRecordUsageHours[]
}

export interface IDeviceRecordUsageHours {
	Month: Number
	Year: Number
	HoursUsage: Number
}

export const dummyDeviceRecordUsageHours = {
	Month: new Date().getMonth() + 1,
	Year: new Date().getFullYear(),
	DateInput: '',
	EmployeeName: 'Dương Thị Ngọc Hân',
	HoursUsage: 1,
	Location: '',
	DeviceEnglishName: 'Dương Thị Ngọc Hân',
	DeviceId: 1,
}