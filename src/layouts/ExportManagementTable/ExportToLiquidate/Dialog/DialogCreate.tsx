import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Tooltip,
} from '@mui/material'

import DataGrid, {
	Column,
	Editing,
	Paging,
	Lookup,
	Summary,
	TotalItem
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { setSnackbar } from '../../../../pages/appSlice'
import {
	IExportToLiquidateManagementFormType,
	dummyExportToLiquidateManagementForm
} from '../../../../types/exportManagementType'
import { DialogProps } from './DialogType'
import { renderHeader } from '../DetailExportToLiquidateManagementForm'
import { colorsNotifi } from '../../../../configs/color'
import {
	getDeviceListAccordingToDepartment,
	getListOfLiquidateDeviceForms,
	postExportToLiquidateManagementForm
} from '../../../../services/exportManagementServices'
import { setListOfExportToLiquidateManagementForms } from '../../exportManagementSlice'

const commonFieldsShow = [
	{ id: 'DeviceId', header: 'Mã thiết bị' },
	{ id: 'DeviceName', header: 'Tên thiết bị' },
	{ id: 'DeviceEnglishName', header: 'Tên tiếng Anh' },
	{ id: 'DeviceInfoId', header: 'Mã định danh thiết bị' },
	{ id: 'Model', header: 'Số Model' },
	{ id: 'SerialNumber', header: 'Số Serial' },
	{ id: 'Specification', header: 'Thông số kỹ thuật' },
	{ id: 'Manufacturer', header: 'Hãng sản xuất' },
	{ id: 'Origin', header: 'Xuất xứ' },
	{ id: 'YearStartUsage', header: 'Năm đưa vào sử dụng' },
	{ id: 'LinkFileRepair', header: 'Biên bản kiểm tra thiết bị từ Đơn vị phụ trách tiếp nhận sửa chữa' },
	{ id: 'LinkFileMaintenace', header: 'Lịch sử bảo trì/sửa chữa' },
	{ id: 'HoursUsageTotal', header: 'Tổng số giờ sử dụng' },
	// { id: 'Status', header: 'Trạng thái', fixed: true },
]

const DialogCreate = ({ isOpen, onClose }: DialogProps) => {
	const dispatch = useAppDispatch()
	const dataGridRef = useRef<DataGrid<any, any> | null>(null)
	const deviceList = useAppSelector(selector => selector.device.listOfDevices)
	const departmentList = useAppSelector(selector => selector.department.listOfDepartments)
	const owner = useAppSelector(state => state.userManager.owner)

	const [currentCreatedForm, setCurrentCreatedForm] = useState<any>(dummyExportToLiquidateManagementForm)
	const [listOfDeviceInfo, setListOfDeviceInfo] = useState<any[]>()


	const getDeviceListOfCreateDepartment = async () => {
		const deviceInfoList = await getDeviceListAccordingToDepartment();
		if (deviceInfoList?.length > 0) {
			let normalizatedDeviceInfoList = deviceInfoList.map((item: any) => {
				let correspondingDeviceType = deviceList.find((deviceType: any) => deviceType.DeviceId === item.DeviceId);

				if (correspondingDeviceType?.DeviceId && correspondingDeviceType.hasOwnProperty("listDeviceInfo")) {
					return item.listDeviceInfoId.map((x: any) => {
						let correspondingDevice = correspondingDeviceType?.listDeviceInfo ? correspondingDeviceType.listDeviceInfo.find((y: any) => y.DeviceInfoId === x) : null;
						if (correspondingDevice?.DeviceInfoId){

						}
						return Object.assign({}, {
							...correspondingDevice,
							DeviceId: item.DeviceId,
							DeviceInfoId: x,
						})
					})
				}

			})
			// console.log("normalizatedDeviceInfoList :", normalizatedDeviceInfoList.flat())
			setListOfDeviceInfo(normalizatedDeviceInfoList.flat())
		}
	}

	useEffect(() => {
		getDeviceListOfCreateDepartment()
	}, [])

	const handleSave = async () => {
		if (!currentCreatedForm?.Title) {
			dispatch(
				setSnackbar({
					message: 'Vui lòng nhập tiêu đề phiếu xuất',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				})
			)
			return;
		}

		else if (!currentCreatedForm?.Content) {
			dispatch(
				setSnackbar({
					message: 'Vui lòng nhập nội dung phiếu xuất',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				})
			)
			return;
		}

		else if (currentCreatedForm?.listDeviceInfo.length === 0) {
			dispatch(
				setSnackbar({
					message: 'Vui lòng thêm thông tin thiết bị thanh lý',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				})
			)
			return;
		}

		else {
			currentCreatedForm.listDeviceInfo.forEach((item: any, idx: number) => {
				if (!item?.DeviceId) {
					dispatch(
						setSnackbar({
							message: `Vui lòng chọn thiết bị ở dòng thứ ${idx + 1}!`,
							color: colorsNotifi['error'].color,
							backgroundColor: colorsNotifi['error'].background,
						})
					)
					return;
				}
			})

			currentCreatedForm?.DepartmentManageId.forEach((item: any, idx: number) => {
				if (!item) {
					dispatch(
						setSnackbar({
							message: `Vui lòng chọn đơn vị quản lý thiết bị ở dòng thứ ${idx + 1}!`,
							color: colorsNotifi['error'].color,
							backgroundColor: colorsNotifi['error'].background,
						})
					)
					return;
				}
			})
		}

		if (!(currentCreatedForm?.DepartmentManageId.every((item: any) => item === currentCreatedForm?.DepartmentManageId[0]))) {
			dispatch(
				setSnackbar({
					message: 'Vui lòng chọn cùng đơn vị quản lý ở các thiết bị!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				})
			)
			return;
		}
		else {
			let normalizatedForm = {
				...currentCreatedForm,
				DepartmentManageId: currentCreatedForm?.DepartmentManageId[0]
			}

			try {
				await postExportToLiquidateManagementForm(normalizatedForm);
				dispatch(
					setSnackbar({
						message: 'Tạo phiếu xuất thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					})
				)

				const listOfExportToLiquidateManagementFormTypes: IExportToLiquidateManagementFormType[] = await getListOfLiquidateDeviceForms();
				if (listOfExportToLiquidateManagementFormTypes) {
					dispatch(setListOfExportToLiquidateManagementForms(listOfExportToLiquidateManagementFormTypes));
				}
				handleClose()
			}
			catch {
				dispatch(
					setSnackbar({
						message: 'Tạo phiếu xuât thất bại!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					})
				)
			}
		}
	}

	const handleClose = () => {
		setCurrentCreatedForm(dummyExportToLiquidateManagementForm)
		onClose()
	}

	const handleDelete = () => {
		handleClose()
	}

	const dataSource = useMemo(() => {
		return new DataSource({
			store: new ArrayStore({
				data: [],
				key: 'Id',
			}),
		})
	}, [deviceList, departmentList])


	const handleEditTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setCurrentCreatedForm({ ...currentCreatedForm, "Title": e.target.value })
	}

	const handleEditContent = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setCurrentCreatedForm({ ...currentCreatedForm, "Content": e.target.value })
	}

	return (
		<Dialog fullScreen open={isOpen} onClose={handleClose}>
			<DialogTitle textAlign="left">
				<b>Tạo phiếu xuất mới</b>

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

			<DialogContent sx={{ overflow: 'auto' }}>
				<Box pb={1}>
					<TextField
						id="TitleExportToLiquidateManagementForm"
						key="Title"
						name="Title"
						label="Tiêu đề"
						variant="standard"
						type="text"
						required
						fullWidth
						onChange={handleEditTitle}
					/>
					<TextField
						id="ContentExportToLiquidateManagementForm"
						key="Content"
						name="Content"
						label="Nội dung"
						variant="standard"
						type="text"
						required
						fullWidth
						onChange={handleEditContent}
					/>
					<TextField
						label="Người lập"
						variant="standard"
						type="text"
						fullWidth
						disabled
						inputProps={{
							value: `${owner.FullName}`,
						}}
					/>
					<TextField
						label="Đơn vị đề xuất thanh lý"
						variant="standard"
						type="text"
						fullWidth
						disabled
						inputProps={{
							value: `${owner.DepartmentName}`,
						}}
					/>
				</Box>

				<DataGridFunc
					owner={owner}
					dataSource={dataSource}
					dataGridRef={dataGridRef}
					deviceList={deviceList}
					setCurrentCreatedForm={setCurrentCreatedForm}
					listOfDeviceInfo={listOfDeviceInfo}
				/>

				<Box px={2} pb={5} height="100%">
					<Box sx={{ float: "right" }}>
						<Tooltip arrow placement="left" title="Xoá phiếu đề nghị">
							<Button
								variant="contained"
								onClick={handleDelete}>
								Xoá
							</Button>
						</Tooltip>

						<Tooltip arrow placement="top" title="Lưu phiếu đề nghị">
							<Button
								variant="contained"
								onClick={handleSave}
								sx={{ marginLeft: '24px' }}>
								Lưu
							</Button>
						</Tooltip>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	)
}

export default DialogCreate

type IDataGridFuncProps = {
	owner: any;
	dataSource: any;
	dataGridRef: any;
	deviceList: any;
	setCurrentCreatedForm: any;
	listOfDeviceInfo: any;
}

const DataGridFunc = React.memo(function DataGridFunc({
	owner,
	dataSource,
	dataGridRef,
	deviceList,
	setCurrentCreatedForm,
	listOfDeviceInfo,
}: IDataGridFuncProps) {
	const onEditorPreparing = useCallback((e: any) => {
		if (e.parentType === "dataRow" && e.dataField === "DeviceName") {
			e.editorOptions.onValueChanged = function (ev: any) {
				let selectedItem = ev.component.option("selectedItem");
				e.setValue(selectedItem);
			};
		}
		if (e.parentType === "dataRow" && e.dataField === "DeviceInfoId") {
			e.editorOptions.onValueChanged = function (ev: any) {
				let selectedItem = ev.component.option("selectedItem");
				e.setValue(selectedItem);
			}
		}
	}, [])

	const setCellValue = (rowData: any, value: any) => {
		rowData.DeviceId = value.DeviceId;
		rowData.DeviceName = value.DeviceName;
		rowData.DeviceEnglishName = value.DeviceEnglishName;
		rowData.DeviceInfoId = value.DeviceInfoId;
		rowData.Model = value.Model;
		rowData.SerialNumber = value.SerialNumber;
		rowData.Specification = value.Specification;
		rowData.Manufacturer = value.Manufacturer;
		rowData.Origin = value.Origin;
		rowData.SupplierName = value.SupplierName;
		rowData.YearStartUsage = value.YearStartUsage;
		rowData.HoursUsageTotal = value.HoursUsageTotal;
	}

	const onContentReady = (e: any) => {
		let allRows = e.component.getVisibleRows();
		let newListDeviceInfo = allRows.map((rowItem: any) => Object.assign({}, { DeviceId: rowItem.values[0] }))
		setCurrentCreatedForm((prevState: any) => Object.assign({}, {
			...prevState,
			DepartmentManageId: allRows.map((row: any) => row.values[5]),
			listDeviceInfo: newListDeviceInfo
		}))
	}

	const getFilteredDeviceInfoIds = (options: any) => {
		return {
			store: listOfDeviceInfo,
			filter: options.data ? ['DeviceId', '=', options.data.DeviceId] : null,
		};
	}

	return (<DataGrid
		dataSource={dataSource}
		ref={dataGridRef}
		showBorders={true}
		columnAutoWidth={true}
		allowColumnResizing={true}
		onContentReady={onContentReady}
		columnResizingMode="widget"
		columnMinWidth={100}
		searchPanel={{
			visible: true,
			width: 240,
			placeholder: 'Tìm kiếm',
		}}
		editing={{
			confirmDelete: true,
			allowDeleting: true,
			allowAdding: true,
			allowUpdating: true,
			mode: 'batch',
		}}
		elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
		onEditorPreparing={onEditorPreparing}
	>
		<Paging enabled={true} />
		<Editing mode="row" allowUpdating={true} allowDeleting={true} allowAdding={true} />

		{commonFieldsShow.map(col => {
			if (col.id === "DeviceInfoId") {
				return <Column
					key="DeviceInfoId"
					dataField="DeviceInfoId"
					dataType="string"
					caption="Mã định danh thiết bị"
					headerCellRender={data => renderHeader(data, true)}
					setCellValue={setCellValue}
				>
					{listOfDeviceInfo?.length > 0 && <Lookup
						dataSource={getFilteredDeviceInfoIds}
						valueExpr="DeviceInfoId"
						displayExpr="DeviceInfoId"
					/>}
				</Column>
			}
			if (col.id === "DeviceName") {
				return <Column
					key="DeviceName"
					dataField="DeviceName"
					caption="Tên thiết bị"
					dataType="string"
					headerCellRender={data => renderHeader(data, true)}
					setCellValue={setCellValue}
				>
					<Lookup dataSource={deviceList} valueExpr="DeviceName" displayExpr="DeviceName" />
				</Column>
			}
			else {
				return <Column
					key={col.id}
					dataField={col.id}
					dataType="string"
					headerCellRender={data => renderHeader(data)}
					caption={col.header}
					allowEditing={false}
					cellRender={data => (
						<span>
							{data.text}
						</span>
					)}
				/>
			}
		})}

		<Summary recalculateWhileEditing={true}>
			<TotalItem column="DeviceId" summaryType="count" />
		</Summary>
	</DataGrid>)
})