import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Autocomplete, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import MaterialReactTable, { MRT_Cell, MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setSnackbarMessage } from '../../../../pages/appSlice';
import {
	deleteExportSubs,
	getExportsSubById,
	getExportsSubs,
	postExportSubs,
	updateExportSubs
} from '../../../../services/exportsServices';
import { RootState } from '../../../../store';
import { IExportChemicalType } from '../../../../types/exportChemicalType';
import { dummyExportData, IExportType } from '../../../../types/exportType';
import ChemicalTable, { ColumnType } from '../../Details/ChemicalTable';
import CreateExportChemicalModal from '../../Modal/CreateExportChemicalModal';
import CreateExportModal from '../../Modal/CreateExportModal';
import DeleteExportModal from '../../Modal/DeleteExportModal';
import EditExportModal from '../../Modal/EditExportModal';
import { setListOfWarehouseStudySession } from '../../warehouseSlice';

const StudySessionTabItem: FC = () => {
	const warehouseStudySession = useAppSelector((state: RootState) => state.warehouse.listOfWarehouseStudySession);
	const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
	const subjectData = useAppSelector((state: RootState) => state.subject.listOfSubjects);
	const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);
	const studySessionData = useAppSelector((state: RootState) => state.schedule.listOfSchedules);
	const [departmentActive, setDepartmentActive] = useState<Number>(2);

	const [isCreateExportChemicalModal, setIsCreateExportChemicalModal] = useState<boolean>(false);
	const [isCreateModal, setIsCreateModal] = useState<boolean>(false);
	const [isEditModal, setIsEditModal] = useState<boolean>(false);
	const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
	const [tableData, setTableData] = useState<IExportType[]>([]);
	const [validationErrors, setValidationErrors] = useState<{
		[cellId: string]: string;
	}>({});

	const dispatch = useAppDispatch();

	const [createdRow, setCreatedRow] = useState<any>(dummyExportData);
	const [updatedRow, setUpdatedRow] = useState<any>(dummyExportData);
	const [deletedRow, setDeletedRow] = useState<any>(dummyExportData);

	useEffect(() => {
		const getWarehouseSubjectData = async () => {
			try {
				const listOfExport: IExportType[] = await getExportsSubs(departmentActive);
				if (listOfExport) {
					dispatch(setListOfWarehouseStudySession(listOfExport));
				}
			} catch (error) {
				dispatch(setListOfWarehouseStudySession([]));
			}
		};
		getWarehouseSubjectData();
	}, [departmentActive]);

	useEffect(() => {
		let formatedData = warehouseStudySession?.map((x: IExportType) => {
			let employeeInChargeInfoIdx = Array.isArray(employeeData)
				? employeeData.findIndex(y => y.EmployeeId === x.EmployeeInCharge)
				: -1;
			let employeeCreateInfoIdx = Array.isArray(employeeData)
				? employeeData.findIndex(y => y.EmployeeId === x.EmployeeCreate)
				: -1;
			let subjectInfoIdx = Array.isArray(subjectData)
				? subjectData?.findIndex(y => y.SubjectId === x.SubjectId)
				: -1;

			return {
				...x,
				formatedExportDate: moment.unix(x.ExportDate).format('DD/MM/YYYY'),
				EmployeeInChargeName:
					employeeInChargeInfoIdx > -1 ? employeeData[employeeInChargeInfoIdx].Fullname : '',
				EmployeeCreateName: employeeCreateInfoIdx > -1 ? employeeData[employeeCreateInfoIdx].Fullname : '',
				SubjectName: subjectInfoIdx > -1 ? subjectData[subjectInfoIdx].SubjectName : '',
			};
		});
		formatedData.sort((x, y) => y.ExportDate - x.ExportDate);
		setTableData(formatedData || []);
	}, [warehouseStudySession]);

	const getCommonEditTextFieldProps = useCallback(
		(cell: MRT_Cell<IExportType>): MRT_ColumnDef<IExportType>['muiTableBodyCellEditTextFieldProps'] => {
			return {
				error: !!validationErrors[cell.id],
				helperText: validationErrors[cell.id],
			};
		},
		[validationErrors],
	);

	const columns = useMemo<MRT_ColumnDef<IExportType>[]>(
		() => [
			{
				accessorKey: 'ExpSubjectId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'formatedExportDate',
				header: 'Th???i gian xu???t',
				size: 140,
			},
			{
				accessorKey: 'Content',
				header: 'N???i dung',
				size: 140,
			},
			{
				accessorKey: 'Schoolyear',
				header: 'N??m h???c',
				size: 140,
			},
			{
				accessorKey: 'Semester',
				header: 'H???c k???',
				size: 140,
			},
			{
				accessorKey: 'SubjectId',
				header: 'M??n h???c',
				size: 140,
			},
			{
				accessorKey: 'EmployeeInCharge',
				header: 'Ng?????i ph??? tr??ch',
				size: 140,
			},
			{
				accessorKey: 'EmployeeCreate',
				header: 'Ng?????i t???o',
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columnsChemicalTable = useRef<ColumnType[]>([
		{
			id: 'ChemDeptId',
			header: 'M?? xu???t ho?? ch???t',
		},
		{
			id: 'ChemicalName',
			header: 'T??n ho?? ch???t',
		},
		{
			id: 'Amount',
			header: 'S??? l?????ng',
			renderValue: (amount, unit) => `${amount} (${unit})`,
		},
	]);

	const columnsExportChemicalModal = useMemo<MRT_ColumnDef<IExportChemicalType>[]>(
		() => [
			{
				accessorKey: 'ExpSubjectId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'ChemDeptId',
				header: 'M?? xu???t ho?? ch???t',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'ChemicalName',
				header: 'T??n ho?? ch???t',
				size: 140,
			},
			{
				accessorKey: 'Amount',
				header: 'S??? l?????ng',
				size: 140,
			},
			{
				accessorKey: 'Unit',
				header: '????n v???',
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const handleOpenEditWarehouseSesModal = (row: any) => {
		setUpdatedRow(row.original);
		setIsEditModal(true);
	};

	const onCloseEditWarehouseSesModal = () => {
		setUpdatedRow(dummyExportData);
		setIsEditModal(false);
	};

	const handleOpenDeleteWarehouseSesModal = (row: any) => {
		setDeletedRow(row.original);
		setIsDeleteModal(true);
	};

	const onCloseDeleteWarehouseSesModal = () => {
		setDeletedRow(dummyExportData);
		setIsDeleteModal(false);
	};

	const handleOpenCreateWarehouseSesModal = (row: any) => {
		setIsCreateModal(true);
	};

	const onCloseCreateWarehouseSesModal = () => {
		setIsCreateModal(false);
	};

	const handleSubmitDeleteWarehouseSesModal = async () => {
		try {
			const resData = await deleteExportSubs(deletedRow.ExpSubjectId);
			if (resData) {
				dispatch(setSnackbarMessage('X??a th??ng tin th??nh c??ng'));
				let deletedIdx = warehouseStudySession.findIndex(x => x.ExpSubjectId === deletedRow.ExpSubjectId);
				let newListOfLabs = [
					...warehouseStudySession.slice(0, deletedIdx),
					...warehouseStudySession.slice(deletedIdx + 1),
				];
				dispatch(setListOfWarehouseStudySession(newListOfLabs));
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitEditWarehouseSesModal = async (updatedRow: any) => {
		const updateData = {
			ExpSubjectId: updatedRow.ExpSubjectId,
			ExportDate: Number(updatedRow.ExportDate),
			Content: updatedRow.Content,
			Semester: Number(updatedRow.Semester),
			Schoolyear: updatedRow.Schoolyear,
			SubjectId: updatedRow.SubjectId,
			EmployeeInCharge: updatedRow.EmployeeInCharge,
			EmployeeCreate: updatedRow.EmployeeCreate,
			listChemical: updatedRow.listChemical,
		};
		setCreatedRow(updateData);
		setIsCreateExportChemicalModal(true);
	};

	const handleSubmitCreateWarehouseSesModal = async (createdRow: any) => {
		try {
			const createData = {
				ExpSubjectId: createdRow.ExpSubjectId,
				ExportDate: Number(createdRow.ExportDate),
				Content: createdRow.Content,
				Semester: Number(createdRow.Semester),
				Schoolyear: createdRow.Schoolyear,
				SubjectId: createdRow.SubjectId,
				EmployeeInCharge: createdRow.EmployeeInCharge,
				EmployeeCreate: createdRow.EmployeeCreate,
				listChemical: createdRow.listChemical,
			};

			setCreatedRow(createData);
			setIsCreateExportChemicalModal(true);
		} catch (error) {
			dispatch(setSnackbarMessage('T???o th??ng tin m???i kh??ng th??nh c??ng'));
		}
	};

	const handleSumbitCreateExportChemical = async (listChemical: any, row: any) => {
		const listChemicalExportUpdate = listChemical.map((chemical: any) => ({
			ChemDeptId: chemical.ChemDeptId,
			ChemicalName: chemical.ChemicalName,
			Amount: chemical.Amount,
			Unit: chemical.Unit,
			ExpSubjectId: createdRow.ExpSubjectId,
		}));

		const createData: IExportType = {
			...createdRow,
			listChemical: listChemicalExportUpdate,
		};
		const isExist: boolean = warehouseStudySession.findIndex(x => x.ExpSubjectId === createData.ExpSubjectId) > -1;
		if (isExist) {
			const resData = await updateExportSubs(createData, departmentActive);

			if (Object.keys(resData).length !== 0) {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin th??nh c??ng'));
				let updatedIdx = warehouseStudySession.findIndex(x => x.ExpSubjectId === createData.ExpSubjectId);
				let newListOfSubs = [
					...warehouseStudySession.slice(0, updatedIdx),
					createData,
					...warehouseStudySession.slice(updatedIdx + 1),
				];
				dispatch(setListOfWarehouseStudySession(newListOfSubs));
			} else {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
			}
		} else {
			const resData = await postExportSubs(createData, departmentActive);
			if (Object.keys(resData).length !== 0) {
				const newListOfSubs: IExportType = await getExportsSubById(
					createData?.ExpSubjectId || '',
					departmentActive,
				);
				if (newListOfSubs) {
					dispatch(setSnackbarMessage('T???o th??ng tin m???i th??nh c??ng'));
					dispatch(setListOfWarehouseStudySession([...warehouseStudySession, newListOfSubs]));
				}
			} else {
				dispatch(setSnackbarMessage('T???o th??ng tin m???i kh??ng th??nh c??ng'));
			}
		}

		setIsCreateExportChemicalModal(false);
		setIsCreateModal(false);
	};

	return (
		<>
			<MaterialReactTable
				displayColumnDefOptions={{
					'mrt-row-actions': {
						header: 'C??c h??nh ?????ng',
						muiTableHeadCellProps: {
							align: 'center',
						},
						muiTableBodyCellProps: {
							align: 'center',
						},
					},
					'mrt-row-numbers': {
						muiTableHeadCellProps: {
							align: 'center',
						},
						muiTableBodyCellProps: {
							align: 'center',
						},
					},
				}}
				columns={columns}
				data={tableData}
				editingMode="modal" //default
				enableEditing
				enableRowNumbers
				enablePinning
				enableGrouping={false}
				enableRowActions
				enableExpanding
				muiTableDetailPanelProps={{
					sx: { background: '#f3f3f3' },
				}}
				initialState={{
					columnVisibility: {
						SessionId: false,
						EmployeeId: false,
						EmployeeInCharge: false,
						EmployeeCreate: false,
						SubjectId: false,
					},
					density: 'compact',
					columnOrder: [
						'mrt-row-expand',
						'mrt-row-numbers',
						...columns.map(x => x.accessorKey || ''),
						'mrt-row-actions',
					],
				}}
				renderDetailPanel={({ row }) => {
					return (
						<>
							<Box>
								<Typography>
									<b>Ng?????i ph??? tr??ch: </b>
									{`${row.original.EmployeeInCharge} - ${row.original.EmployeeInChargeName}`}
								</Typography>
								<Typography>
									<b>Ng?????i t???o: </b>
									{`${row.original.EmployeeCreate} - ${row.original.EmployeeCreateName}`}
								</Typography>
								<Typography>
									<b>M??n h???c: </b>
									{`${row.original.SubjectId} - ${row.original.SubjectName}`}
								</Typography>
							</Box>
							<ChemicalTable
								warehouseData={warehouseStudySession}
								row={row}
								columns={columnsChemicalTable.current}
								type="SUB"
							/>
						</>
					);
				}}
				renderTopToolbarCustomActions={() => (
					<h3 style={{ margin: '0px' }}>
						<b>
							<KeyboardArrowRightIcon
								style={{ margin: '0px', fontSize: '30px', paddingTop: '15px' }}
							></KeyboardArrowRightIcon>
						</b>

						<span>Qu???n l?? phi???u xu???t bu???i h???c</span>
						<Autocomplete
							sx={{ marginBottom: '8px', marginTop: '16px' }}
							size="small"
							autoComplete={true}
							options={departmentData.filter(x => x.DepartmentId !== 1).map(y => y.DepartmentName)}
							onChange={(event, value) => {
								setDepartmentActive(
									departmentData.find(x => x.DepartmentName === value)?.DepartmentId || -1,
								);
							}}
							disableClearable={true}
							noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
							defaultValue={departmentData.filter(x => x.DepartmentId !== 1)[0].DepartmentName || 0}
							value={departmentData.find(x => x.DepartmentId === departmentActive)?.DepartmentName || ''}
							renderInput={params => <TextField {...params} label="Khoa" />}
						/>
					</h3>
				)}
				renderRowActions={({ row, table }) => (
					<>
						<Tooltip arrow placement="left" title="S???a th??ng tin phi???u xu???t ????ng k?? chung">
							<IconButton onClick={() => handleOpenEditWarehouseSesModal(row)}>
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip arrow placement="right" title="Xo?? th??ng tin phi???u xu???t ????ng k?? chung">
							<IconButton color="error" onClick={() => handleOpenDeleteWarehouseSesModal(row)}>
								<Delete />
							</IconButton>
						</Tooltip>
					</>
				)}
				renderBottomToolbarCustomActions={() => (
					<Tooltip title="T???o phi???u xu???t ????ng k?? chung m???i" placement="right-start">
						<Button
							color="primary"
							onClick={handleOpenCreateWarehouseSesModal}
							variant="contained"
							style={{ margin: '10px' }}
						>
							<AddIcon fontSize="small" />
						</Button>
					</Tooltip>
				)}
			/>

			{isDeleteModal && (
				<DeleteExportModal
					isOpen={isDeleteModal}
					onClose={onCloseDeleteWarehouseSesModal}
					title="Xo?? th??ng tin phi???u xu???t bu???i h???c"
					handleSubmit={handleSubmitDeleteWarehouseSesModal}
				>
					<span>B???n c?? ch???c mu???n xo?? th??ng tin </span>
					<Typography component="span" color="red">
						{deletedRow.ExpSubjectId} - {deletedRow.Content} - {deletedRow.EmployeeCreateName}
					</Typography>
					<span> kh??ng?</span>
				</DeleteExportModal>
			)}

			{isCreateModal && (
				<CreateExportModal
					onClose={onCloseCreateWarehouseSesModal}
					columns={columns}
					isCreateModal={isCreateModal}
					handleSubmitCreateModal={handleSubmitCreateWarehouseSesModal}
					initData={{...createdRow, DepartmentId: departmentActive}}
				/>
			)}
			
			{isEditModal && (
				<EditExportModal
					initData={updatedRow}
					isEditModal={isEditModal}
					columns={columns}
					onClose={onCloseEditWarehouseSesModal}
					handleSubmitEditModal={handleSubmitEditWarehouseSesModal}
				/>
			)}

			{isCreateExportChemicalModal && (
				<CreateExportChemicalModal
					type="SUB"
					initData={createdRow}
					isOpen={isCreateExportChemicalModal}
					columns={columnsExportChemicalModal}
					onClose={() => setIsCreateExportChemicalModal(false)}
					handleSubmit={handleSumbitCreateExportChemical}
				/>
			)}
		</>
	);

	return <></>;
};

export default StudySessionTabItem;
