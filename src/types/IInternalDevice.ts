import moment from "moment";

export interface IAccept {
  AcceptDate: string;
  AcceptValue: string | null;
  ContentAccept: string | null;
  EmployeeAcceptId: string;
  EmployeeAcceptName: string;
}

export interface IDevice {
  DeviceId: string;
  DeviceInfoId: string;
  DeviceName: string | null;
  DeviceEnglishName: string | null;
  QuantityImport: string;
  QuantityDistribute: string;
  LabId: string;
}

export interface IExportLab {
  ExportLabId: string;
  DateCreate: string;
  Content: string;
  EmployeeCreateId: string;
  EmployeeCreateName: string;
  DepartmenCreatetId: string;
  DepartmentCreateName: string;
  EmployeeManageLabId: string;
  EmployeeManageLabName: string;
  Status: string;
  Lock: string;
  listAccept: IAccept[];
  listDevice: IDevice[];
}

export const initExportLab: IExportLab = {
  ExportLabId: "",
  DateCreate: moment().unix().toString(),
  Content: "",
  EmployeeCreateId: "",
  EmployeeCreateName: "",
  DepartmenCreatetId: "",
  DepartmentCreateName: "",
  EmployeeManageLabId: "",
  EmployeeManageLabName: "",
  Status: "",
  Lock: "",
  listAccept: [],
  listDevice: [],
};
