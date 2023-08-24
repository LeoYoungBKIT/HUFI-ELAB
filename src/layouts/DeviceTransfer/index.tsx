import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Autocomplete, Box, Button, Grid, TextField } from '@mui/material'
import { Button as DevButton } from 'devextreme-react/button'
import DataGrid, {
	Column,
	ColumnFixing,
	FilterPanel,
	FilterRow,
	Grouping,
	HeaderFilter,
	Item,
	LoadPanel,
	Paging,
	Scrolling,
	Selection,
	Toolbar
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { ColumnCellTemplateData } from 'devextreme/ui/data_grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../configs/color'
import { useAppDispatch } from '../../hooks'
import { setSnackbar } from '../../pages/appSlice'
import { getDevicesTransfer, postDeviceTransfer } from '../../services/deviceTransfer'
import { IDeviceSerial, IDeviceTransfer, dummyDeviceTransferData } from '../../types/deviceTransferType'

function DeviceTransfer() {
	const [deviceTransferData, setDeviceTransferData] = useState<IDeviceTransfer[]>([])
	const dispatch = useAppDispatch()
	const [labFrom, setLabFrom] = useState<IDeviceTransfer>(dummyDeviceTransferData)
	const [labTo, setLabTo] = useState<IDeviceTransfer>(dummyDeviceTransferData)
	const [deviceTransfered, setDeviceTransfered] = useState<IDeviceSerial[]>([])
	const [countSelected, setCountSelected] = useState<number>(0)
	const dataGridToRef = useRef<DataGrid<IDeviceSerial, string> | null>(null)

	const dataSourceTo = useMemo(() => {
		return new DataSource<IDeviceSerial, string>({
			store: new ArrayStore({
				data:
					[
						...(labTo?.listDeviceInfo?.map(devices => ({ ...devices, isTransfered: false })) || []),
						...deviceTransfered?.map(devices => ({ ...devices, isTransfered: true })),
					] || [],
				key: 'DeviceInfoId',
			}),
		})
	}, [labTo, deviceTransfered])

	const columns = useRef([
		{ id: 'DeviceInfoId', header: 'Mã định danh thiết bị' },
		{ id: 'DeviceName', header: 'Tên thiết bị' },
	])

	const dataGridFromRef = useRef<DataGrid<IDeviceSerial, string> | null>(null)

	const dataSourceFrom = useMemo(() => {
		return new DataSource<IDeviceSerial, string>({
			store: new ArrayStore({
				data: labFrom?.listDeviceInfo || [],
				key: 'DeviceInfoId',
			}),
		})
	}, [labFrom])

	const getDeviceTransfer = async () => {
		const listOfDeviceTransfer: IDeviceTransfer[] = await getDevicesTransfer()
		if (listOfDeviceTransfer) {
			setDeviceTransferData(listOfDeviceTransfer)
		}
	}

	useEffect(() => {
		getDeviceTransfer()
	}, [])

	const handleTransfer = () => {
		const listSelect = dataGridFromRef.current?.instance.getSelectedRowsData() || []

		setDeviceTransfered(prev => [...listSelect, ...prev])
	}

	useEffect(() => {
		setLabFrom(prev => {
			const newDevices = labFrom?.listDeviceInfo?.filter(
				device =>
					deviceTransfered.findIndex(transfered => transfered?.DeviceInfoId === device?.DeviceInfoId) === -1,
			)
			return { ...prev, listDeviceInfo: newDevices }
		})
	}, [deviceTransfered])

	const cancelTransfer = (DeviceInfoId: String) => {
		console.log(DeviceInfoId)
		let indexOfBackDevice = deviceTransfered.findIndex(device => device.DeviceInfoId === DeviceInfoId)
		if (indexOfBackDevice !== -1) {
			setLabFrom(prev => {
				return {
					...prev,
					listDeviceInfo: [...(prev.listDeviceInfo || []), deviceTransfered[indexOfBackDevice]],
				}
			})
		}

		const newDevices = deviceTransfered.filter(device => {
			return device.DeviceInfoId !== DeviceInfoId
		})
		setDeviceTransfered(newDevices)
	}

	const updateDeviceTransferStore = async (resData: IDeviceTransfer) => {
		if (Object.keys(resData).length !== 0) {
			dispatch(
				setSnackbar({
					message: 'Cập nhật thông tin thành công',
					color: colorsNotifi['success'].color,
					backgroundColor: colorsNotifi['success'].background,
				}),
			)
		} else {
			dispatch(
				setSnackbar({
					message: 'Cập nhật thông tin không thành công',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		}
		getDeviceTransfer()
	}

	const handleSave = async () => {
		let resData = await postDeviceTransfer(labFrom)
		updateDeviceTransferStore(resData)

		resData = await postDeviceTransfer({
			...labTo,
			listDeviceInfo: [...(labTo?.listDeviceInfo || []), ...deviceTransfered],
		})
		updateDeviceTransferStore(resData)

		setLabFrom(dummyDeviceTransferData)
		setLabTo(dummyDeviceTransferData)
		setDeviceTransfered([])
	}

	const handleSwap = () => {
		setLabFrom(deviceTransferData.find(lab => lab.LabId === labTo.LabId) || dummyDeviceTransferData)
		setLabTo(deviceTransferData.find(lab => lab.LabId === labFrom.LabId) || dummyDeviceTransferData)
		setDeviceTransfered([])
	}

	return (
		<>
			<div
				style={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box minWidth={480} display="flex" alignItems="center" justifyContent="space-between">
					<h3 style={{ margin: '0px', textAlign: 'left', padding: '0.5rem' }}>
						<b>
							<KeyboardArrowRightIcon
								style={{ margin: '0px', fontSize: '30px', paddingTop: '15px' }}
							></KeyboardArrowRightIcon>
						</b>
						<span>Cập nhật vị trí Thiết bị</span>
					</h3>
					<Box height="100%" marginRight="20px" display="flex" alignItems="center" justifyContent="end">
						<Button variant="contained" onClick={handleSave} disabled={!deviceTransfered.length}>
							Lưu
						</Button>
					</Box>
				</Box>

				<Grid
					container
					columns={24}
					sx={{
						flexDirection: {
							xs: 'row',
							lg: 'unset',
						},
						flex: 1,
					}}
					padding="20px"
				>
					<Grid
						sx={{
							height: {
								lg: '100%',
								xs: '600px',
							},
						}}
						item
						lg={11}
						xs={24}
					>
						<Box
							sx={{
								height: {
									lg: '100%',
									xs: '600px',
								},
							}}
							display="flex"
							flexDirection="column"
						>
							{labFrom && (
								<Autocomplete
									options={
										deviceTransferData.length > 0
											? deviceTransferData.filter(lab => lab.LabId !== labTo.LabId)
											: []
									}
									getOptionLabel={option => `${option.LabId} - ${option.LabName}`}
									renderInput={params => (
										<TextField {...params} label="Phòng ban đầu" placeholder="Phòng ban đầu..." />
									)}
									onChange={(e, value) => {
										setLabFrom(value || dummyDeviceTransferData)
										setLabTo(
											deviceTransferData.find(lab => lab.LabId === labTo.LabId) ||
												dummyDeviceTransferData,
										)
										setDeviceTransfered([])
									}}
									value={labFrom}
									isOptionEqualToValue={(option, value) => option.LabId === value.LabId}
								/>
							)}

							<DataGrid
								dataSource={dataSourceFrom}
								ref={dataGridFromRef}
								showBorders={true}
								columnAutoWidth={true}
								allowColumnResizing={true}
								columnResizingMode="widget"
								columnMinWidth={100}
								searchPanel={{
									visible: true,
									width: 240,
									placeholder: 'Tìm kiếm',
								}}
								editing={{
									allowDeleting: false,
									allowAdding: false,
									allowUpdating: false,
								}}
								elementAttr={{
									style: 'height: 100%; padding: 10px 0; width: 100%;',
								}}
								onSelectionChanged={() => {
									setCountSelected(
										dataGridFromRef.current?.instance.getSelectedRowsData().length || 0,
									)
								}}
								wordWrapEnabled={true}
							>
								<Selection mode="multiple" selectAllMode="allPages" showCheckBoxesMode="always" />
								<Paging enabled={false} />
								<FilterRow visible={true} applyFilter={true} />
								<HeaderFilter visible={true} />
								<ColumnFixing enabled={false} />
								<Grouping contextMenuEnabled={true} expandMode="rowClick" />
								<FilterPanel visible={true} />
								<Scrolling mode="infinite" />
								<LoadPanel enabled={false} />
								{columns.current.map(col => (
									<Column key={col.id} dataField={col.id} dataType="string" caption={col.header} />
								))}
								<Toolbar>
									<Item name="exportButton" />
									<Item name="columnChooserButton" />
									<Item name="searchPanel" showText="always" />
								</Toolbar>
							</DataGrid>
						</Box>
					</Grid>
					<Grid item xs={24} lg={2}>
						<Box
							height="100%"
							display="flex"
							sx={{
								padding: {
									xs: '20px 20px 40px 20px',
									lg: '20px',
								},
							}}
							alignItems="center"
							justifyContent="center"
							flexWrap="wrap"
						>
							<Box>
								<Button
									variant="contained"
									onClick={handleTransfer}
									disabled={countSelected === 0 || labFrom.LabId === '' || labTo.LabId === ''}
									sx={{
										width: {
											lg: '100%',
										},
										marginBottom: {
											lg: '24px',
										},
										marginRight: {
											xs: '24px',
											lg: '0',
										},
									}}
								>
									Chuyển
								</Button>

								<Button
									variant="contained"
									onClick={handleSwap}
									sx={{
										width: {
											lg: '100%',
										},
										marginBottom: {
											lg: '24px',
										},
										marginRight: {
											xs: '24px',
											lg: '0',
										},
									}}
								>
									<CompareArrowsIcon />
								</Button>
							</Box>
						</Box>
					</Grid>
					<Grid
						sx={{
							height: {
								lg: '100%',
								xs: '600px',
							},
						}}
						item
						lg={11}
						xs={24}
					>
						<Box
							sx={{
								height: {
									lg: '100%',
									xs: '600px',
								},
							}}
							display="flex"
							flexDirection="column"
						>
							{labTo && (
								<Autocomplete
									options={
										deviceTransferData.length > 0
											? deviceTransferData?.filter(lab => lab.LabId !== labFrom.LabId)
											: []
									}
									getOptionLabel={option => `${option.LabId} - ${option.LabName}`}
									renderInput={params => (
										<TextField
											{...params}
											label="Phòng chuyển đến"
											placeholder="Phòng chuyển đến..."
										/>
									)}
									onChange={(e, value) => {
										setLabTo(value || dummyDeviceTransferData)
										setLabFrom(
											deviceTransferData.find(lab => lab.LabId === labFrom.LabId) ||
												dummyDeviceTransferData,
										)
										setDeviceTransfered([])
									}}
									value={labTo}
									isOptionEqualToValue={(option, value) => option.LabId === value.LabId}
								/>
							)}

							<DataGrid
								dataSource={dataSourceTo}
								ref={dataGridToRef}
								showBorders={true}
								columnAutoWidth={true}
								allowColumnResizing={true}
								columnResizingMode="widget"
								columnMinWidth={100}
								wordWrapEnabled={true}
								searchPanel={{
									visible: true,
									width: 300,
									placeholder: 'Tìm kiếm',
								}}
								editing={{
									allowDeleting: false,
									allowAdding: false,
									allowUpdating: false,
								}}
								elementAttr={{
									style: 'height: 100%; padding: 10px 0; width: 100%;',
								}}
							>
								<Selection mode="multiple" selectAllMode="allPages" showCheckBoxesMode="always" />
								<Paging enabled={false} />
								<FilterRow visible={true} applyFilter={true} />
								<HeaderFilter visible={true} />
								<ColumnFixing enabled={false} />
								<Grouping contextMenuEnabled={true} expandMode="rowClick" />
								<FilterPanel visible={true} />
								<Scrolling mode="infinite" />
								<LoadPanel enabled={false} />
								{columns.current.map(col => (
									<Column key={col.id} dataField={col.id} dataType="string" caption={col.header} />
								))}
								<Column
									type="buttons"
									width="40px"
									cssClass="p-0"
									minWidth={40}
									cellRender={(e: ColumnCellTemplateData<IDeviceSerial, string>) => {
										return e.data?.isTransfered ? (
											<DevButton
												height="100%"
												width="100%"
												stylingMode="contained"
												onClick={() => cancelTransfer(e.data?.DeviceInfoId || '')}
												icon="close"
												type="danger"
												elementAttr={{
													style: 'border-radius: 0;width: 100%;height: 100%',
												}}
											/>
										) : null
									}}
									dataField="isTransfered"
									dataType="string"
									caption=""
									fixed={true}
								/>
								<Toolbar>
									<Item name="exportButton" />
									<Item name="columnChooserButton" />
									<Item name="searchPanel" showText="always" />
								</Toolbar>
							</DataGrid>
						</Box>
					</Grid>
				</Grid>
			</div>
		</>
	)
}

export default DeviceTransfer
