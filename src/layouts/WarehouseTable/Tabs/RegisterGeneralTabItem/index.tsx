import styled from '@emotion/styled';
import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
	Autocomplete,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import MaterialReactTable, { MRT_Cell, MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setSnackbarMessage } from '../../../../pages/appSlice';
import {
	deleteExportRegs,
	getExportsRegById,
	getExportsRegs,
	postExportRegs,
	updateExportRegs,
} from '../../../../services/exportsServices';
import { RootState } from '../../../../store';
import { IExportChemicalType } from '../../../../types/exportChemicalType';
import { dummyExportData, IExportType } from '../../../../types/exportType';
import ChemicalTable, { ColumnType } from '../../Details/ChemicalTable';
import CreateExportChemicalModal from '../../Modal/CreateExportChemicalModal';
import CreateExportModal from '../../Modal/CreateExportModal';
import DeleteExportModal from '../../Modal/DeleteExportModal';
import EditExportModal from '../../Modal/EditExportModal';
import { setListOfWarehouseRegisterGeneral } from '../../warehouseSlice';

const StyledTableCell = styled(TableCell)(theme => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: 'lightgray',
	},
}));

const RegisterGeneralTabItem: FC = () => {
	const warehouseRegisterGeneral = useAppSelector(
		(state: RootState) => state.warehouse.listOfWarehouseRegisterGeneral,
	);
	const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
	const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);

	const [isCreateExportChemicalModal, setIsCreateExportChemicalModal] = useState<boolean>(false);
	const [isCreateModal, setIsCreateModal] = useState<boolean>(false);
	const [isEditModal, setIsEditModal] = useState<boolean>(false);
	const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
	const [tableData, setTableData] = useState<IExportType[]>([]);
	const [validationErrors, setValidationErrors] = useState<{
		[cellId: string]: string;
	}>({});

	const dispatch = useAppDispatch();
	const [departmentActive, setDepartmentActive] = useState<Number>(2);

	const [createdRow, setCreatedRow] = useState<any>(dummyExportData);
	const [updatedRow, setUpdatedRow] = useState<any>(dummyExportData);
	const [deletedRow, setDeletedRow] = useState<any>(dummyExportData);

	useEffect(() => {
		const getWarehouseRegisterGeneralData = async () => {
			try {
				const listOfExport: IExportType[] = await getExportsRegs(departmentActive);
				if (listOfExport) {
					dispatch(setListOfWarehouseRegisterGeneral(listOfExport));
				}
			} catch (error) {
				dispatch(setListOfWarehouseRegisterGeneral([]));
			}
		};

		getWarehouseRegisterGeneralData();
	}, [departmentActive]);

	useEffect(() => {
		let formatedData = warehouseRegisterGeneral?.map((x: IExportType) => {
			let employeeInfoIdx = Array.isArray(employeeData)
				? employeeData.findIndex(y => y.EmployeeId === x.EmployeeId)
				: -1;

			return {
				...x,
				EmployeeName: employeeInfoIdx > -1 ? employeeData[employeeInfoIdx].Fullname : '',
				formatedExportDate: moment.unix(x.ExportDate).format('DD/MM/YYYY'),
			};
		});
		formatedData.sort((x, y) => y.ExportDate - x.ExportDate);
		setTableData(formatedData || []);
	}, [warehouseRegisterGeneral]);

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
				accessorKey: 'ExpRegGeneralId',
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
				accessorKey: 'EmployeeName',
				header: 'Ng?????i xu???t',
				size: 140,
				enableHiding: false,
			},
			{
				accessorKey: 'EmployeeId',
				header: 'Ng?????i xu???t',
				size: 140,
			},
			{
				accessorKey: 'RegisterGeneralId',
				header: 'RegisterGeneralId',
				enableHiding: false,
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
				accessorKey: 'ExpRegGeneralId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'ChemDeptId',
				header: 'M?? xu???t ho?? ch???t',
				size: 140,
			},
			{
				accessorKey: 'ChemicalName',
				header: 'M?? h??a ch???t',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'Amount',
				header: 'T??n h??a ch???t',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'Unit',
				header: 'S??? l?????ng',
				size: 140,
			},
			{
				accessorKey: 'ChemDetailId',
				header: 'Nh?? s???n xu??t',
				enableEditing: false,
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const handleOpenEditWarehouseRegModal = (row: any) => {
		setUpdatedRow(row.original);
		setIsEditModal(true);
	};

	const onCloseEditWarehouseRegModal = () => {
		setUpdatedRow(dummyExportData);
		setIsEditModal(false);
	};

	const handleOpenDeleteWarehouseRegModal = (row: any) => {
		setDeletedRow(row.original);
		setIsDeleteModal(true);
	};

	const onCloseDeleteWarehouseRegModal = () => {
		setDeletedRow(dummyExportData);
		setIsDeleteModal(false);
	};

	const handleOpenCreateWarehouseRegModal = (row: any) => {
		setIsCreateModal(true);
	};

	const onCloseCreateWarehouseRegModal = () => {
		setIsCreateModal(false);
	};

	const handleSubmitEditWarehouseRegModal = async (updatedRow: any) => {
		const updateData = {
			ExpRegGeneralId: updatedRow.ExpRegGeneralId,
			ExportDate: Number(updatedRow.ExportDate),
			Content: updatedRow.Content,
			Semester: Number(updatedRow.Semester),
			Schoolyear: updatedRow.Schoolyear,
			EmployeeId: updatedRow.EmployeeId,
			RegisterGeneralId: updatedRow.RegisterGeneralId,
			listChemicalExport: updatedRow.listChemicalExport,
		};

		setCreatedRow(updateData);
		setIsCreateExportChemicalModal(true);
	};

	const handleSubmitDeleteWarehouseRegModal = async () => {
		try {
			const resData = await deleteExportRegs(deletedRow.ExpRegGeneralId);
			if (resData) {
				dispatch(setSnackbarMessage('X??a th??ng tin th??nh c??ng'));
				let deletedIdx = warehouseRegisterGeneral.findIndex(
					x => x.ExpRegGeneralId === deletedRow.ExpRegGeneralId,
				);
				let newListOfReg = [
					...warehouseRegisterGeneral.slice(0, deletedIdx),
					...warehouseRegisterGeneral.slice(deletedIdx + 1),
				];
				dispatch(setListOfWarehouseRegisterGeneral(newListOfReg));
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitCreateWarehouseRegModal = async (createdRow: any) => {
		try {
			const createData = {
				ExpRegGeneralId: createdRow.ExpRegGeneralId,
				ExportDate: Number(createdRow.ExportDate),
				Content: createdRow.Content,
				Semester: Number(createdRow.Semester),
				Schoolyear: createdRow.Schoolyear,
				EmployeeId: createdRow.EmployeeId,
				RegisterGeneralId: createdRow.RegisterGeneralId,
				listChemicalExport: createdRow.listChemicalExport,
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
		}));

		const createData: IExportType = {
			...createdRow,
			listChemicalExport: listChemicalExportUpdate,
		};

		const isExist: boolean =
			warehouseRegisterGeneral.findIndex(x => x.ExpRegGeneralId === createData.ExpRegGeneralId) > -1;

		if (isExist) {
			const resData = await updateExportRegs(createData, departmentActive);

			if (Object.keys(resData).length !== 0) {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin th??nh c??ng'));
				let updatedIdx = warehouseRegisterGeneral.findIndex(x => x.ExpRegGeneralId === row.ExpRegGeneralId);
				let newListOfRegs = [
					...warehouseRegisterGeneral.slice(0, updatedIdx),
					createData,
					...warehouseRegisterGeneral.slice(updatedIdx + 1),
				];
				dispatch(setListOfWarehouseRegisterGeneral(newListOfRegs));
			} else {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
			}
		} else {
			const resData = await postExportRegs(createData, departmentActive);
			if (Object.keys(resData).length !== 0) {
				const newListOfRegs: IExportType = await getExportsRegById(
					createData?.ExpRegGeneralId || '',
					departmentActive,
				);
				if (newListOfRegs) {
					dispatch(setSnackbarMessage('T???o th??ng tin m???i th??nh c??ng'));
					dispatch(setListOfWarehouseRegisterGeneral([...warehouseRegisterGeneral, newListOfRegs]));
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
				initialState={{
					columnVisibility: { RegisterGeneralId: false, EmployeeId: false },
					density: 'compact',
					columnOrder: [
						'mrt-row-expand',
						'mrt-row-numbers',
						...columns.map(x => x.accessorKey || ''),
						'mrt-row-actions',
					],
				}}
				muiTableDetailPanelProps={{
					sx: { background: '#f3f3f3' },
				}}
				renderDetailPanel={({ row }) => {
					return (
						<>
							<ChemicalTable
								columns={columnsChemicalTable.current}
								warehouseData={warehouseRegisterGeneral}
								row={row}
								type="REG"
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
						<span>Qu???n l?? phi???u xu???t ????ng k?? chung</span>
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
							<IconButton onClick={() => handleOpenEditWarehouseRegModal(row)}>
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip arrow placement="right" title="Xo?? th??ng tin phi???u xu???t ????ng k?? chung">
							<IconButton color="error" onClick={() => handleOpenDeleteWarehouseRegModal(row)}>
								<Delete />
							</IconButton>
						</Tooltip>
					</>
				)}
				renderBottomToolbarCustomActions={() => (
					<Tooltip title="T???o phi???u xu???t ????ng k?? chung m???i" placement="right-start">
						<Button
							color="primary"
							onClick={handleOpenCreateWarehouseRegModal}
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
					onClose={onCloseDeleteWarehouseRegModal}
					title="Xo?? th??ng tin phi???u xu???t ????ng k?? chung"
					handleSubmit={handleSubmitDeleteWarehouseRegModal}
				>
					B???n c?? ch???c mu???n xo?? th??ng tin{' '}
					<Typography component="span" color="red">
						{deletedRow.ExpRegGeneralId} - {deletedRow.Content} - {deletedRow.EmployeeName}
					</Typography>{' '}
					kh??ng?
				</DeleteExportModal>
			)}

			{isCreateModal && (
				<CreateExportModal
					onClose={onCloseCreateWarehouseRegModal}
					columns={columns}
					isCreateModal={isCreateModal}
					handleSubmitCreateModal={handleSubmitCreateWarehouseRegModal}
					initData={{...createdRow, DepartmentId: departmentActive}}
				/>
			)}

			{isEditModal && (
				<EditExportModal
					initData={updatedRow}
					isEditModal={isEditModal}
					columns={columns}
					onClose={onCloseEditWarehouseRegModal}
					handleSubmitEditModal={handleSubmitEditWarehouseRegModal}
				/>
			)}

			{isCreateExportChemicalModal && (
				<CreateExportChemicalModal
					type="REG"
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

export default RegisterGeneralTabItem;
