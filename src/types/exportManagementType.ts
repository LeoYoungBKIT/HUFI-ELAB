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

export interface IExportManagementFormType {
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

export const dummyExportManagementForm: IExportManagementFormType = {
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