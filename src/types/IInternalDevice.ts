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
  QuantityImport: number;
  QuantityDistribute: number;
  LabId: string;
}

export interface IDeviceForCreate {
  listDevice: {
    DeviceInfoId: string;
    DeviceName: string;
    DeviceEnglishName: string | null;
    QuantityImport: number;
  }[];
  DeviceId: string;
  DeviceName: string;
  DeviceEnglishName: string | null;
}

export interface IEmployeeManagerLab {
  listLab: [
    {
      LabId: string;
      LabName: string;
      Function: string | null;
      DepartmentManageId: string;
      EmployeeManageId: string;
      Location: string;
    }
  ];
  EmployeeId: string;
  Fullname: string;
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

export const initDevice: IDevice = {
  DeviceId: "",
  DeviceInfoId: "",
  DeviceName: "",
  DeviceEnglishName: "",
  QuantityImport: 0,
  QuantityDistribute: 0,
  LabId: "",
};
