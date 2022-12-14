import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import MaterialReactTable, { MRT_Cell, MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setSnackbarMessage } from '../../../../pages/appSlice';
import { deleteExport, getExportById, postExport, updateExport } from '../../../../services/exportsServices';
import { RootState } from '../../../../store';
import { IExportChemicalType } from '../../../../types/exportChemicalType';
import { IExportDeviceType } from '../../../../types/exportDeviceType';
import { dummyExportData, IExportType } from '../../../../types/exportType';
import ChemicalTable, { ColumnType } from '../../Details/ChemicalTable';
import DeviceTable from '../../Details/DeviceTable';
import CreateExportChemicalModal from '../../Modal/CreateExportChemicalModal';
import CreateExportDeviceModal from '../../Modal/CreateExportDeviceModal';
import CreateExportModal from '../../Modal/CreateExportModal';
import DeleteExportModal from '../../Modal/DeleteExportModal';
import EditExportModal from '../../Modal/EditExportModal';
import { setListOfWarehouseDepartment } from '../../warehouseSlice';

const DepartmentTabItem: FC = () => {
	const warehouseDepartment = useAppSelector((state: RootState) => state.warehouse.listOfWarehouseDepartment);
	const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
	const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);
	const dispatch = useAppDispatch();

	const [isCreateExportChemicalModal, setIsCreateExportChemicalModal] = useState<boolean>(false);
	const [isCreateExportDeviceModal, setIsCreateExportDeviceModal] = useState<boolean>(false);
	const [isCreateModal, setIsCreateModal] = useState<boolean>(false);
	const [isEditModal, setIsEditModal] = useState<boolean>(false);
	const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
	const [tableData, setTableData] = useState<IExportType[]>([]);
	const [validationErrors, setValidationErrors] = useState<{
		[cellId: string]: string;
	}>({});

	const [createdRow, setCreatedRow] = useState<any>(dummyExportData);
	const [updatedRow, setUpdatedRow] = useState<any>(dummyExportData);
	const [deletedRow, setDeletedRow] = useState<any>(dummyExportData);

	useEffect(() => {
		if (warehouseDepartment.length > 0) {
			let formatedData = warehouseDepartment?.map((x: IExportType) => {
				let userAcceptInfoIdx = Array.isArray(employeeData)
					? employeeData.findIndex(y => y.EmployeeId === x.UserAccept)
					: -1;
				return {
					...x,
					formatedExportDate: moment.unix(x.ExportDate).format('DD/MM/YYYY'),
					UserAcceptName: userAcceptInfoIdx > -1 ? employeeData[userAcceptInfoIdx].Fullname : '',
				};
			});
			formatedData.sort((x: any, y: any) => {
				if (y.ExportDate === x.ExportDate) {
					return y?.ExportId?.localeCompare(x?.ExportId?.toString());
				} else {
					return y.ExportDate - x.ExportDate;
				}
			});
			setTableData(formatedData);
		}
	}, [warehouseDepartment]);

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
				accessorKey: 'ExportId',
				header: 'ID',
				size: 50,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'Content',
				header: 'N???i dung',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
			},
			{
				accessorKey: 'formatedExportDate',
				header: 'Th???i gian xu???t',
				Header: ({ column }) => <span style={{ whiteSpace: 'pre-wrap' }}>{column.columnDef.header}</span>,
				size: 160,
			},
			{
				accessorKey: 'EmployeeId',
				header: 'Ng?????i xu???t',
			},
			{
				accessorKey: 'EmployeeName',
				header: 'Ng?????i xu???t',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
				enableHiding: false,
			},
			{
				accessorKey: 'DepartmentName',
				header: 'Ph??ng',
				size: 180,
				enableHiding: false,
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
			},
			{
				accessorKey: 'UserAcceptName',
				header: 'Ng?????i ch???p nh???n',
				enableHiding: false,
				Header: ({ column }) => <span style={{ whiteSpace: 'pre-wrap' }}>{column.columnDef.header}</span>,
			},
			{
				accessorKey: 'UserAccept',
				header: 'Ng?????i ch???p nh???n',
				size: 180,
			},
			{
				accessorKey: 'DepartmentId',
				header: 'Ph??ng ban',
			},
			{
				accessorKey: 'Note',
				header: 'Ghi ch??',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
			},
			{
				accessorKey: 'Accept',
				header: 'Ch???p nh???n',
				Cell: ({ cell, row, column }) => {
					return (
						<span
							style={{
								whiteSpace: 'pre-wrap',
								background: cell.getValue<String>() === 'Accepted' ? 'green' : '#fc9003',
								color: cell.getValue<String>() === 'Accepted' ? 'white' : 'white',
								padding: '4px 8px',
								borderRadius: '1000px',
							}}
						>
							{cell.getValue<String>() === 'Accepted' ? 'Ch???p nh???n' : '??ang ch???'}
						</span>
					);
				},
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columnsExportChemicalModal = useMemo<MRT_ColumnDef<IExportChemicalType>[]>(
		() => [
			{
				accessorKey: 'ExportId',
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
				accessorKey: 'AmountOriginal',
				header: 'T??n h??a ch???t',
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

	const columnsExportDeviceModal = useMemo<MRT_ColumnDef<IExportDeviceType>[]>(
		() => [
			{
				accessorKey: 'ExportId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'DeviceInfoId',
				header: 'M?? Thi???t b???',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'DeviceName',
				header: 'T??n thi???t b???',
				size: 140,
			},
			{
				accessorKey: 'QuantityOriginal',
				header: 'S??? l?????ng',
				size: 140,
			},
			{
				accessorKey: 'Unit',
				header: 'Xu???t x???',
				size: 140,
			},
			{
				accessorKey: 'DeviceDetailId',
				header: 'Nh?? s???n xu??t',
				enableEditing: false,
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
			id: 'ChemDetailId',
			header: 'M?? ho?? ch???t',
		},
		{
			id: 'ChemicalName',
			header: 'T??n ho?? ch???t',
		},
		{
			id: 'AmountOriginal',
			header: 'S??? l?????ng',
			renderValue: (amount, unit) => `${amount} (${unit})`,
		},
	]);

	const columnsDeviceTable = useRef<ColumnType[]>([
		{
			id: 'DeviceDeptId',
			header: 'M?? xu???t thi???t b???',
		},
		{
			id: 'DeviceDetailId',
			header: 'M?? thi???t b???',
		},
		{
			id: 'DeviceName',
			header: 'T??n thi???t b???',
		},
		{
			id: 'QuantityOriginal',
			header: 'S??? l?????ng',
			renderValue: (amount, unit) => `${amount} (${unit})`,
		},
	]);

	const handleOpenEditWarehouseDepModal = (row: any) => {
		setUpdatedRow(row.original);
		setIsEditModal(true);
	};

	const onCloseEditWarehouseDep = () => {
		setUpdatedRow(dummyExportData);
		setIsEditModal(false);
	};

	const onCloseDeleteWarehouseDepModal = () => {
		setDeletedRow(dummyExportData);
		setIsDeleteModal(false);
	};

	const handleOpenDeleteWarehouseDepModal = (row: any) => {
		setDeletedRow(row.original);
		setIsDeleteModal(true);
	};

	const handleOpenCreateWarehouseDepModal = (row: any) => {
		setIsCreateModal(true);
	};

	const onCloseCreateWarehouseDepModal = () => {
		setIsCreateModal(false);
	};

	const handleSubmitEditWarehouseDepModal = async (updatedRow: any) => {
		const updateData: IExportType = {
			ExportId: updatedRow.ExportId,
			ExportDate: Number(updatedRow.ExportDate),
			Content: updatedRow.Content,
			Note: updatedRow.Note,
			EmployeeId: updatedRow.EmployeeId,
			EmployeeName: updatedRow.EmployeeName,
			DepartmentId: updatedRow.DepartmentId,
			DepartmentName: updatedRow.DepartmentName,
			Accept: updatedRow.Accept !== 'Accepted' ? '' : 'Accepted',
			UserAccept: updatedRow.UserAccept,
			listChemicalExport: updatedRow.listChemicalExport,
			listDeviceExport: updatedRow.listDeviceExport,
		};

		setCreatedRow(updateData);
		setIsCreateExportChemicalModal(true);
	};

	const handleSubmitDeleteWarehouseDepModal = async () => {
		try {
			const data = await deleteExport(deletedRow.ExportId);
			if (data) {
				dispatch(setSnackbarMessage('X??a th??ng tin th??nh c??ng'));
				let deletedIdx = warehouseDepartment.findIndex(x => x.ExportId === deletedRow.ExportId);
				let newListOfDeps = [
					...warehouseDepartment.slice(0, deletedIdx),
					...warehouseDepartment.slice(deletedIdx + 1),
				];
				dispatch(setListOfWarehouseDepartment(newListOfDeps));
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitCreateWarehouseDepModal = async (createdRow: any) => {
		try {
			const createData = {
				ExportId: createdRow.ExportId,
				ExportDate: createdRow.ExportDate,
				Content: createdRow.Content,
				Note: createdRow.Note,
				EmployeeId: createdRow.EmployeeId,
				DepartmentName: createdRow.DepartmentName,
				EmployeeName: createdRow.EmployeeName,
				DepartmentId: createdRow.DepartmentId,
				Accept: createdRow.Accept !== 'Accepted' ? '' : 'Accepted',
				UserAccept: createdRow.UserAccept,
				listChemicalExport: createdRow.listChemicalExport,
				listDeviceExport: createdRow.listDeviceExport,
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
			ChemDetailId: chemical.ChemDetailId,
			ChemicalName: chemical.ChemicalName,
			AmountOriginal: chemical.Amount,
			Unit: chemical.Unit,
		}));

		const createData: IExportType = {
			...createdRow,
			listChemicalExport: listChemicalExportUpdate,
		};

		setCreatedRow(createData);
		setIsCreateExportDeviceModal(true);
	};

	const handleSumbitCreateExportDevice = async (listDevice: any, row: any) => {
		const listDeviceExportUpdate = listDevice.map((device: any) => ({
			DeviceDeptId: device.DeviceDeptId,
			DeviceDetailId: device.DeviceDetailId,
			DeviceName: device.DeviceName,
			QuantityOriginal: device.Amount,
			Unit: device.Unit,
		}));

		const createData: IExportType = {
			...createdRow,
			listDeviceExport: listDeviceExportUpdate,
		};

		const isExist: boolean = warehouseDepartment.findIndex(x => x.ExportId === createData.ExportId) > -1;
		if (isExist) {
			const resData = await updateExport(createData);

			if (Object.keys(resData).length !== 0) {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin th??nh c??ng'));
				let updatedIdx = warehouseDepartment.findIndex(x => x.ExportId === createData.ExportId);
				let newListOfDep = [
					...warehouseDepartment.slice(0, updatedIdx),
					createData,
					...warehouseDepartment.slice(updatedIdx + 1),
				];
				dispatch(setListOfWarehouseDepartment(newListOfDep));
			} else {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
			}
		} else {
			const resData = await postExport(createData);
			if (Object.keys(resData).length !== 0) {
				const newListOfDeps: IExportType = await getExportById(createData?.ExportId || '');
				if (newListOfDeps) {
					dispatch(setSnackbarMessage('T???o th??ng tin m???i th??nh c??ng'));
					dispatch(setListOfWarehouseDepartment([...warehouseDepartment, newListOfDeps]));
				}
			} else {
				dispatch(setSnackbarMessage('T???o th??ng tin m???i kh??ng th??nh c??ng'));
			}
		}

		setIsCreateExportDeviceModal(false);
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
					'mrt-row-expand': { size: 30 },
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
					density: 'compact',
					columnVisibility: { LabId: false, EmployeeId: false, DepartmentId: false, UserAccept: false },
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
							<ChemicalTable
								warehouseData={warehouseDepartment}
								row={row}
								columns={columnsChemicalTable.current}
								type="DEP"
							/>
							<DeviceTable
								warehouseData={warehouseDepartment}
								row={row}
								columns={columnsDeviceTable.current}
								type="DEP"
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
						<span>Qu???n l?? phi???u xu???t ph??ng th?? nghi???m</span>
					</h3>
				)}
				renderRowActions={({ row, table }) => (
					<>
						{row.original.Accept !== 'Accepted' && (
							<>
								<Tooltip arrow placement="left" title="S???a th??ng tin phi???u xu???t ph??ng th?? nghi???m">
									<IconButton onClick={() => handleOpenEditWarehouseDepModal(row)}>
										<Edit />
									</IconButton>
								</Tooltip>
								<Tooltip arrow placement="right" title="Xo?? phi???u xu???t ph??ng th?? nghi???m">
									<IconButton color="error" onClick={() => handleOpenDeleteWarehouseDepModal(row)}>
										<Delete />
									</IconButton>
								</Tooltip>
							</>
						)}
					</>
				)}
				renderBottomToolbarCustomActions={() => (
					<Tooltip title="T???o phi???u xu???t ph??ng th?? nghi???m m???i" placement="right-start">
						<Button
							color="primary"
							onClick={handleOpenCreateWarehouseDepModal}
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
					onClose={onCloseDeleteWarehouseDepModal}
					title="Xo?? th??ng tin phi???u xu???t ph??ng th?? nghi???m"
					handleSubmit={handleSubmitDeleteWarehouseDepModal}
				>
					B???n c?? ch???c mu???n xo?? th??ng tin{' '}
					<Typography component="span" color="red">
						{deletedRow.ExportId} - {deletedRow.Content} - {deletedRow.EmployeeName}
					</Typography>{' '}
					kh??ng?
				</DeleteExportModal>
			)}

			{isCreateModal && (
				<CreateExportModal
					onClose={onCloseCreateWarehouseDepModal}
					columns={columns}
					isCreateModal={isCreateModal}
					handleSubmitCreateModal={handleSubmitCreateWarehouseDepModal}
					initData={createdRow}
				/>
			)}

			{isEditModal && (
				<EditExportModal
					initData={updatedRow}
					isEditModal={isEditModal}
					columns={columns}
					onClose={onCloseEditWarehouseDep}
					handleSubmitEditModal={handleSubmitEditWarehouseDepModal}
				/>
			)}

			{isCreateExportChemicalModal && (
				<CreateExportChemicalModal
					type="DEP"
					initData={createdRow}
					isOpen={isCreateExportChemicalModal}
					columns={columnsExportChemicalModal}
					onClose={() => setIsCreateExportChemicalModal(false)}
					handleSubmit={handleSumbitCreateExportChemical}
				/>
			)}

			{isCreateExportDeviceModal && (
				<CreateExportDeviceModal
					type="DEP"
					handleSubmit={handleSumbitCreateExportDevice}
					initData={createdRow}
					isOpen={isCreateExportDeviceModal}
					columns={columnsExportDeviceModal}
					onClose={() => setIsCreateExportDeviceModal(false)}
				/>
			)}
		</>
	);
};

export default DepartmentTabItem;
