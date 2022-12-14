import styled from '@emotion/styled';
import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
	AppBar,
	Autocomplete,
	Button,
	CircularProgress,
	Collapse,
	debounce,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	SelectChangeEvent,
	Stack,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { MRT_Row } from 'material-react-table';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SearchIcon from '@mui/icons-material/Search';
import {
	IDeviceDepartmentType,
	IDeviceDetailType,
	IDeviceDeptType,
	dummyDeviceDepartmentData,
} from '../../types/deviceDepartmentType';
import * as API from '../../configs/apiHelper';
import { IDepartmentType } from '../../types/departmentType';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { deleteDevice, getDevices, postDevice, updateDevice } from '../../services/deviveDepartmentServices';
import moment from 'moment';
import { DeviceType } from '../../configs/enums';
import CloseIcon from '@mui/icons-material/Close';
import { setSnackbarMessage } from '../../pages/appSlice';
import { IExportDeviceType } from '../../types/exportDeviceType';
import { DialogCreate, DialogDelete, DialogEdit, DialogImportDeviceInfo } from './Dialog';

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

type DeviceTableProps = {
	id: Number | undefined;
};

export type DeviceColumnType = {
	id: string;
	header: String;
	type?: string;
	data?: any;
	size?: number;
	renderValue?: (...args: any[]) => String;
	hide?: boolean;
};

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

function removeAccents(str: string) {
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

const DeviceOfExperimentCenterTable = ({ id }: DeviceTableProps) => {
	const dispatch = useAppDispatch();
	const [devices, setDevices] = useState<IDeviceDepartmentType[]>([]);
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceId');
	const [keyword, setKeyword] = useState<string>('');
	const [dataSearch, setDataSearch] = useState<any>([]);
	const [cloneDevices, setCloneDevices] = useState<IDeviceDepartmentType[]>([]);
	const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);
	const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
	const [deviceType, setDeviceType] = useState<string>('Thi???t b???');
	const listDeviceType = useRef(Object.keys(DeviceType).filter(x => Number.isNaN(Number(x))));
	const [deviceData, setDeviceData] = useState<any>({});
	const [open, setOpen] = useState<number>(-1);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState<Boolean>(true);
	const [isOpenImportInfoDialog, setIsOpenImportInfoDialog] = useState<boolean>(false);

	const [updatedRow, setUpdatedRow] = useState<IDeviceDepartmentType>(dummyDeviceDepartmentData);
	const [deletedRow, setDeletedRow] = useState<IDeviceDepartmentType>(dummyDeviceDepartmentData);

	const getDeviceData = async () => {
		try {
			const data: IDeviceDepartmentType[] = await getDevices(id || 0, deviceType);

			if (!deviceData[deviceType]) {
				deviceData[deviceType] = data;
				setDeviceData({ ...deviceData });
			}

			setDevices(data || []);
			setCloneDevices(data);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getDeviceData();
	}, [deviceType, isOpenCreateModal]);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	useEffect(() => {
		setDevices(prev => {
			let data = [...prev];
			data?.sort((a: IDeviceDepartmentType, b: IDeviceDepartmentType) => {
				let i =
					order === 'desc'
						? descendingComparator<any>(a, b, orderBy)
						: -descendingComparator<any>(a, b, orderBy);
				return i;
			});
			return data || [];
		});
	}, [order, orderBy]);

	useEffect(() => {
		const data = devices.map((device: any) => {
			let string: String = '';

			string = nestedObject(device, string);

			return {
				label: removeAccents(string.toUpperCase()),
				id: device.DeviceId,
			};
		});
		setDataSearch(data);
	}, [devices]);

	useEffect(() => {
		const listId = dataSearch.filter((x: any) => x?.label?.includes(keyword)).map((y: any) => y.id);

		if (keyword === '') {
			setDevices(cloneDevices || []);
		} else {
			const data = devices.filter((x: any) => listId.indexOf(x?.DeviceId) !== -1);
			setDevices(data || []);
		}
	}, [keyword]);

	const handleOpenCreate = () => {
		setIsOpenCreateModal(true);
	};

	const handleOpenEdit = (device: IDeviceDepartmentType) => {
		setUpdatedRow(device);
		setIsOpenEditModal(true);
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
				setDeviceData({
					...deviceData,
					[deviceType]: newData,
				});
				setDevices(newData || []);
				setCloneDevices(newData || []);
			} else {
				dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
			}
		} catch (error) {
			dispatch(setSnackbarMessage('X??a th??ng tin kh??ng th??nh c??ng'));
		} finally {
			setIsOpenDeleteModal(true);
		}
	};

	const handleSubmitUpdate = async (updatedRow: any) => {
		const updateData = {
			DeviceId: updatedRow?.DeviceId,
			DeviceName: updatedRow?.DeviceName,
			DeviceType: updatedRow?.DeviceType,
			Standard: updatedRow?.Standard,
			Unit: updatedRow?.Unit,
			HasTrain: updatedRow?.HasTrain === 'C??' ? 1 : 0,
		};

		const resData = await updateDevice(updateData);
		if (Object.keys(resData).length !== 0) {
			dispatch(setSnackbarMessage('C???p nh???t th??ng tin th??nh c??ng'));
			getDeviceData();
		} else {
			dispatch(setSnackbarMessage('C???p nh???t th??ng tin kh??ng th??nh c??ng'));
		}
		setIsOpenEditModal(false);
	};

	const columns = useRef<DeviceColumnType[]>([
		{ id: 'DeviceId', header: 'M?? thi???t b???' },
		{ id: 'DeviceName', header: 'T??n thi???t b???' },
		{ id: 'Standard', header: 'Qui c??ch' },
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
		{ id: 'HasTrain', header: 'T???p hu???n', renderValue: value => (value === 1 ? 'C??' : 'Kh??ng') },
	]);

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	return (
		<>
			<DialogImportDeviceInfo isOpen={isOpenImportInfoDialog} onClose={() => setIsOpenImportInfoDialog(false)} />
			<Box component="div" justifyContent="space-between" display="flex" flexWrap="wrap" mx={2} mb={2}>
				<Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
					B???ng {deviceType}
				</Typography>
				<Box display="flex" alignItems="end" flexWrap="wrap" justifyContent="flex-end">
					<Box display="flex" alignItems="end" flexWrap="wrap" justifyContent="flex-end">
						<FormControlStyled>
							<RadioGroup
								aria-labelledby="radio-buttons-group-label"
								defaultValue={listDeviceType.current[0]}
								name="radio-buttons-group"
								sx={{ display: 'flex', flexDirection: 'row' }}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setDeviceType((event.target as HTMLInputElement).value);
								}}
							>
								{listDeviceType.current.map((type: string) => (
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
							<Tooltip arrow placement="left" title="Nh???p th??ng tin thi???t b???">
								<Button
									variant="contained"
									onClick={() => setIsOpenImportInfoDialog(true)}
									sx={{ marginLeft: '24px' }}
								>
									Nh???p th??ng tin thi???t b???
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
			<TableContainer component={Paper} sx={{ overflow: 'overlay', flex: '1', marginBottom: '24px' }}>
				<Table sx={{ minWidth: 900 }} stickyHeader size="small">
					<TableHead>
						<TableRow>
							<StyledTableCell align="left"></StyledTableCell>
							<StyledTableCell align="left">
								<b>#</b>
							</StyledTableCell>

							{columns.current.map(col => {
								return (
									<StyledTableCell
										align="left"
										onClick={() => handleRequestSort(col.id)}
										key={col.id}
									>
										<b>{col.header}</b>
										{renderArrowSort(order, orderBy, col.id)}
									</StyledTableCell>
								);
							})}
							<StyledTableCell align="right">
								<b>H??nh ?????ng</b>
							</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!loading &&
							devices
								?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								?.map((exportDevice: IDeviceDepartmentType, index: number) => (
									<RowDevice
										device={exportDevice}
										index={index}
										key={index}
										handleOpenDelete={handleOpenDelete}
										handleOpenEdit={handleOpenEdit}
										columns={columns.current}
										handleOpen={(index: number) => setOpen(open === index ? -1 : index)}
										openIndex={open}
									/>
								))}
						{loading && (
							<TableRow>
								<TableCell colSpan={11} sx={{ textAlign: 'center' }}>
									<CircularProgress disableShrink />
								</TableCell>
							</TableRow>
						)}
						{!loading && devices.length === 0 && (
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
			{isOpenCreateModal && (
				<DialogCreate isOpen={isOpenCreateModal} onClose={() => setIsOpenCreateModal(false)} />
			)}
			{isOpenDeleteModal && (
				<DialogDelete
					isOpen={isOpenDeleteModal}
					onClose={() => setIsOpenDeleteModal(false)}
					dataDelete={deletedRow}
					handleSubmitDelete={handleSubmitDelete}
				/>
			)}
			{isOpenEditModal && (
				<DialogEdit
					isOpen={isOpenEditModal}
					onClose={() => setIsOpenEditModal(false)}
					dataUpdate={updatedRow}
					handleSubmitUpdate={handleSubmitUpdate}
				/>
			)}
		</>
	);
};

type RowDeviceProps = {
	handleOpenEdit: (exportDevice: any) => void;
	handleOpenDelete: (exportDevice: any) => void;
	device: IDeviceDepartmentType;
	index: number;
	columns: DeviceColumnType[];
	openIndex: number;
	handleOpen: (index: number) => void;
};

const RowDevice = ({
	device,
	handleOpenEdit,
	handleOpenDelete,
	columns,
	index,
	openIndex,
	handleOpen,
}: RowDeviceProps) => {
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

					return (
						<TableCell key={col.id} align="left">{`${
							device[col.id as keyof typeof device] || ''
						}`}</TableCell>
					);
				})}

				<TableCell align="right" size="small">
					<Tooltip arrow placement="left" title="S???a">
						<IconButton onClick={() => handleOpenEdit(device)}>
							<Edit />
						</IconButton>
					</Tooltip>
					<Tooltip arrow placement="right" title="Xo??">
						<IconButton color="error" onClick={() => handleOpenDelete(device)}>
							<Delete />
						</IconButton>
					</Tooltip>
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0, background: '#f3f3f3' }} colSpan={13}>
					<Collapse in={openIndex === index} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 1 }}>
							{device?.listDeviceDetail?.length !== 0 ? (
								<>
									<DeviceDetailTable data={device?.listDeviceDetail || []} unit={device.Unit} />
								</>
							) : (
								<Typography variant="h5" gutterBottom align="center" component="div">
									Tr???ng
								</Typography>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

type DeviceDetailTableProps = {
	data: IDeviceDetailType[];
	unit: String;
};

const DeviceDetailTable = ({ data, unit }: DeviceDetailTableProps) => {
	const [deviceDetails, setDeviceDetails] = useState<IDeviceDetailType[]>([]);
	const [open, setOpen] = useState<number>(-1);
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceId');
	const [keyword, setKeyword] = useState<string>('');
	const [dataSearch, setDataSearch] = useState<any>([]);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	useEffect(() => {
		setDeviceDetails(prev => {
			let data = [...prev];
			data?.sort((a: IDeviceDetailType, b: IDeviceDetailType) => {
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
		setDeviceDetails(() => {
			return data?.sort((a, b) => +b.OrderDate - +a.OrderDate);
		});
	}, []);

	useEffect(() => {
		const listId = dataSearch.filter((x: any) => x?.label?.includes(keyword)).map((y: any) => y.id);

		if (keyword === '') {
			setDeviceDetails(data || []);
		} else {
			const results = data?.filter(x => listId.indexOf(x?.DeviceDetailId) !== -1);
			setDeviceDetails(results || []);
		}
	}, [keyword]);

	useEffect(() => {
		const searchArr = data?.map((device: any) => {
			let string: String = '';
			string = nestedObject(device, string);
			return {
				label: removeAccents(string.toUpperCase()),
				id: device.DeviceDetailId,
			};
		});
		setDataSearch(searchArr);
	}, [data]);

	const columns = useRef<DeviceColumnType[]>([
		{ id: 'DeviceDetailId', header: 'M?? chi ti???t TB' },
		{ id: 'Model', header: 'Model' },
		{ id: 'Price', header: 'Gi??' },
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
		{ id: 'OrderId', header: 'M?? PN' },
		{ id: 'OrderDate', header: 'Ng??y nh???p', type: 'date' },
		{ id: 'ManufacturerName', header: 'Nh?? s???n xu???t' },
		{ id: 'Origin', header: 'Xu???t x???' },
		{ id: 'DeviceId', header: 'M?? TB', hide: true },
	]);

	return (
		<>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
				<Typography variant="h6" gutterBottom component="div">
					Nh???p kho
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
			<TableContainer component={Paper} sx={{ marginBottom: '24px', overflow: 'overlay' }}>
				<Table size="small" aria-label="purchases" sx={{ padding: '8px' }}>
					<TableHead>
						<TableRow>
							<StyledTableCell></StyledTableCell>
							{columns.current.map(col => {
								if (col.hide === true) return null;
								return (
									<StyledTableCell key={col.id} onClick={() => handleRequestSort(col.id)}>
										<b>{col.header}</b>
										{renderArrowSort(order, orderBy, col.id)}
									</StyledTableCell>
								);
							})}
						</TableRow>
					</TableHead>
					<TableBody>
						{deviceDetails?.map((deviceDetailType: IDeviceDetailType, index: number) => {
							return (
								<RowOfDeviceDetailTable
									deviceDetailType={deviceDetailType}
									key={index}
									unit={unit}
									columns={columns.current}
									index={index}
									handleOpen={(index: number) => setOpen(open === index ? -1 : index)}
									openIndex={open}
								/>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};

type RowOfDeviceDetailTableProps = {
	deviceDetailType: IDeviceDetailType;
	unit: String;
	columns: DeviceColumnType[];
	index: number;
	openIndex: number;
	handleOpen: (index: number) => void;
};

const RowOfDeviceDetailTable = ({
	deviceDetailType,
	unit,
	columns,
	index,
	openIndex,
	handleOpen,
}: RowOfDeviceDetailTableProps) => {
	const [deviceDetails, setDeviceDetails] = useState<IDeviceDeptType[]>([]);
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceDeptId');
	const [keyword, setKeyword] = useState<string>('');
	const [dataSearch, setDataSearch] = useState<any>([]);

	useEffect(() => {
		setDeviceDetails(deviceDetailType?.listDeviceDept || []);
	}, [deviceDetailType]);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	useEffect(() => {
		setDeviceDetails(prev => {
			let data = [...prev];
			data?.sort((a: IDeviceDeptType, b: IDeviceDeptType) => {
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
			setDeviceDetails(deviceDetailType.listDeviceDept || []);
		} else {
			const results = deviceDetailType?.listDeviceDept.filter(x => listId.indexOf(x?.DeviceInfoId) !== -1);
			setDeviceDetails(results || []);
		}
	}, [keyword]);

	useEffect(() => {
		const searchArr = deviceDetailType?.listDeviceDept.map((device: any) => {
			let string: String = '';
			string = nestedObject(device, string);
			return {
				label: removeAccents(string.toUpperCase()),
				id: device.DeviceInfoId,
			};
		});
		setDataSearch(searchArr);
	}, [deviceDetailType]);

	const columnsExport = useRef<DeviceColumnType[]>([
		{ id: 'DepartmentName', header: 'Khoa' },
		{ id: 'ExportId', header: 'Phi???u xu???t' },
		{ id: 'DeviceInfoId', header: 'M?? thi???t b???' },
		{ id: 'SerialNumber', header: 'S??? Serial' },
		{ id: 'ManufacturingDate', header: 'NSX', type: 'date' },
		{ id: 'StartGuarantee', header: 'B???t ?????u b???o h??nh', type: 'date' },
		{ id: 'EndGuarantee', header: 'K???t th??c b???o h??nh', type: 'date' },
		{ id: 'DateStartUsage', header: 'Ng??y s??? d???ng', type: 'date' },
		{ id: 'HoursUsageTotal', header: 'T???ng gi??? s??? d???ng' },
		{ id: 'PeriodicMaintenance', header: 'BD??K (th??ng)' },
		{ id: 'Status', header: 'Tr???ng th??i' },
	]);

	return (
		<>
			<TableRow>
				<TableCell>
					<IconButton aria-label="expand row" size="small" onClick={() => handleOpen(index)}>
						{openIndex === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</TableCell>
				{columns.map(col => {
					if (col.hide === true) return null;

					if (col.renderValue !== undefined) {
						if (
							col.id === 'QuantityExport' ||
							col.id === 'QuantityOriginal' ||
							col.id === 'QuantityRemain' ||
							col.id === 'QuantityLiquidate'
						)
							return (
								<TableCell align="left" key={col.id}>
									{col.renderValue(deviceDetailType[col.id as keyof typeof deviceDetailType], unit) ||
										''}
								</TableCell>
							);
						if (col.id === 'HasTrain')
							return (
								<TableCell align="left" key={col.id}>
									{col.renderValue(deviceDetailType[col.id as keyof typeof deviceDetailType]) || ''}
								</TableCell>
							);
					}

					if (col.type === 'date')
						return (
							<TableCell align="left" key={col.id}>
								{moment
									.unix(Number(deviceDetailType[col.id as keyof typeof deviceDetailType]))
									.format('DD/MM/YYYY')}
							</TableCell>
						);

					return (
						<TableCell align="left" key={col.id}>{`${
							deviceDetailType[col.id as keyof typeof deviceDetailType] || ''
						}`}</TableCell>
					);
				})}
			</TableRow>

			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0, background: '#f3f3f3' }} colSpan={13}>
					<Collapse in={openIndex === index} timeout="auto" unmountOnExit>
						<Box sx={{ padding: 1 }}>
							{deviceDetailType?.listDeviceDept?.length !== 0 ? (
								<>
									<Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
										<Typography variant="h6" gutterBottom component="div">
											Xu???t kho
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
											onChange={debounce(
												e => setKeyword(removeAccents(e.target.value.toUpperCase())),
												300,
											)}
										/>
									</Box>
									<TableContainer
										component={Paper}
										sx={{ maxHeight: '400px', marginBottom: '24px', overflow: 'overlay' }}
									>
										<Table size="small" aria-label="purchases" sx={{ padding: '8px' }}>
											<TableHead>
												<TableRow>
													{columnsExport.current.map(col => {
														return (
															<StyledTableCell
																key={col.id}
																onClick={() => handleRequestSort(col.id)}
															>
																<b>{col.header}</b>
																{renderArrowSort(order, orderBy, col.id)}
															</StyledTableCell>
														);
													})}
												</TableRow>
											</TableHead>
											<TableBody>
												{deviceDetails?.map((deviceDept: IDeviceDeptType, index: number) => {
													return (
														<TableRow key={index}>
															{columnsExport.current.map(col => {
																if (col.type === 'date')
																	return (
																		<TableCell align="left" key={col.id}>
																			{deviceDept[
																				col.id as keyof typeof deviceDept
																			]
																				? moment
																						.unix(
																							Number(
																								deviceDept[
																									col.id as keyof typeof deviceDept
																								],
																							),
																						)
																						.format('DD/MM/YYYY')
																				: ''}
																		</TableCell>
																	);

																return (
																	<TableCell align="left" key={col.id}>
																		{`${
																			deviceDept[
																				col.id as keyof typeof deviceDept
																			] || ''
																		}`}
																	</TableCell>
																);
															})}
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</TableContainer>
								</>
							) : (
								<Typography variant="h5" gutterBottom align="center" component="div">
									Tr???ng
								</Typography>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

export default DeviceOfExperimentCenterTable;
