import config from '../configs/app'
import * as API from '../configs/apiHelper'
import { IMaintenanceDevice, IRepairDevice } from '../types/maintenanceDevicesType'

const { isProd } = config
const API_ENDPOINT = isProd ? config.production.api_endpoint : config.development.api_endpoint

export const getMaintenanceDevices = async () => {
	const url = `${API_ENDPOINT}/api/Maintenances`
	const maintenanceDevices: IRepairDevice[] = await API.get<IRepairDevice[]>(url)
	return maintenanceDevices
}

export const postMaintenanceDevice = async (newMaintenanceDeviceData: IRepairDevice) => {
	const url = `${API_ENDPOINT}/api/RecordHours`
	const newMaintenanceDevice = await API.post<IRepairDevice, IRepairDevice>(url, newMaintenanceDeviceData)
	return newMaintenanceDevice
}

export const updateMaintenanceDevice = async (updatedData: IRepairDevice) => {
	const url = `${API_ENDPOINT}/api/RecordHours`
	const maintenanceDevice: IRepairDevice = await API.put<IRepairDevice, IRepairDevice>(url, updatedData)
	return maintenanceDevice
}

export const getMaintenanceDeviceById = async (id: String) => {
	const url = `${API_ENDPOINT}/api/Maintenances/${id}`
	const maintenanceDevice: IMaintenanceDevice = await API.get<IMaintenanceDevice>(url)
	return maintenanceDevice
}

export const getDeviceForCriteria = async () => {
	const url = `${API_ENDPOINT}/api/Maintenances/GetDeviceForCriteria`
	const maintenanceDevice: IMaintenanceDevice[] = await API.get<IMaintenanceDevice[]>(url)
	return maintenanceDevice
}

export const postMaintenanceSearchForExport = async (
	id1: string,
	id2: string,
	maintenanceDevices: IMaintenanceDevice[],
) => {
	const url = `${API_ENDPOINT}/api/Maintenances/SearchForExport/${id1}/${id2}`
	const newMaintenanceDevice = await API.post<IMaintenanceDevice[], { data: IMaintenanceDevice[] }>(
		url,
		maintenanceDevices,
	)
	return newMaintenanceDevice
}

export const postDateMaintenace = async (id1: string, id2: string) => {
	const url = `${API_ENDPOINT}/api/Maintenances/updateDateMaintenace/${id1}/${id2}`
	const maintenanceDevices = await API.post<any, { data: IMaintenanceDevice[] }>(url, {})
	return maintenanceDevices
}

export const deleteMaintenanceDevice = async (id: String) => {
	const url = `${API_ENDPOINT}/api/RecordHours/${id}`
	await API.deleteResource(url)
}

export const getRepairDevices = async () => {
	const url = `${API_ENDPOINT}/api/Repairs`
	const repairDevice: IRepairDevice[] = await API.get<IRepairDevice[]>(url)
	return repairDevice
}

export const putRepairDevice = async (id: string, updatedData: FormData) => {
	const url = `${API_ENDPOINT}/api/Repairs/${id}`
	const repairDevice = await API.put<FormData, FormData>(url, updatedData)
	return repairDevice
}

export const postNewRepairDevice = async (newRepairDeviceData: FormData) => {
	const url = `${API_ENDPOINT}/api/Repairs`
	const newRepairDevice = await API.post<FormData, FormData>(url, newRepairDeviceData)
	return newRepairDevice
}

export const postRejectRepairDevice = async (id: string, contentRepair: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/Reject/${id}/${contentRepair}`
	const repairDevice = await API.post<{}, {}>(url, {})
	return repairDevice
}

export const postReceiveRepairDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/Receive/${id}`
	const repairDevice = await API.post<{}, {}>(url, {})
	return repairDevice
}

export const postCompleteRepairDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/Complete/${id}`
	const repairDevice = await API.post<{}, {}>(url, {})
	return repairDevice
}

export const postProposeLiquidateRepairDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/ProposeLiquidate/${id}`
	const repairDevice = await API.post<{}, {}>(url, {})
	return repairDevice
}

export const postAcceptRepairDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/Accept/${id}`
	const repairDevice = await API.post<{}, {}>(url, {})
	return repairDevice
}

export const deleteRepairDevice = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Repairs/${id}`
	await API.deleteResource(url)
}
