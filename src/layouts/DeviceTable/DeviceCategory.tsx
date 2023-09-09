import { Box, Typography } from '@mui/material'
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
import SelectBox from 'devextreme-react/select-box'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { ValueChangedEvent } from 'devextreme/ui/select_box'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../hooks'
import { useLoading } from '../../hooks/useLoading'
import { getDeviceGeneral, getDeviceGeneralDept } from '../../services/deviceServices'
import { IDeviceGeneral } from '../../types/deviceType'

const DeviceCategory = () => {
	const [devices, setDevices] = useState<IDeviceGeneral[]>([])
	const departments = useAppSelector(state => state.department.listOfDepartments)
	const [department, setDepartment] = useState<string>('all')

	const [getDeviceData, isLoadingGetDevices] = useLoading(async () => {
		try {
			let data: IDeviceGeneral[] = []
			if (department === 'all' || department === '') {
				data = await getDeviceGeneral()
			} else {
				data = await getDeviceGeneralDept(department)
			}
			setDevices(data)
		} catch (error) {
			console.log(error)
		}
	})

	useEffect(() => {
		getDeviceData().catch(console.error)
	}, [department])

	const dataGridRef = useRef<DataGrid<any, any> | null>(null)

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: devices || [],
				key: 'DeviceId',
			}),
		})
	}, [devices])

	const handleRefresh = () => {
		getDeviceData().catch(console.error)
	}
	const columns = useMemo<IColumnProps[]>(
		() => [
			{ dataField: 'DeviceId', caption: 'Mã thiết bị' },
			{ dataField: 'DeviceInfoId', caption: 'Mã định danh thiết bị', fixed: true },
			{ dataField: 'DeviceName', caption: 'Tên thiết bị', fixed: true },
			{ dataField: 'DeviceEnglishName', caption: 'Tên tiếng anh' },
			{ dataField: 'Model', caption: 'Số Model' },
			{ dataField: 'SerialNumber', caption: 'Số Serial' },
			{ dataField: 'Specification', caption: 'Thông số kỹ thuật' },
			{ dataField: 'Manufacturer', caption: 'Hãng sản xuất' },
			{ dataField: 'Origin', caption: 'Xuất xứ' },
			{ dataField: 'DeviceLocation', caption: 'Vị trí', visible: department !== 'all' },
			{ dataField: 'DepartmentImportName', caption: 'Đơn vị nhập', visible: department === 'all' },
			{ dataField: 'Status', caption: 'Tình trạng' },
		],
		[department],
	)

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
				overflow="auto"
				m={2}
			>
				<Typography fontWeight="bold" align="left" variant="h6" whiteSpace="nowrap">
					Danh mục thiết bị
				</Typography>
				<SelectBox
					items={[{ DepartmentId: 'all', DepartmentName: 'Toàn trường' }, ...departments]}
					displayExpr="DepartmentName"
					valueExpr="DepartmentId"
					placeholder="Chọn phòng..."
					defaultValue="all"
					onValueChanged={(e: ValueChangedEvent) => {
						setDepartment(e.value || '')
					}}
					width={320}
					value={department}
					searchEnabled={true}
				/>
			</Box>
			<Box
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
					columnMinWidth={150}
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
					<LoadPanel enabled={true} showPane={isLoadingGetDevices} />
					<Paging defaultPageSize={30} />
					{columns.map(col => (
						<Column key={col.dataField} {...col}></Column>
					))}

					<Toolbar>
						<Item location="before">
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
						<Item name="addRowButton" showText="always"/>
						<Item name="saveButton" showText="always"/>
						<Item name="revertButton" showText="always"/>
						<Item name="columnChooserButton" showText="always"/>
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</Box>
		</div>
	)
}

export default DeviceCategory
