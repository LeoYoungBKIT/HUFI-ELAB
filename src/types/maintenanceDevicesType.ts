export interface IRepairDevice {
	ContentRepair: string
	ContentReport: string
	DateCreate: string
	DepartmentCreateId: string
	DepartmentCreateName: string
	DepartmentRepairId: string
	DepartmentRepairName: string
	DisplayMode: string
	EmployeeCreateId: string
	EmployeeCreateName: string
	LinkHandoverFile: string
	LinkCheckFile: string
	LinkReportFile: string
	Location: string
	Lock: string
	RepairId: string
	Status: string
	Title: string
	YearstartUsage: number
	listAccept: IRepairAccept[]
	DeviceInfoId: string
	DeviceName: string
}

export interface IRepairAccept {
	AcceptDate: string
	AcceptValue: string
	ContentAccept: string
	EmployeeAcceptId: string
	EmployeeAcceptName: string
}

export interface IRepairDeviceItem {
	RepairId: Number
	DateCreate: String
	Content: String
	Cost: Number
	Status: String
	EmployeeName: String
}

export const dummyRepairDeviceItem = {
	RepairId: -1,
	DateCreate: '',
	Content: '',
	Cost: 0,
	Status: '',
	EmployeeName: 'Dương Văn Thành',
}
export interface IMaintenanceDevice {
	DeviceInfoId: string
	DateMaintenace: string[]
	DepartmentManageId: string
	DepartmentManageName: string
	DeviceName: string
	Location: string
	NextDateMaintenace: string
	StartDate: string
	EndDate: string
	listRepair: IRepair[]
}

export interface IRepair {
	ContentRepair: string
	DateComplete: string
	DateCreate: string
	Status: string
}
