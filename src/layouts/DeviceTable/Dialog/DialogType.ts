import { GridSize } from '@mui/material';
import { IDeviceDepartmentType } from '../../../types/deviceDepartmentType';

export type ColumnsType = {
	id: string;
	header: String;
	type?: string;
	data?: any;
	size?: number;
	renderValue?: (...arg: any[]) => void;
	sx?: { [key: string]: string };
};

export type ColumnSizeType = {
	xs?: GridSize;
	sm?: GridSize;
	md?: GridSize;
	lg?: GridSize;
	xl?: GridSize;
};

export type DialogProps = {
	isOpen: boolean
	onClose: () => void
	handleSubmitDelete?: (DeviceId: String) => void
	handleSubmitUpdate?: (updatedRow: any) => void
	dataDelete?: IDeviceDepartmentType
	dataUpdate?: IDeviceDepartmentType
	deviceInfoId?: string
}

export type ErrorType = {
	id: String;
	msg: String;
};