import CloseIcon from '@mui/icons-material/Close'
import {
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputLabel,
	TextField,
} from '@mui/material'
import DataGrid, {
	Column,
	ColumnFixing,
	Button as DevButtonGrid,
	Editing,
	FilterPanel,
	Grouping,
	HeaderFilter,
	Item,
	LoadPanel,
	Paging,
	RequiredRule,
	Scrolling,
	Summary,
	Toolbar,
	TotalItem,
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { EditorPreparingEvent, SavingEvent } from 'devextreme/ui/data_grid'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../../configs/color'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { setSnackbar } from '../../../pages/appSlice'
import {
	deleteRecordHours,
	getRecordHours,
	postCheckFileImport,
	postRecordHours,
	putRecordHours,
} from '../../../services/deviceUsageHoursServices'
import { IDeviceRecordUsageHours, IDeviceUsageHours } from '../../../types/deviceUsageHoursType'
import { DialogProps } from './DialogType'
import { ADMIN, EXPERIMENTAL_MANAGEMENT_HEAD, EXPERIMENTAL_MANAGEMENT_SPECIALIST, UNIT_UTILIZATION_HEAD, UNIT_UTILIZATION_SPECIALIST } from '../../../configs/permissions'

const DialogDeviceUsageHours = ({ isOpen, onClose, deviceInfoId = '' }: DialogProps) => {
	const [deviceHours, setDeviceHours] = useState<IDeviceUsageHours>()
	const owner = useAppSelector(selector => selector.userManager.owner)
	const dispatch = useAppDispatch()
	const dataGridRef = useRef<DataGrid<any, any> | null>(null)
	const [isFileLoading, setIsFileLoading] = useState(false)
	const readOnly = useRef(
		[
			ADMIN,
			EXPERIMENTAL_MANAGEMENT_HEAD,
			EXPERIMENTAL_MANAGEMENT_SPECIALIST,
			UNIT_UTILIZATION_HEAD,
			UNIT_UTILIZATION_SPECIALIST,
		].includes(owner.GroupName),
	)

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: deviceHours?.listRecordHours || [],
			}),
		})
	}, [deviceHours])

	const columnTableHours = useMemo(() => {
		return [
			{
				id: 'Month',
				header: 'Tháng',
				isReadonly: true,
			},
			{
				id: 'Year',
				header: 'Năm',
				isReadonly: true,
			},
			{
				id: 'HoursUsage',
				header: 'Số giờ',
				isReadonly: false,
			},
		]
	}, [])

	const columnField = useMemo(
		() => [
			{
				header: 'Mã Thiết bị',
				value: deviceHours?.DeviceId || '',
			},
			{
				header: 'Mã định danh thiết bị',
				value: deviceHours?.DeviceInfoId || '',
			},
			{
				header: 'Tên thiết bị',
				value: deviceHours?.DeviceName || '',
			},
			{
				header: 'Tên tiếng anh',
				value: deviceHours?.DeviceEnglishName || '',
			},
			{
				header: 'Vị trí',
				value: deviceHours?.Location || '',
			},
		],
		[deviceHours],
	)

	const getListDevice = async () => {
		try {
			const res: IDeviceUsageHours = await getRecordHours(deviceInfoId)
			if (res) {
				setDeviceHours(res)
			}
		} catch (error) {
			setDeviceHours(undefined)
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		}
	}

	useEffect(() => {
		getListDevice()
	}, [isOpen])

	const handleOnSave = async (e: SavingEvent<IDeviceRecordUsageHours, IDeviceRecordUsageHours>) => {
		try {
			const listInsert = e.changes.filter(c => c.type === 'insert')
			const listUpdate = e.changes.filter(c => c.type === 'update')
			const listRemove = e.changes.filter(c => c.type === 'remove')

			if (listInsert.length > 0) {
				await postRecordHours({
					DeviceInfoId: deviceInfoId,
					DeviceEnglishName: '',
					DeviceId: '',
					DeviceName: '',
					Location: '',
					Unit: '',
					listRecordHours: listInsert
						.map(row => {
							if (row.data.HoursUsage && row.data.Month && row.data.Year) {
								const record: IDeviceRecordUsageHours = {
									Year: row.data.Year,
									Month: row.data.Month,
									HoursUsage: row.data.HoursUsage,
								}
								return record
							}
							return null
						})
						.filter(row => row !== null) as IDeviceRecordUsageHours[],
				})
			}

			if (listUpdate.length > 0) {
				await putRecordHours({
					DeviceInfoId: deviceInfoId,
					DeviceEnglishName: '',
					DeviceId: '',
					DeviceName: '',
					Location: '',
					Unit: '',
					listRecordHours: listUpdate
						.map(row => {
							if (row.data.HoursUsage && row.key.Month && row.key.Year) {
								const record: IDeviceRecordUsageHours = {
									HoursUsage: row.data.HoursUsage,
									Month: row.key.Month,
									Year: row.key.Year,
								}
								return record
							}
							return null
						})
						.filter(row => row !== null) as IDeviceRecordUsageHours[],
				})
			}

			if (listRemove.length > 0) {
				await deleteRecordHours({
					DeviceInfoId: deviceInfoId,
					DeviceEnglishName: '',
					DeviceId: '',
					DeviceName: '',
					Location: '',
					Unit: '',
					listRecordHours: listRemove
						.map(row => {
							if (row.key.HoursUsage && row.key.Month && row.key.Year) {
								const record: IDeviceRecordUsageHours = {
									HoursUsage: row.key.HoursUsage,
									Month: row.key.Month,
									Year: row.key.Year,
								}
								return record
							}
							return null
						})
						.filter(row => row !== null) as IDeviceRecordUsageHours[],
				})
			}
		} catch (error) {
			e.cancel = true
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		} finally {
			getListDevice()
		}
	}

	const handleOnEditorPreparingEvent = (e: EditorPreparingEvent) => {
		if ((e.dataField === 'Month' || e.dataField === 'Year') && !e.row?.isNewRow) {
			e.editorOptions.readOnly = true
		}

		if (e.row?.isNewRow === true) {
			e.editorOptions.readOnly = false
		}
	}

	const handleChangeFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			setIsFileLoading(true)
			const formData = new FormData()
			if (event.target.files && event.target.files.length > 0) {
				formData.append('file', event.target.files[0])
			}
			formData.append('DeviceInfoId', deviceInfoId)

			await postCheckFileImport(formData)
		} catch (e) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!! Vui lòng kiểm tra trùng dữ liệu cột Tháng/Năm ',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		} finally {
			getListDevice()
			setIsFileLoading(false)
		}
	}

	return (
		<Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { width: '800px', maxWidth: 'unset' } }}>
			<DialogTitle textAlign="left">
				<b>Giờ sử dụng Thiết bị</b>

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
			<DialogContent sx={{ paddingTop: '8px', display: 'flex', flexDirection: 'column' }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						{columnField.map(col => {
							return (
								<TextField
									key={col.header}
									label={col.header}
									value={col.value}
									variant="standard"
									sx={{
										marginBottom: '16px',
									}}
									type="text"
									fullWidth
								/>
							)
						})}
					</Grid>
				</Grid>

				<div
					style={{
						flex: 1,
						overflow: 'hidden',
						display: 'flex',
					}}
				>
					<DataGrid
						dataSource={dataSource}
						ref={dataGridRef}
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
						onEditorPreparing={handleOnEditorPreparingEvent}
						onSaving={handleOnSave}
						elementAttr={{ style: 'padding-bottom: 20px; width: 100%; min-width: 600px' }}
						wordWrapEnabled={true}
					>
						<Editing
							mode="batch"
							allowUpdating={readOnly.current}
							allowDeleting={readOnly.current}
							allowAdding={readOnly.current}
							useIcons={true}
						/>

						<Paging enabled={true} />
						<HeaderFilter visible={true} />
						<ColumnFixing enabled={true} />
						<Grouping contextMenuEnabled={true} expandMode="rowClick" />
						<FilterPanel visible={true} />
						<Scrolling mode="infinite" />
						<LoadPanel enabled={true} />
						{columnTableHours.map(col => (
							<Column key={col.id} dataField={col.id} dataType="number" caption={col.header}>
								<RequiredRule />
							</Column>
						))}
						<Column type="buttons">
							<DevButtonGrid name="delete" visible={true} />
						</Column>

						<Toolbar>
							<Item location="before">
								<Button
									variant="contained"
									sx={{
										padding: 0,
										minWidth: 0,
										mb: '8px',
									}}
								>
									<InputLabel
										sx={{
											padding: '6px 8px',
											minWidth: '64px',
											color: 'white',
										}}
										htmlFor="importUsageHour"
									>
										{isFileLoading ? 'Đang tải...' : 'Tải mẫu file import'}
										<input
											type="file"
											name="importUsageHour"
											id="importUsageHour"
											hidden
											onChange={handleChangeFileImport}
										/>
									</InputLabel>
								</Button>
							</Item>
							<Item name="addRowButton" />
							<Item name="revertButton" />
							<Item name="saveButton" />
							<Item name="columnChooserButton" />
							<Item name="searchPanel" showText="always" />
						</Toolbar>
						<Summary>
							<TotalItem
								column="HoursUsage"
								summaryType="sum"
								displayFormat="Tổng giờ sử dụng: {0} giờ"
							/>
						</Summary>
					</DataGrid>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default DialogDeviceUsageHours
