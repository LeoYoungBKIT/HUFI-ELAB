import CloseIcon from '@mui/icons-material/Close'
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import Button from 'devextreme-react/button'
import DataGrid, {
	Column,
	ColumnChooser,
	ColumnFixing,
	FilterPanel,
	FilterRow,
	Grouping,
	HeaderFilter,
	IColumnProps,
	Item,
	LoadPanel,
	Pager,
	Paging,
	Position,
	RequiredRule,
	Toolbar,
} from 'devextreme-react/data-grid'
import LoadIndicator from 'devextreme-react/load-indicator'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { SavingEvent } from 'devextreme/ui/data_grid'
import { useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../../configs/color'
import { useAppDispatch } from '../../../hooks'
import { useLoading } from '../../../hooks/useLoading'
import { setSnackbar } from '../../../pages/appSlice'
import {
	deleteInstrument,
	getInstrumentsGeneral,
	postInstrument,
	updateInstrument,
} from '../../../services/instrumentServices'
import { IInstrumentGeneral } from '../../../types/instrumentType'
import { DialogProps } from './DialogType'

const DialogEditInstrument = ({ isOpen, onClose }: DialogProps) => {
	const [instruments, setInstruments] = useState<IInstrumentGeneral[]>([])
	const dispatch = useAppDispatch()
	const [getInstrumentData, isLoadingGetInstruments] = useLoading(async () => {
		try {
			const data: IInstrumentGeneral[] = await getInstrumentsGeneral()
			setInstruments(data)
		} catch (error) {
			console.log(error)
		}
	})

	useEffect(() => {
		getInstrumentData().catch(console.error)
	}, [])

	const dataGridRef = useRef<DataGrid<any, any> | null>(null)

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: instruments || [],
				key: 'InstrumentId',
			}),
		})
	}, [instruments])

	const handleRefresh = () => {
		getInstrumentData().catch(console.error)
	}

	const columns = useRef<(IColumnProps & { required?: boolean })[]>([
		{ dataField: 'InstrumentId', caption: 'Mã thiết bị', required: true },
		{ dataField: 'InstrumentName', caption: 'Tên thiết bị', required: true },
		{ dataField: 'Specification', caption: 'Quy cách', required: true },
		{ dataField: 'Unit', caption: 'Đơn vị tính', required: true },
	])

	const handleSaving = async (e: SavingEvent<IInstrumentGeneral, string>) => {
		try {
			if (e.changes.length > 0) {
				const insertInstruments = e.changes.filter(change => change.type === 'insert')
				const updateInstruments = e.changes.filter(change => change.type === 'update')
				const removeInstruments = e.changes.filter(change => change.type === 'remove')

				if (insertInstruments.length > 0) {
					try {
						const insertPromises = insertInstruments.map(instrument => {
							return postInstrument({
								InstrumentId: instrument.data.InstrumentId || '',
								InstrumentName: instrument.data?.InstrumentName || '',
								Specification: instrument.data?.Specification || '',
								Unit: instrument.data?.Unit || '',
							})
						})

						Promise.all(insertPromises)
							.then(() => {
								dispatch(
									setSnackbar({
										message: 'Thêm thành công!!!',
										color: colorsNotifi['success'].color,
										backgroundColor: colorsNotifi['success'].background,
									}),
								)
							})
							.catch(() => {
								dispatch(
									setSnackbar({
										message: 'Thêm không thành công!!!',
										color: colorsNotifi['error'].color,
										backgroundColor: colorsNotifi['error'].background,
									}),
								)
							})
					} catch (error) {
						console.log(error)

						dispatch(
							setSnackbar({
								message: 'Thêm không thành công!!!',
								color: colorsNotifi['error'].color,
								backgroundColor: colorsNotifi['error'].background,
							}),
						)
					}
				}

				if (updateInstruments.length > 0) {
					const updatePromises = updateInstruments.map(instrument => {
						return updateInstrument({
							InstrumentId: instrument.key || '',
							InstrumentName:
								instrument.data?.InstrumentName ||
								instruments.find(x => x.InstrumentId === instrument.key)?.InstrumentName ||
								'',
							Specification:
								instrument.data?.Specification ||
								instruments.find(x => x.InstrumentId === instrument.key)?.Specification ||
								'',
							Unit:
								instrument.data?.Unit ||
								instruments.find(x => x.InstrumentId === instrument.key)?.Unit ||
								'',
						})
					})

					Promise.all(updatePromises)
						.then(() => {
							dispatch(
								setSnackbar({
									message: 'Sửa thành công!!!',
									color: colorsNotifi['success'].color,
									backgroundColor: colorsNotifi['success'].background,
								}),
							)
						})
						.catch(() => {
							dispatch(
								setSnackbar({
									message: 'Sửa không thành công!!!',
									color: colorsNotifi['error'].color,
									backgroundColor: colorsNotifi['error'].background,
								}),
							)
						})
				}

				if (removeInstruments.length > 0) {
					const removePromises = removeInstruments.map(instrument => {
						return deleteInstrument(instrument.key)
					})

					Promise.all(removePromises)
						.then(() => {
							dispatch(
								setSnackbar({
									message: 'Xóa thành công!!!',
									color: colorsNotifi['success'].color,
									backgroundColor: colorsNotifi['success'].background,
								}),
							)
						})
						.catch(() => {
							dispatch(
								setSnackbar({
									message: 'Xóa không thành công!!!',
									color: colorsNotifi['error'].color,
									backgroundColor: colorsNotifi['error'].background,
								}),
							)
						})
				}
			}
		} catch (error) {
			console.log(error)
		} finally {
			getInstrumentData().catch(console.error)
		}
	}

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
				<Box
					sx={{
						overflow: 'overlay',
						flex: '1',
						padding: '0 16px 16px 16px',
						boxShadow: 'none',
						border: 'none',
						height: '100%',
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
							mode: 'batch',
							confirmDelete: true,
							allowDeleting: true,
							allowAdding: true,
							allowUpdating: true,
							useIcons: true,
						}}
						elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
						wordWrapEnabled={true}
						repaintChangesOnly={true}
						onSaving={handleSaving}
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
						<LoadPanel enabled={true} />
						<Paging defaultPageSize={30} />
						{columns.current.map(col => (
							<Column key={col.dataField} {...col}>
								{col.required && <RequiredRule />}
							</Column>
						))}

						<Toolbar>
							<Item location="before">
								<Button
									stylingMode="contained"
									type="default"
									disabled={isLoadingGetInstruments}
									onClick={handleRefresh}
								>
									<LoadIndicator
										id="small-indicator"
										height={20}
										width={20}
										visible={isLoadingGetInstruments}
										elementAttr={{ class: 'indicator-white' }}
									/>
									Làm mới
								</Button>
							</Item>
							<Item name="addRowButton" />
							<Item name="saveButton" />
							<Item name="revertButton" />
							<Item name="columnChooserButton" />
							<Item name="searchPanel" showText="always" />
						</Toolbar>
					</DataGrid>
				</Box>
			</DialogContent>
		</Dialog>
	)
}

export default DialogEditInstrument
