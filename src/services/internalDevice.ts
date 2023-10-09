import config from "../configs/app";
import * as API from "../configs/apiHelper";
import {
  IDeviceForCreate,
  IEmployeeManagerLab,
  IExportLab,
} from "../types/IInternalDevice";

const { isProd } = config;
const API_ENDPOINT = isProd
  ? config.production.api_endpoint
  : config.development.api_endpoint;

export const getAll = async () => {
  return API.get<IExportLab[]>(`${API_ENDPOINT}/api/exportLabs`);
};

export const addExportLab = async (body: IExportLab) => {
  return API.post<IExportLab, IExportLab>(
    `${API_ENDPOINT}/api/exportLabs`,
    body
  );
};

export const getDeviceForCreate = async () => {
  return API.get<IDeviceForCreate[]>(
    `${API_ENDPOINT}/api/exportLabs/GetDeviceForCreate`
  );
};

export const getEmployeeManageLab = async () => {
  return API.get<IEmployeeManagerLab[]>(
    `${API_ENDPOINT}/api/exportLabs/GetEmployeeManageLab`
  );
};

export const acceptExportLab = async (id: string) => {
  return API.post<{}, any>(`${API_ENDPOINT}/api/ExportLabs/Accept/${id}`, {});
};

export const unAcceptExportLab = async (id: string, message: string) => {
  return API.post<{}, any>(
    `${API_ENDPOINT}/api/ExportLabs/Reject/${id}/${message}`,
    {}
  );
};

export const updateExportLab = async (body: IExportLab) => {
  return API.put<IExportLab, IExportLab>(
    `${API_ENDPOINT}/api/exportLabs`,
    body
  );
};
