import { Box, Paper, Typography } from '@mui/material'
import DataGrid, {
	Column,
	ColumnChooser,
	ColumnFixing,
	Export,
	FilterPanel,
	FilterRow,
	Grouping,
	HeaderFilter,
	Item,
	LoadPanel,
	Paging,
	Position,
	Scrolling,
	Selection,
	Toolbar,
} from 'devextreme-react/data-grid'
import DateBox from 'devextreme-react/date-box'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { ExportingEvent } from 'devextreme/ui/data_grid'
import { Column as ExcelCol, Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../configs/color'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setSnackbar } from '../../pages/appSlice'
import { getDeviceForCriteria, postMaintenanceSearchForExport } from '../../services/maintenanceDevicesServices'
import { IMaintenanceDevice } from '../../types/maintenanceDevicesType'
import Button from 'devextreme-react/button'
import { ADMIN, EXPERIMENTAL_MANAGEMENT_SPECIALIST, UNIT_UTILIZATION_SPECIALIST } from '../../configs/permissions'
import LoadIndicator from 'devextreme-react/load-indicator'
import { useLoading } from '../../hooks/useLoading'

function MaintenanceDeviceTable() {
	const [deviceForCriteria, setDeviceForCriteria] = useState<IMaintenanceDevice[]>([])
	const [dateStart, setDateStart] = useState<Date>(new Date())
	const [dateEnd, setDateEnd] = useState<Date>(new Date())
	const dispatch = useAppDispatch()
	const { owner } = useAppSelector(state => state.userManager)

	const columns = useRef([
		{ id: 'DeviceInfoId', header: 'Mã định danh thiết bị' },
		{ id: 'DeviceName', header: 'Tên thiết bị' },
		{
			id: 'Location',
			header: 'Vị trí',
		},
		{ id: 'DepartmentManageName', header: 'Đơn vị quản lý thiết bị' },
	])

	const exportHeaders = useRef<Partial<ExcelCol>[]>([
		{
			header: 'Mã định danh thiết bị',
			key: 'DeviceInfoId',
			width: 20,
		},
		{
			header: 'Tên thiết bị',
			key: 'DeviceName',
			width: 20,
		},
		{
			header: 'Vị trí',
			key: 'Location',
			width: 20,
		},
		{
			header: 'Đơn vị quản lý thiết bị',
			key: 'DepartmentManageName',
			width: 20,
		},
		{
			header: 'Thời gian bắt đầu',
			key: 'StartDate',
			width: 20,
		},
		{
			header: 'Thời gian kết thúc',
			key: 'EndDate',
			width: 20,
		},
		{
			header: 'Ngày hiệu chuẩn/bảo trì',
			key: 'NextDateMaintenace',
			width: 20,
		},
	])

	const dataGridRef = useRef<DataGrid<IMaintenanceDevice, string> | null>(null)

	const dataSource = useMemo(() => {
		return new DataSource<IMaintenanceDevice, string>({
			store: new ArrayStore({
				data: deviceForCriteria,
				key: 'DeviceInfoId',
			}),
		})
	}, [deviceForCriteria])

	const [getCriteria, isLoadingGetCriteria] = useLoading(async () => {
		try {
			const deviceForCriteria = await getDeviceForCriteria()
			setDeviceForCriteria(deviceForCriteria)
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi trong khi tải dữ liệu!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
		}
	})

	const onExporting = async (e: ExportingEvent<IMaintenanceDevice, any>) => {
		const deviceSelected = e.component.getSelectedRowsData()

		const workbook = new Workbook()
		const worksheet = workbook.addWorksheet('Sheet 1')

		worksheet.columns = exportHeaders.current
		worksheet.columns.forEach((column, index) => {
			column.font = {
				name: 'Times New Roman',
				size: 13,
			}
		})

		worksheet.getRow(1).eachCell(cell => {
			cell.border = {
				top: { style: 'thin' },
				bottom: { style: 'thin' },
				left: { style: 'thin' },
				right: { style: 'thin' },
			}
		})

		try {
			const exportData = await postMaintenanceSearchForExport(
				(dateStart.getTime() / 1000).toFixed(0),
				(dateEnd.getTime() / 1000).toFixed(0),
				deviceSelected,
			)

			exportData.data.forEach(row => {
				const addedRow = worksheet.addRow({
					...row,
					StartDate: new Date(Number(row.StartDate) * 1000),
					EndDate: new Date(Number(row.EndDate) * 1000),
					NextDateMaintenace: new Date(Number(row.NextDateMaintenace) * 1000),
				})

				addedRow.eachCell({ includeEmpty: true }, cell => {
					cell.border = {
						top: { style: 'thin' },
						bottom: { style: 'thin' },
						left: { style: 'thin' },
						right: { style: 'thin' },
					}
				})
			})

			workbook.xlsx
				.writeBuffer()
				.then(buffer => saveAs(new Blob([buffer]), `${Date.now()}.xlsx`))
				.catch(err => console.log('Error writing excel export', err))
		} catch (error) {
			console.log(error)
		}

		e.cancel = true
	}

	useEffect(() => {
		getCriteria().catch(console.error)
	}, [])

	const handleRefresh = () => {
		getCriteria().catch(console.error)
	}

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
				component="div"
				boxShadow="none"
				border="none"
				justifyContent="space-between"
				display="flex"
				flexWrap="wrap"
				m={2}
			>
				<Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
					Hiệu chuẩn/bảo trì
				</Typography>

				{[ADMIN, UNIT_UTILIZATION_SPECIALIST, EXPERIMENTAL_MANAGEMENT_SPECIALIST].includes(owner.GroupName) && (
					<Box
						display="flex"
						flexWrap="wrap"
						marginLeft="auto"
						alignItems="center"
						justifySelf="right"
						justifyContent="right"
					>
						<div
							className="dx-field"
							style={{
								display: 'flex',
								alignItems: 'center',
								marginBottom: '0px',
							}}
						>
							<div style={{ marginRight: '8px' }}>TG bắt đầu: </div>
							<div>
								<DateBox
									onValueChanged={e => {
										setDateStart(new Date(e?.value || ''))
									}}
									value={dateStart}
									type="date"
									displayFormat="dd/MM/yyyy"
								/>
							</div>
						</div>
						<div
							className="dx-field"
							style={{
								display: 'flex',
								alignItems: 'center',
								marginLeft: '8px',
							}}
						>
							<div style={{ marginRight: '8px' }}>TG kết thúc: </div>
							<div>
								<DateBox
									onValueChanged={e => {
										setDateEnd(new Date(e?.value || ''))
									}}
									value={dateEnd}
									defaultValue={new Date()}
									type="date"
									displayFormat="dd/MM/yyyy"
								/>
							</div>
						</div>
					</Box>
				)}
			</Box>

			<Paper
				sx={{
					marginBottom: '24px',
					overflow: 'overlay',
					flex: '1',
					padding: '0 16px 16px 16px',
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
					editing={{
						allowDeleting: false,
						allowAdding: false,
						allowUpdating: false,
					}}
					noDataText=""
					elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
					onExporting={onExporting}
					wordWrapEnabled={true}
				>
					<Selection mode="multiple" selectAllMode="allPages" showCheckBoxesMode="always" />
					<ColumnChooser enabled={true} mode="select">
						<Position my="right top" at="right top" of=".dx-datagrid-column-chooser-button" />
					</ColumnChooser>
					<Paging enabled={false} />
					<FilterRow visible={true} applyFilter={true} />
					<HeaderFilter visible={true} />
					<ColumnFixing enabled={false} />
					<Grouping contextMenuEnabled={true} expandMode="rowClick" />
					<FilterPanel visible={true} />
					<Export
						enabled={[ADMIN, UNIT_UTILIZATION_SPECIALIST, EXPERIMENTAL_MANAGEMENT_SPECIALIST].includes(
							owner.GroupName,
						)}
						allowExportSelectedData={true}
					/>
					<LoadPanel enabled={true} />
					<Scrolling mode="infinite" />
					<LoadPanel enabled={true} showPane={isLoadingGetCriteria} />
					{columns.current.map(col => (
						<Column key={col.id} dataField={col.id} dataType="string" caption={col.header} />
					))}
					<Toolbar>
						<Item location="before">
							<Button
								stylingMode="contained"
								disabled={isLoadingGetCriteria}
								type="default"
								onClick={handleRefresh}
							>
								<LoadIndicator
									id="small-indicator"
									height={20}
									width={20}
									visible={isLoadingGetCriteria}
									elementAttr={{ class: 'indicator-white' }}
								/>
								Làm mới
							</Button>
						</Item>
						<Item name="exportButton" showText="always" />
						<Item name="columnChooserButton"  showText="always" />
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</Paper>
		</div>
	)
}

export default MaintenanceDeviceTable
