import config from "../configs/app";
import * as API from "../configs/apiHelper";
import { IExportLab } from "../types/IInternalDevice";

const { isProd } = config;
const API_ENDPOINT = isProd
  ? config.production.api_endpoint
  : config.development.api_endpoint;

export const getAll = async () => {
  return API.get<IExportLab[]>(`${API_ENDPOINT}/api/exportLabs`);
};

export const getDeviceForCreate = async () => {
  return API.get<IExportLab[]>(
    `${API_ENDPOINT}/api/exportLabs/GetDeviceForCreate`
  );
};

export const getEmployeeManageLab = async () => {
  return API.get<IExportLab[]>(
    `${API_ENDPOINT}/api/exportLabs/GetEmployeeManageLab`
  );
};
