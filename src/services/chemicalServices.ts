import config from '../configs/app';
import * as API from '../configs/apiHelper';
import { IChemicalType } from '../types/chemicalType';
import { IExportChemicalType } from '../types/exportChemicalType';

const { isProd } = config;
const API_ENDPOINT = isProd
	? config.production.api_endpoint
	: config.development.api_endpoint;

export const getChemicals = async () => {
	const url = `${API_ENDPOINT}/api/chemicals`;
	const chemicals: IChemicalType[] = await API.get<IChemicalType[]>(url);
	return chemicals;
};

export const getChemicalById = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/chemicals/${id}`;
	const lab: IExportChemicalType[] = await API.get<IExportChemicalType[]>(url);
	return lab;
};

export const updateChemical = async (updatedData: IChemicalType) => {
	const url = `${API_ENDPOINT}/api/chemicals/${updatedData?.ChemicalId}`;
	const lab: IChemicalType = await API.put<IChemicalType, IChemicalType>(url, updatedData);
	return lab;
};

export const deleteChemical = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/chemicals/${id}`;
	await API.deleteResource(url);
};

export const postChemical = async (newLabData: IChemicalType) => {
	const url = `${API_ENDPOINT}/api/chemicals`;
	const newLab = await API.post<IChemicalType, IChemicalType>(url, newLabData);
	return newLab;
};
