import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ReactNode } from 'react'

interface ISnackbarMessage {
	isOpen?: boolean
	message: string
	color?: string
	backgroundColor?: string
}

export const defaultSnackbarMessage: ISnackbarMessage = {
	isOpen: false,
	message: '',
	color: 'black',
	backgroundColor: 'white',
}

interface IAppState {
	isOpenDrawer: boolean
	snackbarState: ISnackbarMessage
	appState: string
}

// Define the initial state using that type
const initialState: IAppState = {
	isOpenDrawer: true,
	snackbarState: defaultSnackbarMessage,
	appState: 'Phòng lab',
}

export const appSlice = createSlice({
	name: 'app',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		setIsOpenDrawer: (state: IAppState, action: PayloadAction<boolean>) => {
			return {
				...state,
				isOpenDrawer: action.payload,
			}
		},
		setSnackbarMessage: (state: IAppState, action: PayloadAction<string>) => {
			return {
				...state,
				snackbarState: {
					isOpen: action.payload ? true : false,
					message: action.payload ? action.payload : '',
				},
			}
		},
		setSnackbar: (state: IAppState, action: PayloadAction<ISnackbarMessage>) => {
			return {
				...state,
				snackbarState: {
					isOpen: action.payload ? true : false,
					message: action.payload ? action.payload.message : '',
					color: action.payload.hasOwnProperty('color') ? action.payload.color : state.snackbarState.color,
					backgroundColor: action.payload.hasOwnProperty('backgroundColor')
						? action.payload.backgroundColor
						: state.snackbarState.backgroundColor,
				},
			}
		},

		reset: () => {
			return {
				isOpenDrawer: true,
				snackbarState: defaultSnackbarMessage,
				appState: 'Phòng lab',
			}
		},
		setAppState: (state, action: PayloadAction<string>) => {
			state.appState = action.payload
		},
	},
})

export const { setIsOpenDrawer, setSnackbarMessage, setSnackbar, reset, setAppState } = appSlice.actions

export default appSlice.reducer
