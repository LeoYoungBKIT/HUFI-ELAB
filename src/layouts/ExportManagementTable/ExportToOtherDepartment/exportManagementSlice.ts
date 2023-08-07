import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
	IExportToLiquidateManagementFormType,
	IExportToOtherDepartmentManagementFormType,
	dummyExportToOtherDepartmentManagementForm,
} from '../../../types/exportManagementType';

// Define a type for the slice state
interface IExportManagementState {
	listOfExportToOtherDepartmentManagementForms: IExportToOtherDepartmentManagementFormType[] | [];
	currentExportToOtherDepartmentManagementForm: IExportToOtherDepartmentManagementFormType;
	listOfExportToLiquidateManagementForms: IExportToLiquidateManagementFormType[] | [];
}

// Define the initial state using that type
const initialState: IExportManagementState = {
	listOfExportToOtherDepartmentManagementForms: [],
	currentExportToOtherDepartmentManagementForm: dummyExportToOtherDepartmentManagementForm,
	listOfExportToLiquidateManagementForms: [],
};


export const exportManagementSlice = createSlice({
	name: 'exportManagement',
	initialState,
	reducers: {
		setListOfExportToOtherDepartmentManagementForms: (
			state: IExportManagementState,
			action: PayloadAction<IExportToOtherDepartmentManagementFormType[]>
		) => {
			state.listOfExportToOtherDepartmentManagementForms = action.payload;
		},
		setCurrentExportToOtherDepartmentManagementForm: (
			state: IExportManagementState,
			action: PayloadAction<IExportToOtherDepartmentManagementFormType>,
		) => {
			state.currentExportToOtherDepartmentManagementForm = action.payload;
		},

		setListOfExportToLiquidateManagementForms: (
			state: IExportManagementState,
			action: PayloadAction<IExportToLiquidateManagementFormType[]>
		) => {
			state.listOfExportToLiquidateManagementForms = action.payload;
		},

		reset: () => {
			return initialState;
		},
	},
});

export const {
	setListOfExportToOtherDepartmentManagementForms,
	setCurrentExportToOtherDepartmentManagementForm,
	setListOfExportToLiquidateManagementForms,
	reset
} = exportManagementSlice.actions;

export default exportManagementSlice.reducer;
