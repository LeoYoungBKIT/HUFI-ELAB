import config from '../configs/app';
import * as API from '../configs/apiHelper';
import {
    IExportToLiquidateManagementFormType,
    IExportToOtherDepartmentManagementFormType
} from '../types/exportManagementType';

const { isProd } = config;
const API_ENDPOINT = isProd
    ? config.production.api_endpoint
    : config.development.api_endpoint;

export const getExportToOtherDepartmentManagementForms = async () => {
    const url = `${API_ENDPOINT}/api/ExportOuts`;
    try {
        const exportManagement: IExportToOtherDepartmentManagementFormType[] = await API.get<IExportToOtherDepartmentManagementFormType[]>(url);
        return exportManagement;
    }
    catch {
        return [];
    }
};

export const postExportToOtherDepartmentManagementForm = async (exportManagementFormData: IExportToOtherDepartmentManagementFormType) => {
    const url = `${API_ENDPOINT}/api/ExportOuts`;
    const newForm: IExportToOtherDepartmentManagementFormType = await API.post<IExportToOtherDepartmentManagementFormType, IExportToOtherDepartmentManagementFormType>(url, exportManagementFormData);
    return newForm;
};

export const approveExportToOtherDepartmentManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Accept/${id}`;
    const approvedExportToOtherDepartmentManagementFormType = await API.post<any, any>(url);
    return approvedExportToOtherDepartmentManagementFormType;
}

export const forwardApproveExportToOtherDepartmentManagementForm = async (
    exportManagementFormData: IExportToOtherDepartmentManagementFormType,
    id1: string,
    id2: string
) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Propose/${id1}/${id2}`;
    const approvedExportToOtherDepartmentManagementFormType = await API.post<IExportToOtherDepartmentManagementFormType, any>(url, exportManagementFormData);
    return approvedExportToOtherDepartmentManagementFormType;
}

export const deleteExportToOtherDepartmentManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/${id}`;
    await API.deleteResource(url);
}

export const rejectExportToOtherDepartmentManagementForm = async (
    exportManagementFormData: IExportToOtherDepartmentManagementFormType,
    id1: string,
    id2: string
) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Reject/${id1}/${id2}`;
    const rejectedExportToOtherDepartmentManagementFormType = await API.post<IExportToOtherDepartmentManagementFormType, any>(url, exportManagementFormData);
    return rejectedExportToOtherDepartmentManagementFormType;
}

export const getListOfLiquidateDeviceForms = async () => {
    try {
        const url = `${API_ENDPOINT}/api/LiquidateDevices`;
        const forms: IExportToLiquidateManagementFormType[] = await API.get<IExportToLiquidateManagementFormType[]>(url);
        return forms;
    }
    catch {
        return [];
    }
}

export const getDeviceInfoListAccordingToDepartment = async () => {
    try {
        const url = `${API_ENDPOINT}/api/ExportOuts/GetDeviceForPropose`;
        const deviceInfoList: any[] = await API.get<any[]>(url)
        return deviceInfoList;
    }
    catch {
        return [];
    }
}

export const getDeviceListAccordingToDepartment = async () => {
    try {
        const url = `${API_ENDPOINT}/api/ExportOuts/GetDeviceForDept`;
        const deviceList: any[] = await API.get<any[]>(url)
        return deviceList;
    }
    catch {
        return [];
    }
}

export const postExportToLiquidateManagementForm = async (exportManagementFormData: IExportToLiquidateManagementFormType) => {
    const url = `${API_ENDPOINT}/api/LiquidateDevices`;
    const newForm: IExportToLiquidateManagementFormType = await API.post<IExportToLiquidateManagementFormType, IExportToLiquidateManagementFormType>(url, exportManagementFormData);
    return newForm;
};

export const deleteExportToLiquidateManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/LiquidateDevices/${id}`;
    await API.deleteResource(url);
}

export const forwardApproveExportToLiquidateManagementForm = async (
    exportManagementFormData: IExportToLiquidateManagementFormType,
    id1: string,
    id2: string
) => {
    const url = `${API_ENDPOINT}/api/LiquidateDevices/Propose/${id1}/${id2}`;
    const approvedExportToLiquidateManagementFormType = await API.post<IExportToLiquidateManagementFormType, any>(url, exportManagementFormData);
    return approvedExportToLiquidateManagementFormType;
}

export const approveExportToLiquidateManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/LiquidateDevices/Accept/${id}`;
    const approvedExportToLiquidateManagementFormType = await API.post<any, any>(url);
    return approvedExportToLiquidateManagementFormType;
}

export const rejectExportToLiquidateManagementForm = async (
    exportManagementFormData: IExportToLiquidateManagementFormType,
    id1: string,
    id2: string
) => {
    const url = `${API_ENDPOINT}/api/LiquidateDevices/Reject/${id1}/${id2}`;
    const rejectedExportToLiquidateManagementFormType = await API.post<IExportToLiquidateManagementFormType, any>(url, exportManagementFormData);
    return rejectedExportToLiquidateManagementFormType;
}