import config from '../configs/app';
import * as API from '../configs/apiHelper';
import { IExportManagementFormType } from '../types/exportManagementType';

const { isProd } = config;
const API_ENDPOINT = isProd
    ? config.production.api_endpoint
    : config.development.api_endpoint;

export const getExportManagementForms = async () => {
    const url = `${API_ENDPOINT}/api/ExportOuts`;
    try {
        const exportManagement: IExportManagementFormType[] = await API.get<IExportManagementFormType[]>(url);
        return exportManagement;
    }
    catch {
        return [];
    }
};

export const postExportManagementForm = async (exportManagementFormData: IExportManagementFormType) => {
    const url = `${API_ENDPOINT}/api/ExportOuts`;
	const newForm: IExportManagementFormType = await API.post<IExportManagementFormType, IExportManagementFormType>(url, exportManagementFormData);
	return newForm;
};

export const approveExportManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Accept/${id}`; 
    const approvedExportManagementForm = await API.post<any, any>(url);
    return approvedExportManagementForm;
}

export const forwardApproveExportManagementForm = async (exportManagementFormData: IExportManagementFormType, id1: string, id2: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Propose/${id1}/${id2}`; 
    const approvedExportManagementForm = await API.post<IExportManagementFormType, any>(url, exportManagementFormData);
    return approvedExportManagementForm;
}

export const deleteExportManagementForm = async (id: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/${id}`; 
    await API.deleteResource(url);
}

export const rejectExportManagementForm = async (exportManagementFormData: IExportManagementFormType, id1: string, id2: string) => {
    const url = `${API_ENDPOINT}/api/ExportOuts/Reject/${id1}/${id2}`; 
    const rejectedExportManagementForm = await API.post<IExportManagementFormType, any>(url, exportManagementFormData);
    return rejectedExportManagementForm;
}