import config from "../configs/app";
import * as API from "../configs/apiHelper";
import { IPurchaseOrderInstrument } from "../types/IPurchaseOrderInstruments";

const { isProd } = config;
const API_ENDPOINT = isProd
  ? config.production.api_endpoint
  : config.development.api_endpoint;

export const getAll = async () => {
  return API.get<IPurchaseOrderInstrument[]>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments`
  );
};

export const getDataFile = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return API.post<unknown, { data: IPurchaseOrderInstrument }>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments/checkImportFile`,
    form
  );
};

export const create = async (body: IPurchaseOrderInstrument) => {
  return API.post<unknown, { data: IPurchaseOrderInstrument }>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments/savePurchaseOrder`,
    body
  );
};

export const update = async (body: IPurchaseOrderInstrument) => {
  return API.put<unknown, { data: IPurchaseOrderInstrument }>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments`,
    body
  );
};

export const accept = async (orderId: string) => {
  return API.post<unknown, { data: IPurchaseOrderInstrument }>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments/Accept/${orderId}`,
    {}
  );
};

export const unAccept = async (orderId: string, message: string) => {
  return API.post<unknown, { data: IPurchaseOrderInstrument }>(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments/Reject/${orderId}/${message}`,
    {}
  );
};

export const remove = async (orderId: string) => {
  return API.deleteResource(
    `${API_ENDPOINT}/api/PurchaseOrderInstruments/${orderId}`
  );
};
