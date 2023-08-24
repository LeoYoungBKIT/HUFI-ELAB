import config from '../configs/app'
import * as API from '../configs/apiHelper'
import { IDeviceDepartmentType, IDeviceSimpleType } from '../types/deviceDepartmentType'

const { isProd } = config
const API_ENDPOINT = isProd ? config.production.api_endpoint : config.development.api_endpoint

export const getDevices = async () => {
	const url = `${API_ENDPOINT}/api/devices`
	const devices: IDeviceDepartmentType[] = await API.get<IDeviceDepartmentType[]>(url)
	return devices
}

export const getDeviceById = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/devices/${id}`
	const device: IDeviceDepartmentType[] = await API.get<IDeviceDepartmentType[]>(url)
	return device
}

export const updateDevice = async (updatedData: IDeviceSimpleType) => {
	const url = `${API_ENDPOINT}/api/devices`
	const updatedDevice: any = await API.put<IDeviceSimpleType, IDeviceSimpleType>(url, updatedData)
	return updatedDevice
}

export const deleteDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/devices/${id}`
	const data = await API.deleteResource(url)
	return data
}

export const postDevice = async (newLabData: IDeviceSimpleType[]) => {
	const url = `${API_ENDPOINT}/api/devices`
	const newDevice = await API.post<IDeviceSimpleType[], IDeviceSimpleType[]>(url, newLabData)
	return newDevice
}
