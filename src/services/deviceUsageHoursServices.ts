import config from '../configs/app';
import * as API from '../configs/apiHelper';
import { IDeviceRecordUsageHours, IDeviceUsageHours } from '../types/deviceUsageHoursType';
import axios from 'axios';

const { isProd } = config;
const API_ENDPOINT = isProd
	? config.production.api_endpoint
	: config.development.api_endpoint;

export const getRecordHours = async (id: string) => {
	const url = `${API_ENDPOINT}/api/RecordHours/${id}`;
	const records: IDeviceUsageHours = await API.get<IDeviceUsageHours>(url);
	return records;
};

export const postRecordHours = async (newData: IDeviceUsageHours) => {
	const url = `${API_ENDPOINT}/api/RecordHours`
	const records = await API.post<IDeviceUsageHours, IDeviceUsageHours>(url, newData)
	return records
}

export const putRecordHours = async (newData: IDeviceUsageHours) => {
	const url = `${API_ENDPOINT}/api/RecordHours`
	const records = await API.put<IDeviceUsageHours, IDeviceUsageHours>(url, newData)
	return records
}

export const deleteRecordHours = async (deleteData: IDeviceUsageHours) => {
	const url = `${API_ENDPOINT}/api/RecordHours`;
	const records = await API.deleteData(url, deleteData)
	return records;
};

export const postCheckFileImport = async (form: FormData) => {
	const url = `${API_ENDPOINT}/api/recordhours/importFile`
	const newDevice = await API.post<FormData, string>(url, form)
	return newDevice
}
