import React, { useEffect, useRef, useMemo, useState } from 'react'
import { getRepairDevices } from '../../services/maintenanceDevicesServices'
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
import { IRepairDevice } from '../../types/maintenanceDevicesType'
import moment from 'moment'
import { ColumnCellTemplateData } from 'devextreme/ui/data_grid'

const COLUMN_LINKS = ['LinkCheckFile', 'LInkHandoverFile', 'LinkReportFile']

const RepairDevice = () => {
	const [repairs, setRepairs] = useState<IRepairDevice[]>([])
	useEffect(() => {
		getRepair()
	}, [])

	const getRepair = async () => {
		try {
			const repairs = await getRepairDevices()
			setRepairs(repairs)
			console.log(repairs)
		} catch (error) {}
	}
	const dataGridFromRef = useRef<DataGrid<IRepairDevice, string> | null>(null)

	const dataSourceFrom = useMemo(() => {
		return new DataSource<IRepairDevice, string>({
			store: new ArrayStore({
				data:
					repairs.map(repair => ({
						...repair,
						DateCreate: moment(Number(repair.DateCreate) * 1000).format('YYYY/MM/DD'),
					})) || [],
				key: 'DeviceInfoId',
			}),
		})
	}, [repairs])

	const columns = useRef([
		{ id: 'RepairId', header: 'Mã sửa chữa', width: 100 },
		{ id: 'Title', header: 'Tiêu đề', width: 100 },
		{ id: 'ContentRepair', header: 'Nội dung sửa chữa', width: 280 },
		{ id: 'ContentReport', header: 'Nội dung tường trình', width: 280 },
		{ id: 'DateCreate', header: 'Ngày tạo', width: 100, dataType: 'date' },
		{ id: 'DepartmentCreateName', header: 'Đơn vị tạo', width: 150 },
		{ id: 'DepartmentRepairName', header: 'Đơn vị sửa', width: 250 },
		{ id: 'EmployeeCreateId', header: 'Mã nhân viên tạo', width: 100 },
		{ id: 'EmployeeCreateName', header: 'Tên nhân viên tạo', width: 120 },
		{ id: 'LinkReportFile', header: 'Bản tường trình', width: 120 },
		{ id: 'LInkHandoverFile', header: 'Biên bản bàn giao', width: 120 },
		{ id: 'LinkCheckFile', header: 'Biên bản kiểm tra', width: 120 },
		{ id: 'Location', header: 'Vị trí' },
		{ id: 'YearstartUsage', header: 'Năm đưa vào sử dụng', width: 100 },
		// { id: 'DisplayMode', header: 'Trạng thái hiển thị', width: 100 },
		// { id: 'Lock', header: 'Lock', width: 100 },
		// { id: 'Status', header: 'Trạng thái', width: 150 },
	])

	return (
		<>
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
				wordWrapEnabled={true}
			>
				<Paging enabled={false} />
				<FilterRow visible={true} applyFilter={true} />
				<HeaderFilter visible={true} />
				<ColumnFixing enabled={false} />
				<Grouping contextMenuEnabled={true} expandMode="rowClick" />
				<FilterPanel visible={true} />
				<Scrolling mode="infinite" />
				<LoadPanel enabled={false} />
				{columns.current.map(col => {
					if (COLUMN_LINKS.includes(col.id)) {
						return (
							<Column
								key={col.id}
								dataField={col.id}
								dataType={col?.dataType || 'string'}
								width={col?.width}
								caption={col.header}
								alignment="center"
								cellRender={(e: ColumnCellTemplateData) => {
									console.log(e)
									return (
										<a href={e.value} rel="noreferrer" target="_blank">
											Xem
										</a>
									)
								}}
							/>
						)
					} else {
						return (
							<Column
								key={col.id}
								dataField={col.id}
								dataType={col?.dataType || 'string'}
								width={col?.width}
								caption={col.header}
							/>
						)
					}
				})}
				<Toolbar>
					<Item name="exportButton" />
					<Item name="columnChooserButton" />
					<Item name="searchPanel" showText="always" />
				</Toolbar>
			</DataGrid>
		</>
	)
}

export default RepairDevice
