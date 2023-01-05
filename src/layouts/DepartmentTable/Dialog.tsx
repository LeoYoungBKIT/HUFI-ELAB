import styled from '@emotion/styled';
import { Delete } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
	AppBar,
	Autocomplete,
	Box,
	Button,
	ButtonGroup,
	Checkbox,
	CircularProgress,
	debounce,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	Stack,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import { GridSize } from '@mui/material/Grid';
import DataGrid, {
	Column,
	Editing,
	Item,
	Paging,
	RequiredRule,
	Selection,
	Toolbar as DevToolbar,
} from 'devextreme-react/data-grid';

import _ from 'lodash';
import moment from 'moment';
import { Fragment, memo, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { colorsNotifi } from '../../configs/color';
import { DeviceType } from '../../configs/enums';
import { useAppDispatch } from '../../hooks';
import { setSnackbar, setSnackbarMessage } from '../../pages/appSlice';
import { postDevice } from '../../services/deviceServices';
import {
	deleteRecordHours,
	getRecordHours,
	postRecordHours,
	putRecordHours,
} from '../../services/deviceUsageHoursServices';
import {
	deleteMaintenanceDevice,
	getMaintenanceDeviceById,
	postMaintenanceDevice,
	updateMaintenanceDevice,
} from '../../services/maintenanceDevicesServices';
import { dummyDeviceDepartmentData, IDeviceDepartmentType } from '../../types/deviceDepartmentType';
import { IDeviceHistory } from '../../types/deviceHistoriesType';
import { IDeviceTransferHistoryItem } from '../../types/deviceTransferType';
import {
	dummyDeviceRecordUsageHours,
	IDeviceRecordUsageHours,
	IDeviceUsageHours,
} from '../../types/deviceUsageHoursType';
import {
	IInstrumentHistory,
	IInstrumentResearchItem,
	IInstrumentTranferItem,
} from '../../types/instrumentHistoriesType';
import { dummyRepairDeviceItem, IRepairDevice, IRepairDeviceItem } from '../../types/maintenanceDevicesType';
import { descendingComparator, renderArrowSort } from '../ChemicalWarehouseTable/Utils';
import { ProviderValueType, useDeviceOfDepartmentTableStore } from './context/DeviceOfDepartmentTableContext';
import { removeAccents } from './DeviceOfDepartmentTable';

import { loadMessages } from 'devextreme/localization';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import viMessages from '../../configs/devextreme_vi.json';
import DevButton from 'devextreme-react/button';
import { IDeviceInfo, IDeviceInfoItem } from '../../types/deviceInfoType';
import { deleteDeviceInfoes, getDeviceInfoes, postDeviceInfoes, putDeviceInfoes } from '../../services/deviceInfoServices';

const StyledTableCell = styled(TableCell)(theme => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: 'lightgray',
	},
}));

type DeviceColumnType = {
	id: string;
	header: String;
	type?: string;
	data?: any;
	size?: number;
	renderValue?: (...arg: any[]) => void;
	sx?: { [key: string]: string };
};

type ColumnSizeType = {
	xs?: GridSize;
	sm?: GridSize;
	md?: GridSize;
	lg?: GridSize;
	xl?: GridSize;
};

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
	handleSubmitDelete?: (DeviceId: String) => void;
	handleSubmitUpdate?: (updatedRow: any) => void;
	dataDelete?: IDeviceDepartmentType;
	dataUpdate?: IDeviceDepartmentType;
};

type RowCreateDeviceProps = {
	field: any;
	indexField: number;
	handleFormChange: (e: any, value: any, index: number) => void;
	removeFields: (index: number) => void;
};

const columns: DeviceColumnType[] = [
	{
		id: 'DeviceId',
		header: 'Mã thiết bị',
		size: 120,
	},
	{
		id: 'DeviceName',
		header: 'Tên thiết bị',
		size: -1,
		sx: {
			minWidth: '200px',
		},
	},
	{
		id: 'DeviceType',
		header: 'Loại thiết bị',
		type: 'select',
		data: Object.keys(DeviceType).filter(v => isNaN(Number(v))),
		size: 180,
	},
	{
		id: 'Unit',
		header: 'Đơn vị',
		size: 120,
	},
	{
		id: 'HasTrain',
		header: 'Tập huấn',
		data: ['Có', 'Không'],
		renderValue: value => (value === 1 ? 'Có' : 'Không'),
		size: 180,
		type: 'select',
	},
	{
		id: 'Standard',
		header: 'Qui cách',
	},
];

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
				case 'DateInput':
				case 'DateTransfer':
				case 'DateCreate':
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

const DialogCreate = ({ isOpen, onClose }: DialogProps) => {
	const [createdRow, setCreatedRow] = useState<any>([dummyDeviceDepartmentData]);
	const dispatch = useAppDispatch();

	const handleFormChange = useCallback(
		(event: any, value: any, index: number) => {
			const newArray = createdRow.map((item: any, i: number) => {
				if (index === i) {
					return { ...item, [event.target.name]: value };
				} else {
					return item;
				}
			});
			setCreatedRow(newArray);
		},
		[createdRow],
	);

	const addFields = useCallback(() => {
		setCreatedRow([...createdRow, dummyDeviceDepartmentData]);
	}, [createdRow]);

	const removeFields = (index: number) => {
		let data = createdRow.filter((x: any, i: number) => i !== index).map((item: any, i: number) => item);
		setCreatedRow(data);
	};

	const submit = async () => {
		const createData = createdRow
			.filter((x: any) => x.DeviceId !== '' && x.DeviceName !== '')
			.map((row: any) => {
				return {
					DeviceId: row.DeviceId,
					DeviceName: row.DeviceName,
					DeviceType: row.DeviceType,
					HasTrain: row.HasTrain === 'Có' ? 1 : 0,
					Standard: row.Standard,
					Unit: row.Unit,
				};
			});

		const res = await postDevice(createData);
		if (Object.keys(res).length !== 0) {
			dispatch(setSnackbarMessage('Tạo thông tin mới thành công'));
			onClose();
		} else {
			dispatch(setSnackbarMessage('Tạo thông tin mới không thành công'));
			onClose();
		}
	};

	const handleClose = () => {
		setCreatedRow([dummyDeviceDepartmentData]);
		onClose();
	};

	return (
		<Dialog fullScreen open={isOpen} onClose={handleClose}>
			<AppBar sx={{ position: 'relative', minWidth: '1200px', overflow: 'auto' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
						<CloseIcon />
					</IconButton>
					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						<b>Tạo thông tin thiết bị mới</b>
					</Typography>
					<Button autoFocus color="inherit" onClick={submit}>
						Lưu
					</Button>
				</Toolbar>
			</AppBar>
			<DialogContent sx={{ minWidth: '1200px', overflow: 'auto' }}>
				<form onSubmit={e => e.preventDefault()} style={{ marginTop: '10px' }}>
					{createdRow.map((field: any, indexField: number) => {
						return (
							<Stack
								sx={{
									width: '100%',
									gap: '1.5rem',
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									marginBottom: '24px',
								}}
								key={indexField}
							>
								<RowCreateDevice
									field={field}
									handleFormChange={handleFormChange}
									indexField={indexField}
									removeFields={removeFields}
								/>
							</Stack>
						);
					})}
				</form>
				<Button variant="contained" onClick={() => addFields()}>
					Thêm hàng
				</Button>
			</DialogContent>
		</Dialog>
	);
};

const DialogDelete = ({ isOpen, onClose, dataDelete, handleSubmitDelete }: DialogProps) => {
	return (
		<>
			<Dialog open={isOpen} onClose={onClose}>
				<DialogTitle textAlign="center">
					<b>Xoá thông tin thiết bị</b>
				</DialogTitle>
				<DialogContent>
					<div>
						Bạn có chắc muốn xoá thông tin phiếu xuất thiết bị{' '}
						<Typography component="span" color="red">
							{dataDelete?.DeviceId} - {dataDelete?.DeviceName}
						</Typography>{' '}
						không?
					</div>
				</DialogContent>
				<DialogActions sx={{ p: '1.25rem' }}>
					<Button onClick={onClose}>Hủy</Button>
					<Button
						color="primary"
						onClick={() => handleSubmitDelete?.(dataDelete?.DeviceId || '')}
						variant="contained"
					>
						Xác nhận
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const DialogEdit = ({ isOpen, onClose, dataUpdate, handleSubmitUpdate }: DialogProps) => {
	const [updatedRow, setUpdatedRow] = useState<any>(() => dataUpdate);

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="center">
				<b>Sửa thông tin thiết bị</b>
			</DialogTitle>
			<DialogContent>
				<form onSubmit={e => e.preventDefault()} style={{ marginTop: '10px' }}>
					<Stack
						sx={{
							width: '100%',
							minWidth: { xs: '300px', sm: '360px', md: '400px' },
							gap: '1.5rem',
						}}
					>
						{updatedRow &&
							columns.map(column => {
								if (column.id === 'DeviceId') {
									return (
										<TextField
											disabled
											key={column.id}
											label={column.header}
											name={column.id}
											value={column.id && updatedRow[column.id]}
										/>
									);
								}
								if (column?.type === 'select' && column.id === 'HasTrain') {
									const list = column.data;

									return (
										<FormControl key={column.id}>
											<InputLabel>{column.header}</InputLabel>
											<Select
												value={
													list?.findIndex(
														(x: any) => x === column?.renderValue?.(updatedRow[column.id]),
													) > -1
														? list
																?.findIndex(
																	(x: any) =>
																		x ===
																		column?.renderValue?.(updatedRow[column.id]),
																)
																.toString()
														: ''
												}
												name={column.id}
												label={column.header}
												onChange={(e: SelectChangeEvent) =>
													setUpdatedRow({
														...updatedRow,
														[column.id]: list[Number(e.target.value)],
													})
												}
											>
												{list.map((x: any, idx: number) => (
													<MenuItem key={idx} value={idx}>
														{x}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									);
								}
								if (column?.type === 'select') {
									const list = column.data;

									return (
										<FormControl key={column.id}>
											<InputLabel>{column.header}</InputLabel>
											<Select
												value={
													list?.findIndex((x: any) => x === updatedRow[column.id]) > -1
														? list
																?.findIndex((x: any) => x === updatedRow[column.id])
																.toString()
														: ''
												}
												name={column.id}
												label={column.header}
												onChange={(e: SelectChangeEvent) =>
													setUpdatedRow({
														...updatedRow,
														[column.id]: list[Number(e.target.value)],
													})
												}
											>
												{list.map((x: any, idx: number) => (
													<MenuItem key={idx} value={idx}>
														{x}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									);
								} else {
									return (
										<TextField
											key={column.id}
											label={column.header}
											name={column.id}
											value={column.id && updatedRow[column.id]}
											onChange={e =>
												setUpdatedRow({ ...updatedRow, [column.id]: e.target.value })
											}
										/>
									);
								}
							})}
					</Stack>
				</form>
			</DialogContent>
			<DialogActions sx={{ p: '1.25rem' }}>
				<Button onClick={onClose}>Hủy</Button>
				<Button color="primary" onClick={() => handleSubmitUpdate?.(updatedRow)} variant="contained">
					Lưu thay đổi
				</Button>
			</DialogActions>
		</Dialog>
	);
};
const RowCreateDevice = memo(({ field, indexField, handleFormChange, removeFields }: RowCreateDeviceProps) => {
	return (
		<>
			{columns?.map((column: DeviceColumnType, index: number) => {
				if (column?.type === 'select') {
					const list = column.data;

					return (
						<FormControl sx={{ m: 0, width: `${column.size}px` }} key={column.id}>
							<InputLabel>{column.header}</InputLabel>
							<Select
								value={
									list?.findIndex((x: any) => x === field[column.id]) > -1
										? list?.findIndex((x: any) => x === field[column.id]).toString()
										: ''
								}
								name={column.id}
								label={column.header}
								onChange={(e: SelectChangeEvent) =>
									handleFormChange(e, list[Number(e.target.value)], indexField)
								}
							>
								{list.map((x: any, idx: number) => (
									<MenuItem key={idx} value={idx}>
										{x}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					);
				} else {
					let style = {};
					if (column.sx) style = column.sx;

					return (
						<TextField
							key={index}
							label={column.header}
							name={column.id}
							sx={{
								maxWidth: column.size !== -1 ? `${column.size}px` : 'auto',
								flex: column.size === -1 ? 1 : '',
								...style,
							}}
							// defaultValue={column.id && field[column.id]}
							value={column.id && field[column.id]}
							onChange={e => handleFormChange(e, e.target.value, indexField)}
						/>
					);
				}
			})}
			<Tooltip arrow placement="right" title="Xoá hàng">
				<IconButton color="error" onClick={() => removeFields(indexField)}>
					<Delete />
				</IconButton>
			</Tooltip>
		</>
	);
});

const DialogDeviceUsageHours = ({ isOpen, onClose }: DialogProps) => {
	const [openAutocomplete, setOpenAutocomplete] = useState<boolean>(false);
	const [listDevice, setListDevice] = useState<IDeviceUsageHours[]>([]);
	const loading = openAutocomplete && listDevice.length === 0;
	const [deviceSelected, setDeviceSelected] = useState<IDeviceUsageHours | null>(null);
	const [selected, setSelected] = useState<IDeviceRecordUsageHours[]>([]);
	const [recordInputValue, setRecordInputValue] = useState<IDeviceRecordUsageHours>(dummyDeviceRecordUsageHours);
	const [typeButton, setTypeButton] = useState<String>('POST');
	const [loadingSendRequest, setLoadingSendRequest] = useState<boolean>(false);
	const dispatch = useAppDispatch();

	const columns = useRef([
		{
			id: 'Month',
			header: 'Tháng',
		},
		{
			id: 'Year',
			header: 'Năm',
		},
		{
			id: 'HoursUsage',
			header: 'Số giờ',
		},
		{
			id: 'EmployeeName',
			header: 'Nhân viên nhập',
		},
		{
			id: 'DateInput',
			header: 'Ngày nhập',
			type: 'date',
		},
	]);

	const getListDevice = async () => {
		try {
			const list: IDeviceUsageHours[] = await getRecordHours();

			if (Array.isArray(list)) {
				setListDevice(list);
			}
		} catch (error) {
			setListDevice([]);
		}
	};

	useEffect(() => {
		setDeviceSelected(null);
		setSelected([]);
		setRecordInputValue(dummyDeviceRecordUsageHours);
		getListDevice();
	}, [isOpen]);

	useEffect(() => {
		if (deviceSelected)
			setDeviceSelected(listDevice.find(x => x.DeviceInfoId === deviceSelected.DeviceInfoId) || null);
	}, [listDevice]);

	useEffect(() => {
		let isExist: Boolean =
			deviceSelected?.listRecordHours.findIndex(
				x => x.Month === recordInputValue.Month && x.Year === recordInputValue.Year,
			) !== -1;
		isExist ? setTypeButton('PUT') : setTypeButton('POST');
	}, [recordInputValue, deviceSelected]);

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const newSelected: IDeviceRecordUsageHours[] = deviceSelected?.listRecordHours?.map(n => n) || [];
			if (newSelected) handleSelect(newSelected);
			return;
		}
		handleSelect([]);
	};

	const handleSelect = (value: IDeviceRecordUsageHours[]) => {
		setSelected(value);
	};

	const handleClick = (event: React.MouseEvent<unknown>, record: IDeviceRecordUsageHours) => {
		const selectedIndex = selected.findIndex(x => x.Month === record.Month && x.Year === record.Year);
		let newSelected: IDeviceRecordUsageHours[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, record);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}
		setRecordInputValue(record);
		handleSelect(newSelected);
	};

	const handleAddRecord = async () => {
		setLoadingSendRequest(true);
		if (deviceSelected !== null) {
			let newData: IDeviceUsageHours = {
				...deviceSelected,
				listRecordHours: [
					{
						...recordInputValue,
						DateInput: `${Math.floor(Date.now() / 1000)}`,
					},
				],
			};

			try {
				if (typeButton === 'POST') {
					await postRecordHours(newData);
					dispatch(setSnackbarMessage('Thêm thành công!!!'));
				}
				if (typeButton === 'PUT') {
					await putRecordHours(newData);
					dispatch(setSnackbarMessage('Sửa thành công!!!'));
				}
				getListDevice();
			} catch (error) {
				dispatch(setSnackbarMessage('Đã xảy ra lỗi!!!'));
			} finally {
				setLoadingSendRequest(false);
			}
		}
	};

	const handleDeleteRecord = async () => {
		if (deviceSelected !== null && selected.length !== 0) {
			setLoadingSendRequest(true);
			let deleteData: IDeviceUsageHours = {
				...deviceSelected,
				listRecordHours: selected,
			};
			try {
				await deleteRecordHours(deleteData);
				dispatch(setSnackbarMessage('Xóa thành công!!!'));
				setSelected([]);
				getListDevice();
			} catch (error) {
				dispatch(setSnackbarMessage('Đã xảy ra lỗi!!!'));
			} finally {
				setLoadingSendRequest(false);
			}
		}
	};

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Nhập giờ sử dụng thiết bị</b>

				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ paddingTop: '8px' }}>
				<Autocomplete
					id="device-usage"
					open={openAutocomplete}
					onOpen={() => {
						setOpenAutocomplete(true);
					}}
					onClose={() => {
						setOpenAutocomplete(false);
					}}
					isOptionEqualToValue={(option, value) => option.DeviceInfoId === value.DeviceInfoId}
					getOptionLabel={option => `${option.DeviceInfoId} - ${option.DeviceName}`}
					options={listDevice}
					loading={loading}
					onChange={(e, value) => {
						setDeviceSelected(value);
						setRecordInputValue(dummyDeviceRecordUsageHours);
					}}
					renderInput={params => (
						<TextField
							{...params}
							label="Thiết bị..."
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<Fragment>
										{loading ? <CircularProgress color="inherit" size={20} /> : null}
										{params.InputProps.endAdornment}
									</Fragment>
								),
							}}
						/>
					)}
				/>

				<Box my={3}>
					<Grid container spacing={2}>
						<Grid item md={2} xs={4}>
							<TextField
								label="Tháng"
								variant="standard"
								type="number"
								fullWidth
								inputProps={{
									min: 1,
									max: 12,
									value: `${recordInputValue.Month}`,
								}}
								onChange={e => {
									setRecordInputValue(prev => ({
										...prev,
										Month: Number(e.target.value),
									}));
								}}
							/>
						</Grid>
						<Grid item md={2} xs={4}>
							<TextField
								label="Năm"
								variant="standard"
								type="number"
								fullWidth
								inputProps={{
									value: `${recordInputValue.Year}`,
								}}
								onChange={e => {
									setRecordInputValue(prev => ({
										...prev,
										Year: Number(e.target.value),
									}));
								}}
							/>
						</Grid>
						<Grid item md={2} xs={4}>
							<TextField
								label="Số giờ"
								variant="standard"
								type="number"
								fullWidth
								inputProps={{
									value: `${recordInputValue.HoursUsage}`,
									min: 0,
								}}
								onChange={e => {
									setRecordInputValue(prev => ({
										...prev,
										HoursUsage: Number(e.target.value),
									}));
								}}
							/>
						</Grid>
						<Grid item md={3} xs={12}>
							<TextField
								label="Người nhập"
								variant="standard"
								disabled={true}
								fullWidth
								defaultValue={recordInputValue.EmployeeName}
							/>
						</Grid>
						<Grid item md={3} xs={12} sx={{ display: 'flex', alignItems: 'flex-end' }}>
							<Button
								variant="contained"
								sx={{ width: '50%', marginRight: '8px' }}
								onClick={handleAddRecord}
								disabled={!deviceSelected || loadingSendRequest}
							>
								{typeButton === 'POST' && !loadingSendRequest && 'Thêm'}
								{typeButton === 'PUT' && !loadingSendRequest && 'Sửa'}
								{loadingSendRequest && <CircularProgress color="inherit" size={24} />}
							</Button>
							<Button
								variant="contained"
								color="error"
								sx={{ width: '50%', marginLeft: '8px' }}
								onClick={handleDeleteRecord}
								disabled={selected.length === 0 || loadingSendRequest}
							>
								{loadingSendRequest ? <CircularProgress color="inherit" size={24} /> : 'Xóa'}
							</Button>
						</Grid>
					</Grid>
				</Box>

				<Table size="small" aria-label="purchases" sx={{ padding: '8px' }}>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox" sx={{ background: '#d3d3d3' }}>
								<Checkbox
									color="primary"
									indeterminate={
										selected.length > 0 &&
										selected.length < (deviceSelected?.listRecordHours.length || 0)
									}
									checked={
										(deviceSelected?.listRecordHours?.length || 0) > 0 &&
										selected.length === deviceSelected?.listRecordHours?.length
									}
									onChange={handleSelectAllClick}
									inputProps={{
										'aria-label': 'select all desserts',
									}}
								/>
							</TableCell>
							<StyledTableCell>
								<b>#</b>
							</StyledTableCell>
							{columns.current.map(col => {
								return (
									<StyledTableCell key={col.id}>
										<b>{col.header}</b>
									</StyledTableCell>
								);
							})}
						</TableRow>
					</TableHead>
					<TableBody>
						{deviceSelected &&
							deviceSelected?.listRecordHours?.map((device, index) => {
								let isSelect: boolean | undefined =
									selected.find(x => x.Month === device.Month && x.Year === device.Year) !==
									undefined;
								return (
									<TableRow
										key={index}
										selected={isSelect}
										role="checkbox"
										onClick={event => handleClick(event, device)}
										sx={{ position: 'relative' }}
									>
										<TableCell padding="checkbox">
											<Checkbox color="primary" checked={isSelect} />
										</TableCell>
										<TableCell align="left">
											<b>{index + 1}</b>
										</TableCell>
										{columns.current.map(col => {
											if (col.type === 'date')
												return (
													<TableCell align="left" key={col.id}>
														{moment
															.unix(Number(device[col.id as keyof typeof device]))
															.format('DD/MM/YYYY')}
													</TableCell>
												);

											return (
												<TableCell align="left" key={col.id}>
													{`${device[col.id as keyof typeof device] || ''}`}
												</TableCell>
											);
										})}
									</TableRow>
								);
							})}

						{(deviceSelected?.listRecordHours.length === 0 || deviceSelected === null) && (
							<TableRow>
								<TableCell colSpan={7}>
									<Typography variant="h5" gutterBottom align="center" component="div">
										Trống
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</DialogContent>
		</Dialog>
	);
};

const DialogMaintenanceDevice = ({
	isOpen,
	onClose,
	data,
	loading,
}: DialogProps & {
	data: IRepairDevice | null;
	loading: boolean;
}) => {
	const columns = useRef<DeviceColumnType[]>([
		{ id: 'RepairId', header: 'ID' },
		{ id: 'Content', header: 'Nội dụng' },
		{ id: 'Cost', header: 'Giá' },
		{ id: 'DateCreate', header: 'Ngày tạo' },
		{ id: 'EmployeeName', header: 'Người yêu cầu bảo trì' },
		{ id: 'Status', header: 'Trạng thái' },
	]);
	const dispatch = useAppDispatch();
	const [maintenanceDevice, setMaintenanceDevice] = useState<IRepairDevice | null>(null);
	const [loadingSendRequest, setLoadingSendRequest] = useState<boolean>(false);
	const statusList = useRef<string[]>(['Đang bảo trì', 'Đã bảo trì']);
	const [newMaintenance, setNewMaintenance] = useState<IRepairDeviceItem>(dummyRepairDeviceItem);
	const [selected, setSelected] = useState<IRepairDeviceItem[]>([]);
	const [typeRequest, setTypeRequest] = useState<'PUT' | 'POST'>('POST');
	const { getDeviceData }: ProviderValueType = useDeviceOfDepartmentTableStore();
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceId');
	const [keyword, setKeyword] = useState<String | null>(null);

	const getMaintenance = async () => {
		try {
			let newMaintenanceDevice: IRepairDevice = await getMaintenanceDeviceById(
				maintenanceDevice?.SerialNumber || '',
			);
			if (newMaintenanceDevice) {
				setMaintenanceDevice(newMaintenanceDevice);
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			);
		}
	};

	useEffect(() => {
		setMaintenanceDevice(data);
		setKeyword('');
	}, [data]);

	useEffect(() => {
		if (!isOpen) {
			setTypeRequest('POST');
			setKeyword(null);
			setSelected([]);
			setNewMaintenance(dummyRepairDeviceItem);
			setLoadingSendRequest(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (
			maintenanceDevice?.listRepair?.findIndex(x => x.RepairId === newMaintenance.RepairId) === -1 ||
			newMaintenance.RepairId === -1
		) {
			setTypeRequest('POST');
		} else {
			setTypeRequest('PUT');
		}
	}, [newMaintenance]);

	useEffect(() => {
		if (!selected.length) {
			setNewMaintenance(dummyRepairDeviceItem);
		}
	}, [selected]);

	useEffect(() => {
		const sortDevices = (prev: IRepairDevice | null) => {
			if (prev !== null && data !== null) {
				let cloneData: IRepairDevice = { ...prev };
				let listMaintenance: IRepairDeviceItem[];

				if (keyword?.trim() === '' || keyword === null) {
					cloneData = data;
				} else {
					listMaintenance = cloneData.listRepair.filter(item => {
						if (keyword?.trim() === '' || keyword === null) return true;

						let searchString: String = '';

						searchString = nestedObject(item, searchString);
						searchString = removeAccents(searchString.toUpperCase());

						return searchString.includes(`${keyword}`);
					});

					cloneData = { ...cloneData, listRepair: listMaintenance };
				}

				listMaintenance =
					cloneData?.listRepair?.sort((a: IRepairDeviceItem, b: IRepairDeviceItem) => {
						let i =
							order === 'desc'
								? descendingComparator<any>(a, b, orderBy)
								: -descendingComparator<any>(a, b, orderBy);
						return i;
					}) || [];

				return (
					{
						...cloneData,
						listMaintenance,
					} || []
				);
			}
			return null;
		};
		setMaintenanceDevice(sortDevices(maintenanceDevice));
	}, [order, orderBy, keyword]);

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const newSelected: IRepairDeviceItem[] = maintenanceDevice?.listRepair?.map(n => n) || [];
			if (newSelected) handleSelect(newSelected);
			return;
		}
		handleSelect([]);
	};

	const handleSelect = (value: IRepairDeviceItem[]) => {
		setSelected(value);
	};

	const handleClick = (maintenance: IRepairDeviceItem) => {
		const selectedIndex = selected.findIndex(x => x.RepairId === maintenance.RepairId);
		let newSelected: IRepairDeviceItem[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, maintenance);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		handleSelect(newSelected);
		setNewMaintenance(maintenance);
	};

	const handleAddMaintenance = async () => {
		setLoadingSendRequest(true);

		try {
			if (typeRequest === 'POST') {
				await addMaintenance();
			}

			if (typeRequest === 'PUT') {
				await editMaintenance();
			}
		} catch (error) {
		} finally {
			handleSelect([]);
			setNewMaintenance(dummyRepairDeviceItem);
			setLoadingSendRequest(false);
			getMaintenance();
			getDeviceData(true);
		}
	};

	const addMaintenance = async () => {
		try {
			if (maintenanceDevice !== null && _.isEqual(newMaintenance, dummyRepairDeviceItem) === false) {
				await postMaintenanceDevice({
					...maintenanceDevice,
					listRepair: [
						{
							...newMaintenance,
							DateCreate: `${Math.floor(Date.now() / 1000)}`,
						},
					],
				});

				dispatch(
					setSnackbar({
						message: 'Thêm thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
				return;
			}

			throw new Error('Đã xảy ra lỗi!!!');
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			);
		} finally {
			setLoadingSendRequest(false);
		}
	};

	const editMaintenance = async () => {
		try {
			if (
				maintenanceDevice !== null &&
				_.isEqual(newMaintenance, dummyRepairDeviceItem) === false &&
				_.isEqual(selected, newMaintenance) === false &&
				newMaintenance.RepairId !== -1
			) {
				await updateMaintenanceDevice({
					...maintenanceDevice,
					listRepair: [
						{
							...newMaintenance,
							DateCreate: `${Math.floor(Date.now() / 1000)}`,
						},
					],
				});

				dispatch(
					setSnackbar({
						message: 'Cập nhật thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
				return;
			}

			throw new Error('Đã xảy ra lỗi!!!');
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			);
		} finally {
			setLoadingSendRequest(false);
		}
	};

	const handleDeleteMaintenance = () => {
		setLoadingSendRequest(true);
		let requests: Promise<void>[] = selected.map(s => deleteMaintenanceDevice(`${s.RepairId}`));

		Promise.all(requests)
			.then(() => {
				dispatch(
					setSnackbar({
						message: 'Xóa thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
			})
			.catch(() => {
				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				);
			})
			.finally(() => {
				handleSelect([]);
				setNewMaintenance(dummyRepairDeviceItem);
				setLoadingSendRequest(false);
				getMaintenance();
			});
	};

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Bảo trì thiết bị</b>

				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				{!loading ? (
					<>
						<Grid container spacing={2}>
							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{
										readOnly: true,
									}}
									variant="standard"
									value={maintenanceDevice?.SerialNumber}
									label="Số Serial"
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{
										readOnly: true,
									}}
									variant="standard"
									value={maintenanceDevice?.DeviceName}
									label="Tên thiết bị"
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{
										readOnly: true,
									}}
									variant="standard"
									value={maintenanceDevice?.Unit}
									label="Đơn vị tính"
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{
										readOnly: true,
									}}
									variant="standard"
									value={moment.unix(Number(maintenanceDevice?.DateStartUsage)).format('DD/MM/YYYY')}
									label="Giờ bắt đầu sử dụng"
								/>
							</Grid>
							<Grid item xs={12}>
								<Divider />
							</Grid>
							<Grid item xs={12}>
								<TextField
									fullWidth
									InputProps={{}}
									variant="standard"
									label="Mã bảo trì"
									inputProps={{
										value: `${newMaintenance.RepairId !== -1 ? newMaintenance.RepairId : ''}`,
									}}
									disabled
								/>
							</Grid>

							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{}}
									variant="standard"
									label="Nội dung bảo trì"
									inputProps={{
										value: `${newMaintenance.Content}`,
									}}
									onChange={e =>
										setNewMaintenance(prev => ({
											...prev,
											Content: e.target.value,
										}))
									}
								/>
							</Grid>

							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									type="number"
									inputProps={{
										min: 0,
										step: 10000,
										value: `${newMaintenance.Cost}`,
									}}
									variant="standard"
									label="Giá"
									onChange={e =>
										setNewMaintenance(prev => ({
											...prev,
											Cost: Number(e.target.value),
										}))
									}
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									fullWidth
									InputProps={{
										readOnly: true,
									}}
									variant="standard"
									value={newMaintenance.EmployeeName}
									disabled
									label="Người yêu cầu bảo trì"
									onChange={e =>
										setNewMaintenance(prev => ({
											...prev,
											EmployeeName: e.target.value,
										}))
									}
								/>
							</Grid>
							<Grid item sm={6} xs={12}>
								<TextField
									select
									label="Trạng thái"
									fullWidth
									variant="standard"
									value={newMaintenance.Status}
									onChange={e =>
										setNewMaintenance(prev => ({
											...prev,
											Status: e.target.value,
										}))
									}
								>
									{statusList.current.map(option => (
										<MenuItem key={option} value={option}>
											{option}
										</MenuItem>
									))}
								</TextField>
							</Grid>

							<Grid item xs={12}>
								<ButtonGroup variant="contained">
									<Button
										onClick={handleAddMaintenance}
										disabled={
											newMaintenance.Content.trim() === '' ||
											newMaintenance.Status.trim() === '' ||
											loadingSendRequest
										}
									>
										{loadingSendRequest && <CircularProgress color="inherit" size={24} />}
										{!loadingSendRequest && typeRequest === 'POST' && 'Thêm'}
										{!loadingSendRequest && typeRequest === 'PUT' && 'Sửa'}
									</Button>
									<Button
										color="error"
										disabled={!selected.length || loadingSendRequest}
										onClick={handleDeleteMaintenance}
									>
										{loadingSendRequest ? <CircularProgress color="inherit" size={24} /> : 'Xóa'}
									</Button>
								</ButtonGroup>
							</Grid>
						</Grid>

						<TextField
							sx={{
								marginTop: '24px',
								marginBottom: '4px',
							}}
							fullWidth
							size="small"
							type="search"
							placeholder="Tìm kiếm..."
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
						<TableContainer
							component={Paper}
							sx={{
								minHeight: {
									xs: '280px',
								},
							}}
						>
							<Table stickyHeader size="small" sx={{ minWidth: '600px' }}>
								<TableHead>
									<TableRow>
										<TableCell padding="checkbox" sx={{ background: '#d3d3d3' }}>
											<Checkbox
												color="primary"
												indeterminate={
													selected.length > 0 &&
													selected.length < (maintenanceDevice?.listRepair.length || 0)
												}
												checked={
													(maintenanceDevice?.listRepair?.length || 0) > 0 &&
													selected.length === maintenanceDevice?.listRepair?.length
												}
												onChange={handleSelectAllClick}
												inputProps={{
													'aria-label': 'select all desserts',
												}}
											/>
										</TableCell>
										{columns.current?.map(col => (
											<TableCell
												key={col.id}
												sx={{ background: '#d3d3d3', width: `${col?.size}px` }}
												onClick={() => handleRequestSort(col.id)}
											>
												{col.header}{' '}
												<span
													style={{
														fontSize: '16px',
													}}
												>
													{renderArrowSort(order, orderBy, col.id)}
												</span>
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{maintenanceDevice?.listRepair?.length === 0 && (
										<TableRow>
											<TableCell colSpan={7} sx={{ borderBottom: '0', textAlign: 'center' }}>
												<h3 style={{ width: '100%', padding: '16px 0px' }}>Trống</h3>
											</TableCell>
										</TableRow>
									)}
									{maintenanceDevice?.listRepair?.map((device, index) => {
										let isSelect: boolean | undefined =
											selected.find(x => x.RepairId === device.RepairId) !== undefined;

										return (
											<TableRow
												selected={isSelect}
												key={`${device.RepairId}`}
												role="checkbox"
												sx={{ position: 'relative' }}
												onClick={event => handleClick(device)}
											>
												<TableCell padding="checkbox">
													<Checkbox color="primary" checked={isSelect} />
												</TableCell>
												{columns.current.map(col => {
													if (col.id === 'DateCreate')
														return (
															<TableCell key={col.id}>
																{moment
																	.unix(Number(device?.DateCreate))
																	.format('DD/MM/YYYY')}
															</TableCell>
														);
													if (col.id === 'Cost')
														return (
															<TableCell key={col.id}>
																{device.Cost.toLocaleString('vi-VN')}
															</TableCell>
														);
													return (
														<TableCell key={col.id}>{`${
															device[col.id as keyof typeof device]
														}`}</TableCell>
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
					<Box textAlign="center">
						<CircularProgress disableShrink />
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};

const DialogHistoryDevices = ({
	isOpen,
	onClose,
	data,
	loading,
}: DialogProps & {
	data: IDeviceHistory | IInstrumentHistory | null;
	loading: boolean;
}) => {
	const [historyDevice, setHistoryDevice] = useState<IDeviceHistory | IInstrumentHistory | null>(null);
	const [order, setOrder] = useState<string>('asc');
	const [orderBy, setOrderBy] = useState<string>('DeviceId');
	const [keyword, setKeyword] = useState<String | null>(null);
	const [typeTable, setTypeTable] = useState<string>('Giờ sử dụng');
	const typeDeviceTables = useRef<string[]>(['Giờ sử dụng', 'Điều chuyển', 'Bảo trì']);
	const typeInstrumentTables = useRef<string[]>(['Điều chuyển', 'Research', 'Thanh lý']);
	const { deviceType, listDeviceType } = useDeviceOfDepartmentTableStore();

	function isDeviceHistory(obj: any): obj is IDeviceHistory {
		if (obj !== null) return 'SerialNumber' in obj;
		return false;
	}

	function isInstrumentHistory(obj: any): obj is IInstrumentHistory {
		if (obj !== null) return 'InstrumentDeptId' in obj;
		return false;
	}

	useEffect(() => {
		setHistoryDevice(data);
		setKeyword('');
	}, [data]);

	useEffect(() => {
		if (!isOpen) {
			setHistoryDevice(null);
			setKeyword(null);
			setTypeTable('Giờ sử dụng');
			setOrderBy('asc');
		}
	}, [isOpen]);

	const historyDeviceColumns = useRef<(DeviceColumnType & { colSize: ColumnSizeType })[]>([
		{ id: 'DeviceId', header: `Mã ${deviceType}`, colSize: { sm: 3, xs: 12 } },
		{ id: 'SerialNumber', header: 'Số Serial', colSize: { sm: 3, xs: 12 } },
		{ id: 'Model', header: 'Số Model', colSize: { sm: 3, xs: 12 } },
		{ id: 'Origin', header: 'Xuất xứ', colSize: { sm: 3, xs: 12 } },
		{ id: 'DeviceName', header: 'Tên thiết bị', colSize: { sm: 6, xs: 12 } },
		{ id: 'ManufactureName', header: 'Nhà sản xuất', colSize: { sm: 6, xs: 12 } },
		{ id: 'DateReceive', header: 'Ngày nhận', colSize: { sm: 3, xs: 12 }, type: 'date' },
		{ id: 'DateStartUsage', header: 'Ngày sử dụng', colSize: { sm: 3, xs: 12 }, type: 'date' },
		{ id: 'HoursUsageTotal', header: 'Giờ đã sử dụng (giờ)', colSize: { sm: 3, xs: 12 } },
		{ id: 'SuggestId', header: 'SuggestId', colSize: { sm: 3, xs: 12 } },
		{ id: 'Location', header: 'Location', colSize: { sm: 6, xs: 12 } },
		{ id: 'Status', header: 'Trạng thái', colSize: { sm: 6, xs: 12 } },
		{ id: 'Standard', header: 'Qui cách', colSize: { sm: 12, xs: 12 } },
	]);

	const historyInstrumentColumns = useRef<(DeviceColumnType & { colSize: ColumnSizeType })[]>([
		{ id: 'DeviceId', header: `Mã deviceType`, colSize: { sm: 6, xs: 12 } },
		{ id: 'InstrumentDeptId', header: 'InstrumentDeptId', colSize: { sm: 6, xs: 12 } },
		{ id: 'DeviceName', header: `Tên ${deviceType}`, colSize: { xs: 12 } },
		{ id: 'Origin', header: 'Xuất xứ', colSize: { xs: 6 } },
		{ id: 'Unit', header: 'Đơn vị tính', colSize: { xs: 6 } },
		{ id: 'Standard', header: 'Qui cách', colSize: { xs: 12 } },
	]);

	const historyDeviceHourUsageColumns = useRef<DeviceColumnType[]>([
		{
			id: 'Month',
			header: 'Tháng',
		},
		{
			id: 'Year',
			header: 'Năm',
		},
		{
			id: 'HoursUsage',
			header: 'Số giờ',
		},
		{
			id: 'EmployeeName',
			header: 'Nhân viên nhập',
		},
		{
			id: 'DateInput',
			header: 'Ngày nhập',
			type: 'date',
		},
	]);

	const historyDeviceTranferColumns = useRef<DeviceColumnType[]>([
		{ id: 'LabId', header: 'Mã phòng' },
		{ id: 'LabName', header: 'Tên phòng' },
		{ id: 'Location', header: 'Địa chỉ' },
		{ id: 'DateTransfer', header: 'Ngày chuyển', type: 'date' },
		{ id: 'ExportLabId', header: 'Mã phiếu xuất' },
		{ id: 'EmployeeName', header: 'Người chuyển' },
	]);

	const historyDeviceMaintenanceColumns = useRef<DeviceColumnType[]>([
		{ id: 'RepairId', header: 'Mã bảo trì' },
		{ id: 'Content', header: 'Nội dung' },
		{ id: 'Cost', header: 'Giá' },
		{ id: 'DateCreate', header: 'Ngày bảo trì', type: 'date' },
		{ id: 'EmployeeName', header: 'Người yêu cầu bảo trì' },
		{ id: 'Status', header: 'Trạng thái' },
	]);

	const historyInstrumentTranferColumns = useRef<DeviceColumnType[]>([
		{ id: 'TransferId', header: 'EmployeeName' },
		{ id: 'LabId', header: 'LabId' },
		{ id: 'DateTransfer', header: 'Ngày chuyển', type: 'date' },
		{ id: 'LabIdReceive', header: 'LabIdReceive' },
		{ id: 'EmployeeName', header: 'EmployeeName' },
	]);

	const historyInstrumentResearchColumns = useRef<DeviceColumnType[]>([
		{ id: 'EmployeeId', header: 'EmployeeId' },
		{ id: 'EmployeeName', header: 'EmployeeName' },
		{ id: 'Quantity', header: 'Quantity' },
		{ id: 'ExpResearchId', header: 'ExpResearchId' },
	]);

	// const historyLiquitedateResearchColumns = useRef<DeviceColumnType[]>([
	// 	{ id: 'EmployeeId', header: 'EmployeeId' },
	// 	{ id: 'EmployeeName', header: 'EmployeeName' },
	// 	{ id: 'Quantity', header: 'Quantity' },
	// 	{ id: 'ExpResearchId', header: 'ExpResearchId' },
	// ]);

	const handleRequestSort = (property: string) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const getColumnActive = useCallback(
		(type: string) => {
			let headerCol: DeviceColumnType[] = [];
			let list:
				| IRepairDeviceItem[]
				| IDeviceTransferHistoryItem[]
				| IDeviceRecordUsageHours[]
				| IInstrumentTranferItem[]
				| IInstrumentResearchItem[] = [];

			if (deviceType === listDeviceType[0]) {
				switch (type) {
					case typeDeviceTables.current[0]: {
						headerCol = historyDeviceHourUsageColumns.current;
						if (isDeviceHistory(historyDevice)) {
							list =
								historyDevice?.listHourUsage
									.sort(
										(a: IDeviceRecordUsageHours, b: IDeviceRecordUsageHours) =>
											Number(b.DateInput) - Number(a.DateInput),
									)
									.filter(item => {
										if (keyword?.trim() === '') return true;

										let searchString: String = '';

										searchString = nestedObject(item, searchString);
										searchString = removeAccents(searchString.toUpperCase());

										return searchString.includes(`${keyword}`);
									}) || [];
						}
						break;
					}
					case typeDeviceTables.current[1]: {
						headerCol = historyDeviceTranferColumns.current;
						if (isDeviceHistory(historyDevice)) {
							list =
								historyDevice?.listDeviceTransfer
									.sort(
										(a: IDeviceTransferHistoryItem, b: IDeviceTransferHistoryItem) =>
											Number(b.DateTransfer) - Number(a.DateTransfer),
									)
									.filter(item => {
										if (keyword?.trim() === '') return true;

										let searchString: String = '';

										searchString = nestedObject(item, searchString);
										searchString = removeAccents(searchString.toUpperCase());

										return searchString.includes(`${keyword}`);
									}) || [];
						}
						break;
					}
					case typeDeviceTables.current[2]: {
						headerCol = historyDeviceMaintenanceColumns.current;
						if (isDeviceHistory(historyDevice)) {
							list =
								historyDevice?.listMaintenance
									.sort(
										(a: IRepairDeviceItem, b: IRepairDeviceItem) =>
											Number(b.DateCreate) - Number(a.DateCreate),
									)
									.filter(item => {
										if (keyword?.trim() === '') return true;

										let searchString: String = '';
										searchString = nestedObject(item, searchString);
										searchString = removeAccents(searchString.toUpperCase());

										return searchString.includes(`${keyword}`);
									}) || [];
						}
						break;
					}
					default:
						break;
				}
			}

			if (deviceType !== listDeviceType[0]) {
				switch (type) {
					case typeInstrumentTables.current[0]: {
						headerCol = historyInstrumentTranferColumns.current;
						if (isInstrumentHistory(historyDevice)) {
							list =
								historyDevice?.listInstrumentTranfer
									.sort(
										(a: IInstrumentTranferItem, b: IInstrumentTranferItem) =>
											Number(b.DateTransfer) - Number(a.DateTransfer),
									)
									.filter(item => {
										if (keyword?.trim() === '') return true;

										let searchString: String = '';
										searchString = nestedObject(item, searchString);
										searchString = removeAccents(searchString.toUpperCase());

										return searchString.includes(`${keyword}`);
									}) || [];
						}
						break;
					}
					case typeInstrumentTables.current[1]: {
						headerCol = historyInstrumentResearchColumns.current;
						if (isInstrumentHistory(historyDevice)) {
							list =
								historyDevice?.listInstrumentResearch
									.sort((a: IInstrumentResearchItem, b: IInstrumentResearchItem) => {
										if (a.ExpResearchId < b.ExpResearchId) {
											return -1;
										}
										if (a.ExpResearchId > b.ExpResearchId) {
											return 1;
										}
										return 0;
									})
									.filter(item => {
										if (keyword?.trim() === '') return true;

										let searchString: String = '';
										searchString = nestedObject(item, searchString);
										searchString = removeAccents(searchString.toUpperCase());

										return searchString.includes(`${keyword}`);
									}) || [];
						}
						break;
					}
					default:
						break;
				}
			}

			list = list.sort((a, b) => {
				let i: any =
					order === 'desc'
						? descendingComparator<any>(a, b, orderBy)
						: -descendingComparator<any>(a, b, orderBy);
				return i;
			});

			return { headerCol, list };
		},
		[order, orderBy, keyword],
	);

	const renderTableHeader = (type: string) => {
		let { headerCol } = getColumnActive(type);

		return headerCol?.map(col => (
			<TableCell
				key={col.id}
				sx={{ background: '#d3d3d3', width: `${col?.size}px` }}
				onClick={() => handleRequestSort(col.id)}
			>
				{col.header}{' '}
				<span
					style={{
						fontSize: '16px',
					}}
				>
					{renderArrowSort(order, orderBy, col.id)}
				</span>
			</TableCell>
		));
	};

	const renderTableBody = (type: string) => {
		const { headerCol, list } = getColumnActive(type);

		return (
			<>
				{list?.length === 0 && (
					<TableRow>
						<TableCell colSpan={headerCol.length} sx={{ borderBottom: '0', textAlign: 'center' }}>
							<h3 style={{ width: '100%', padding: '16px 0px' }}>Trống</h3>
						</TableCell>
					</TableRow>
				)}
				{list?.map((device, index) => {
					return (
						<TableRow key={`${index}`} sx={{ position: 'relative' }}>
							{headerCol.map(col => {
								if (col.type === 'date')
									return (
										<TableCell key={col.id}>
											{moment
												.unix(Number(device[col.id as keyof typeof device]))
												.format('DD/MM/YYYY')}
										</TableCell>
									);
								if (col.id === 'Cost')
									return (
										<TableCell key={col.id}>
											{Number(device[col.id as keyof typeof device]).toLocaleString('vi-VN')}
										</TableCell>
									);
								return (
									<TableCell key={col.id}>{`${
										device[col.id as keyof typeof device] === null
											? ''
											: device[col.id as keyof typeof device]
									}`}</TableCell>
								);
							})}
						</TableRow>
					);
				})}
			</>
		);
	};

	const renderStaticField = () => {
		let fields: (DeviceColumnType & { colSize: ColumnSizeType })[] =
			deviceType === listDeviceType[0] ? historyDeviceColumns.current : historyInstrumentColumns.current;

		return fields.map(col => {
			if (col.type === 'date')
				return (
					<Grid item {...col.colSize} key={col.id}>
						<TextField
							fullWidth
							InputProps={{
								readOnly: true,
							}}
							variant="standard"
							value={moment
								.unix(
									Number(
										historyDevice !== null && historyDevice[col.id as keyof typeof historyDevice],
									),
								)
								.format('DD/MM/YYYY')}
							label={col.header}
						/>
					</Grid>
				);

			if (col.id === 'Standard')
				return (
					<Grid item {...col.colSize} key={col.id}>
						<TextField
							fullWidth
							multiline
							rows={2}
							InputProps={{
								readOnly: true,
							}}
							variant="standard"
							value={
								historyDevice !== null && (historyDevice[col.id as keyof typeof historyDevice] || ' ')
							}
							label={col.header}
						/>
					</Grid>
				);
			return (
				<Grid item {...col.colSize} key={col.id}>
					<TextField
						fullWidth
						InputProps={{
							readOnly: true,
						}}
						variant="standard"
						value={historyDevice !== null && (historyDevice[col.id as keyof typeof historyDevice] || ' ')}
						label={col.header}
					/>
				</Grid>
			);
		});
	};

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Lịch sử thiết bị</b>

				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				{!loading ? (
					<>
						<Grid container spacing={2}>
							{renderStaticField()}
							<Grid item xs={12}>
								<Divider />
							</Grid>
						</Grid>

						<Grid container spacing={2} my={1}>
							<Grid item xs={12} sm={6}>
								<TextField
									sx={{
										height: '100%',
										alignItems: 'flex-end',
										justifyContent: 'end',
									}}
									fullWidth
									type="search"
									size="small"
									placeholder="Tìm kiếm...."
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
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									select
									label="Loại"
									fullWidth
									variant="standard"
									defaultValue={
										deviceType === listDeviceType[0]
											? typeDeviceTables.current[0]
											: typeDeviceTables.current[0]
									}
									onChange={e => {
										setTypeTable(e.target.value);
									}}
								>
									{deviceType === listDeviceType[0] &&
										typeDeviceTables.current.map(option => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
									{deviceType !== listDeviceType[0] &&
										typeInstrumentTables.current.map(option => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
								</TextField>
							</Grid>
						</Grid>

						<TableContainer
							component={Paper}
							sx={{
								minHeight: {
									xs: '280px',
								},
							}}
						>
							<Table stickyHeader size="small" sx={{ minWidth: '600px' }}>
								<TableHead>{<TableRow>{renderTableHeader(typeTable)}</TableRow>}</TableHead>
								{<TableBody>{renderTableBody(typeTable)}</TableBody>}
							</Table>
						</TableContainer>
					</>
				) : (
					<Box textAlign="center">
						<CircularProgress disableShrink />
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
};

const DialogImportDeviceInfo = ({ isOpen, onClose }: DialogProps) => {
	const dataGridRef = useRef<DataGrid<any, any> | null>(null);
	const [openAutocomplete, setOpenAutocomplete] = useState<boolean>(false);
	const [listDevice, setListDevice] = useState<IDeviceInfo[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<IDeviceInfo | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [listInfo, setListInfo] = useState<(IDeviceInfoItem & { Id: String })[]>([]);
	const [selectedRows, setSelectedRows] = useState<any[]>([]);
	const dispatch = useAppDispatch()

	const handleInitRow = (e: any) => {
		let data = e.component.getDataSource().items();
		if (data.length > 0) {
			let lastItem = data.slice(-1);
			e.data = {
				DeviceInfoId: '',
				SerialNumber: '',
				ManufacturingDate: lastItem[0].ManufacturingDate,
				StartGuarantee: lastItem[0].StartGuarantee,
				EndGuarantee: lastItem[0].EndGuarantee,
				DateStartUsage: lastItem[0].DateStartUsage,
				HoursUsageTotal: lastItem[0].HoursUsageTotal || 0,
				PeriodicMaintenance: lastItem[0].PeriodicMaintenance || 3,
				Status: 'Bình thường',
			};
		} else {
			e.data = {
				DeviceInfoId: '',
				SerialNumber: '',
				ManufacturingDate: 1638511200000,
				StartGuarantee: 1638511200000,
				EndGuarantee: 1638511200000,
				DateStartUsage: 1638511200000,
				HoursUsageTotal: 0,
				PeriodicMaintenance: 3,
				Status: 'Bình thường',
			};
		}
	};

	useEffect(() => {
		(async () => {
			try {
				let list: IDeviceInfo[] = await getDeviceInfoes();

				setListDevice(list);
			} catch (err) {
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (selectedDevice !== null) {
			setListInfo(
				selectedDevice.listDeviceInfo.map(x => {
					let item: IDeviceInfoItem & { Id: String } = {
						Id: x.DeviceInfoId,
						DeviceInfoId: x.DeviceInfoId,
						SerialNumber: x.SerialNumber,
						ManufacturingDate: Number(x.ManufacturingDate) * 1000,
						StartGuarantee: Number(x.StartGuarantee) * 1000,
						EndGuarantee: Number(x.EndGuarantee) * 1000,
						DateStartUsage: Number(x.DateStartUsage) * 1000,
						HoursUsageTotal: x.HoursUsageTotal,
						PeriodicMaintenance: x.PeriodicMaintenance,
						Status: x.Status,
					};
					return item;
				}) || [],
			);
		}
	}, [selectedDevice]);

	useEffect(() => {
		loadMessages(viMessages);
	}, []);

	const renderHeader = (data: any, isRequired: boolean = false) => {
		return (
			<b style={{ color: 'black' }}>
				{data.column.caption} {isRequired && <span style={{ color: 'red' }}>*</span>}
			</b>
		);
	};

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: listInfo,
				key: 'Id',
			}),
		});
	}, [listInfo])

	const handleSave = async (changes: any[]) => {

		let inserts = changes.filter(x => x.type === "insert")
		let updates = changes.filter(x => x.type === "update")

		if(inserts.length > 0) {
			try {
				let create: IDeviceInfoItem[] = inserts.map(({data}) => {
					let item: IDeviceInfoItem = {
						DeviceInfoId: data.DeviceInfoId,
						SerialNumber: data.SerialNumber,
						ManufacturingDate: data.ManufacturingDate > 0 ? `${Number(data.ManufacturingDate) / 1000}` : null,
						StartGuarantee: data.StartGuarantee > 0 ? `${Number(data.StartGuarantee) / 1000}` : null,
						EndGuarantee: data.EndGuarantee > 0 ? `${Number(data.EndGuarantee) / 1000}` : null,
						DateStartUsage: data.DateStartUsage > 0 ? `${Number(data.DateStartUsage) / 1000}` : null,
						HoursUsageTotal: data.HoursUsageTotal || 0,
						PeriodicMaintenance: data.PeriodicMaintenance || 0,
						Status: data.Status,
					}
					return item
				});
				
	
				await postDeviceInfoes([
					{
						listDeviceInfo: create,
						DeviceDetailId: selectedDevice?.DeviceDetailId || '',
					},
				]);

				dispatch(
					setSnackbar({
						message: 'Thêm thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
			} catch(err) {
				inserts.forEach(({key}) => {	
					dataSource.store().remove(key)
				})

				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				);
			}
		}

		if(updates.length > 0) {
			try {
				let edit: IDeviceInfoItem[] = updates.map(({data}) => {
					let item: IDeviceInfoItem = {
						DeviceInfoId: data.DeviceInfoId,
						SerialNumber: data.SerialNumber,
						ManufacturingDate: data.ManufacturingDate > 0 ? `${Number(data.ManufacturingDate) / 1000}` : null,
						StartGuarantee: data.StartGuarantee > 0 ? `${Number(data.StartGuarantee) / 1000}` : null,
						EndGuarantee: data.EndGuarantee > 0 ? `${Number(data.EndGuarantee) / 1000}` : null,
						DateStartUsage: data.DateStartUsage > 0 ? `${Number(data.DateStartUsage) / 1000}` : null,
						HoursUsageTotal: data.HoursUsageTotal || 0,
						PeriodicMaintenance: data.PeriodicMaintenance || 0,
						Status: data.Status,
					}
					return item
				});
				
	
				await putDeviceInfoes(
					{
						listDeviceInfo: edit,
						DeviceDetailId: selectedDevice?.DeviceDetailId || '',
					},
				);

				dispatch(
					setSnackbar({
						message: 'Sửa thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
			} catch(err) {
				updates.forEach(({key}) => {	
					dataSource.store().remove(key)
				})

				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				);
			}
		}

	};

	const handleDelete = async () => {
		let deleteRows: any[] = selectedRows.map(x => {
			return {
				DeviceInfoId: x.DeviceInfoId,
				SerialNumber: x.SerialNumber,
				ManufacturingDate: x.ManufacturingDate > 0 ? `${Number(x.ManufacturingDate) / 1000}` : null,
				StartGuarantee: x.StartGuarantee > 0 ? `${Number(x.StartGuarantee) / 1000}` : null,
				EndGuarantee: x.EndGuarantee > 0 ? `${Number(x.EndGuarantee) / 1000}` : null,
				DateStartUsage: x.DateStartUsage > 0 ? `${Number(x.DateStartUsage) / 1000}` : null,
				HoursUsageTotal: x.HoursUsageTotal,
				PeriodicMaintenance: x.PeriodicMaintenance,
				Status: x.Status,
			};
		});
		if (deleteRows.length > 0 && selectedDevice !== null) {
			try {
				await deleteDeviceInfoes({
					listDeviceInfo: deleteRows,
					DeviceDetailId: selectedDevice?.DeviceDetailId,
				});

				selectedRows.forEach(key => {
					dataSource.store().remove(key?.Id)
				});

				setSelectedRows([]);
				dataSource.reload();

				dispatch(
					setSnackbar({
						message: 'Xóa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
			} catch (error) {
				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				);
			}
		}
	};

	return (
		<Dialog open={isOpen} onClose={onClose} fullScreen PaperProps={{ style: { maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Nhập thông tin thiết bị</b>

				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Box py={1}>
					<Autocomplete
						open={openAutocomplete}
						onOpen={() => {
							setOpenAutocomplete(true);
						}}
						onClose={() => {
							setOpenAutocomplete(false);
						}}
						sx={{
							marginBottom: '10px'
						}}
						isOptionEqualToValue={(option, value) => option.DeviceDetailId === value.DeviceDetailId}
						getOptionLabel={option => `${option.DeviceDetailId}`}
						options={listDevice}
						loading={loading}
						onChange={(e, value) => {
							setSelectedDevice(value);
						}}
						renderInput={params => (
							<TextField
								{...params}
								label="Thiết bị..."
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<Fragment>
											{loading ? <CircularProgress color="inherit" size={20} /> : null}
											{params.InputProps.endAdornment}
										</Fragment>
									),
								}}
							/>
						)}
					/>
					<div id="data-grid">
						<DataGrid
							ref={dataGridRef}
							id="gridContainer"
							dataSource={dataSource}
							showBorders={true}
							onInitNewRow={handleInitRow}
							selectedRowKeys={selectedRows.map(x => x.Id)}
							onSelectionChanged={data => {
								setSelectedRows(data.selectedRowsData);
							}}
	
							onSaved={data => {
								handleSave(data.changes)
							}}
						>
							<Selection mode="multiple" />
							<Paging enabled={false} />
							<Editing mode="form" allowUpdating={true} allowAdding={true} />
	
							<Column
								dataField="DeviceInfoId"
								caption="Mã thông tin TB"
								headerCellRender={data => renderHeader(data, true)}
							>
								<RequiredRule />
							</Column>
							<Column
								dataField="SerialNumber"
								caption="Số Serial"
								headerCellRender={data => renderHeader(data, true)}
							>
								<RequiredRule />
							</Column>
							<Column
								dataField="ManufacturingDate"
								caption="Ngày sản xuất"
								dataType="date"
								headerCellRender={data => renderHeader(data)}
								format="dd/MM/yyyy"
							></Column>
							<Column
								dataField="StartGuarantee"
								caption="Bắt đầu bảo hành"
								dataType="date"
								headerCellRender={data => renderHeader(data)}
								format="dd/MM/yyyy"
							></Column>
							<Column
								dataField="EndGuarantee"
								caption="Kết thúc bảo hành"
								dataType="date"
								headerCellRender={data => renderHeader(data)}
								format="dd/MM/yyyy"
							></Column>
							<Column
								dataField="DateStartUsage"
								caption="Ngày sử dụng"
								dataType="date"
								headerCellRender={data => renderHeader(data)}
								format="dd/MM/yyyy"
								cellRender={cell => {
									if (!cell.data?.DateStartUsage) return <p style={{ margin: '0	' }}></p>;
									return <p style={{ margin: '0	' }}>{cell.text}</p>;
								}}
							></Column>
							<Column
								dataField="HoursUsageTotal"
								caption="Giờ sử dụng"
								dataType="number"
								headerCellRender={data => renderHeader(data)}
							></Column>
							<Column
								dataField="PeriodicMaintenance"
								caption="Bảo trì định kì (tháng)"
								dataType="number"
								headerCellRender={data => renderHeader(data)}
							></Column>
							<Column dataField="Status" caption="Trạng thái" headerCellRender={data => renderHeader(data)}>
								<RequiredRule />
							</Column>
							<DevToolbar>
								<Item name="addRowButton" showText="always" />
								<Item location="after" disabled={!selectedRows.length}>
									<DevButton icon="trash" text="Xóa hàng đã chọn" onClick={handleDelete} />
								</Item>
							</DevToolbar>
						</DataGrid>
					</div>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export {
	DialogCreate,
	DialogDelete,
	DialogEdit,
	DialogDeviceUsageHours,
	DialogMaintenanceDevice,
	DialogHistoryDevices,
	DialogImportDeviceInfo,
};
