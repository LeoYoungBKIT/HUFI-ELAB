import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IExportManagementFormType, dummyExportManagementForm } from '../../types/exportManagementType';

// Define a type for the slice state
interface IExportManagementState {
	listOfExportManagementForms: IExportManagementFormType[] | [];
	currentExportManagementForm: IExportManagementFormType;
	// currentexportManagement: IListDeviceInexportManagementType;
}

// Define the initial state using that type
const initialState: IExportManagementState = {
	listOfExportManagementForms: [],
	currentExportManagementForm: dummyExportManagementForm,
	// currentExportManagement: dummyListDeviceInexportManagementData,
};


export const exportManagementSlice = createSlice({
	name: 'exportManagement',
	initialState,
	reducers: {
		setListOfExportManagementForms: (state: IExportManagementState, action: PayloadAction<IExportManagementFormType[]>) => {
			state.listOfExportManagementForms = action.payload;
		},
		setCurrentExportManagementForm: (
			state: IExportManagementState,
			action: PayloadAction<IExportManagementFormType>,
		) => {
			state.currentExportManagementForm = action.payload;
		},

		reset: () => {
			return initialState;
		},
	},
});

export const { setListOfExportManagementForms, setCurrentExportManagementForm, reset } =
	exportManagementSlice.actions;

export default exportManagementSlice.reducer;
