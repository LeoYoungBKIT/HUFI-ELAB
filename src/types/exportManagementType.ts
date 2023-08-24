export interface IListAcceptType {
    AcceptDate: string
    AcceptValue: string
    ContentAccept: string
    EmployeeAcceptId: string
    EmployeeAcceptName: string
}

export interface IlistDeviceInfoType {
    DeviceEnglishName: string
    DeviceId: string
    DeviceInfoId: string
    DeviceName: string
    OutDetailId: string | number
}

export interface IExportToOtherDepartmentManagementFormType {
    Content: string
    DateCreate: string
    DepartmentCreateId: string
    DepartmentCreateName: string
    DepartmentManageId: string
    DepartmentManageName: string
    DisplayMode: string
    EmployeeCreateId: string
    EmployeeCreateName: string
    ExportOutId: string
    Lock: string
    Status: string
    Title: string
    listAccept: IListAcceptType[]
    listDeviceInfo: IlistDeviceInfoType[]
}

export const dummyExportToOtherDepartmentManagementForm: IExportToOtherDepartmentManagementFormType = {
    Content: "",
    DateCreate: "",
    DepartmentCreateId: "",
    DepartmentCreateName: "",
    DepartmentManageId: "",
    DepartmentManageName: "",
    DisplayMode: "",
    EmployeeCreateId: "",
    EmployeeCreateName: "",
    ExportOutId: "",
    Lock: "",
    Status: "",
    Title: "",
    listAccept: [],
    listDeviceInfo: [],
}

export interface IlistLiquidateDeviceType {
    DepreciationRate: string
    DeviceEnglishName: string
    DeviceId: string
    DeviceInfoId: string
    DeviceName: string
    LinkFileMaintenace: string
    LinkFileRepair: string
    Manufacturer: string
    Model: string
    Origin: string
    ResidualValue: string
    SerialNumber: string
    Specification: string
    SupplierId: string
    SupplierName: string
    YearStartUsage: number
}

export interface IExportToLiquidateManagementFormType {
    Content: string
    DateCreate: string
    DepartmentCreateId: string
    DepartmentCreateName: string
    DisplayMode: string
    EmployeeCreateId: string
    EmployeeCreateName: string
    LiquidateId: string
    Lock: string
    Status: string
    Title: string
    listAccept: IListAcceptType[]
    listDevice: IlistLiquidateDeviceType[]
}

export const dummyExportToLiquidateManagementForm: IExportToLiquidateManagementFormType = {
    Content: "",
    DateCreate: "",
    DepartmentCreateId: "",
    DepartmentCreateName: "",
    DisplayMode: "",
    EmployeeCreateId: "",
    EmployeeCreateName: "",
    LiquidateId: "",
    Lock: "",
    Status: "",
    Title: "",
    listAccept: [],
    listDevice: [],
}