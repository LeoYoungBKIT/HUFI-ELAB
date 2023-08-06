import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Toolbar,
	Tooltip,
	Typography
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
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { setSnackbar } from '../../../pages/appSlice'
import { IExportManagementFormType, dummyExportManagementForm } from '../../../types/exportManagementType'
import { DialogProps } from './DialogType'
import { renderHeader } from '../DetailExportManagementForm'
import { colorsNotifi } from '../../../configs/color'
import { getExportManagementForms, postExportManagementForm } from '../../../services/exportManagementServices'
import { setListOfExportManagementForms } from '../exportManagementSlice'


const commonFieldsShow = [
	{ id: 'DeviceId', header: 'Mã thiết bị' },
	{ id: 'DeviceName', header: 'Tên thiết bị' },
	{ id: 'DeviceEnglishName', header: 'Tên tiếng Anh' },
	{ id: 'EmployeeCreateName', header: 'Người đề nghị' },
	{ id: 'DepartmentCreateName', header: 'Đơn vị đề xuất' },
	{ id: 'DepartmentManageName', header: 'Đơn vị quản lý Thiết bị' },
	{ id: 'DateCreate', header: 'Ngày đề nghị', type: 'date' },
	{ id: 'Status', header: 'Trạng thái', fixed: true },
]

const DialogCreate = ({ isOpen, onClose }: DialogProps) => {
	const dispatch = useAppDispatch()
	const dataGridRef = useRef<DataGrid<any, any> | null>(null)
	const deviceList = useAppSelector(selector => selector.device.listOfDevices)
	const departmentList = useAppSelector(selector => selector.department.listOfDepartments)
	const owner = useAppSelector(state => state.userManager.owner)

	const [currentCreatedForm, setCurrentCreatedForm] = useState<any>(dummyExportManagementForm)

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

		else if (currentCreatedForm?.listDeviceInfo.length == 0) {
			dispatch(
				setSnackbar({
					message: 'Vui lòng thêm thông tin thiết bị cần xuất',
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
				await postExportManagementForm(normalizatedForm);
				dispatch(
					setSnackbar({
						message: 'Tạo phiếu xuất thành công!!!',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					})
				)

				const listOfExportManagementForms: IExportManagementFormType[] = await getExportManagementForms();
				if (listOfExportManagementForms) {
					dispatch(setListOfExportManagementForms(listOfExportManagementForms));
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
		setCurrentCreatedForm(dummyExportManagementForm)
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

				<Box
					component="form"
				>
					<TextField
						id="TitleExportManagementForm"
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
						id="ContnetExportManagementForm"
						key="Content"
						name="Content"
						label="Nội dung"
						variant="standard"
						type="text"
						required
						fullWidth
						onChange={handleEditContent}
					/>

				</Box>

			</DialogTitle>

			<DialogContent sx={{ overflow: 'auto' }}>
				<DataGridFunc
					owner={owner}
					dataSource={dataSource}
					dataGridRef={dataGridRef}
					deviceList={deviceList}
					departmentList={departmentList}
					setCurrentCreatedForm={setCurrentCreatedForm}
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
	departmentList: any;
	setCurrentCreatedForm: any;
}

const DataGridFunc = React.memo(function DataGridFunc({
	owner,
	dataSource,
	dataGridRef,
	deviceList,
	departmentList,
	setCurrentCreatedForm,
}: IDataGridFuncProps) {
	const onEditorPreparing = useCallback((e: any) => {
		if (e.parentType === "dataRow" && e.dataField === "DeviceName") {
			e.editorOptions.onValueChanged = function (ev: any) {
				let selectedItem = ev.component.option("selectedItem");
				e.setValue(selectedItem);
			};
		}
	}, [])

	const setCellValue = (rowData: any, value: any) => {
		rowData.DeviceId = value.DeviceId;
		rowData.DeviceName = value.DeviceName;
		rowData.DeviceEnglishName = value.DeviceEnglishName;
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
		<Column
			key="DeviceId"
			dataField="DeviceId"
			caption="Mã thiết bị"
			dataType="string"
			allowEditing={false}
			headerCellRender={data => renderHeader(data)}
		>
		</Column>
		<Column
			key="DeviceName"
			dataField="DeviceName"
			caption="Tên thiết bị"
			dataType="string"
			headerCellRender={data => renderHeader(data, true)}
			setCellValue={setCellValue}
		>
			<Lookup dataSource={deviceList} valueExpr="DeviceName" displayExpr="DeviceName" />
		</Column>

		<Column
			key="DeviceEnglishName"
			dataField="DeviceEnglishName"
			caption="Tên tiếng Anh"
			dataType="string"
			allowEditing={false}
			headerCellRender={data => renderHeader(data)}
		>
		</Column>

		<Column
			key="EmployeeCreateName"
			dataField="EmployeeCreateName"
			caption="Người đề nghị"
			dataType="string"
			allowEditing={false}
			headerCellRender={data => renderHeader(data)}
			cellRender={data => (
				<span>
					{owner.FullName}
				</span>
			)}
		>
		</Column>

		<Column
			key="DepartmentCreateName"
			dataField="DepartmentCreateName"
			caption="Đơn vị đề xuất"
			dataType="string"
			allowEditing={false}
			headerCellRender={data => renderHeader(data)}
			cellRender={data => (
				<span>
					{owner.DepartmentName}
				</span>
			)}
		>
		</Column>

		<Column
			key="DepartmentManageName"
			dataField="DepartmentManageName"
			caption="Đơn vị quản lý thiết bị"
			dataType="string"
			headerCellRender={data => renderHeader(data, true)}
		>
			<Lookup dataSource={departmentList} valueExpr="DepartmentId" displayExpr="DepartmentName" />
		</Column>
		<Summary recalculateWhileEditing={true}>
			<TotalItem column="DeviceId" summaryType="count" />
		</Summary>
	</DataGrid>)
})