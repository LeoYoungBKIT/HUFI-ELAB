import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import WarningIcon from '@mui/icons-material/Warning'
import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Link,
	Step,
	StepIconProps,
	StepLabel,
	Stepper,
	TextField,
	Typography,
} from '@mui/material'
import ButtonDevextreme from 'devextreme-react/button'
import DataGrid, { Column, IColumnProps } from 'devextreme-react/data-grid'
import FileUploader from 'devextreme-react/file-uploader'
import Form, { Item as FormItem, IItemProps } from 'devextreme-react/form'
import Popup from 'devextreme-react/popup'
import { RequiredRule } from 'devextreme-react/validator'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import moment from 'moment'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { colorsNotifi } from '../../../configs/color'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { setSnackbar } from '../../../pages/appSlice'
import { getDeviceGeneral } from '../../../services/deviceServices'
import {
	deleteRepairDevice,
	postAcceptRepairDevice,
	postCompleteByRepairUnit,
	postCompleteRepairDevice,
	postProposeLiquidateRepairDevice,
	postReceiveRepairDevice,
	postRejectRepairDevice,
	putRepairDevice,
} from '../../../services/maintenanceDevicesServices'
import { IDeviceGeneral } from '../../../types/deviceType'
import { IRepairDevice } from '../../../types/maintenanceDevicesType'
import { DialogProps } from '../../DeviceTable/Dialog/DialogType'
import { useLoading } from '../../../hooks/useLoading'
import Button from 'devextreme-react/button'
import LoadIndicator from 'devextreme-react/load-indicator'
import {
	ADMIN,
	EQUIPMENT_MANAGEMENT_HEAD,
	EQUIPMENT_MANAGEMENT_SPECIALIST,
	EXPERIMENTAL_MANAGEMENT_HEAD,
	EXPERIMENTAL_MANAGEMENT_SPECIALIST,
	UNIT_UTILIZATION_HEAD,
	UNIT_UTILIZATION_SPECIALIST,
} from '../../../configs/permissions'
import { confirm } from 'devextreme/ui/dialog'

type RepairDeviceDetailProps = DialogProps & {
	data: IRepairDevice
	changeData: () => void
}

const RepairDeviceDetail = ({ isOpen, onClose, data, changeData }: RepairDeviceDetailProps) => {
	const [progressStep, setProgressStep] = useState<number>(1)
	const [currentData, setCurrentData] = useState<IRepairDevice>(data)
	const [deviceGenerals, setDeviceGenerals] = useState<IDeviceGeneral[]>([])
	const contentRepairRef = useRef<HTMLInputElement>()
	const [popupEditVisible, setPopupEditVisible] = useState<boolean>(false)
	const [popupComfirmFileVisible, setPopupComfirmFileVisible] = useState<boolean>(false)
	const [popupComfirmLiquidateFileVisible, setPopupComfirmLiquidateFileVisible] = useState<boolean>(false)
	const stepperRef = useRef<HTMLDivElement>()
	const { owner } = useAppSelector(state => state.userManager)
	const dispatch = useAppDispatch()

	const hidePopupEdit = useCallback(() => {
		setPopupEditVisible(false)
	}, [setPopupEditVisible])

	const showPopupEdit = useCallback(() => {
		setPopupEditVisible(true)
	}, [setPopupEditVisible])

	const hidePopupComfirmFile = useCallback(() => {
		setPopupComfirmFileVisible(false)
	}, [setPopupComfirmFileVisible])

	const showPopupComfirmFile = useCallback(() => {
		setPopupComfirmFileVisible(true)
	}, [setPopupComfirmFileVisible])

	const hidePopupComfirmLiquidateFile = useCallback(() => {
		setPopupComfirmLiquidateFileVisible(false)
	}, [setPopupComfirmLiquidateFileVisible])

	const showPopupComfirmLiquidateFile = useCallback(() => {
		setPopupComfirmLiquidateFileVisible(true)
	}, [setPopupComfirmLiquidateFileVisible])

	const getDeviceInfo = async () => {
		const devicesInfo = await getDeviceGeneral()
		if (devicesInfo.find(x => x.DeviceInfoId === currentData.DeviceInfoId)) setDeviceGenerals(devicesInfo)
		else
			setDeviceGenerals([
				...devicesInfo,
				{
					DeviceInfoId: currentData.DeviceInfoId,
					DeviceName: currentData.DeviceName,
				},
			])
	}

	useEffect(() => {
		setCurrentData(data)
	}, [data])

	useEffect(() => {
		if (currentData) {
			setProgressStep(currentData.listAccept.length + 1)
		}
		getDeviceInfo().catch(console.error)
	}, [currentData])

	const dataGridRef = useRef<DataGrid<IRepairDevice, string> | null>(null)

	const dataSource = useMemo(() => {
		return new DataSource<IRepairDevice, string>({
			store: new ArrayStore({
				data: [currentData],
				key: 'RepairId',
			}),
			reshapeOnPush: true,
		})
	}, [currentData])

	const columns = useMemo<IColumnProps[]>(
		() => [
			{
				dataField: 'DeviceInfoId',
				caption: 'Mã định danh Thiết bị ',
				width: 200,
				allowEditing: true,
			},
			{ dataField: 'DeviceName', caption: 'Tên Thiết bị', minWidth: 200, allowEditing: false },
			{ dataField: 'Location', caption: 'Vị trí', width: 100, allowEditing: false },
			{ dataField: 'YearstartUsage', caption: 'Năm đưa vào sử dụng', width: 120, allowEditing: false },
			{
				dataField: 'DateCreate',
				caption: 'Ngày tạo',
				width: 100,
				dataType: 'date',
				allowEditing: true,
			},
			{ dataField: 'EmployeeCreateName', caption: 'Người tạo', width: 200, allowEditing: false },
			{
				dataField: 'LinkReportFile',
				caption: 'Bản tường trình',
				allowEditing: true,
				cellRender: e => (
					<Link target="_blank" href={currentData.LinkReportFile}>
						Xem
					</Link>
				),
				width: 100,
			},
			{
				dataField: 'DepartmentRepairName',
				caption: 'Đơn vị tiếp nhận',
				width: 280,
				allowEditing: false,
				visible: !['tiepnhan_khongtiepnhan', 'duyet'].includes(currentData.DisplayMode),
			},
			{
				dataField: 'DepartmentCreateName',
				caption: 'Đơn vị đề xuất',
				width: 280,
				allowEditing: false,
				visible: ['tiepnhan_khongtiepnhan', 'duyet'].includes(currentData.DisplayMode),
			},
			{
				dataField: 'LinkCheckFile',
				caption: 'Biên bản kiểm tra',
				allowEditing: true,
				cellRender: e => (
					<Link target="_blank" href={currentData.LinkCheckFile}>
						Xem
					</Link>
				),
				width: 100,
			},
			{
				dataField: 'LinkHandoverFile',
				caption: 'Biên bản bàn giao',
				allowEditing: true,
				cellRender: e => (
					<Link target="_blank" href={currentData.LinkHandoverFile}>
						Xem
					</Link>
				),
				width: 100,
			},
			{ dataField: 'Status', caption: 'Trạng thái', width: 100 },
		],
		[currentData],
	)

	const formGroup = useMemo<IItemProps[]>(() => {
		return [
			{ dataField: 'Title', editorType: 'dxTextBox', cssClass: 'pointer-event-none', caption: 'Tiêu đề' },
			{
				dataField: 'ContentRepair',
				editorType: 'dxTextBox',
				cssClass: 'pointer-event-none',
				caption: 'Nội dung sửa chữa',
			},
			{
				dataField: 'ContentReport',
				editorType: 'dxTextBox',
				cssClass: 'pointer-event-none',
				caption: 'Nội dung tường trình',
			},
		]
	}, [])

	const [handleRejectRepair, isLoadingRejectRepair] = useLoading(async () => {
		try {
			let result = await confirm(
				`<p><p style="color: red">${
					contentRepairRef?.current?.value ? '' : `Bạn đang từ chối mà không có nội dung sửa chữa.`
				}</p>Bạn chắc chắn từ chối tiếp nhận phiếu sửa chữa này?</p>`,
				'Từ chối tiếp nhận',
			)
			if (result) {
				await postRejectRepairDevice(currentData.RepairId, contentRepairRef?.current?.value || 'Trống')

				dispatch(
					setSnackbar({
						message: 'Không tiếp nhận phiếu sửa chữa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
				changeData()
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		}
	})

	const [handleReceiveRepair, isLoadingReceiveRepair] = useLoading(async () => {
		try {
			let result = await confirm('<p>Bạn chắc chắn đồng ý tiếp nhận phiếu sửa chữa này?</p>', 'Tiếp nhận')
			if (result) {
				await postReceiveRepairDevice(currentData.RepairId)

				dispatch(
					setSnackbar({
						message: 'Tiếp nhận phiếu sửa chữa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
				changeData()
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		}
	})

	const [handleCompleteRepair, isLoadingCompleteRepair] = useLoading(async () => {
		try {
			let result = await confirm(
				'<p>Bạn chắc chắn xác nhận hoàn thành phiếu sửa chữa này?</p>',
				'Xác nhận hoàn thành',
			)
			if (result) {
				await postCompleteRepairDevice(currentData.RepairId)
				dispatch(
					setSnackbar({
						message: 'Xác nhận hoàn thành thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
				changeData()
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		}
	})

	const [handleAcceptRepair, isLoadingAcceptRepair] = useLoading(async () => {
		try {
			let result = await confirm('<p>Bạn chắc chắn xác nhận duyệt phiếu sửa chữa này?</p>', 'Xác nhận duyệt')
			if (result) {
				await postAcceptRepairDevice(currentData.RepairId)

				dispatch(
					setSnackbar({
						message: 'Duyệt thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
				changeData()
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		}
	})

	const [handleDeleteRepair, isLoadingDeleteRepair] = useLoading(async () => {
		try {
			let result = await confirm('<p>Bạn chắc chắn xác nhận xóa phiếu sửa chữa này?</p>', 'Xác nhận xóa')
			if (result) {
				await deleteRepairDevice(currentData.RepairId)
				dispatch(
					setSnackbar({
						message: 'Xóa phiếu sửa chữa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)
				onClose()
			}
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		}
	})

	const [handleSaving, isLoadingSaving] = useLoading(async (e: FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault()
			const form = e.target as HTMLFormElement
			const formData = new FormData(form)

			const LinkReportFile = formData.get('LinkReportFile') as File

			if (!LinkReportFile?.name) {
				formData.delete('LinkReportFile')
			}

			await putRepairDevice(currentData.RepairId, formData)

			dispatch(
				setSnackbar({
					message: 'Chỉnh sửa phiếu sửa chữa thành công',
					color: colorsNotifi['success'].color,
					backgroundColor: colorsNotifi['success'].background,
				}),
			)

			changeData()
		} catch (error) {
			dispatch(
				setSnackbar({
					message: 'Đã xảy ra lỗi!!!',
					color: colorsNotifi['error'].color,
					backgroundColor: colorsNotifi['error'].background,
				}),
			)
			console.log(error)
		} finally {
			hidePopupEdit()
		}
	})

	const [handleSavingCompleteRepair, isLoadingSavingCompleteRepair] = useLoading(
		async (e: FormEvent<HTMLFormElement>) => {
			try {
				e.preventDefault()
				const form = e.target as HTMLFormElement
				const formData = new FormData(form)

				await postCompleteByRepairUnit(currentData.RepairId, formData)

				dispatch(
					setSnackbar({
						message: 'Xác nhận hoàn thành sửa chữa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)

				changeData()
			} catch (error) {
				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				)
				console.log(error)
			} finally {
				hidePopupComfirmFile()
			}
		},
	)

	const [handleProposeLiquidateRepair, isLoadingProposeLiquidateRepair] = useLoading(
		async (e: FormEvent<HTMLFormElement>) => {
			try {
				e.preventDefault()
				const form = e.target as HTMLFormElement
				const formData = new FormData(form)

				await postProposeLiquidateRepairDevice(currentData.RepairId, formData)

				dispatch(
					setSnackbar({
						message: 'Xác nhận hoàn thành sửa chữa thành công',
						color: colorsNotifi['success'].color,
						backgroundColor: colorsNotifi['success'].background,
					}),
				)

				changeData()
			} catch (error) {
				dispatch(
					setSnackbar({
						message: 'Đã xảy ra lỗi!!!',
						color: colorsNotifi['error'].color,
						backgroundColor: colorsNotifi['error'].background,
					}),
				)
				console.log(error)
			} finally {
				hidePopupComfirmFile()
			}
		},
	)

	const columnsEdit = useRef<(IColumnProps & { typeCreate?: string })[]>([
		{ dataField: 'Title', caption: 'Tiêu đề', typeCreate: 'textbox' },
		{ dataField: 'ContentRepair', caption: 'Nội dung sửa chữa', typeCreate: 'textbox' },
		{ dataField: 'ContentReport', caption: 'Nội dung tường trình', typeCreate: 'textbox' },
		{ dataField: 'LinkReportFile', caption: 'Bản tường trình', visible: false, typeCreate: 'file' },
	])

	useEffect(() => {
		if (stepperRef.current) {
			stepperRef.current.scrollTo({
				left: stepperRef.current.scrollWidth,
				top: 0,
			})
		}
	})

	return (
		<>
			<Dialog
				scroll="paper"
				open={isOpen}
				onClose={onClose}
				fullScreen
				PaperProps={{ style: { maxWidth: 'unset' } }}
			>
				<DialogTitle textAlign="left">
					<b>
						Chi tiết phiếu sửa chữa thiết bị - {currentData.RepairId} - {currentData.Title}
					</b>

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
					<div
						style={{ width: '100%', paddingBottom: '16px', overflow: 'auto' }}
						ref={stepperRef as React.LegacyRef<HTMLDivElement>}
					>
						<Stepper activeStep={progressStep} alternativeLabel>
							<Step sx={{ minWidth: 200 }} key="StepStart">
								<StepLabel
									StepIconComponent={(props: StepIconProps) => <CheckCircleIcon color="success" />}
								>
									<div>
										Tạo lúc{' '}
										{moment
											.unix(Number(currentData.listAccept[0].AcceptDate))
											.format('HH:mm - DD/MM/YYYY')}
									</div>
									<div>
										Người tạo: {currentData.EmployeeCreateId} - {currentData.EmployeeCreateName}
									</div>
								</StepLabel>
							</Step>
							{currentData.listAccept.map((label, idx) => (
								<Step sx={{ minWidth: 200 }} key={label.AcceptValue + idx} color="success">
									<StepLabel
										StepIconComponent={(props: StepIconProps) => {
											if (label.AcceptValue === 'Không duyệt') {
												return <WarningIcon sx={{ color: 'red' }} />
											} else if (['Duyệt hoàn thành', 'Hoàn thành'].includes(label.AcceptValue)) {
												return <CheckCircleIcon color="success" />
											} else if (idx < currentData.listAccept.length - 1) {
												return <CheckCircleIcon color="success" />
											} else {
												return <AutorenewIcon color="primary" />
											}
										}}
									>
										<div>{label?.AcceptValue}</div>
										<div>
											Lúc: {moment.unix(Number(label?.AcceptDate)).format('HH:mm - DD/MM/YYYY')}
										</div>
										<div>
											NV: {label?.EmployeeAcceptId} - {label?.EmployeeAcceptName}
										</div>
										{label?.ContentAccept && <div>Nội dung: {label.ContentAccept}</div>}
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</div>

					<Box mt={3}>
						<Typography variant="h6" mb={2}>
							Thông tin phiếu
						</Typography>
						<Form formData={currentData}>
							{formGroup?.map(field => (
								<FormItem {...field} key={field.dataField} label={{ text: field.caption }}></FormItem>
							))}
						</Form>
						<DataGrid
							dataSource={dataSource}
							ref={dataGridRef}
							showBorders={true}
							columnAutoWidth={true}
							allowColumnResizing={true}
							columnResizingMode="widget"
							columnMinWidth={100}
							elementAttr={{
								style: 'height: 100%; padding: 10px 0; width: 100%',
							}}
							wordWrapEnabled={true}
							toolbar={{
								disabled: true,
								visible: false,
							}}
							scrolling={{
								useNative: true,
							}}
						>
							{columns.map(col => (
								<Column renderAsync={true} key={col.dataField} {...col} />
							))}
						</DataGrid>

						{currentData.Lock === 'False' && (
							<Box
								mt={3}
								display="flex"
								flexWrap="wrap"
								alignItems="center"
								justifyContent="space-between"
							>
								<Box
									sx={{
										mb: 3,
										width: '100%',
										maxWidth: '500px',
									}}
								>
									{currentData.DisplayMode === 'tiepnhan_khongtiepnhan' && (
										<TextField
											inputRef={contentRepairRef}
											variant="standard"
											placeholder="Nội dung chỉnh sửa"
											label="Nội dung chỉnh sửa"
											color="info"
											multiline
											focused
											sx={{
												width: '100%'
											}}
										/>
									)}
								</Box>
								<Box>
									{currentData.DisplayMode === 'hoanthanh_dexuatthanhly' && (
										<>
											{[
												ADMIN,
												EXPERIMENTAL_MANAGEMENT_SPECIALIST,
												EQUIPMENT_MANAGEMENT_SPECIALIST,
											].includes(owner.GroupName) && (
												<Button
													type="default"
													onClick={showPopupComfirmLiquidateFile}
													elementAttr={{ style: 'margin-left: 8px;' }}
												>
													Đề xuất thanh lý
												</Button>
											)}
											{[
												ADMIN,
												EXPERIMENTAL_MANAGEMENT_SPECIALIST,
												EQUIPMENT_MANAGEMENT_SPECIALIST,
												UNIT_UTILIZATION_SPECIALIST,
											].includes(owner.GroupName) && (
												<Button
													type="default"
													onClick={showPopupComfirmFile}
													elementAttr={{ style: 'margin-left: 8px;' }}
												>
													Hoàn thành sửa chữa
												</Button>
											)}
										</>
									)}
									{currentData.DisplayMode === 'tiepnhan_khongtiepnhan' &&
										[
											ADMIN,
											EXPERIMENTAL_MANAGEMENT_SPECIALIST,
											EQUIPMENT_MANAGEMENT_SPECIALIST,
										].includes(owner.GroupName) && (
											<>
												<Button
													type="default"
													onClick={handleReceiveRepair}
													elementAttr={{ style: 'margin-left: 8px;' }}
													disabled={isLoadingReceiveRepair}
												>
													<LoadIndicator
														id="small-indicator"
														height={20}
														width={20}
														visible={isLoadingReceiveRepair}
														elementAttr={{ class: 'indicator-white' }}
													/>
													Tiếp nhận
												</Button>
												<Button
													type="default"
													onClick={handleRejectRepair}
													elementAttr={{ style: 'margin-left: 8px;' }}
													disabled={isLoadingRejectRepair}
												>
													<LoadIndicator
														id="small-indicator"
														height={20}
														width={20}
														visible={isLoadingRejectRepair}
														elementAttr={{ class: 'indicator-white' }}
													/>
													Không tiếp nhận
												</Button>
											</>
										)}
									{currentData.DisplayMode === 'enable_hoan_thanh' &&
										[
											ADMIN,
											EXPERIMENTAL_MANAGEMENT_SPECIALIST,
											EQUIPMENT_MANAGEMENT_SPECIALIST,
											UNIT_UTILIZATION_SPECIALIST,
										].includes(owner.GroupName) && (
											<Button
												type="default"
												onClick={handleCompleteRepair}
												elementAttr={{ style: 'margin-left: 8px;' }}
												disabled={isLoadingCompleteRepair}
											>
												<LoadIndicator
													id="small-indicator"
													height={20}
													width={20}
													visible={isLoadingCompleteRepair}
													elementAttr={{ class: 'indicator-white' }}
												/>
												Xác nhận hoàn thành
											</Button>
										)}
									{currentData.DisplayMode === 'duyet' &&
										[
											ADMIN,
											EQUIPMENT_MANAGEMENT_HEAD,
											EXPERIMENTAL_MANAGEMENT_HEAD,
											UNIT_UTILIZATION_HEAD,
										].includes(owner.GroupName) && (
											<Button
												type="default"
												onClick={handleAcceptRepair}
												elementAttr={{ style: 'margin-left: 8px;' }}
												disabled={isLoadingAcceptRepair}
											>
												<LoadIndicator
													id="small-indicator"
													height={20}
													width={20}
													visible={isLoadingAcceptRepair}
													elementAttr={{ class: 'indicator-white' }}
												/>
												Duyệt
											</Button>
										)}
									{currentData.DisplayMode === 'sua_phieu' &&
										[ADMIN, UNIT_UTILIZATION_SPECIALIST].includes(owner.GroupName) && (
											<>
												<Button
													onClick={handleDeleteRepair}
													type="default"
													elementAttr={{ style: 'margin-left: 8px;' }}
													disabled={isLoadingDeleteRepair}
												>
													<LoadIndicator
														id="small-indicator"
														height={20}
														width={20}
														visible={isLoadingDeleteRepair}
														elementAttr={{ class: 'indicator-white' }}
													/>
													Xóa
												</Button>
												<Button
													onClick={showPopupEdit}
													type="default"
													elementAttr={{ style: 'margin-left: 8px;' }}
												>
													Chỉnh sửa
												</Button>
											</>
										)}
									{currentData.DisplayMode === 'tao_phieu' &&
										[ADMIN, UNIT_UTILIZATION_SPECIALIST].includes(owner.GroupName) && (
											<>
												<Button
													onClick={handleDeleteRepair}
													type="default"
													elementAttr={{ style: 'margin-left: 8px;' }}
													disabled={isLoadingDeleteRepair}
												>
													<LoadIndicator
														id="small-indicator"
														height={20}
														width={20}
														visible={isLoadingDeleteRepair}
														elementAttr={{ class: 'indicator-white' }}
													/>
													Xóa
												</Button>
												<Button
													onClick={showPopupEdit}
													type="default"
													elementAttr={{ style: 'margin-left: 8px;' }}
												>
													Chỉnh sửa
												</Button>
											</>
										)}
								</Box>
							</Box>
						)}
					</Box>

					<Popup
						visible={popupEditVisible}
						onHiding={hidePopupEdit}
						dragEnabled={true}
						hideOnOutsideClick={false}
						showCloseButton={true}
						showTitle={true}
						title="Chỉnh sửa phiếu sửa chữa"
						height="auto"
						resizeEnabled={true}
						width={700}
					>
						<form onSubmit={handleSaving} encType="multipart/form-data">
							<Form formData={{ ...currentData }}>
								{columnsEdit.current.map(col => {
									if (col?.typeCreate === 'textbox') {
										return (
											<FormItem
												key={col.dataField}
												dataField={col.dataField}
												colSpan={2}
												label={{
													text: col.caption,
												}}
											>
												<RequiredRule />
											</FormItem>
										)
									}
									if (col?.typeCreate === 'selectbox') {
										return (
											<FormItem
												key={col.dataField}
												dataField={col.dataField}
												editorType="dxSelectBox"
												editorOptions={{ ...col.editorOptions, dataSource: deviceGenerals }}
												colSpan={2}
												label={{
													text: col.caption,
												}}
											>
												<RequiredRule />
											</FormItem>
										)
									}
									if (col?.typeCreate === 'file') {
										return (
											<FormItem
												key={col.dataField}
												cssClass="items-center disable-padding-top  disable-padding-bottom disable-padding-left"
												dataField={col.dataField}
												colSpan={2}
												label={{
													text: col.caption,
												}}
											>
												<FileUploader
													selectButtonText="Chọn file"
													labelText=""
													elementAttr={{
														class: 'uploader-horizontal',
													}}
													accept="application/pdf,application/vnd.ms-excel"
													uploadMode="useForm"
													name={col.dataField}
												/>
											</FormItem>
										)
									}
								})}
							</Form>
							<Box display="flex">
								<ButtonDevextreme
									type="default"
									elementAttr={{ style: 'margin-left: auto; width: 120px;' }}
									width={120}
									useSubmitBehavior={true}
									disabled={isLoadingSaving}
								>
									<LoadIndicator
										id="small-indicator"
										height={20}
										width={20}
										visible={isLoadingSaving}
										elementAttr={{ class: 'indicator-white' }}
									/>
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

					<Popup
						visible={popupComfirmFileVisible}
						onHiding={hidePopupComfirmFile}
						dragEnabled={true}
						hideOnOutsideClick={false}
						showCloseButton={true}
						showTitle={true}
						title="Thêm thông tin"
						height="auto"
						resizeEnabled={true}
						width={700}
					>
						<form onSubmit={handleSavingCompleteRepair} encType="multipart/form-data">
							<Form formData={{ ...currentData }}>
								{[
									{ dataField: 'LinkCheckFile', caption: 'Biên bản kiểm tra', typeCreate: 'file' },
									{ dataField: 'LinkHandoverFile', caption: 'Biên bản bàn giao', typeCreate: 'file' },
								].map(col => {
									if (col?.typeCreate === 'file') {
										return (
											<FormItem
												key={col.dataField}
												cssClass="items-center disable-padding-top  disable-padding-bottom disable-padding-left"
												dataField={col.dataField}
												colSpan={2}
												label={{
													text: col.caption,
												}}
											>
												<FileUploader
													selectButtonText="Chọn file"
													labelText=""
													elementAttr={{
														class: 'uploader-horizontal',
													}}
													accept="application/pdf,application/vnd.ms-excel"
													uploadMode="useForm"
													name={col.dataField}
												/>
											</FormItem>
										)
									}
								})}
							</Form>
							<Box display="flex">
								<ButtonDevextreme
									type="default"
									elementAttr={{ style: 'margin-left: auto; width: 120px;' }}
									width={120}
									useSubmitBehavior={true}
									disabled={isLoadingSavingCompleteRepair}
								>
									<LoadIndicator
										id="small-indicator"
										height={20}
										width={20}
										visible={isLoadingSavingCompleteRepair}
										elementAttr={{ class: 'indicator-white' }}
									/>
									Xác nhận
								</ButtonDevextreme>
								<ButtonDevextreme
									type="normal"
									text="Hủy"
									onClick={hidePopupComfirmFile}
									elementAttr={{ style: 'margin-left: 16px; width: 80px' }}
									width={80}
								/>
							</Box>
						</form>
					</Popup>

					<Popup
						visible={popupComfirmLiquidateFileVisible}
						onHiding={hidePopupComfirmLiquidateFile}
						dragEnabled={true}
						hideOnOutsideClick={false}
						showCloseButton={true}
						showTitle={true}
						title="Thêm thông tin"
						height="auto"
						resizeEnabled={true}
						width={700}
					>
						<form onSubmit={handleProposeLiquidateRepair} encType="multipart/form-data">
							<Form formData={{ ...currentData }}>
								{[
									{ dataField: 'LinkCheckFile', caption: 'Biên bản kiểm tra', typeCreate: 'file' },
									{ dataField: 'LinkHandoverFile', caption: 'Biên bản bàn giao', typeCreate: 'file' },
								].map(col => {
									if (col?.typeCreate === 'file') {
										return (
											<FormItem
												key={col.dataField}
												cssClass="items-center disable-padding-top  disable-padding-bottom disable-padding-left"
												dataField={col.dataField}
												colSpan={2}
												label={{
													text: col.caption,
												}}
											>
												<FileUploader
													selectButtonText="Chọn file"
													labelText=""
													elementAttr={{
														class: 'uploader-horizontal',
													}}
													accept="application/pdf,application/vnd.ms-excel"
													uploadMode="useForm"
													name={col.dataField}
												/>
											</FormItem>
										)
									}
								})}
							</Form>
							<Box display="flex">
								<ButtonDevextreme
									type="default"
									elementAttr={{ style: 'margin-left: auto; width: 120px;' }}
									width={120}
									useSubmitBehavior={true}
									disabled={isLoadingProposeLiquidateRepair}
								>
									<LoadIndicator
										id="small-indicator"
										height={20}
										width={20}
										visible={isLoadingProposeLiquidateRepair}
										elementAttr={{ class: 'indicator-white' }}
									/>
									Xác nhận
								</ButtonDevextreme>
								<ButtonDevextreme
									type="normal"
									text="Hủy"
									onClick={hidePopupComfirmLiquidateFile}
									elementAttr={{ style: 'margin-left: 16px; width: 80px' }}
									width={80}
								/>
							</Box>
						</form>
					</Popup>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default RepairDeviceDetail
