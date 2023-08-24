import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogContent, DialogTitle, IconButton, Paper, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'

import Button from 'devextreme-react/button'
import DataGrid, {
	Column,
	ColumnChooser,
	ColumnFixing,
	Button as DevButtonGrid,
	FilterPanel,
	FilterRow,
	Grouping,
	HeaderFilter,
	Item,
	LoadPanel,
	Pager,
	Paging,
	Position,
	Toolbar,
} from 'devextreme-react/data-grid'
import LoadIndicator from 'devextreme-react/load-indicator'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { uniqueId } from 'lodash'
import moment from 'moment'
import {
	ADMIN,
	EQUIPMENT_MANAGEMENT_HEAD,
	EXPERIMENTAL_MANAGEMENT_HEAD,
	EXPERIMENTAL_MANAGEMENT_SPECIALIST,
	UNIT_UTILIZATION_HEAD,
	UNIT_UTILIZATION_SPECIALIST,
} from '../../configs/permissions'
import { useLoading } from '../../hooks/useLoading'
import { getDevices } from '../../services/deviceDepartmentServices'
import { IDeviceDepartmentType } from '../../types/deviceDepartmentType'
import { DialogDeviceUsageHours, DialogRepairDevice } from './Dialog'
import DeviceCategory from './Dialog/DialogEditDevice'

type DeviceColumnType = {
	id: string
	header: String
	type?: string
	data?: any
	size?: number
	renderValue?: (...args: any[]) => String
	hide?: boolean
}

export function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const DeviceOfDepartmentTable = () => {
	const dispatch = useAppDispatch()
	const [selectedDevice, setSelectedDevice] = useState<IDeviceDepartmentType>()
	const [popupEditVisible, setPopupEditVisible] = useState<boolean>(false)
	const [devices, setDevices] = useState<IDeviceDepartmentType[]>([])
	const owner = useAppSelector(selector => selector.userManager.owner)

	const [getDeviceData, isLoadingGetDevices] = useLoading(async () => {
		try {
			const data: IDeviceDepartmentType[] = await getDevices()
			setDevices(data)
		} catch (error) {
			console.log(error)
		}
	})

	useEffect(() => {
		getDeviceData().catch(console.error)
	}, [])

  const columns = useRef<DeviceColumnType[]>([
    { id: "DeviceId", header: "Mã thiết bị" },
    { id: "DeviceName", header: "Tên thiết bị" },
    { id: "DeviceEnglishName", header: "Tên tiếng anh" },
    {
      id: "QuantityImport",
      header: "SL nhập",
    },
    {
      id: "QuantityDistribute",
      header: "SL phân phối",
    },
    {
      id: "QuantityExport",
      header: "SL xuất",
    },
    {
      id: "QuantityAvailable",
      header: "SL hiện có",
    },
  ]);

  const dataGridRef = useRef<DataGrid<any, any> | null>(null);

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: (devices || []).map(x => ({ ...x, Id: uniqueId('Device_') })),
				key: 'Id',
			}),
		})
	}, [devices])

	const handleRefresh = () => {
		getDeviceData().catch(console.error)
	}

	return (
		<>
			<Paper
				sx={{
					marginBottom: '24px',
					overflow: 'overlay',
					flex: '1',
					padding: '16px',
					boxShadow: 'none',
					border: 'none',
				}}
			>
				<DataGrid
					dataSource={dataSource}
					ref={dataGridRef}
					showBorders={true}
					columnAutoWidth={true}
					allowColumnResizing={true}
					columnResizingMode="widget"
					columnMinWidth={60}
					searchPanel={{
						visible: true,
						width: 300,
						placeholder: 'Tìm kiếm',
					}}
					editing={{
						confirmDelete: true,
						allowDeleting: true,
						allowAdding: true,
						allowUpdating: true,
					}}
					elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
					wordWrapEnabled={true}
					repaintChangesOnly={true}
				>
					<ColumnChooser enabled={true} mode="select">
						<Position my="right top" at="right top" of=".dx-datagrid-column-chooser-button" />
					</ColumnChooser>
					<Paging enabled={false} />
					<FilterRow visible={true} applyFilter={true} />
					<HeaderFilter visible={true} />
					<ColumnFixing enabled={false} />
					<Grouping contextMenuEnabled={true} expandMode="rowClick" />
					<FilterPanel visible={true} />
					<Pager
						allowedPageSizes={true}
						showInfo={true}
						showNavigationButtons={true}
						showPageSizeSelector={true}
						visible={true}
					/>
					<LoadPanel enabled={true} showPane={isLoadingGetDevices} />
					<Paging defaultPageSize={30} />
					{columns.current.map(col => (
						<Column
							key={col.id}
							dataField={col.id}
							dataType="string"
							caption={col.header}
							cellRender={data => (
								<span>
									{Number(data.text) && col?.type === 'date'
										? moment.unix(Number(data.text)).format('DD/MM/YYYY')
										: data.text}
								</span>
							)}
						/>
					))}

					<Column type="buttons" width={60} fixed={true}>
						<DevButtonGrid
							icon="chevrondown"
							onClick={(e: any) => {
								setSelectedDevice(e.row.data)
							}}
						/>
					</Column>
					<Toolbar>
						<Item location="before">
							<Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
								Thiết bị
							</Typography>
						</Item>
						<Item location="after">
							<Button
								stylingMode="contained"
								type="default"
								disabled={isLoadingGetDevices}
								onClick={handleRefresh}
							>
								<LoadIndicator
									id="small-indicator"
									height={20}
									width={20}
									visible={isLoadingGetDevices}
									elementAttr={{ class: 'indicator-white' }}
								/>
								Làm mới
							</Button>
						</Item>
						{[ADMIN, EQUIPMENT_MANAGEMENT_HEAD].includes(owner.GroupName) && (
							<Item location="after">
								<Button stylingMode="contained" onClick={() => setPopupEditVisible(true)} icon="add" />
							</Item>
						)}
						<Item name="columnChooserButton" />
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</Paper>

			{selectedDevice && (
				<RowDevice
					device={selectedDevice}
					isOpen={!!selectedDevice}
					handleClose={() => setSelectedDevice(undefined)}
				/>
			)}
			{popupEditVisible && (
				<DeviceCategory isOpen={popupEditVisible} onClose={() => setPopupEditVisible(false)} />
			)}
		</>
	)
}

type RowDeviceProps = {
  device: IDeviceDepartmentType;
  isOpen: boolean;
  handleClose: () => void;
};

const RowDevice = ({ device, isOpen, handleClose }: RowDeviceProps) => {
	const dataGridRef = useRef<DataGrid<any, any> | null>(null)
	const [isOpenDeviceUsageHours, setIsOpenDeviceUsageHours] = useState<boolean>(false)
	const [deviceInfoId, setDeviceInfoId] = useState<string>('')
	const [isOpenDeviceRepair, setIsOpenDeviceRepair] = useState<boolean>(false)
	const owner = useAppSelector(selector => selector.userManager.owner)

	const handleCloseDeviceRepairDialog = () => {
		setIsOpenDeviceRepair(false)
	}

  const handleCloseDeviceUsageHoursDialog = () => {
    setIsOpenDeviceUsageHours(false);
  };

	const handleOpenDeviceUsageHoursDialog = (deviceInfoId: String) => {
		setDeviceInfoId(`${deviceInfoId}`)
		setIsOpenDeviceUsageHours(true)
	}

	const handleOpenDeviceRepairDialog = (deviceInfoId: String) => {
		setDeviceInfoId(`${deviceInfoId}`)
		setIsOpenDeviceRepair(true)
	}

  const dataSource = useMemo(() => {
    return new DataSource({
      store: new ArrayStore({
        data: (device?.listDeviceInfo || []).map((x) => ({
          ...x,
          Id: uniqueId("DeviceDetail_"),
        })),
        key: "Id",
      }),
    });
  }, [device]);

	const [commonFieldsShow, setCommonFieldShow] = useState([
		{ id: 'DeviceId', header: 'Mã thiết bị', fixed: true },
		{ id: 'DeviceInfoId', header: 'Mã định danh thiết bị', fixed: true },
		{ id: 'DeviceName', header: 'Tên thiết bị', fixed: true, width: 240 },
		{ id: 'DeviceEnglishName', header: 'Tên tiếng anh' },
		{ id: 'Model', header: 'Số Model' },
		{ id: 'SerialNumber', header: 'Số Serial' },
		{ id: 'Specification', header: 'Thông số kỹ thuật', width: 240 },
		{ id: 'Manufacturer', header: 'Hãng sản xuất' },
		{ id: 'Origin', header: 'Xuất xứ' },
		{ id: 'SupplierName', header: 'Nhà cung cấp', width: 240 },
		{ id: 'Unit', header: 'Đvt' },
		{ id: 'QuantityImport', header: 'SL nhập' },
		{ id: 'QuantityDistribute', header: 'SL phân phối' },
		{ id: 'QuantityExport', header: 'SL xuất' },
		{ id: 'QuantityAvailable', header: 'SL hiện có' },
		{ id: 'DepartmentImportName', header: 'Đơn vị nhập' },
		{ id: 'DateImport', header: 'Ngày nhập', type: 'date' },
		{ id: 'YearStartUsage', header: 'Năm đưa vào sử dụng' },
		{
			id: 'StartGuarantee',
			header: 'Thời gian bắt đầu bảo hành',
			type: 'date',
		},
		{ id: 'EndGuarantee', header: 'Thời gian kết thúc bảo hành', type: 'date' },
		{
			id: 'PeriodicMaintenance',
			header: 'Chu kỳ hiệu chuẩn/bảo trì định kỳ',
		},
		{ id: 'Status', header: 'Tình trạng' },
		{
			id: 'DepartmentMaintenanceName',
			header: 'Đơn vị phụ trách hiệu chuẩn – bảo trì/sửa chữa',
			width: 240,
		},
	])

	return (
		<>
			<Dialog
				scroll="paper"
				open={isOpen}
				onClose={handleClose}
				fullScreen
				PaperProps={{ style: { maxWidth: 'unset' } }}
			>
				<DialogTitle textAlign="left">
					<b>
						Chi tiết thiết bị - {device.DeviceId} - {device.DeviceName}
					</b>

					<IconButton
						aria-label="close"
						onClick={handleClose}
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
					<Box pb={5} height="100%">
						<DataGrid
							dataSource={dataSource}
							ref={dataGridRef}
							showBorders={true}
							columnAutoWidth={true}
							allowColumnResizing={true}
							columnResizingMode="widget"
							columnMinWidth={150}
							searchPanel={{
								visible: true,
								width: 300,
								placeholder: 'Tìm kiếm',
							}}
							editing={{
								confirmDelete: true,
								allowDeleting: true,
								allowAdding: true,
								allowUpdating: true,
							}}
							elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
							wordWrapEnabled={true}
						>
							<ColumnChooser enabled={true} mode="select">
								<Position my="right top" at="right top" of=".dx-datagrid-column-chooser-button" />
							</ColumnChooser>
							<Paging enabled={true} />
							<FilterRow visible={true} applyFilter={true} />
							<HeaderFilter visible={true} />
							<ColumnFixing enabled={true} />
							<Grouping contextMenuEnabled={true} expandMode="rowClick" />
							<FilterPanel visible={true} />
							<Pager
								allowedPageSizes={true}
								showInfo={true}
								showNavigationButtons={true}
								showPageSizeSelector={true}
								visible={true}
							/>
							<LoadPanel enabled={true} />
							<Paging defaultPageSize={30} />
							{commonFieldsShow.map(col => (
								<Column
									key={col.id}
									dataField={col.id}
									dataType="string"
									caption={col.header}
									fixed={col?.fixed}
									width={col.width || 150}
									cellRender={data => (
										<span>
											{Number(data.text) && col?.type === 'date'
												? moment.unix(Number(data.text)).format('DD/MM/YYYY')
												: data.text}
										</span>
									)}
								/>
							))}

							<Column type="buttons">
								{[
									ADMIN,
									EXPERIMENTAL_MANAGEMENT_HEAD,
									EXPERIMENTAL_MANAGEMENT_SPECIALIST,
									UNIT_UTILIZATION_HEAD,
									UNIT_UTILIZATION_SPECIALIST,
								].includes(owner.GroupName) && (
									<DevButtonGrid
										icon="edit"
										hint="Lịch sử sửa chữa"
										onClick={(e: any) => {
											handleOpenDeviceRepairDialog(e.row.data.DeviceInfoId || '')
										}}
									/>
								)}
								<DevButtonGrid
									icon="clock"
									hint="Giờ sử dụng thiết bị"
									onClick={(e: any) => {
										handleOpenDeviceUsageHoursDialog(e.row.data.DeviceInfoId)
									}}
								/>
							</Column>
							<Toolbar>
								<Item name="columnChooserButton" />
								<Item name="searchPanel" showText="always" />
							</Toolbar>
						</DataGrid>
					</Box>
				</DialogContent>
			</Dialog>
			{isOpenDeviceRepair && (
				<DialogRepairDevice
					isOpen={isOpenDeviceRepair}
					onClose={handleCloseDeviceRepairDialog}
					deviceInfoId={deviceInfoId}
				/>
			)}
			{isOpenDeviceUsageHours && (
				<DialogDeviceUsageHours
					deviceInfoId={deviceInfoId}
					isOpen={isOpenDeviceUsageHours}
					onClose={handleCloseDeviceUsageHoursDialog}
				/>
			)}
		</>
	)
}

export default DeviceOfDepartmentTable;
