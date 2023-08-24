import config from '../configs/app'
import * as API from '../configs/apiHelper'
import { IDeviceGeneral, IDeviceSpecType, IDeviceType, ILessonDeviceType } from '../types/deviceType'
import { IChemicalType } from '../types/chemicalType'
import { IInstrumentGeneral, IInstrumentType } from '../types/instrumentType'
import { IDeviceTransfer } from '../types/deviceTransferType'

const { isProd } = config
const API_ENDPOINT = isProd ? config.production.api_endpoint : config.development.api_endpoint

export const getInstruments = async () => {
	const url = `${API_ENDPOINT}/api/Instruments`
	const devices: IInstrumentType[] = await API.get<IInstrumentType[]>(url)
	return devices
}

export const getInstrumentsGeneral = async () => {
	const url = `${API_ENDPOINT}/api/Instruments/GetInstrumentGeneral`
	const devices: IInstrumentGeneral[] = await API.get<IInstrumentGeneral[]>(url)
	return devices
}

export const getDeviceGeneralDept = async () => {
	const url = `${API_ENDPOINT}/api/Instruments/GetDeviceGeneralDept`
	const devices: IDeviceGeneral[] = await API.get<IDeviceGeneral[]>(url)
	return devices
}

export const updateInstrument = async (updatedData: IInstrumentGeneral) => {
	const url = `${API_ENDPOINT}/api/Instruments`
	const updatedDevice: any = await API.put<IInstrumentGeneral, IInstrumentGeneral>(url, updatedData)
	return updatedDevice
}

export const deleteInstrument = async (id: string) => {
	const url = `${API_ENDPOINT}/api/Instruments/${id}`
	const data = await API.deleteResource(url)
	return data
}

export const postInstrument = async (newLabData: IInstrumentGeneral) => {
	const url = `${API_ENDPOINT}/api/Instruments`
	const newDevice = await API.post<IInstrumentGeneral, IInstrumentGeneral>(url, newLabData)
	return newDevice
}


export const getDeviceById = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/devices/${id}`
	const device: IDeviceType = await API.get<IDeviceType>(url)
	return device
}

export const updateDevice = async (updatedData: IDeviceType) => {
	const url = `${API_ENDPOINT}/api/devices/${updatedData.DeviceId}`
	const updatedDevice: IDeviceType = await API.put<IDeviceType, IDeviceType>(url, updatedData)
	return updatedDevice
}

export const deleteDevice = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/devices/${id}`
	await API.deleteResource(url)
}

export const postDevice = async (newLabData: IDeviceType) => {
	const url = `${API_ENDPOINT}/api/devices`
	const newDevice = await API.post<IDeviceType, IDeviceType>(url, newLabData)
	return newDevice
}

export const getDeviceSpec = async () => {
	const url = `${API_ENDPOINT}/api/devicespecs`
	const devicespec: IDeviceSpecType[] = await API.get<IDeviceSpecType[]>(url)
	return devicespec
}

export const getDeviceSpecById = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/devicespecs/${id}`
	const lab: IDeviceSpecType = await API.get<IDeviceSpecType>(url)
	return lab
}

export const updateDeviceSpec = async (updatedData: IDeviceSpecType) => {
	const url = `${API_ENDPOINT}/api/devicespecs/${updatedData.DeviceId}/${updatedData.SpecsID}`
	const lab: IDeviceSpecType = await API.put<IDeviceSpecType, IDeviceSpecType>(url, updatedData)
	return lab
}

export const deleteDeviceSpec = async (deletedData: IDeviceSpecType) => {
	const url = `${API_ENDPOINT}/api/devicespecs/${deletedData.DeviceId}/${deletedData.SpecsID}`
	await API.deleteResource(url)
}

export const postDeviceSpec = async (newData: IDeviceSpecType) => {
	const url = `${API_ENDPOINT}/api/devicespecs`
	const newDeviceSpec: IDeviceSpecType = await API.post<IDeviceSpecType, IDeviceSpecType>(url, newData)
	return newDeviceSpec
}

export const getDevicePlanningByLesson = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/lessondevices/${id}`
	const devicePlanningData: IDeviceType[] = await API.get<IDeviceType[]>(url)
	return devicePlanningData
}

export const postDevicePlanningByLesson = async (newData: ILessonDeviceType[]) => {
	const url = `${API_ENDPOINT}/api/lessondevices`
	const newDevicePlanningData: ILessonDeviceType[] = await API.post<ILessonDeviceType[], ILessonDeviceType[]>(
		url,
		newData,
	)
	return newDevicePlanningData
}

export const updateDevicePlanningByLesson = async (updatedData: ILessonDeviceType[]) => {
	const url = `${API_ENDPOINT}/api/lessondevices/${updatedData[0].LessonId}/`
	updatedData.map((x: ILessonDeviceType) => {
		API.put<ILessonDeviceType, ILessonDeviceType>(url + `${x.DeviceId}`, x)
	})
}

export const getChemicalPlanningByLesson = async (id: Number) => {
	const url = `${API_ENDPOINT}/api/lessonchemicals/${id}`
	const chemicalPlanningData: IChemicalType[] = await API.get<IChemicalType[]>(url)
	return chemicalPlanningData
}

export const getInstrumentsTransfer = async () => {
	const url = `${API_ENDPOINT}/api/InstrumentTransfers`
	const chemicalPlanningData: IDeviceTransfer[] = await API.get<IDeviceTransfer[]>(url)
	return chemicalPlanningData
}

export const postInstrumentsTransfer = async (newData: [IDeviceTransfer, IDeviceTransfer]) => {
	const url = `${API_ENDPOINT}/api/InstrumentTransfers`
	const newDeviceSpec: IDeviceTransfer[] = await API.post<
		[IDeviceTransfer, IDeviceTransfer],
		[IDeviceTransfer, IDeviceTransfer]
	>(url, newData)
	return newDeviceSpec
}
