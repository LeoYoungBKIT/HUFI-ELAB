import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLoading } from '../../hooks/useLoading'
import { deleteDevice, getDevices, postDevice, updateDevice } from '../../services/deviceDepartmentServices'
import { IDeviceDepartmentType } from '../../types/deviceDepartmentType'
import DataSource from 'devextreme/data/data_source'
import ArrayStore from 'devextreme/data/array_store'
import { uniqueId } from 'lodash'
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
	RequiredRule,
	Toolbar,
} from 'devextreme-react/data-grid'
import { Box, Typography } from '@mui/material'
import Button from 'devextreme-react/button'
import LoadIndicator from 'devextreme-react/load-indicator'
import moment from 'moment'
import { SavingEvent } from 'devextreme/ui/data_grid'
import { useAppDispatch } from '../../hooks'
import { setSnackbar } from '../../pages/appSlice'
import { colorsNotifi } from '../../configs/color'

const DeviceCategory = () => {
	const [devices, setDevices] = useState<IDeviceDepartmentType[]>([])
	const dispatch = useAppDispatch()
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
	const columns = useRef<(IColumnProps & { required?: boolean })[]>([
		{ dataField: 'DeviceId', caption: 'Mã thiết bị', required: true },
		{ dataField: 'DeviceName', caption: 'Tên thiết bị' },
		{ dataField: 'DeviceEnglishName', caption: 'Tên tiếng anh' },
	])

	const handleSaving = async (e: SavingEvent<IDeviceDepartmentType, string>) => {
		try {
			if (e.changes.length > 0) {
				const insertDevices = e.changes.filter(change => change.type === 'insert')
				const updateDevices = e.changes.filter(change => change.type === 'update')
				const removeDevices = e.changes.filter(change => change.type === 'remove')

				if (insertDevices.length > 0) {
					try {
						await postDevice(
							insertDevices.map(device => ({
								DeviceId: device.data?.DeviceId || '',
								DeviceName: device.data?.DeviceName || '',
								DeviceEnglishName: device.data?.DeviceEnglishName || '',
							})),
						)

						dispatch(
							setSnackbar({
								message: 'Thêm thành công!!!',
								color: colorsNotifi['success'].color,
								backgroundColor: colorsNotifi['success'].background,
							}),
						)
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

				if (updateDevices.length > 0) {
					const updatePromises = updateDevices.map(device => {
						return updateDevice({
							DeviceId: device.key || '',
							DeviceName:
								device.data?.DeviceName ||
								devices.find(x => x.DeviceId === device.key)?.DeviceName ||
								'',
							DeviceEnglishName:
								device.data?.DeviceEnglishName ||
								devices.find(x => x.DeviceId === device.key)?.DeviceEnglishName ||
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

				if (removeDevices.length > 0) {
					const removePromises = removeDevices.map(device => {
						return deleteDevice(device.key)
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
			getDeviceData().catch(console.error)
		}
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
				flexDirection="column"
				overflow="auto"
				m={2}
			>
				<Typography fontWeight="bold" align="left" variant="h6" whiteSpace="nowrap">
					Danh mục thiết bị
				</Typography>
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
						<Item name="addRowButton" />
						<Item name="saveButton" />
						<Item name="revertButton" />
						<Item name="columnChooserButton" />
						<Item name="searchPanel" showText="always" />
					</Toolbar>
				</DataGrid>
			</Box>
		</div>
	)
}

export default DeviceCategory
