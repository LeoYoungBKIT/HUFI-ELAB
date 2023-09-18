import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Autocomplete, Box, Button, Grid, TextField, Typography } from '@mui/material'
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
	Toolbar,
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { ColumnCellTemplateData } from 'devextreme/ui/data_grid'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../configs/color'
import { useAppDispatch } from '../../hooks'
import { setSnackbar } from '../../pages/appSlice'
import { IDeviceTransfer, dummyDeviceTransferData } from '../../types/deviceTransferType'
import { getInstrumentsTransfer, postInstrumentsTransfer } from '../../services/instrumentServices'
import Form, { Item as FormItem, IItemProps, NumericRule, RequiredRule } from 'devextreme-react/form'
import Popup from 'devextreme-react/popup'
import ButtonDevextreme from 'devextreme-react/button'
import { IInstrumentSerial } from '../../types/instrumentType'
import { useLoading } from '../../hooks/useLoading'
import LoadIndicator from 'devextreme-react/load-indicator'

const sumQuantity = (data: IInstrumentSerial[]) => {
	const instrumentTotals: { [key: string]: any } = {}

	data.forEach(item => {
		const instrumentId = item.InstrumentId
		const quantity = item.QuantityTotal

		if (instrumentId in instrumentTotals) {
			instrumentTotals[`${instrumentId || ''}`].QuantityTotal += quantity
		} else {
			instrumentTotals[`${instrumentId || ''}`] = {
				InstrumentId: instrumentId,
				InstrumentName: item.InstrumentName,
				QuantityTotal: quantity,
			}
		}
	})

	const result = Object.values(instrumentTotals) as IInstrumentSerial[]
	return result
}

const InstrumentTransfer = () => {
	const [instrumentTransferData, setDeviceTransferData] = useState<IDeviceTransfer[]>([])
	const [popupEditVisible, setPopupEditVisible] = useState<boolean>(false)
	const dispatch = useAppDispatch()
	const [labFrom, setLabFrom] = useState<IDeviceTransfer>(dummyDeviceTransferData)
	const [labTo, setLabTo] = useState<IDeviceTransfer>(dummyDeviceTransferData)
	const [instrumentTransfered, setInstrumentTransfered] = useState<IInstrumentSerial[]>([])
	const [countSelected, setCountSelected] = useState<number>(0)
	const dataGridToRef = useRef<DataGrid<IInstrumentSerial, string> | null>(null)

	const dataSourceTo = useMemo(() => {
		return new DataSource<IInstrumentSerial, string>({
			store: new ArrayStore({
				data:
					[
						...(labTo?.listInstrument?.map(instruments => ({ ...instruments, isTransfered: false })) || []),
						...instrumentTransfered?.map(instruments => ({ ...instruments, isTransfered: true })),
					].filter(i => i.QuantityTotal !== 0) || [],
			}),
		})
	}, [labTo, instrumentTransfered])

	const columns = useRef([
		{ id: 'InstrumentId', header: 'Mã công cụ/dụng cụ' },
		{ id: 'InstrumentName', header: 'Tên công cụ/dụng cụ' },
		{ id: 'QuantityTotal', header: 'Số lượng' },
	])

	const dataGridFromRef = useRef<DataGrid<IInstrumentSerial, string> | null>(null)

	const dataSourceFrom = useMemo(() => {
		return new DataSource<IInstrumentSerial, string>({
			store: new ArrayStore({
				data: labFrom?.listInstrument?.filter(i => i.QuantityTotal !== 0) || [],
			}),
		})
	}, [labFrom])

	const [getInstrumentTransferData, isLoadingInstrumentTransferData] = useLoading(async () => {
		const listOfInstrumentTransfer: IDeviceTransfer[] = await getInstrumentsTransfer()
		if (listOfInstrumentTransfer) {
			setDeviceTransferData(listOfInstrumentTransfer)
		}
	})

	const handleTransfer = (quantity: number) => {
		if (quantity === 0) {
			const listSelect = dataGridFromRef.current?.instance.getSelectedRowsData() || []
			setInstrumentTransfered(prev => sumQuantity([...listSelect, ...prev]))
		} else {
			const listSelect = dataGridFromRef.current?.instance.getSelectedRowsData() || []
			setInstrumentTransfered(prev =>
				sumQuantity([...listSelect.map(item => ({ ...item, QuantityTotal: quantity })), ...prev]),
			)
		}
	}

	const cancelTransfer = (InstrumentId: String) => {
		console.log(InstrumentId)
		let indexOfBackDevice = instrumentTransfered.findIndex(instrument => instrument.InstrumentId === InstrumentId)
		if (indexOfBackDevice !== -1) {
			setLabFrom(prev => {
				return {
					...prev,
					listInstrument: sumQuantity([
						...(prev.listInstrument || []),
						instrumentTransfered[indexOfBackDevice],
					]),
				}
			})
		}

		const newDevices = instrumentTransfered.filter(instrument => {
			return instrument.InstrumentId !== InstrumentId
		})
		setInstrumentTransfered(newDevices)
	}

	const handleSave = async () => {
		const test = instrumentTransferData.find(lab => lab.LabId === labFrom.LabId)

		try {
			if (test) {
				await postInstrumentsTransfer([
					{
						...test,
						listInstrument: test.listInstrument?.filter(i =>
							instrumentTransfered.find(t => i.InstrumentId === t.InstrumentId),
						),
					},
					{ ...labTo, listInstrument: [...instrumentTransfered] },
				])

				dispatch(
					setSnackbar({
						message: 'Chuyển thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
			}
		} catch (error) {
			console.log(error)
			dispatch(
				setSnackbar({
					message: 'Chuyển không thành công',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		} finally {
			getInstrumentTransferData().catch(console.log)
			setInstrumentTransfered([])
		}
	}

	const handleSwap = () => {
		setLabFrom(instrumentTransferData.find(lab => lab.LabId === labTo.LabId) || dummyDeviceTransferData)
		setLabTo(instrumentTransferData.find(lab => lab.LabId === labFrom.LabId) || dummyDeviceTransferData)
		setInstrumentTransfered([])
	}

	const handleConfirm = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const form = e.target as HTMLFormElement
		const formData = new FormData(form)
		const quantity = Number(formData.get('Quantity'))
		handleTransfer(quantity)
		setPopupEditVisible(false)
	}

	const handleRefresh = () => {
		getInstrumentTransferData().catch(console.log)
	}

	const hidePopupEdit = useCallback(() => {
		setPopupEditVisible(false)
	}, [setPopupEditVisible])

	const showPopupEdit = useCallback(() => {
		setPopupEditVisible(true)
	}, [setPopupEditVisible])

	useEffect(() => {
		getInstrumentTransferData().catch(console.log)
	}, [])

	useEffect(() => {
		setLabFrom(prev => {
			const lab = instrumentTransferData.find(lab => lab.LabId === labFrom.LabId)
			const newDevices = lab?.listInstrument?.map(instrument => {
				const x = instrumentTransfered.find(transfered => transfered?.InstrumentId === instrument?.InstrumentId)
				return {
					...instrument,
					QuantityTotal: Number(instrument.QuantityTotal) - Number(x?.QuantityTotal || 0),
				}
			})
			return { ...prev, listInstrument: newDevices }
		})
	}, [instrumentTransfered])

	useEffect(() => {
		setLabFrom(instrumentTransferData.find(lab => lab.LabId === labFrom.LabId) || dummyDeviceTransferData)
		setLabTo(instrumentTransferData.find(lab => lab.LabId === labTo.LabId) || dummyDeviceTransferData)
	}, [instrumentTransferData])

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
						<Button variant="contained" disabled={isLoadingInstrumentTransferData} onClick={handleRefresh}>
							<LoadIndicator
								id="small-indicator"
								height={20}
								width={20}
								visible={isLoadingInstrumentTransferData}
								elementAttr={{ class: 'indicator-white' }}
							/>
							Làm mới
						</Button>
						<Button
							style={{ marginLeft: '20px' }}
							variant="contained"
							onClick={handleSave}
							disabled={!instrumentTransfered.length}
						>
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
										instrumentTransferData.length > 0
											? instrumentTransferData.filter(lab => lab.LabId !== labTo.LabId)
											: []
									}
									getOptionLabel={option => `${option.LabId} - ${option.LabName}`}
									renderInput={params => (
										<TextField {...params} label="Phòng ban đầu" placeholder="Phòng ban đầu..." />
									)}
									onChange={(e, value) => {
										setLabFrom(value || dummyDeviceTransferData)
										setInstrumentTransfered([])
									}}
									value={labFrom}
									isOptionEqualToValue={(option, value) => option.LabId === value.LabId}
								/>
							)}

							<DataGrid
								dataSource={dataSourceFrom}
								ref={dataGridFromRef}
								showBorders={true}
								allowColumnResizing={true}
								repaintChangesOnly={false}
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
									onClick={showPopupEdit}
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
										instrumentTransferData.length > 0
											? instrumentTransferData?.filter(lab => lab.LabId !== labFrom.LabId)
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
										setInstrumentTransfered([])
									}}
									value={labTo}
									isOptionEqualToValue={(option, value) => option.LabId === value.LabId}
								/>
							)}

							<DataGrid
								dataSource={dataSourceTo}
								ref={dataGridToRef}
								showBorders={true}
								repaintChangesOnly={false}
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
									cellRender={(e: ColumnCellTemplateData<IInstrumentSerial, string>) => {
										return e.data?.isTransfered ? (
											<DevButton
												height="100%"
												width="100%"
												stylingMode="contained"
												onClick={() => cancelTransfer(e.data?.InstrumentId || '')}
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

			<Popup
				visible={popupEditVisible}
				onHiding={hidePopupEdit}
				dragEnabled={true}
				hideOnOutsideClick={false}
				showCloseButton={true}
				showTitle={true}
				title="Nhập số lượng chuyển"
				height="auto"
				resizeEnabled={true}
				width={400}
			>
				<form onSubmit={handleConfirm}>
					<Form formData={{ Quantity: 0 }}>
						<FormItem
							colSpan={2}
							dataField="Quantity"
							label={{
								text: 'Số lượng chuyển đi',
							}}
						>
							<RequiredRule />
							<NumericRule />
						</FormItem>
					</Form>
					<Typography fontStyle="italic" fontSize="14px" mt={2}>
						(<span style={{ color: '#c9302c' }}>*</span>) Bắt buộc phải điền
						<br />
						<span>
							Nếu số lượng chuyển đi bằng 0 thì tự động chuyển tất cả của dụng cụ/công cụ được chọn
						</span>
					</Typography>
					<Box display="flex" mt={2}>
						<ButtonDevextreme
							type="default"
							elementAttr={{ style: 'margin-left: auto; width: 120px;' }}
							width={120}
							useSubmitBehavior={true}
						>
							Xác nhận
						</ButtonDevextreme>
						<ButtonDevextreme
							type="normal"
							text="Hủy"
							onClick={hidePopupEdit}
							elementAttr={{ style: 'margin-left: 16px; width: 80px' }}
							width={80}
						/>
					</Box>
				</form>
			</Popup>
		</>
	)
}

export default InstrumentTransfer
