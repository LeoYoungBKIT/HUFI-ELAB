import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import MaterialReactTable, { MRT_Cell, MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setSnackbarMessage } from '../../../../pages/appSlice';
import { deleteExportChemical } from '../../../../services/exportChemicalServices';
import { deleteExportDevice } from '../../../../services/exportDeviceServices';
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
// import DeleteExportChemicalModal from '../../Modal/DeleteExportChemicalModal';
// import DeleteExportDeviceModal from '../../Modal/DeleteExportDeviceModal';
import DeleteExportModal from '../../Modal/DeleteExportModal';
import EditExportChemicalModal from '../../Modal/EditExportChemicalModal';
// import EditExportDeviceModal from '../../Modal/EditExportDeviceModal';
import EditExportModal from '../../Modal/EditExportModal';
import { setListOfWarehouseDepartment } from '../../warehouseSlice';

const DepartmentTabItem: FC = () => {
	const warehouseDepartment = useAppSelector((state: RootState) => state.warehouse.listOfWarehouseDepartment);
	const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
	const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);
	const laboratoriesData = useAppSelector((state: RootState) => state.laboratory.listOfLaboratories);
	const exportChemicalData = useAppSelector((state: RootState) => state.exportChemical.listOfExportChemical);
	const chemicalsData = useAppSelector((state: RootState) => state.chemical.listOfChemicals);
	const nanufacturersData = useAppSelector((state: RootState) => state.manufacturer.listOfManufacturers);
	const exportDeviceData = useAppSelector((state: RootState) => state.exportDevice.listOfExportDevice);
	const dispatch = useAppDispatch();

	const [isCreateExportChemicalModal, setIsCreateExportChemicalModal] = useState<boolean>(false);
	const [isEditExportChemicalModal, setIsEditExportChemicalModal] = useState<boolean>(false);
	const [isDeleteExportChemicalModal, setIsDeleteExportChemicalModal] = useState<boolean>(false);
	const [isCreateExportDeviceModal, setIsCreateExportDeviceModal] = useState<boolean>(false);
	const [isEditExportDeviceModal, setIsEditExportDeviceModal] = useState<boolean>(false);
	const [isCreateModal, setIsCreateModal] = useState<boolean>(false);
	const [isDeleteExportDeviceModal, setIsDeleteExportDeviceModal] = useState<boolean>(false);
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
		let formatedData = warehouseDepartment?.map((x: IExportType) => {
			let employeeInfoIdx = Array.isArray(employeeData)
				? employeeData.findIndex(y => y.EmployeeID === x.EmployeeId)
				: -1;
			let departmentInfoIdx = Array.isArray(departmentData)
				? departmentData.findIndex(y => y.DepartmentId === x.DepartmentId)
				: -1;
			let userAcceptInfoIdx = Array.isArray(employeeData)
				? employeeData.findIndex(y => y.EmployeeID === x.UserAccept)
				: -1;
			return {
				...x,
				EmployeeName: employeeInfoIdx > -1 ? employeeData[employeeInfoIdx].Fullname : '',
				formatedExportDate: moment.unix(x.ExportDate).format('DD/MM/YYYY'),
				DepartmentName: departmentInfoIdx > -1 ? departmentData[departmentInfoIdx].DepartmentName : '',
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
				accessorKey: 'formatedExportDate',
				header: 'Thời gian xuất',
				Header: ({ column }) => <span style={{ whiteSpace: 'pre-wrap' }}>{column.columnDef.header}</span>,
				size: 160,
			},
			{
				accessorKey: 'Content',
				header: 'Nội dung',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
			},
			{
				accessorKey: 'EmployeeId',
				header: 'Người xuất',
			},
			{
				accessorKey: 'EmployeeName',
				header: 'Người xuất',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
				enableHiding: false,
			},
			{
				accessorKey: 'DepartmentName',
				header: 'Phòng',
				size: 180,
				enableHiding: false,
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
				},
			},
			{
				accessorKey: 'Accept',
				header: 'Chấp nhận',
			},
			{
				accessorKey: 'UserAcceptName',
				header: 'Người chấp nhận',
				enableHiding: false,
				Header: ({ column }) => <span style={{ whiteSpace: 'pre-wrap' }}>{column.columnDef.header}</span>,
			},
			{
				accessorKey: 'UserAccept',
				header: 'Người chấp nhận',
				size: 180,
			},
			{
				accessorKey: 'DepartmentId',
				header: 'Phòng ban',
			},
			{
				accessorKey: 'Note',
				header: 'Ghi chú',
				Cell: ({ cell, row, column }) => {
					return <span style={{ whiteSpace: 'pre-wrap' }}>{cell.getValue<String>()}</span>;
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
				accessorKey: 'ExpChemDeptId',
				header: 'Mã xuất hoá chất',
				size: 140,
			},
			{
				accessorKey: 'ChemicalName',
				header: 'Mã hóa chất',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'AmountOriginal',
				header: 'Tên hóa chất',
				size: 140,
			},
			{
				accessorKey: 'Unit',
				header: 'Số lượng',
				size: 140,
			},
			{
				accessorKey: 'ChemDetailId',
				header: 'Nhà sản xuât',
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
				accessorKey: 'ExpDeviceDeptId',
				header: 'Mã Thiết bị',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'DeviceName',
				header: 'Tên thiết bị',
				size: 140,
			},
			{
				accessorKey: 'QuantityOriginal',
				header: 'Số lượng',
				size: 140,
			},
			{
				accessorKey: 'Unit',
				header: 'Xuất xứ',
				size: 140,
			},
			{
				accessorKey: 'DeviceDetailId',
				header: 'Nhà sản xuât',
				enableEditing: false,
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columnsChemicalTable = useRef<ColumnType[]>([
		{
			id: 'ExpChemDeptId',
			header: 'Mã xuất hoá chất',
		},
		{
			id: 'ChemDetailId',
			header: 'Mã hoá chất',
		},
		{
			id: 'ChemicalName',
			header: 'Tên hoá chất',
		},
		{
			id: 'AmountOriginal',
			header: 'Số lượng',
			renderValue: (amount, unit) => `${amount} (${unit})`,
		},
	]);

	const columnsDeviceTable = useRef<ColumnType[]>([
		{
			id: 'ExpDeviceDeptId',
			header: 'Mã xuất thiết bị',
		},
		{
			id: 'DeviceDetailId',
			header: 'Mã thiết bị',
		},
		{
			id: 'DeviceName',
			header: 'Tên thiết bị',
		},
		{
			id: 'QuantityOriginal',
			header: 'Số lượng',
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
			ExportDate: updatedRow.ExportDate.toString(),
			Content: updatedRow.Content,
			Note: updatedRow.Note,
			EmployeeId: updatedRow.EmployeeId,
			DepartmentId: updatedRow.DepartmentId,
			Accept: updatedRow.Accept,
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
				dispatch(setSnackbarMessage('Xóa thông tin thành công'));
				let deletedIdx = warehouseDepartment.findIndex(x => x.ExportId === deletedRow.ExportId);
				let newListOfDeps = [
					...warehouseDepartment.slice(0, deletedIdx),
					...warehouseDepartment.slice(deletedIdx + 1),
				];
				dispatch(setListOfWarehouseDepartment(newListOfDeps));
			} else {
				dispatch(setSnackbarMessage('Xóa thông tin không thành công'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('Xóa thông tin không thành công'));
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
				DepartmentId: createdRow.DepartmentId,
				Accept: createdRow.Accept,
				UserAccept: createdRow.UserAccept,
				listChemicalExport: createdRow.listChemicalExport,
				listDeviceExport: createdRow.listDeviceExport,
			};
			setCreatedRow(createData);
			setIsCreateExportChemicalModal(true);
		} catch (error) {
			dispatch(setSnackbarMessage('Tạo thông tin mới không thành công'));
		}
	};

	const handleSumbitCreateExportChemical = async (listChemical: any, row: any) => {
		const listChemicalExportUpdate = listChemical.map((chemical: any) => ({
			ExpChemDeptId: chemical.ExpChemDeptId,
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
			ExpDeviceDeptId: device.ExpDeviceDeptId,
			DeviceDetailId: device.DeviceDetailId,
			DeviceName: device.DeviceName,
			QuantityOriginal: device.Amount,
			Unit: device.Unit,
		}));

		const createData: IExportType = {
			...createdRow,
			listDeviceExport: listDeviceExportUpdate,
		};

		const isExist:boolean = warehouseDepartment.findIndex(x => x.ExportId === createData.ExportId) > -1;
		if (isExist) {
			const resData = await updateExport(createData);

			if (Object.keys(resData).length !== 0) {
				dispatch(setSnackbarMessage('Cập nhật thông tin thành công'));
				let updatedIdx = warehouseDepartment.findIndex(x => x.ExportId === createData.ExportId);
				let newListOfDep = [
					...warehouseDepartment.slice(0, updatedIdx),
					createData,
					...warehouseDepartment.slice(updatedIdx + 1),
				];
				dispatch(setListOfWarehouseDepartment(newListOfDep));
			} else {
				dispatch(setSnackbarMessage('Cập nhật thông tin không thành công'));
			}
		} else {
			const resData = await postExport(createData);
			if (Object.keys(resData).length !== 0) {
				const newListOfDeps: IExportType = await getExportById(createData?.ExportId || '');
				if (newListOfDeps) {
					dispatch(setSnackbarMessage('Tạo thông tin mới thành công'));
					dispatch(setListOfWarehouseDepartment([...warehouseDepartment, newListOfDeps]));
				}
			} else {
				dispatch(setSnackbarMessage('Tạo thông tin mới không thành công'));
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
						header: 'Các hành động',
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
				enableColumnOrdering
				enableEditing
				enableRowNumbers
				enablePinning
				enableGrouping
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
								handleOpenCreate={() => {
									setCreatedRow(row.original);
									setIsCreateExportChemicalModal(true);
								}}
								handleOpenDelete={(exportChemical: any) => {
									setDeletedRow(exportChemical);
									setIsDeleteExportChemicalModal(true);
								}}
								handleOpenEdit={(exportChemical: any) => {
									setUpdatedRow(exportChemical);
									setIsEditExportChemicalModal(true);
								}}
								row={row}
								columns={columnsChemicalTable.current}
								type="DEP"
							/>
							<DeviceTable
								warehouseData={warehouseDepartment}
								handleOpenCreate={() => {
									setCreatedRow(row.original);
									setIsCreateExportDeviceModal(true);
								}}
								handleOpenDelete={(exportDevice: any) => {
									setUpdatedRow(exportDevice);
									setIsEditExportDeviceModal(true);
								}}
								handleOpenEdit={(exportDevice: any) => {
									setDeletedRow(exportDevice);
									setIsDeleteExportDeviceModal(true);
								}}
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
						<span>Quản lý phiếu xuất phòng thí nghiệm</span>
					</h3>
				)}
				renderRowActions={({ row, table }) => (
					<>
						{row.original.Accept !== 'Accepted' && (
							<>
								<Tooltip arrow placement="left" title="Sửa thông tin phiếu xuất phòng thí nghiệm">
									<IconButton onClick={() => handleOpenEditWarehouseDepModal(row)}>
										<Edit />
									</IconButton>
								</Tooltip>
								<Tooltip arrow placement="right" title="Xoá phiếu xuất phòng thí nghiệm">
									<IconButton color="error" onClick={() => handleOpenDeleteWarehouseDepModal(row)}>
										<Delete />
									</IconButton>
								</Tooltip>
							</>
						)}
					</>
				)}
				renderBottomToolbarCustomActions={() => (
					<Tooltip title="Tạo phiếu xuất phòng thí nghiệm mới" placement="right-start">
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
					title="Xoá thông tin phiếu xuất phòng thí nghiệm"
					handleSubmit={handleSubmitDeleteWarehouseDepModal}
				>
					Bạn có chắc muốn xoá thông tin{' '}
					<Typography component="span" color="red">
						{deletedRow.ExportId} - {deletedRow.Content} - {deletedRow.EmployeeName}
					</Typography>{' '}
					không?
				</DeleteExportModal>
			)}

			{isCreateModal && (
				<CreateExportModal
					onClose={onCloseCreateWarehouseDepModal}
					columns={columns}
					isCreateModal={isCreateModal}
					handleSubmitCreateModal={handleSubmitCreateWarehouseDepModal}
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
				type='DEP'
					initData={createdRow}
					isOpen={isCreateExportChemicalModal}
					columns={columnsExportChemicalModal}
					onClose={() => setIsCreateExportChemicalModal(false)}
					handleSubmit={handleSumbitCreateExportChemical}
				/>
			)}

			{isCreateExportDeviceModal && (
				<CreateExportDeviceModal
				type='DEP'
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
