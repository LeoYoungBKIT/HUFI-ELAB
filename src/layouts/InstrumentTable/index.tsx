import CloseIcon from '@mui/icons-material/Close'
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
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
    IColumnProps,
    Item,
    LoadPanel,
    Pager,
    Paging,
    Position,
    Toolbar
} from 'devextreme-react/data-grid'
import LoadIndicator from 'devextreme-react/load-indicator'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ADMIN, EQUIPMENT_MANAGEMENT_HEAD, EXPERIMENTAL_MANAGEMENT_HEAD } from '../../configs/permissions'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { useLoading } from '../../hooks/useLoading'
import { getInstruments } from '../../services/instrumentServices'
import { IInstrumentType } from '../../types/instrumentType'
import DialogEditInstrument from './Dialog/DialogEditInstrument'

const InstrumentTable = () => {
	const [instruments, setInstruments] = useState<IInstrumentType[]>([])
	const [popupEditVisible, setPopupEditVisible] = useState<boolean>(false)
	const [selectedInstrument, setSelectedInstrument] = useState<IInstrumentType>()
	const owner = useAppSelector(selector => selector.userManager.owner)
	const dispatch = useAppDispatch()

	const [getInstrumentData, isLoadingGetDevices] = useLoading(async () => {
		try {
            const data: IInstrumentType[] = await getInstruments()
			setInstruments(data)
			console.log(data)
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
				data:
					instruments.map(instrument => ({
						...instrument,
						QuantityInStock: instrument.QuantityImport - instrument.QuantityDistribute,
					})) || [],
				key: 'InstrumentId',
			}),
		})
	}, [instruments])

	const handleRefresh = () => {
		getInstrumentData().catch(console.error)
	}

	const columns = useRef<IColumnProps[]>([
		{ dataField: 'InstrumentId', caption: 'Mã Công cụ - Dụng cụ' },
		{ dataField: 'InstrumentName', caption: 'Tên Công cụ - Dụng cụ' },
		{ dataField: 'Specification', caption: 'Quy cách' },
		{ dataField: 'Unit', caption: 'Đơn vị tính' },
		{ dataField: 'QuantityImport', caption: 'SL nhập' },
		{ dataField: 'QuantityDistribute', caption: 'SL phân phối' },
		{ dataField: 'QuantityExport', caption: 'SL xuất' },
		{ dataField: 'QuantityAvailable', caption: 'SL hiện có' },
		{ dataField: 'QuantityInStock', caption: 'SL kho', visible: true },
	])

	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<Box
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
					columnMinWidth={100}
					searchPanel={{
						visible: true,
						width: 300,
						placeholder: 'Tìm kiếm',
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
					<LoadPanel enabled={true} showPane={true} />
					<Paging defaultPageSize={30} />
					{columns.current.map(col => (
						<Column key={col.dataField} {...col} />
					))}
					<Column type="buttons" width={60} fixed={true}>
						<DevButtonGrid
							icon="chevrondown"
							onClick={(e: { row: { data: IInstrumentType } }) => {
								setSelectedInstrument(e.row.data)
							}}
						/>
					</Column>
					<Toolbar>
						<Item location="before">
							<Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
								Công cụ dụng cụ
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
						{[ADMIN, EQUIPMENT_MANAGEMENT_HEAD, EXPERIMENTAL_MANAGEMENT_HEAD].includes(owner.GroupName) && (
							<Item location="after">
								<Button stylingMode="contained" onClick={() => setPopupEditVisible(true)} icon="add" />
							</Item>
						)}
						<Item name="columnChooserButton" />
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</Box>
			{selectedInstrument && (
				<RowInstrument
					instrument={selectedInstrument}
					isOpen={!!selectedInstrument}
					handleClose={() => setSelectedInstrument(undefined)}
				/>
			)}
			{popupEditVisible && (
				<DialogEditInstrument isOpen={popupEditVisible} onClose={() => setPopupEditVisible(false)} />
			)}
		</div>
	)
}
type RowInstrumentProps = {
	instrument: IInstrumentType
	isOpen: boolean
	handleClose: () => void
}

const RowInstrument = ({ instrument, isOpen, handleClose }: RowInstrumentProps) => {
	const dataGridRef = useRef<DataGrid<any, any> | null>(null)

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: instrument?.listInstrumentDistribute || [],
				key: 'InstrumentId',
			}),
		})
	}, [instrument])

	const columns = useRef<IColumnProps[]>([
		{ dataField: 'InstrumentId', caption: 'Mã Công cụ - Dụng cụ', fixed: true },
		{ dataField: 'InstrumentName', caption: 'Tên Công cụ - Dụng cụ', fixed: true },
		{ dataField: 'Specification', caption: 'Quy cách' },
		{ dataField: 'Unit', caption: 'Đơn vị tính' },
		{ dataField: 'QuantityDistribute', caption: 'SL phân phối' },
		{ dataField: 'QuantityExport', caption: 'SL xuất' },
		{ dataField: 'QuantityAvailable', caption: 'SL hiện có' },
		{ dataField: 'LabId', caption: 'Đơn vị nhập' },
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
						Chi tiết công cụ - dụng cụ - {instrument.InstrumentId} - {instrument.InstrumentName}
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
							{columns.current.map(col => (
								<Column key={col.dataField} {...col} />
                            ))}
                            
							<Toolbar>
								<Item name="columnChooserButton" />
								<Item name="searchPanel" showText="always" />
							</Toolbar>
						</DataGrid>
					</Box>
				</DialogContent>
			</Dialog>
		</>
	)
}
export default InstrumentTable
