import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Autocomplete, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import MaterialReactTable, { MRT_Cell, MRT_ColumnDef } from 'material-react-table';
import moment from 'moment';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { setSnackbarMessage } from '../../../../pages/appSlice';
import {
	deleteExportLabs,
	getExportsLabById,
	getExportsLabs,
	postExportLabs,
	updateExportLabs
} from '../../../../services/exportsServices';
import { RootState } from '../../../../store';
import { IExportDeviceType } from '../../../../types/exportDeviceType';
import { dummyExportData, IExportType } from '../../../../types/exportType';
import DeviceTable, { ColumnType } from '../../Details/DeviceTable';
import InstrumentTable from '../../Details/Instrument';
import CreateExportDeviceModal from '../../Modal/CreateExportDeviceModal';
import CreateExportModal from '../../Modal/CreateExportModal';
import DeleteExportModal from '../../Modal/DeleteExportModal';
import EditExportModal from '../../Modal/EditExportModal';
import { setListOfWarehouseLaboratory } from '../../warehouseSlice';

const LaboratoryTabItem: FC = () => {
	const warehouseLaboratoriesData = useAppSelector((state: RootState) => state.warehouse.listOfWarehouseLaboratory);
	const laboratoriesData = useAppSelector((state: RootState) => state.laboratory.listOfLaboratories);
	const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);
	const dispatch = useAppDispatch();

	const [isCreateExportInstrumentModal, setIsCreateExportInstrumentModal] = useState<boolean>(false);
	const [isCreateExportDeviceModal, setIsCreateExportDeviceModal] = useState<boolean>(false);
	const [isCreateModal, setIsCreateModal] = useState<boolean>(false);
	const [isEditModal, setIsEditModal] = useState<boolean>(false);
	const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
	const [tableData, setTableData] = useState<IExportType[]>([]);
	const [validationErrors, setValidationErrors] = useState<{
		[cellId: string]: string;
	}>({});
	const [departmentActive, setDepartmentActive] = useState<Number>(2);

	const [createdRow, setCreatedRow] = useState<any>(dummyExportData);
	const [updatedRow, setUpdatedRow] = useState<any>(dummyExportData);
	const [deletedRow, setDeletedRow] = useState<any>(dummyExportData);

	useEffect(() => {
		const getWarehouseLaboratoryData = async () => {
			try {
				const listOfExport: IExportType[] = await getExportsLabs(departmentActive);
				if (listOfExport) {
					dispatch(setListOfWarehouseLaboratory(listOfExport));
				}
			} catch (error) {
				dispatch(setListOfWarehouseLaboratory([]));
			}
		};
		getWarehouseLaboratoryData();
	}, [departmentActive]);

	useEffect(() => {
		let formatedData = warehouseLaboratoriesData?.map((x: IExportType) => {
			let laboratoryInfoIdx = Array.isArray(laboratoriesData)
				? laboratoriesData.findIndex(y => y.LabId === x.LabId)
				: -1;
			return {
				...x,
				LabName: laboratoryInfoIdx > -1 ? laboratoriesData[laboratoryInfoIdx].LabName : '',
				formatedExportDate: moment.unix(x.ExportDate).format('DD/MM/YYYY'),
			};
		});
		formatedData.sort((x, y) => y.ExportDate - x.ExportDate);
		setTableData(formatedData || []);
	}, [warehouseLaboratoriesData]);

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
				accessorKey: 'ExportLabId',
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
				accessorKey: 'EmployeeId',
				header: 'Ng?????i xu???t',
				size: 140,
			},
			{
				accessorKey: 'EmployeeName',
				header: 'Ng?????i xu???t',
				size: 140,
				enableHiding: false,
			},
			{
				accessorKey: 'LabName',
				header: 'Ph??ng',
				size: 140,
				enableHiding: false,
			},
			{
				accessorKey: 'LabId',
				header: 'Ph??ng',
				size: 140,
			},
			{
				accessorKey: 'DepartmentName',
				header: 'Khoa',
				size: 140,
				enableHiding: false,
			},
			{
				accessorKey: 'DepartmentId',
				enableEditing: false,
				header: 'Khoa',
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columnsExportDevice = useMemo<MRT_ColumnDef<IExportDeviceType>[]>(
		() => [
			{
				accessorKey: 'ExportLabId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'DeviceInfoId',
				header: 'M?? xu???t Thi???t b???',
				size: 100,
			},
			{
				accessorKey: 'DeviceName',
				header: 'M?? Thi???t b???',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'SerialNumber',
				header: 'T??n thi???t b???',
				size: 140,
			},
			{
				accessorKey: 'Quantity',
				header: 'S??? l?????ng',
				size: 140,
			},
			{
				accessorKey: 'ManufacturingDate',
				header: 'Xu???t x???',
				size: 140,
			},
			{
				accessorKey: 'StartGuarantee',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'EndGuarantee',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'YearStartUsage',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'HoursUsage',
				header: 'M???u',
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columnsExportInstrument = useMemo<MRT_ColumnDef<IExportDeviceType>[]>(
		() => [
			{
				accessorKey: 'ExportLabId',
				header: 'ID',
				size: 100,
				enableColumnOrdering: true,
				enableEditing: false,
				enableSorting: false,
			},
			{
				accessorKey: 'DeviceInfoId',
				header: 'M?? xu???t Thi???t b???',
				size: 100,
			},
			{
				accessorKey: 'DeviceName',
				header: 'M?? Thi???t b???',
				enableEditing: false,
				size: 140,
			},
			{
				accessorKey: 'SerialNumber',
				header: 'T??n thi???t b???',
				size: 140,
			},
			{
				accessorKey: 'Quantity',
				header: 'S??? l?????ng',
				size: 140,
			},
			{
				accessorKey: 'ManufacturingDate',
				header: 'Xu???t x???',
				size: 140,
			},
			{
				accessorKey: 'StartGuarantee',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'EndGuarantee',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'YearStartUsage',
				header: 'M???u',
				size: 140,
			},
			{
				accessorKey: 'HoursUsage',
				header: 'M???u',
				size: 140,
			},
		],
		[getCommonEditTextFieldProps],
	);

	const columsDeviceTable = useRef([
		{ id: 'DeviceDeptId', header: 'ID' },
		{ id: 'DeviceName', header: 'T??n thi???t b???' },
		{ id: 'SerialNumber', header: 'S??? Serial' },
		{ id: 'Unit', header: '????n v???' },
		{ id: 'ManufacturingDate', header: 'Ng??y s???n xu???t', type: 'date' },
		{ id: 'StartGuarantee', header: 'B???t ?????u b???o h??nh', type: 'date' },
		{ id: 'EndGuarantee', header: 'K???t th??c b???o h??nh', type: 'date' },
		{ id: 'YearStartUsage', header: 'N??m b???t ?????u s??? d???ng' },
		{ id: 'HoursUsage', header: 'Gi??? s??? d???ng' },
	]);

	const columnsInstrumentTable = useRef<ColumnType[]>([
		{
			id: 'DeviceDeptId',
			header: 'M?? xu???t thi???t b???',
		},
		{
			id: 'DeviceName',
			header: 'T??n thi???t b???',
		},
		{
			id: 'Quantity',
			header: 'S??? l?????ng',
			renderValue: (amount, unit) => `${amount} (${unit})`,
		},
	]);

	const handleOpenEditWarehouseLabModal = (row: any) => {
		setUpdatedRow(row.original);
		setIsEditModal(true);
	};

	const onCloseEditWarehouseLab = () => {
		setUpdatedRow(dummyExportData);
		setIsEditModal(false);
	};

	const handleOpenDeleteWarehouseLabModal = (row: any) => {
		setDeletedRow(row.original);
		setIsDeleteModal(true);
	};

	const onCloseDeleteWarehouseLabModal = () => {
		setDeletedRow(dummyExportData);
		setIsDeleteModal(false);
	};

	const handleOpenCreateWarehouseLabModal = (row: any) => {
		setIsCreateModal(true);
	};

	const onCloseCreateWarehouseLabModal = () => {
		setIsCreateModal(false);
	};

	const handleSubmitDeleteWarehouseLabModal = async () => {
		try {
			const data = await deleteExportLabs(deletedRow.ExportLabId);
			if (data) {
				dispatch(setSnackbarMessage('X??a th??ng tin th??nh c??ng'));
				let deletedIdx = warehouseLaboratoriesData.findIndex(x => x.ExportLabId === deletedRow.ExportLabId);
				let newListOfLabs = [
					...warehouseLaboratoriesData.slice(0, deletedIdx),
					...warehouseLaboratoriesData.slice(deletedIdx + 1),
				];
				dispatch(setListOfWarehouseLaboratory(newListOfLabs));
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitEditWarehouseLabModal = async (updatedRow: any) => {
		try {
			const updateData = {
				ExportLabId: updatedRow.ExportLabId,
				ExportDate: Number(updatedRow.ExportDate),
				Content: updatedRow.Content,
				EmployeeId: updatedRow.EmployeeId,
				DepartmentId: updatedRow.DepartmentId,
				LabId: updatedRow.LabId,
				listDevice: updatedRow.listDevice,
				listInstrument: updatedRow.listInstrument,
			};

			setCreatedRow(updateData);
			setIsCreateExportDeviceModal(true);
		} catch (error) {
			dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitCreateWarehouseLabModal = async (createdRow: any) => {
		try {
			const createData = {
				ExportLabId: createdRow.ExportLabId,
				ExportDate: Number(createdRow.ExportDate),
				Content: createdRow.Content,
				EmployeeId: createdRow.EmployeeId,
				DepartmentId: createdRow.DepartmentId,
				LabId: createdRow.LabId,
				listDevice: createdRow.listDevice,
				listInstrument: createdRow.listInstrument,
			};

			setCreatedRow(createData);
			setIsCreateExportDeviceModal(true);
		} catch (error) {
			dispatch(setSnackbarMessage('T???o th??ng tin m???i kh??ng th??nh c??ng'));
		}
	};

	const handleSubmitCreateDeviceModal = (listDevice: any, row: any) => {
		const listDeviceExportUpdate = listDevice?.map((device: any) => ({
			DeviceDeptId: device.DeviceDeptId,
			DeviceName: device.DeviceName,
			Unit: device.Unit,
			SerialNumber: device.SerialNumber,
			ManufacturingDate: device.ManufacturingDate,
			StartGuarantee: device.StartGuarantee,
			EndGuarantee: device.EndGuarantee,
			YearStartUsage: device.YearStartUsage,
			HoursUsage: device.HoursUsage,
		}));

		const createData: IExportType = {
			...createdRow,
			listDevice: listDeviceExportUpdate,
		};
		setCreatedRow(createData);
		setIsCreateExportDeviceModal(false);
		setIsCreateExportInstrumentModal(true);
	};

	const handleSubmitCreateInstrumentModal = async (listDevice: any, row: any) => {
		const listDeviceExportUpdate = listDevice?.map((device: any) => ({
			DeviceDeptId: device.DeviceDeptId,
			DeviceName: device.DeviceName,
			Unit: device.Unit,
			Quantity: device.Amount || device.Quantity,
		}));

		const createData: IExportType = {
			...createdRow,
			listInstrument: listDeviceExportUpdate,
		};

		const isExist: boolean =
			warehouseLaboratoriesData.findIndex(x => x.ExportLabId === createData.ExportLabId) > -1;
		if (isExist) {
			const resData = await updateExportLabs(createData, departmentActive);

			if (Object.keys(resData).length !== 0) {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin th??nh c??ng'));
				let updatedIdx = warehouseLaboratoriesData.findIndex(x => x.ExportLabId === createData.ExportLabId);
				let newListOfLab = [
					...warehouseLaboratoriesData.slice(0, updatedIdx),
					createData,
					...warehouseLaboratoriesData.slice(updatedIdx + 1),
				];
				dispatch(setListOfWarehouseLaboratory([...newListOfLab]));
			} else {
				dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
			}
		} else {
			const resData = await postExportLabs(createData, departmentActive);
			if (Object.keys(resData).length !== 0) {
				const newListOfLabs: IExportType = await getExportsLabById(
					createData?.ExportLabId || '',
					departmentActive,
				);
				if (newListOfLabs) {
					dispatch(setSnackbarMessage('T???o th??ng tin m???i th??nh c??ng'));
					dispatch(setListOfWarehouseLaboratory([...warehouseLaboratoriesData, newListOfLabs]));
				}
			} else {
				dispatch(setSnackbarMessage('T???o th??ng tin m???i kh??ng th??nh c??ng'));
			}
		}

		setCreatedRow(dummyExportData)
		setIsCreateModal(false);
		setIsCreateExportDeviceModal(false);
		setIsCreateExportInstrumentModal(false);
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
				enableGrouping={false}
				enableRowNumbers
				enablePinning
				enableRowActions
				enableExpanding
				muiTableDetailPanelProps={{
					sx: { background: '#f3f3f3' },
				}}
				initialState={{
					density: 'compact',
					columnVisibility: { LabId: false, EmployeeId: false, DepartmentId: false },
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
							<DeviceTable
								warehouseData={warehouseLaboratoriesData}
								columns={columsDeviceTable.current}
								type="LAB"
								row={row}
							/>
							<InstrumentTable
								warehouseData={warehouseLaboratoriesData}
								columns={columnsInstrumentTable.current}
								type="LAB"
								row={row}
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
						<Tooltip arrow placement="left" title="S???a th??ng tin phi???u xu???t ph??ng th?? nghi???m">
							<IconButton onClick={() => handleOpenEditWarehouseLabModal(row)}>
								<Edit />
							</IconButton>
						</Tooltip>
						<Tooltip arrow placement="right" title="Xo?? phi???u xu???t ph??ng th?? nghi???m">
							<IconButton color="error" onClick={() => handleOpenDeleteWarehouseLabModal(row)}>
								<Delete />
							</IconButton>
						</Tooltip>
					</>
				)}
				renderBottomToolbarCustomActions={() => (
					<Tooltip title="T???o phi???u xu???t ph??ng th?? nghi???m m???i" placement="right-start">
						<Button
							color="primary"
							onClick={handleOpenCreateWarehouseLabModal}
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
					onClose={onCloseDeleteWarehouseLabModal}
					title="Xo?? th??ng tin phi???u xu???t ph??ng th?? nghi???m"
					handleSubmit={handleSubmitDeleteWarehouseLabModal}
				>
					B???n c?? ch???c mu???n xo?? th??ng tin{' '}
					<Typography component="span" color="red">
						{deletedRow.ExportLabId} - {deletedRow.Content} - {deletedRow.EmployeeName}
					</Typography>{' '}
					kh??ng?
				</DeleteExportModal>
			)}

			{isCreateModal && (
				<CreateExportModal
					onClose={onCloseCreateWarehouseLabModal}
					columns={columns}
					isCreateModal={isCreateModal}
					handleSubmitCreateModal={handleSubmitCreateWarehouseLabModal}
					initData={{ ...createdRow, DepartmentId: departmentActive }}
				/>
			)}

			{isEditModal && (
				<EditExportModal
					initData={{ ...updatedRow, DepartmentId: departmentActive }}
					isEditModal={isEditModal}
					columns={columns}
					onClose={onCloseEditWarehouseLab}
					handleSubmitEditModal={handleSubmitEditWarehouseLabModal}
				/>
			)}

			{isCreateExportDeviceModal && (
				<CreateExportDeviceModal
					type="LAB_DEV"
					handleSubmit={handleSubmitCreateDeviceModal}
					initData={createdRow}
					isOpen={isCreateExportDeviceModal}
					columns={columnsExportDevice}
					onClose={() => setIsCreateExportDeviceModal(false)}
				/>
			)}

			{isCreateExportInstrumentModal && (
				<CreateExportDeviceModal
					type="LAB_INS"
					handleSubmit={handleSubmitCreateInstrumentModal}
					initData={createdRow}
					isOpen={isCreateExportInstrumentModal}
					columns={columnsExportDevice}
					onClose={() => setIsCreateExportInstrumentModal(false)}
				/>
			)}
		</>
	);
};

export default LaboratoryTabItem;
