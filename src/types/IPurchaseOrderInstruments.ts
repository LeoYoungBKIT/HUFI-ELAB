export interface InstrumentInfo {
  QuantityDistribute: number;
  Status: string;
  DepartmentImportId: string;
  DepartmentImportName: string;
  InstrumentId: string;
  InstrumentName: string;
  Specification: string;
  Unit: string;
}

export interface IAccept {
  AcceptDate: string;
  AcceptValue: string;
  ContentAccept: null;
  EmployeeAcceptId: string;
  EmployeeAcceptName: string;
}

export interface IPurchaseOrderInstrument {
  listInstrumentInfo: InstrumentInfo[];
  listAccept: IAccept[];
  OrderId: string;
  Title: string | null;
  Content: string | null;
  DateCreate: string;
  EmployeeCreateId: string;
  EmployeeCreateName: string;
  DepartmentImportId: string;
  DepartmentImportName: string;
  Status: string | null;
  Lock: string | null;
}

export const initPurchaseOrderInstrument: IPurchaseOrderInstrument = {
  listInstrumentInfo: [],
  listAccept: [],
  OrderId: "",
  Title: "",
  Content: "",
  DateCreate: "",
  EmployeeCreateId: "",
  EmployeeCreateName: "",
  DepartmentImportId: "",
  DepartmentImportName: "",
  Status: null,
  Lock: null,
};
