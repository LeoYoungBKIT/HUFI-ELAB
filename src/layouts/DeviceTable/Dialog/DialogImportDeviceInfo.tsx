import CloseIcon from '@mui/icons-material/Close';
import {
	Autocomplete,
	Box,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
} from '@mui/material';
import DataGrid, {
	Button,
	Column,
	ColumnChooser,
	ColumnFixing,
	Toolbar as DevToolbar,
	Editing,
	FilterRow,
	Grouping,
	HeaderFilter,
	Item,
	Pager,
	Paging,
	RequiredRule,
	SearchPanel,
	Selection,
} from 'devextreme-react/data-grid';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { colorsNotifi } from '../../../configs/color';
import { useAppDispatch } from '../../../hooks';
import { setSnackbar } from '../../../pages/appSlice';

import { loadMessages } from 'devextreme/localization';

import DevButton from 'devextreme-react/button';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import viMessages from '../../../configs/devextreme_vi.json';
import {
	deleteDeviceInfoes,
	getDeviceInfoes,
	postDeviceInfoes,
	putDeviceInfoes,
} from '../../../services/deviceInfoServices';
import { IDeviceInfo, IDeviceInfoItem } from '../../../types/deviceInfoType';
import { DialogProps } from './DialogType';

export const renderHeader = (data: any, isRequired: boolean = false) => {
	return (
		<b style={{ color: 'black' }}>
			{data.column.caption} {isRequired && <span style={{ color: 'red' }}>*</span>}
		</b>
	);
};

const DialogImportDeviceInfo = ({ isOpen, onClose, deviceInfo }: DialogProps & { deviceInfo: String }) => {
	const dataGridRef = useRef<DataGrid<any, any> | null>(null);
	const [openAutocomplete, setOpenAutocomplete] = useState<boolean>(false);
	const [listDevice, setListDevice] = useState<IDeviceInfo[]>([]);
	const [selectedDevice, setSelectedDevice] = useState<IDeviceInfo | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [listInfo, setListInfo] = useState<(IDeviceInfoItem & { Id: String })[]>([]);
	const [selectedRows, setSelectedRows] = useState<any[]>([]);
	const [isAllowEdit, setIsAllowEdit] = useState<boolean>(false)
	const dispatch = useAppDispatch();

	const handleInitRow = (e: any) => {
		let data = e.component.getDataSource().items();
		setIsAllowEdit(true);
		if (data.length > 0) {
			let lastItem = data.slice(-1);
			console.log(lastItem);
			e.data = {
				DeviceInfoId: '',
				SerialNumber: '',
				ManufacturingDate: lastItem[0].ManufacturingDate || Number(new Date()),
				StartGuarantee: lastItem[0].StartGuarantee || Number(new Date()),
				EndGuarantee: lastItem[0].EndGuarantee || Number(new Date()),
				DateStartUsage: lastItem[0].DateStartUsage || Number(new Date()),
				HoursUsageTotal: lastItem[0].HoursUsageTotal || 0,
				PeriodicMaintenance: lastItem[0].PeriodicMaintenance || 3,
				Status: 'Bình thường',
			};
		} else {
			e.data = {
				DeviceInfoId: '',
				SerialNumber: '',
				ManufacturingDate: Number(new Date()),
				StartGuarantee: Number(new Date()),
				EndGuarantee: Number(new Date()),
				DateStartUsage: Number(new Date()),
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
				let indexOfSelectedDevice = list.findIndex(x => x.DeviceDetailId === deviceInfo);
				if (indexOfSelectedDevice !== -1) setSelectedDevice(list[indexOfSelectedDevice]);
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

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: listInfo,
				key: 'Id',
			}),
		});
	}, [listInfo]);

	const handleSave = async (changes: any[]) => {
		let inserts = changes.filter(x => x.type === 'insert');
		let updates = changes.filter(x => x.type === 'update');
		setIsAllowEdit(false);
		if (inserts.length > 0) {
			try {
				let create: IDeviceInfoItem[] = inserts.map(({ data }) => {
					let item: IDeviceInfoItem = {
						DeviceInfoId: data.DeviceInfoId,
						SerialNumber: data.SerialNumber,
						ManufacturingDate:
							data.ManufacturingDate > 0 ? `${Number(data.ManufacturingDate) / 1000}` : null,
						StartGuarantee: data.StartGuarantee > 0 ? `${Number(data.StartGuarantee) / 1000}` : null,
						EndGuarantee: data.EndGuarantee > 0 ? `${Number(data.EndGuarantee) / 1000}` : null,
						DateStartUsage: data.DateStartUsage > 0 ? `${Number(data.DateStartUsage) / 1000}` : null,
						HoursUsageTotal: data.HoursUsageTotal || 0,
						PeriodicMaintenance: data.PeriodicMaintenance || 0,
						Status: data.Status,
					};
					return item;
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
			} catch (err) {
				inserts.forEach(({ key }) => {
					dataSource.store().remove(key);
				});

				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				);
			}
		}

		if (updates.length > 0) {
			try {
				let edit: IDeviceInfoItem[] = updates.map(({ data }) => {
					let item: IDeviceInfoItem = {
						DeviceInfoId: data.DeviceInfoId,
						SerialNumber: data.SerialNumber,
						ManufacturingDate:
							data.ManufacturingDate > 0 ? `${Number(data.ManufacturingDate) / 1000}` : null,
						StartGuarantee: data.StartGuarantee > 0 ? `${Number(data.StartGuarantee) / 1000}` : null,
						EndGuarantee: data.EndGuarantee > 0 ? `${Number(data.EndGuarantee) / 1000}` : null,
						DateStartUsage: data.DateStartUsage > 0 ? `${Number(data.DateStartUsage) / 1000}` : null,
						HoursUsageTotal: data.HoursUsageTotal || 0,
						PeriodicMaintenance: data.PeriodicMaintenance || 0,
						Status: data.Status,
					};
					return item;
				});

				await putDeviceInfoes({
					listDeviceInfo: edit,
					DeviceDetailId: selectedDevice?.DeviceDetailId || '',
				});

				dispatch(
					setSnackbar({
						message: 'Sửa thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				);
			} catch (err) {
				updates.forEach(({ key }) => {
					dataSource.store().remove(key);
				});

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
					dataSource.store().remove(key?.Id);
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
				<Box py={1} height="100%" display="flex" flexDirection="column" overflow="hidden">
					<Autocomplete
						open={openAutocomplete}
						onOpen={() => {
							setOpenAutocomplete(true);
						}}
						onClose={() => {
							setOpenAutocomplete(false);
						}}
						sx={{
							marginBottom: '10px',
						}}
						isOptionEqualToValue={(option, value) => option.DeviceDetailId === value.DeviceDetailId}
						getOptionLabel={option => `${option.DeviceDetailId}`}
						options={listDevice}
						loading={loading}
						value={selectedDevice}
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
					<div id="data-grid" style={{ height: '100%', width: '100%', overflowX: 'auto' }}>
						<DataGrid
							ref={dataGridRef}
							id="gridContainer"
							dataSource={dataSource}
							showBorders={true}
							onInitNewRow={handleInitRow}
							selectedRowKeys={selectedRows.map(x => x.Id)}
							columnAutoWidth={true}
							allowColumnResizing={true}
							columnResizingMode="widget"
							onSelectionChanged={data => {
								setSelectedRows(data.selectedRowsData);
							}}
							onSaved={data => {
								handleSave(data.changes);
							}}
							onEditCanceled={() => setIsAllowEdit(false)}
							loadPanel={{
								enabled: true,
							}}
							elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 800px' }}
						>
							<Selection mode="multiple" showCheckBoxesMode="always" />
							<HeaderFilter visible={true} />
							<ColumnFixing enabled={false} />
							<Grouping contextMenuEnabled={true} expandMode="rowClick" />
							<Pager
								allowedPageSizes={true}
								showInfo={true}
								showNavigationButtons={true}
								showPageSizeSelector={true}
								visible={true}
							/>
							<Paging defaultPageSize={30} />
							<ColumnChooser enabled={true} mode="select" />
							<FilterRow visible={true} applyFilter={true} />
							<Editing mode="form" allowUpdating={true} allowAdding={true} useIcons={true} />
							<SearchPanel visible={true} width={240} placeholder="Tìm kiếm..." />

							<Column
								dataField="DeviceInfoId"
								caption="Mã thông tin TB"
								headerCellRender={data => renderHeader(data, true)}
								allowEditing={isAllowEdit}
							>
								<RequiredRule />
							</Column>
							<Column
								dataField="SerialNumber"
								caption="Số Serial"
								headerCellRender={data => renderHeader(data, true)}
								allowEditing={isAllowEdit}
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
									if (!cell.data?.DateStartUsage) return <p style={{ margin: '0' }}></p>;
									return <p style={{ margin: '0' }}>{cell.text}</p>;
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
								caption="Bảo trì định kỳ (tháng)"
								dataType="number"
								headerCellRender={data => renderHeader(data)}
							></Column>
							<Column
								dataField="Status"
								caption="Trạng thái"
								headerCellRender={data => renderHeader(data)}
							>
								<RequiredRule />
							</Column>
							<Column type="buttons" fixed={true}>
								<Button icon="edit" name="edit" />
							</Column>
							<DevToolbar>
								<Item name="addRowButton" showText="always" />
								<Item location="after" disabled={!selectedRows.length}>
									<DevButton icon="trash" text="Xóa hàng đã chọn" onClick={handleDelete} />
								</Item>
								<Item name="searchPanel" />
							</DevToolbar>
						</DataGrid>
					</div>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default DialogImportDeviceInfo;
