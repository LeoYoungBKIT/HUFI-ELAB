import styled from '@emotion/styled';
import {
	Button,
	CircularProgress,
	Collapse,
	debounce,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Paper,
	Radio,
	RadioGroup,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography
} from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EngineeringIcon from '@mui/icons-material/Engineering';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import moment from 'moment';
import { setSnackbarMessage } from '../../pages/appSlice';
import { getDeviceHitories } from '../../services/deviceHistoryServices';
import { deleteDevice } from '../../services/deviveDepartmentServices';
import { getInstrumentHitories } from '../../services/instrumentHistoryServices';
import { getMaintenanceDeviceById } from '../../services/maintenanceDevicesServices';
import { IDeviceDepartmentType } from '../../types/deviceDepartmentType';
import { IDeviceHistory } from '../../types/deviceHistoriesType';
import { IExportDeviceType } from '../../types/exportDeviceType';
import { IInstrumentHistory } from '../../types/instrumentHistoriesType';
import { IRepairDevice } from '../../types/maintenanceDevicesType';
import {
	ProviderValueType, useDeviceOfDepartmentTableStore
} from './context/DeviceOfDepartmentTableContext';
import { DeviceColumnType } from './DeviceOfExperimentCenterTable';
import {
	DialogCreate,
	DialogDelete,
	DialogDeviceUsageHours,
	DialogHistoryDevices,
	DialogMaintenanceDevice
} from './Dialog';

const listDeviceType = ['Thi???t b???', 'C??ng c???', 'D???ng c???'];

const StyledTableCell = styled(TableCell)(theme => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: 'lightgray',
	},
}));

const FormControlStyled = styled(FormControl)(theme => ({
	'@media (max-width: 600px)': {
		width: '100%',
	},
}));

const BoxTextFieldStyled = styled(Box)(theme => ({
	'@media (max-width: 600px)': {
		width: '100%',
		margin: '8px 0',
	},

	'@media (max-width: 900px)': {
		margin: '8px 0',
	},
}));

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function renderArrowSort(order: string, orderBy: string, property: string) {
	if (orderBy === property) {
		return order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
	}
	return null;
}

export function removeAccents(str: string) {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/??/g, 'd')
		.replace(/??/g, 'D');
}

const isObject = (val: any) => {
	if (val === null) {
		return false;
	}

	return typeof val === 'object';
};

const nestedObject = (obj: any, string: String) => {
	for (const key in obj) {
		if (isObject(obj[key])) {
			string += `${nestedObject(obj[key], string)}`;
		} else {
			switch (key) {
				case 'ExportDate':
				case 'ManufacturingDate':
				case 'StartGuarantee':
				case 'EndGuarantee':
				case 'DateTranferTo':
				case 'DateStartUsage':
				case 'ImportDate':
					string += `${moment.unix(Number(obj[key])).format('DD/MM/YYYY')} `;
					break;
				default:
					string += `${obj[key]} `;
					break;
			}
		}
	}
	return string;
};

const DeviceOfDepartmentTable = () => {
	const warehouseLaboratoriesData = useAppSelector((state: RootState) => state.warehouse.listOfWarehouseLaboratory);
	const dispatch = useAppDispatch();
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceId');
	const [keyword, setKeyword] = useState<string>('');
	const [dataSearch, setDataSearch] = useState<any>([]);
	const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);
	const [isOpenDeviceUsageHours, setIsOpenDeviceUsageHours] = useState<boolean>(false);
	const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [open, setOpen] = useState<number>(-1);
	const [updatedRow, setUpdatedRow] = useState<any>();
	const [deletedRow, setDeletedRow] = useState<IDeviceDepartmentType>();
	const {
		devices,
		setDeviceValues,
		loading,
		setLoadingValues,
		deviceType,
		setDeviceTypeValues,
		deviceData,
		setDeviceDataValues,
		cloneDevices,
		setCloneDeviceValues,
		getDeviceData,
	}: ProviderValueType = useDeviceOfDepartmentTableStore();

	useEffect(() => {
		getDeviceData();
		setKeyword('');
	}, [deviceType]);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	useEffect(() => {
		const sortDevices = (prev: IDeviceDepartmentType[]) => {
			let data = [...prev];
			data?.sort((a: IDeviceDepartmentType, b: IDeviceDepartmentType) => {
				let i =
					order === 'desc'
						? descendingComparator<any>(a, b, orderBy)
						: -descendingComparator<any>(a, b, orderBy);
				return i;
			});
			return data || [];
		};
		setDeviceValues(sortDevices(devices));
	}, [order, orderBy]);

	useEffect(() => {
		const data = devices.map((device: any) => {
			let string: String = '';

			string = nestedObject(device, string);

			return {
				label: removeAccents(string.toUpperCase()),
				id: device.DeviceDetailId,
			};
		});
		setDataSearch(data);
	}, [devices]);

	useEffect(() => {
		const listId = dataSearch.filter((x: any) => x?.label?.includes(keyword)).map((y: any) => y.id);

		if (keyword === '') {
			setDeviceValues(cloneDevices || []);
		} else {
			const data = devices.filter((x: any) => listId.indexOf(x?.DeviceDetailId) !== -1);
			setDeviceValues(data || []);
		}
	}, [keyword]);

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleOpenCreate = () => {
		setIsOpenCreateModal(true);
	};

	const handleOpenEdit = () => {
		setIsOpenEditModal(true);
	};

	const handleDeviceUsageHours = () => {
		setIsOpenDeviceUsageHours(true);
	};

	const handleOpenDelete = (dataDelete: IDeviceDepartmentType) => {
		setIsOpenDeleteModal(true);
		setDeletedRow(dataDelete);
	};

	const handleSubmitDelete = async (DeviceId: String) => {
		try {
			const data = await deleteDevice(DeviceId);

			if (data) {
				dispatch(setSnackbarMessage('X??a th??ng tin th??nh c??ng'));
				const newData = deviceData[deviceType]?.filter((device: any) => DeviceId !== device?.DeviceId);
				setDeviceDataValues({
					...deviceData,
					[deviceType]: newData,
				});
				setDeviceValues(newData || []);
				setCloneDeviceValues(newData || []);
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		} finally {
			setIsOpenDeleteModal(true);
		}
	};

	const columns = useRef<DeviceColumnType[]>([
		{ id: 'DeviceDetailId', header: 'M?? chi ti???t TB' },
		{ id: 'DeviceId', header: 'M?? thi???t b???' },
		{ id: 'DeviceName', header: 'T??n thi???t b???' },
		{ id: 'Model', header: 'S??? Model' },
		{ id: 'ImportDate', header: 'Ng??y nh???p', type: 'date' },
		{ id: 'Standard', header: 'Qui c??ch' },
		{ id: 'HasTrain', header: '???? t???p hu???n', renderValue: value => (value === 1 ? 'C??' : 'Kh??ng') },
		{
			id: 'QuantityOriginal',
			header: 'SL ban ?????u',
			renderValue: (qty: any, unit: any) => `${qty === null ? 0 : qty} (${unit})`,
		},
		{
			id: 'QuantityExport',
			header: 'SL xu???t',
			renderValue: (qty: any, unit: any) => `${qty === null ? 0 : qty} (${unit})`,
		},
		{
			id: 'QuantityRemain',
			header: 'SL kho',
			renderValue: (qty: any, unit: any) => `${qty === null ? 0 : qty} (${unit})`,
		},
		{
			id: 'QuantityTotal',
			header: 'SL t???n',
			renderValue: (qty: any, unit: any) => `${qty === null ? 0 : qty} (${unit})`,
		},
		{
			id: 'QuantityLiquidate',
			header: 'SL thanh l??',
			renderValue: (qty: any, unit: any) => `${qty === null ? 0 : qty} (${unit})`,
		},
	]);

	return (
		<>
			<Box component="div" justifyContent="space-between" display="flex" flexWrap="wrap" mx={2} mb={2}>
				<Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
					B???ng {deviceType}
				</Typography>
				<Box display="flex" alignItems="end" flexWrap="wrap" justifyContent="flex-end">
					<Box display="flex" alignItems="end" flexWrap="wrap" justifyContent="flex-end">
						<FormControlStyled>
							<RadioGroup
								aria-labelledby="radio-buttons-group-label"
								defaultValue={listDeviceType[0]}
								name="radio-buttons-group"
								sx={{ display: 'flex', flexDirection: 'row' }}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setDeviceTypeValues((event.target as HTMLInputElement).value);
								}}
							>
								{listDeviceType.map((type: string) => (
									<FormControlLabel
										value={type}
										control={<Radio />}
										label={type}
										key={type}
										checked={type === deviceType}
									/>
								))}
							</RadioGroup>
						</FormControlStyled>
						<BoxTextFieldStyled>
							<TextField
								id="filled-search"
								type="search"
								variant="standard"
								placeholder="T??m ki???m..."
								fullWidth
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
								onChange={debounce(e => setKeyword(removeAccents(e.target.value.toUpperCase())), 300)}
							/>
						</BoxTextFieldStyled>
						<Box>
							<Tooltip arrow placement="left" title="T???o m???i">
								<Button variant="contained" onClick={handleOpenCreate} sx={{ marginLeft: '24px' }}>
									T???o m???i
								</Button>
							</Tooltip>
							<Tooltip arrow placement="left" title="Nh???p gi??? thi???t b???">
								<Button
									variant="contained"
									onClick={handleDeviceUsageHours}
									sx={{ marginLeft: '24px' }}
								>
									Nh???p gi??? thi???t b???
								</Button>
							</Tooltip>
						</Box>
					</Box>
					<TablePagination
						sx={{ width: '100%' }}
						rowsPerPageOptions={[10, 20, 40, 100]}
						component="div"
						count={devices?.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</Box>
			</Box>
			<TableContainer component={Paper} sx={{ marginBottom: '24px', overflow: 'overlay' }}>
				<Table sx={{ minWidth: 900 }} stickyHeader size="small">
					<TableHead>
						<TableRow>
							<StyledTableCell align="left"></StyledTableCell>
							<StyledTableCell align="left">
								<b>#</b>
							</StyledTableCell>
							{columns.current.map(col => {
								if (col.id === 'Model' && deviceType !== listDeviceType[0]) return;
								return (
									<StyledTableCell
										align="left"
										key={col.id}
										onClick={() => handleRequestSort(col.id)}
									>
										<b>{col.header}</b>
										{renderArrowSort(order, orderBy, col.id)}
									</StyledTableCell>
								);
							})}
							{deviceType !== listDeviceType[0] && <StyledTableCell></StyledTableCell>}
						</TableRow>
					</TableHead>
					<TableBody>
						{!loading &&
							devices
								?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								?.map((exportDevice: IDeviceDepartmentType, index: number) => (
									<RowDevice
										deviceType={deviceType}
										device={exportDevice}
										index={index}
										key={index}
										columns={columns.current}
										handleOpenDelete={handleOpenDelete}
										handleOpenEdit={handleOpenEdit}
										handleOpen={(index: number) => setOpen(open === index ? -1 : index)}
										openIndex={open}
									/>
								))}
						{loading && (
							<TableRow>
								<TableCell colSpan={10} sx={{ textAlign: 'center' }}>
									<CircularProgress disableShrink />
								</TableCell>
							</TableRow>
						)}
						{!loading && devices?.length === 0 && (
							<TableRow>
								<TableCell colSpan={11} sx={{ textAlign: 'center' }}>
									<Typography variant="h5" gutterBottom align="center" component="div">
										Tr???ng
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<DialogCreate isOpen={isOpenCreateModal} onClose={() => setIsOpenCreateModal(false)} />
			<DialogDelete
				isOpen={isOpenDeleteModal}
				onClose={() => setIsOpenDeleteModal(false)}
				dataDelete={deletedRow}
				handleSubmitDelete={handleSubmitDelete}
			/>

			<DialogDeviceUsageHours isOpen={isOpenDeviceUsageHours} onClose={() => setIsOpenDeviceUsageHours(false)} />
			
		</>
	);
};

type RowDeviceProps = {
	handleOpenEdit: (exportDevice: any) => void;
	handleOpenDelete: (exportDevice: any) => void;
	device: IDeviceDepartmentType;
	index: number;
	openIndex: number;
	handleOpen: (index: number) => void;
	deviceType: string;
	columns: DeviceColumnType[];
};

const RowDevice = ({
	index,
	device,
	columns,
	handleOpenEdit,
	handleOpenDelete,
	handleOpen,
	openIndex,
	deviceType,
}: RowDeviceProps) => {
	const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
	const [serialNumber, setSerialNumber] = useState<String>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [deviceHitories, setDeviceHistories] = useState<IInstrumentHistory | null>(null);
	const handleOpenHistoryDialog = (serialNumber: String) => {
		setIsOpenHistory(true);
		setSerialNumber(serialNumber);
	};

	const getHistoryInstrument = async () => {
		setLoading(true);
		try {
			let deviceHitories: IInstrumentHistory = await getInstrumentHitories(serialNumber);
			setDeviceHistories(deviceHitories);
		} catch (error) {
			setDeviceHistories(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (serialNumber !== '' && deviceType !== listDeviceType[0]) getHistoryInstrument();
	}, [serialNumber]);

	const handleCloseHistoryDialog = () => {
		setSerialNumber('');
		setIsOpenHistory(false);
	};

	return (
		<>
			<TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > *': { borderBottom: 'unset' } }}>
				<TableCell>
					<IconButton aria-label="expand row" size="small" onClick={() => handleOpen(index)}>
						{openIndex === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				<TableCell align="left">{index + 1}</TableCell>

				{columns.map(col => {
					if (col.id === 'Model' && deviceType !== listDeviceType[0]) return;

					if (col.type === 'date')
						return (
							<TableCell align="left" key={col.id}>
								{moment.unix(Number(device[col.id as keyof typeof device])).format('DD/MM/YYYY')}
							</TableCell>
						);
					if (col.renderValue !== undefined) {
						if (
							col.id === 'QuantityExport' ||
							col.id === 'QuantityOriginal' ||
							col.id === 'QuantityRemain' ||
							col.id === 'QuantityTotal' ||
							col.id === 'QuantityLiquidate'
						)
							return (
								<TableCell align="left" key={col.id}>
									{col.renderValue(device[col.id as keyof typeof device], device.Unit)}
								</TableCell>
							);
						if (col.id === 'HasTrain')
							return (
								<TableCell align="left" key={col.id}>
									{col.renderValue(device[col.id as keyof typeof device])}
								</TableCell>
							);
					}
					return <TableCell align="left">{`${device[col.id as keyof typeof device] || ''}`}</TableCell>;
				})}
				{deviceType !== listDeviceType[0] && (
					<TableCell>
						<Tooltip arrow placement="left" title="B???o d?????ng thi???t b???">
							<IconButton
								aria-label="delete"
								onClick={() => handleOpenHistoryDialog(device.InstrumentDeptId)}
							>
								<ManageHistoryIcon />
							</IconButton>
						</Tooltip>
					</TableCell>
				)}
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0, background: '#f3f3f3' }} colSpan={14}>
					<Collapse in={openIndex === index} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 1 }}>
							{device?.listDeviceInfo?.length !== 0 && deviceType === listDeviceType[0] ? (
								<>
									<DeviceDetailTable
										data={device?.listDeviceInfo || []}
										unit={device.Unit}
										deviceName={device.DeviceName}
									/>
								</>
							) : (
								deviceType === listDeviceType[0] && (
									<Typography variant="h5" gutterBottom align="center" component="div">
										Tr???ng
									</Typography>
								)
							)}

							{device?.listExportInstrument?.length !== 0 &&
							(deviceType === listDeviceType[1] || deviceType === listDeviceType[2]) ? (
								<>
									<DeviceDetailTable
										data={device?.listExportInstrument || []}
										unit={device.Unit}
										deviceName={device.DeviceName}
										instrumentDeptId={device.InstrumentDeptId}
									/>
								</>
							) : (
								(deviceType === listDeviceType[1] || deviceType === listDeviceType[2]) && (
									<Typography variant="h5" gutterBottom align="center" component="div">
										Tr???ng
									</Typography>
								)
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>

			{deviceHitories !== null && (
				<DialogHistoryDevices
					isOpen={isOpenHistory}
					onClose={handleCloseHistoryDialog}
					data={deviceHitories}
					loading={loading}
				/>
			)}
		</>
	);
};

type DeviceDetailTableProps = {
	data: IExportDeviceType[];
	unit: String;
	deviceName: String;
	instrumentDeptId?: String;
};

const DeviceDetailTable = ({ data, unit, deviceName, instrumentDeptId }: DeviceDetailTableProps) => {
	const listTypeData = useRef(['MAINTENANCE', 'HISTORY']);
	const [deviceDetails, setDeviceDetails] = useState<IExportDeviceType[]>([]);
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceDeptId');
	const [keyword, setKeyword] = useState<string>('');
	const [dataSearch, setDataSearch] = useState<any>([]);
	const [isOpenMaintenance, setIsOpenMaintenance] = useState<boolean>(false);
	const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
	const [serialNumber, setSerialNumber] = useState<String>('');
	const [maintenanceDevice, setMaintenanceDevice] = useState<IRepairDevice | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [typeData, setTypeData] = useState<String | null>(null);
	const [deviceHitories, setDeviceHistories] = useState<IDeviceHistory | IInstrumentHistory | null>(null);
	const { deviceType } = useDeviceOfDepartmentTableStore();

	useEffect(() => {
		setDeviceDetails(data);
	}, [data]);

	useEffect(() => {
		setDeviceDetails(prev => {
			let data = [...prev];
			data?.sort((a: IExportDeviceType, b: IExportDeviceType) => {
				let i =
					order === 'desc'
						? descendingComparator<any>(a, b, orderBy)
						: -descendingComparator<any>(a, b, orderBy);
				return i;
			});
			return data;
		});
	}, [order, orderBy]);

	useEffect(() => {
		const listId = dataSearch.filter((x: any) => x?.label?.includes(keyword)).map((y: any) => y.id);

		if (keyword === '') {
			setDeviceDetails(data || []);
		} else {
			const results = data?.filter(x => listId.indexOf(x?.SerialNumber) !== -1);
			setDeviceDetails(results || []);
		}
	}, [keyword]);

	useEffect(() => {
		const searchArr = data?.map((device: any) => {
			let string: String = '';
			string = nestedObject(device, string);
			return {
				label: removeAccents(string.toUpperCase()),
				id: device.SerialNumber,
			};
		});
		setDataSearch(searchArr);
	}, [data]);

	const columns = useRef(
		(() => {
			if (deviceType === listDeviceType[1] || deviceType === listDeviceType[2])
				return [
					{
						id: 'LabName',
						header: 'Ph??ng',
						sx: { minWidth: '120px' },
						renderValue: (...args: String[]) => args.join(' - '),
					},
					{ id: 'Location', header: '?????a ch???', sx: { minWidth: '150px' } },
					{ id: 'Quantity', header: 'S??? l?????ng' },
				];

			return [
				{ id: 'DeviceInfoId', header: 'M??' },
				{
					id: 'LabName',
					header: 'Ph??ng',
					sx: { minWidth: '120px' },
					renderValue: (...args: String[]) => args.join(' - '),
				},
				{ id: 'Location', header: '?????a ch???', sx: { minWidth: '150px' } },
				{ id: 'DateTranferTo', header: 'Ng??y chuy???n ?????n', type: 'date' },
				{ id: 'EmployeeName', header: 'Ng?????i xu???t', sx: { minWidth: '150px' } },
				{ id: 'SerialNumber', header: 'S??? Serial' },
				{ id: 'ManufacturingDate', header: 'Ng??y s???n xu???t', type: 'date' },
				{ id: 'StartGuarantee', header: 'B???t ?????u b???o h??nh', type: 'date' },
				{ id: 'EndGuarantee', header: 'K???t th??c b???o h??nh', type: 'date' },
				{ id: 'DateStartUsage', header: 'B???t ?????u s??? d???ng', type: 'date' },
				{ id: 'DateMaintenace', header: 'B???t ?????u s??? d???ng', type: 'date' },
				{ id: 'HoursUsageTotal', header: 'T???ng gi??? s??? d???ng' },
				{ id: 'PeriodicMaintenance', header: 'BD??K (th??ng)' },
				{ id: 'Status', header: 'Tr???ng th??i', sx: { minWidth: '150px' } },
				{ id: 'WarningMaintenace', header: 'C???nh b??o' },
			];
		})(),
	);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleCloseMaintenanceDialog = () => {
		setSerialNumber('');
		setIsOpenMaintenance(false);
	};

	const handleCloseHistoryDialog = () => {
		setSerialNumber('');
		setIsOpenHistory(false);
	};

	const handleOpenMaintenanceDialog = (serialNumber: String) => {
		setIsOpenMaintenance(true);
		setSerialNumber(serialNumber);
		setTypeData(listTypeData.current[0]);
	};

	const handleOpenHistoryDialog = (serialNumber: String) => {
		setIsOpenHistory(true);
		setSerialNumber(serialNumber);
		setTypeData(listTypeData.current[1]);
	};

	const getMaintenanceDevice = async () => {
		setLoading(true);
		try {
			let maintenanceDevice: IRepairDevice = await getMaintenanceDeviceById(serialNumber);
			if (maintenanceDevice) {
				console.log(1)
				setMaintenanceDevice(maintenanceDevice);
			} else {
				let index = deviceDetails.findIndex(x => x?.DeviceInfoId === serialNumber);
				if (index !== -1) {
					setMaintenanceDevice({
						DeviceName: deviceName || '',
						SerialNumber: deviceDetails[index]?.SerialNumber || '',
						DeviceInfoId: deviceDetails[index]?.DeviceInfoId || '',
						DateStartUsage: deviceDetails[index]?.DateStartUsage || '',
						LastMaintenanceDate: '',
						Unit: unit || '',
						listRepair: [],
					});
				}
			}
		} catch (error) {
			setMaintenanceDevice(null);
		} finally {
			setLoading(false);
		}
	};

	const getHistoryDevice = async () => {
		setLoading(true);
		try {
			let deviceHitories: IDeviceHistory = await getDeviceHitories(serialNumber);
			setDeviceHistories(deviceHitories);
		} catch (error) {
			setDeviceHistories(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (typeData === listTypeData.current[0] && serialNumber !== '') getMaintenanceDevice();
		if (typeData === listTypeData.current[1] && serialNumber !== '' && deviceType === listDeviceType[0])
			getHistoryDevice();
	}, [serialNumber]);

	return (
		<>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
				<Typography variant="h6" gutterBottom component="div" mb={0}>
					Chi ti???t thi???t b???
				</Typography>
				<TextField
					size="small"
					type="search"
					placeholder="T??m ki???m...."
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					variant="standard"
					onChange={debounce(e => setKeyword(removeAccents(e.target.value.toUpperCase())), 300)}
				/>
			</Box>
			<TableContainer component={Paper} sx={{ maxHeight: '400px', marginBottom: '24px', overflow: 'overlay' }}>
				<Table stickyHeader size="small" aria-label="purchases" sx={{ padding: '8px' }}>
					<TableHead>
						<TableRow>
							{columns.current.map(col => {
								return (
									<StyledTableCell
										key={col.id}
										align="left"
										onClick={() => handleRequestSort(col.id)}
									>
										<b>{col.header}</b>
										{renderArrowSort(order, orderBy, col.id)}
									</StyledTableCell>
								);
							})}
							{deviceType === listDeviceType[0] && <StyledTableCell></StyledTableCell>}
						</TableRow>
					</TableHead>
					<TableBody>
						{deviceDetails?.map((deviceDetailType: IExportDeviceType, index: number) => {
							let isWarning: boolean =
								deviceDetailType?.WarningMaintenace !== 'No warning' &&
								deviceType === listDeviceType[0];

							return (
								<TableRow
									key={index}
									sx={{
										background: isWarning ? '#fff3e0' : '',
									}}
								>
									{columns.current.map(col => {
										if (col.id === 'LabName') {
											return (
												<TableCell align="left" key={col.id} sx={{ ...(col?.sx || {}) }}>
													{col?.renderValue?.(
														deviceDetailType?.LabId || '',
														deviceDetailType?.LabName || '',
													) || ''}
												</TableCell>
											);
										}

										if (col.type === 'date')
											return (
												<TableCell align="left" key={col.id} sx={{ ...(col?.sx || {}) }}>
													{moment
														.unix(
															Number(
																deviceDetailType[
																	col.id as keyof typeof deviceDetailType
																],
															),
														)
														.format('DD/MM/YYYY')}
												</TableCell>
											);
										if (col.id === 'WarningMaintenace') {
											return (
												<TableCell align="left" key={col.id} sx={{ ...col?.sx }}>
													{isWarning && (
														<Tooltip
															title={
																<span style={{ color: '#663c00', fontSize: '12px' }}>
																	C???nh b??o t???i h???n b???o d?????ng
																</span>
															}
															slotProps={{
																tooltip: {
																	sx: { background: '#fff4e5' },
																},
															}}
														>
															<span>
																<WarningIcon color="warning" />
															</span>
														</Tooltip>
													)}
												</TableCell>
											);
										}

										if (col.id === 'PeriodicMaintenance') {
											return (
												<TableCell align="left" key={col.id} sx={{ ...col?.sx }}>
													{deviceDetailType[col.id as keyof typeof deviceDetailType] !==
														null &&
														`${deviceDetailType[col.id as keyof typeof deviceDetailType]}`}
												</TableCell>
											);
										}
										return (
											<TableCell align="left" key={col.id} sx={{ ...col?.sx }}>
												{deviceDetailType[col.id as keyof typeof deviceDetailType] !== null &&
													`${deviceDetailType[col.id as keyof typeof deviceDetailType]}`}
											</TableCell>
										);
									})}
									{deviceType === listDeviceType[0] && (
										<TableCell sx={{ minWidth: '120px' }}>
											<>
												<Tooltip arrow placement="left" title="B???o d?????ng thi???t b???">
													<IconButton
														aria-label="delete"
														onClick={() =>
															handleOpenMaintenanceDialog(
																deviceDetailType.DeviceInfoId || '',
															)
														}
													>
														<EngineeringIcon />
													</IconButton>
												</Tooltip>
												<Tooltip arrow placement="left" title="B???o d?????ng thi???t b???">
													<IconButton
														aria-label="delete"
														onClick={() =>
															handleOpenHistoryDialog(
																(deviceType === listDeviceType[0]
																	? deviceDetailType.DeviceInfoId
																	: instrumentDeptId) || '',
															)
														}
													>
														<ManageHistoryIcon />
													</IconButton>
												</Tooltip>
											</>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			<DialogMaintenanceDevice
				isOpen={isOpenMaintenance}
				onClose={handleCloseMaintenanceDialog}
				data={maintenanceDevice}
				loading={loading}
			/>
			<DialogHistoryDevices
				isOpen={isOpenHistory}
				onClose={handleCloseHistoryDialog}
				data={deviceHitories}
				loading={loading}
			/>
		</>
	);
};

export default DeviceOfDepartmentTable;
