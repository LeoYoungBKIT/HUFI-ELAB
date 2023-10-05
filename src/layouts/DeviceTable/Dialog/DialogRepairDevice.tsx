import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField } from '@mui/material'
import { Button as DevButton } from 'devextreme-react/button'
import DataGrid, {
	Column,
	ColumnChooser,
	ColumnFixing,
	FilterPanel,
	FilterRow,
	Grouping,
	HeaderFilter,
	Item,
	LoadPanel,
	Paging,
	Scrolling,
	Toolbar,
} from 'devextreme-react/data-grid'
import LoadIndicator from 'devextreme-react/load-indicator'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { SavingEvent } from 'devextreme/ui/data_grid'
import moment from 'moment'
import { useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../../configs/color'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { setSnackbar } from '../../../pages/appSlice'
import { getMaintenanceDeviceById, postDateMaintenace } from '../../../services/maintenanceDevicesServices'
import { IMaintenanceDevice, IRepair } from '../../../types/maintenanceDevicesType'
import { DialogProps } from './DialogType'
import { ADMIN, EXPERIMENTAL_MANAGEMENT_SPECIALIST, UNIT_UTILIZATION_SPECIALIST } from '../../../configs/permissions'
import { useLoading } from '../../../hooks/useLoading'

const DialogRepairDevice = ({ isOpen, onClose, deviceInfoId = '' }: DialogProps) => {
	const dispatch = useAppDispatch()
	const [deviceMaintenance, setDeviceMaintenance] = useState<IMaintenanceDevice>()
	const [isAddMaintenaceDate, setIsAddMaintenaceDate] = useState(false)
	const { owner } = useAppSelector(state => state.userManager)

	const dataGridRepairRef = useRef<DataGrid<IRepair, any> | null>(null)
	const dataSourceRepair = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data:
					deviceMaintenance?.listRepair.map(repair => ({
						...repair,
						DateCreate: moment(Number(repair.DateCreate) * 1000).format('YYYY/MM/DD'),
						DateComplete: moment(Number(repair.DateComplete) * 1000).format('YYYY/MM/DD'),
					})) || [],
			}),
		})
	}, [deviceMaintenance])

	const dataGridMaintenaceRef = useRef<DataGrid<{ Date: Date }, string> | null>(null)
	const dataSourceMaintenace = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: deviceMaintenance?.DateMaintenace.map(date => ({ Date: new Date(Number(date) * 1000) })) || [],
			}),
		})
	}, [deviceMaintenance])

	const columnField = useMemo(
		() => [
			{
				header: 'Mã định danh thiết bị',
				value: deviceMaintenance?.DeviceInfoId || '',
			},
			{
				header: 'Tên thiết bị',
				value: deviceMaintenance?.DeviceName || '',
			},
			{
				header: 'Khoa',
				value: deviceMaintenance?.DepartmentManageName || '',
			},
			{
				header: 'Vị trí',
				value: deviceMaintenance?.Location || '',
			},
		],
		[deviceMaintenance],
	)
	const getMaintenanceDevice = async () => {
		try {
			const res: IMaintenanceDevice = await getMaintenanceDeviceById(deviceInfoId)
			if (res) {
				setDeviceMaintenance(res)
			}
		} catch (error) {
			setDeviceMaintenance(undefined)
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		}
	}

	const [saveDateMaintenace, isLoadingSaveDateMaintenace] = useLoading(
		async (e: SavingEvent<{ Date: Date }, string>) => {
			try {
				if (e.changes.length > 0 && e.changes[0].data.Date?.getTime) {
					const date = e.changes[0].data.Date?.getTime() / 1000
					console.log(date)
					await postDateMaintenace(deviceInfoId, `${date}`)
				}

				if (e.changes.length > 0 || e.changes[0].data.Date?.getTime) {
					e.cancel = true
					e.component.cancelEditData()
				}
			} catch (error) {
				console.log(error)
				e.cancel = true
				e.component.cancelEditData()
				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				)
			}
		},
	)

	useEffect(() => {
		getMaintenanceDevice()
	}, [isOpen])

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Lịch sử sửa chữa - hiệu chuẩn/bảo trì</b>

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
				<Grid item xs={8}>
					{columnField.map(col => {
						return (
							<TextField
								key={col.header}
								label={col.header}
								value={col.value || ' '}
								variant="standard"
								sx={{
									padding: '0px 16px 16px 0',
									width: '50%',
								}}
								type="text"
							/>
						)
					})}
				</Grid>
				<DataGrid
					dataSource={dataSourceMaintenace}
					ref={dataGridMaintenaceRef}
					showBorders={true}
					columnAutoWidth={true}
					allowColumnResizing={true}
					columnResizingMode="widget"
					columnMinWidth={100}
					searchPanel={{
						visible: true,
						width: 300,
						placeholder: 'Tìm kiếm',
					}}
					elementAttr={{
						style: 'height: 100%; min-height: 300px; padding-bottom: 20px; width: 100%; min-width: 600px',
					}}
					onSaving={saveDateMaintenace}
					wordWrapEnabled={true}
				>
					<ColumnFixing enabled={false} />
					<Grouping contextMenuEnabled={true} expandMode="rowClick" />
					<FilterPanel visible={true} />
					<LoadPanel enabled={true} />
					<Column dataField="Date" caption="Ngày tạo" dataType="date" format="dd/MM/yyyy" />
					<Scrolling mode="infinite" />
					<LoadPanel enabled={true} />
					<Toolbar>
						<Item location="before">
							<div className="informer">
								<b style={{ fontSize: '18px' }}>Danh sách ngày định chuẩn</b>
							</div>
						</Item>
						{[ADMIN, UNIT_UTILIZATION_SPECIALIST, EXPERIMENTAL_MANAGEMENT_SPECIALIST].includes(
							owner.GroupName,
						) && (
							<Item location="after">
								<DevButton
									onClick={() => {
										setIsAddMaintenaceDate(!isAddMaintenaceDate)
										if (isAddMaintenaceDate) {
											dataGridMaintenaceRef.current?.instance.saveEditData()
										} else {
											dataGridMaintenaceRef.current?.instance.addRow()
										}
									}}
									disabled={isLoadingSaveDateMaintenace}
									type="default"
								>
									<LoadIndicator
										id="small-indicator"
										height={20}
										width={20}
										visible={isLoadingSaveDateMaintenace}
										elementAttr={{ class: 'indicator-white' }}
									/>
									{isAddMaintenaceDate ? 'Lưu ' : 'Cập nhật ngày định chuẩn'}
								</DevButton>
							</Item>
						)}
					</Toolbar>
				</DataGrid>
				<DataGrid
					dataSource={dataSourceRepair}
					ref={dataGridRepairRef}
					showBorders={true}
					columnAutoWidth={true}
					allowColumnResizing={true}
					columnResizingMode="widget"
					columnMinWidth={100}
					searchPanel={{
						visible: true,
						width: 300,
						placeholder: 'Tìm kiếm',
					}}
					elementAttr={{
						style: 'height: 100%; min-height: 300px; padding-bottom: 20px; width: 100%; min-width: 600px',
					}}
					wordWrapEnabled={true}
				>
					<ColumnChooser enabled={true} mode="select" />
					<Paging enabled={false} />
					<FilterRow visible={true} applyFilter={true} />
					<HeaderFilter visible={true} />
					<ColumnFixing enabled={false} />
					<Grouping contextMenuEnabled={true} expandMode="rowClick" />
					<FilterPanel visible={true} />
					<Scrolling mode="infinite" />
					<LoadPanel enabled={true} />
					<Column dataField="DateCreate" width={140} caption="Ngày tạo" dataType="date" />
					<Column dataField="DateComplete" width={150} caption="Ngày hoàn thành" dataType="date" />
					<Column dataField="ContentRepair" minWidth={250} caption="Nội dung sửa chữa" />
					<Column dataField="Status" caption="Trạng thái" width={120} />
					<Toolbar>
						<Item location="before">
							<div className="informer">
								<b style={{ fontSize: '18px' }}>Lịch sử sửa chữa</b>
							</div>
						</Item>
						<Item name="columnChooserButton" showText="always" />
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</DialogContent>
		</Dialog>
	)
}

export default DialogRepairDevice
