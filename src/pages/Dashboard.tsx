import { SnackbarContent } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setListOfChemicals } from '../layouts/ChemicalTable/chemicalSlice'
import { setListOfChemicalWarehouse } from '../layouts/ChemicalWarehouseTable/chemicalWarehouseSlice'
import { setListOfClassSubjects } from '../layouts/ClassSubjectTable/classSubjectSlice'
import { setListOfDepartments } from '../layouts/DepartmentTable/departmentSlice'
import { setListOfDeviceSpecs, setListOfDevices } from '../layouts/DeviceTable/deviceSlice'
import { setListOfEmployees } from '../layouts/EmployeeTable/employeeSlice'
import { setListOfLaboratories } from '../layouts/LaboratoryTable/laboratorySlice'
import { setListOfLessonLabs } from '../layouts/LessonLabTable/lessonLabSlice'
import { setListOfManufacturers } from '../layouts/ManufacturerTable/manufacturerSlice'
import { setListOfPlanSubjects } from '../layouts/PlanSubjectTable/planSubjectSlice'
import { setListOfPurchaseOrders } from '../layouts/PurchaseOrderTable/purchaseOrderSlice'
import { setListOfRegisterGenerals } from '../layouts/RegisterGeneralTable/registerGeneralSlice'
import { setListOfResearchTeams, setListOfResearchers } from '../layouts/ResearchTeamTable/researchTeamSlice'
import { setListOfSchedules } from '../layouts/ScheduleTable/scheduleSlice'
import { setListOfSubjects } from '../layouts/SubjectTable/subjectSlice'
import { setListOfSuppliers } from '../layouts/SupplierTable/supplierSlice'
import {
	setListOfTrainDevice,
	setListOfTrainInstructor,
	setListOfTrainer,
} from '../layouts/TrainSchedule/TrainScheduleSlice'
import { getChemicals } from '../services/chemicalServices'
import { getChemicalWarehouseById } from '../services/chemicalWarehouseServices'
import { getClassSubjects } from '../services/clasSubjectServices'
import { getDepartments } from '../services/departmentServices'
import { getDeviceSpec, getDevices } from '../services/deviceServices'
import { getEmployees } from '../services/employeeServices'
import { getLaboratories } from '../services/laboratoryServices'
import { getLessonLabs } from '../services/lessonLabServices'
import { getManufacturers } from '../services/manufacturerServices'
import { getPlanSubjects } from '../services/planSubjectServices'
import { getPurchaseOrders } from '../services/purchaseOrderServices'
import { getRegisterGenerals } from '../services/registerGeneralServices'
import { getResearchTeams, getResearchers } from '../services/researchTeamServices'
import { getSchedules } from '../services/scheduleServices'
import { getSubjects } from '../services/subjectServices'
import { getSuppliers } from '../services/supplierServices'
import { getTrainDevices, getTrainInstructors, getTrainer } from '../services/trainServices'

import { loadMessages, locale } from 'devextreme/localization'
import viMessages from '../configs/devextreme_vi.json'
import Sidebar from '../configs/sidebar'
import {
	setListOfExportToLiquidateManagementForms,
	setListOfExportToOtherDepartmentManagementForms,
} from '../layouts/ExportManagementTable/exportManagementSlice'
import { setListOfSuggestNewDevices } from '../layouts/SuggestNewDevicesTable/suggestNewDeviceSlice'
import {
	getExportToOtherDepartmentManagementForms,
	getListOfLiquidateDeviceForms,
} from '../services/exportManagementServices'
import { getSuggestNewDevices } from '../services/suggestNewDeviceServices'
import { RootState } from '../store'
import { IChemicalType } from '../types/chemicalType'
import { IChemicalWarehouseType } from '../types/chemicalWarehouseType'
import { IClassSubjectType } from '../types/classSubjectType'
import { IDepartmentType } from '../types/departmentType'
import { IDeviceSpecType, IDeviceType } from '../types/deviceType'
import {
	IExportToLiquidateManagementFormType,
	IExportToOtherDepartmentManagementFormType,
} from '../types/exportManagementType'
import { ILaboratoryType } from '../types/laboratoryType'
import { ILessonLabType } from '../types/lessonLabType'
import { IManufacturerType } from '../types/manufacturerType'
import { IPlanSubjectType } from '../types/planSubjectType'
import { IPurchaseOrderType } from '../types/purchaseOrderType'
import { IRegisterGeneralType } from '../types/registerGeneralType'
import { IResearchTeamType, IResearcherType } from '../types/researchTeamType'
import { IScheduleType } from '../types/scheduleType'
import { ISubjectType } from '../types/subjectType'
import { ISuggestNewDeviceType } from '../types/suggestNewDeviceType'
import { ISupplierType } from '../types/supplierType'
import { ITrainDevice, ITrainInstructor, ITrainer } from '../types/trainType'
import './Dashboard.css'
import { setSnackbarMessage } from './appSlice'

export function Dashboard() {
	const { snackbarState, appState } = useAppSelector((state: RootState) => state.app)
	const { owner } = useAppSelector((state: RootState) => state.userManager)

	const role = Number(localStorage.getItem('role') || 1)

	const dispatch = useAppDispatch()

	useEffect(() => {
		loadMessages(viMessages)
		locale('vi-VN')
	}, [])

	const getLaboratoryData = async () => {
		const listOfLaboratories: ILaboratoryType[] = await getLaboratories()
		if (listOfLaboratories) {
			dispatch(setListOfLaboratories(listOfLaboratories))
		}
	}

	const getDeviceSpecData = async () => {
		const listOfDeviceSpec: IDeviceSpecType[] = await getDeviceSpec()
		if (listOfDeviceSpec) {
			dispatch(setListOfDeviceSpecs(listOfDeviceSpec))
		}
	}

	const getEmployeeData = async () => {
		const listOfEmployees: any[] = await getEmployees()
		if (listOfEmployees) {
			dispatch(setListOfEmployees(listOfEmployees))
		}
	}

	const getDepartmentData = async () => {
		const listOfDepartment: IDepartmentType[] = await getDepartments()
		if (listOfDepartment) {
			dispatch(setListOfDepartments(listOfDepartment))
		}
	}

	const getManufacturerData = async () => {
		const listOfManufacturers: IManufacturerType[] = await getManufacturers()
		if (listOfManufacturers) {
			dispatch(setListOfManufacturers(listOfManufacturers))
		}
	}

	const getSupplierData = async () => {
		const listOfSupplier: ISupplierType[] = await getSuppliers()
		if (listOfSupplier) {
			dispatch(setListOfSuppliers(listOfSupplier))
		}
	}

	const getChemicalData = async () => {
		const listOfChemical: IChemicalType[] = await getChemicals()
		if (listOfChemical) {
			dispatch(setListOfChemicals(listOfChemical))
		}
	}

	const getChemicalWarehouseData = async () => {
		const listOfChemicalWarehouse: IChemicalWarehouseType[] = await getChemicalWarehouseById(role)
		if (listOfChemicalWarehouse) {
			dispatch(setListOfChemicalWarehouse(listOfChemicalWarehouse))
		}
	}

	const getDeviceData = async () => {
		const listOfDevices: IDeviceType[] = await getDevices()
		if (listOfDevices) {
			dispatch(setListOfDevices(listOfDevices))
		}
	}

	const getSubjectData = async () => {
		const listOfSubjects: ISubjectType[] = await getSubjects()
		if (listOfSubjects) {
			dispatch(setListOfSubjects(listOfSubjects))
		}
	}

	const getClassSubjectData = async () => {
		const listOfClassSubjects: IClassSubjectType[] = await getClassSubjects()
		if (listOfClassSubjects) {
			dispatch(setListOfClassSubjects(listOfClassSubjects))
		}
	}

	const getLessonLabData = async () => {
		const listOfLessonLabs: ILessonLabType[] = await getLessonLabs()
		if (listOfLessonLabs) {
			dispatch(setListOfLessonLabs(listOfLessonLabs))
		}
	}

	const getRegisterGeneralsData = async () => {
		const listOfRegisterGeneral: IRegisterGeneralType[] = await getRegisterGenerals('2')
		if (listOfRegisterGeneral) {
			dispatch(setListOfRegisterGenerals(listOfRegisterGeneral))
		}
	}

	const getPurchaseOrderData = async () => {
		const listOfPurchaseOrders: IPurchaseOrderType[] = await getPurchaseOrders()
		if (listOfPurchaseOrders) {
			dispatch(setListOfPurchaseOrders(listOfPurchaseOrders))
		}
	}

	const getScheduleData = async () => {
		const listOfSchedules: IScheduleType[] = await getSchedules()
		if (listOfSchedules) {
			dispatch(setListOfSchedules(listOfSchedules))
		}
	}

	const getPlanSubjectData = async () => {
		const listOfPlanSubjects: IPlanSubjectType[] = await getPlanSubjects()
		if (listOfPlanSubjects) {
			dispatch(setListOfPlanSubjects(listOfPlanSubjects))
		}
	}

	const getResearchTeamsData = async () => {
		const listOfResearchTeams: IResearchTeamType[] = await getResearchTeams()
		if (listOfResearchTeams) {
			dispatch(setListOfResearchTeams(listOfResearchTeams))
		}
	}

	const getResearchersData = async () => {
		const listOfResearchers: IResearcherType[] = await getResearchers()
		if (listOfResearchers) {
			dispatch(setListOfResearchers(listOfResearchers))
		}
	}

	const getTrainDeviceData = async () => {
		const listOfTrainDevices: ITrainDevice[] = await getTrainDevices()
		if (listOfTrainDevices) {
			dispatch(setListOfTrainDevice(listOfTrainDevices))
		}
	}

	const getTrainInstructorData = async () => {
		const listOfTrainInstructors: ITrainInstructor[] = await getTrainInstructors()
		if (listOfTrainInstructors) {
			dispatch(setListOfTrainInstructor(listOfTrainInstructors))
		}
	}

	const getTrainerData = async () => {
		const listOfTrainer: ITrainer[] = await getTrainer()
		if (listOfTrainer) {
			dispatch(setListOfTrainer(listOfTrainer))
		}
	}

	const getSuggestNewDevicesData = async () => {
		const listOfSuggestNewDevices: ISuggestNewDeviceType[] = await getSuggestNewDevices('2')
		if (listOfSuggestNewDevices) {
			dispatch(setListOfSuggestNewDevices(listOfSuggestNewDevices))
		}
	}

	const getExportToOtherDepartmentManagementFormsData = async () => {
		const listOfExportToOtherDepartmentManagementFormTypes: IExportToOtherDepartmentManagementFormType[] =
			await getExportToOtherDepartmentManagementForms()
		if (listOfExportToOtherDepartmentManagementFormTypes) {
			dispatch(setListOfExportToOtherDepartmentManagementForms(listOfExportToOtherDepartmentManagementFormTypes))
		}
	}

	const getLiquidateDeviceFormsData = async () => {
		const listOfLiquidateDeviceForms: IExportToLiquidateManagementFormType[] = await getListOfLiquidateDeviceForms()
		if (listOfLiquidateDeviceForms) {
			dispatch(setListOfExportToLiquidateManagementForms(listOfLiquidateDeviceForms))
		}
	}

	useEffect(() => {
		getLaboratoryData()
		getEmployeeData()
		getDepartmentData()
		getManufacturerData()
		getSupplierData()
		getChemicalData()
		getChemicalWarehouseData()
		getDeviceData()
		getDeviceSpecData()
		getSubjectData()
		getClassSubjectData()
		getLessonLabData()
		getRegisterGeneralsData()
		getPurchaseOrderData()
		getScheduleData()
		getPlanSubjectData()
		getResearchersData()
		getResearchTeamsData()
		getTrainDeviceData()
		getTrainInstructorData()
		getTrainerData()
		getSuggestNewDevicesData()
		getExportToOtherDepartmentManagementFormsData()
		getLiquidateDeviceFormsData()
	}, [])

	const snackbarFunc = () =>
		setTimeout(() => {
			dispatch(setSnackbarMessage(''))
		}, 5000)

	useEffect(() => {
		if (snackbarState.isOpen) {
			snackbarFunc()
		}
		return () => {
			clearTimeout(snackbarFunc())
		}
	}, [snackbarState.isOpen])

	const getComp = useCallback(() => {
		return Sidebar.getActive(appState)?.comp
	}, [appState])

	return (
		<>
			<div className="home">{getComp()}</div>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				open={snackbarState.isOpen}
				message={snackbarState.message}
				key="bottomRight"
			>
				<SnackbarContent
					style={{
						backgroundColor: snackbarState.backgroundColor,
						color: snackbarState.color,
					}}
					message={snackbarState.message}
				/>
			</Snackbar>
		</>
	)
}
