import React, { useEffect, useMemo, useRef, useState } from "react"
import { IExportToOtherDepartmentManagementFormType } from "../../../types/exportManagementType"
import { useAppDispatch, useAppSelector } from "../../../hooks"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Grid,
    TextField,
    Tooltip,
    Button,
    Stepper,
    Step,
    StepLabel
} from "@mui/material"
import CloseIcon from '@mui/icons-material/Close'
import { Box } from '@mui/system'
import DataGrid, {
    Column,
    ColumnChooser,
    ColumnFixing,
    FilterPanel,
    FilterRow,
    Grouping,
    HeaderFilter,
    Item,
    LoadPanel,
    Pager,
    Paging,
    Toolbar,
    Lookup,
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { uniqueId } from 'lodash'
import moment from 'moment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { StepIconProps } from '@mui/material/StepIcon'
import {
    approveExportToOtherDepartmentManagementForm,
    deleteExportToOtherDepartmentManagementForm,
    forwardApproveExportToOtherDepartmentManagementForm,
    getDeviceInfoListAccordingToDepartment,
    getExportToOtherDepartmentManagementForms,
    rejectExportToOtherDepartmentManagementForm
} from "../../../services/exportManagementServices"
import { colorsNotifi } from "../../../configs/color"
import { setSnackbar } from "../../../pages/appSlice"
import { setListOfExportToOtherDepartmentManagementForms } from "../exportManagementSlice"

type RowExportToOtherDepartmentManagementFormTypeProps = {
    exportManagementForm: IExportToOtherDepartmentManagementFormType
    isOpen: boolean
    handleClose: () => void
}

export const renderHeader = (data: any, isRequired: boolean = false) => {
    return (
        <b style={{ color: 'black' }}>
            {data.column.caption} {isRequired && <span style={{ color: 'red' }}>*</span>}
        </b>
    );
};

const commonFieldsShow = [
    { id: 'DeviceId', header: 'Mã thiết bị' },
    { id: 'DeviceName', header: 'Tên thiết bị' },
    { id: 'DeviceEnglishName', header: 'Tên tiếng Anh' },
    { id: 'EmployeeCreateName', header: 'Người đề nghị' },
    { id: 'DepartmentCreateName', header: 'Đơn vị đề xuất' },
    { id: 'DepartmentManageName', header: 'Đơn vị quản lý Thiết bị' },
    { id: 'DateCreate', header: 'Ngày đề nghị', type: 'date' },
    { id: 'DeviceInfoId', header: 'Mã định danh thiết bị' },
    { id: 'Status', header: 'Trạng thái' },
]

const RowExportToOtherDepartmentManagementFormType = ({
    exportManagementForm,
    isOpen,
    handleClose
}: RowExportToOtherDepartmentManagementFormTypeProps) => {
    const dispatch = useAppDispatch()
    const dataGridRef = useRef<DataGrid<any, any> | null>(null)
    const owner = useAppSelector(selector => selector.userManager.owner)

    const [progressStep,] = useState<number>(exportManagementForm.listAccept.length + 1)
    const [contentAccept, setContentAccept] = useState<string>('')
    const [reason, setReason] = useState<string>('')
    const [listOfDeviceInfo, setListOfDeviceInfo] = useState<any[]>()
    const [currentCreatedForm, setCurrentCreatedForm] = useState<any>(exportManagementForm)


    const getDeviceListOfCreateDepartment = async () => {
        const deviceInfoList = await getDeviceInfoListAccordingToDepartment();
        if (deviceInfoList?.length > 0) {
            let normalizatedDeviceInfoList = deviceInfoList.map((item: any) => {
                return item.listDeviceInfoId.map((x: any) => Object.assign({}, {
                    DeviceId: item.DeviceId,
                    DeviceInfoId: x
                }))
            })
            setListOfDeviceInfo(normalizatedDeviceInfoList.flat())
        }
    }

    useEffect(() => {
        getDeviceListOfCreateDepartment()
        setContentAccept('')
        setReason('')
    }, [])

    const dataSource = useMemo(() => {
        return new DataSource({
            store: new ArrayStore({
                data: (exportManagementForm?.listDeviceInfo || []).map(x => ({
                    ...x,
                    ExportOutId: exportManagementForm.ExportOutId,
                    DepartmentCreateName: exportManagementForm.DepartmentCreateName,
                    Title: exportManagementForm.Title,
                    Content: exportManagementForm.Content,
                    DepartmentManageName: exportManagementForm.DepartmentManageName,
                    DepartmentManageId: exportManagementForm.DepartmentManageId,
                    DateCreate: exportManagementForm.DateCreate,
                    EmployeeCreateName: exportManagementForm.EmployeeCreateName,
                    EmployeeCreateId: exportManagementForm.EmployeeCreateId,
                    Status: exportManagementForm?.listAccept?.length > 0 ?
                        exportManagementForm.listAccept[exportManagementForm.listAccept.length - 1].AcceptValue
                        : 'Mới tạo',
                    Id: uniqueId('ExportToOtherDepartmentManagementFormTypeDetail_')
                })),
                key: 'Id',
            }),
        })
    }, [exportManagementForm])

    const handleEditContentAccept = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setContentAccept(e.target.value);
    }

    const handleEditReason = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setReason(e.target.value);
    }

    const handleApprove = async (id: string) => {
        try {
            await approveExportToOtherDepartmentManagementForm(id);
            dispatch(
                setSnackbar({
                    message: 'Duyệt phiếu xuất thành công!!!',
                    color: colorsNotifi['success'].color,
                    backgroundColor: colorsNotifi['success'].background,
                })
            )

            const listOfExportToOtherDepartmentManagementFormTypes: IExportToOtherDepartmentManagementFormType[] = await getExportToOtherDepartmentManagementForms();
            if (listOfExportToOtherDepartmentManagementFormTypes) {
                dispatch(setListOfExportToOtherDepartmentManagementForms(listOfExportToOtherDepartmentManagementFormTypes));
            }
            handleClose()
        }
        catch {
            dispatch(
                setSnackbar({
                    message: 'Duyệt phiếu xuât thất bại!',
                    color: colorsNotifi['error'].color,
                    backgroundColor: colorsNotifi['error'].background,
                })
            )
        }
    }

    const handleForwardApprove = async (id: string) => {
        if (!contentAccept) {
            dispatch(
                setSnackbar({
                    message: 'Vui lòng điền đề xuất xử lý!',
                    color: colorsNotifi['error'].color,
                    backgroundColor: colorsNotifi['error'].background,
                })
            )
            return;
        } else {
            let isHaveAllDeviceInfoIds = true;
            let isHaveSameDeviceInfoIds = false;

            currentCreatedForm.listDeviceInfo.forEach((item: any, idx: number) => {
                if (!isHaveAllDeviceInfoIds) {
                    return;
                }

                if (!item?.DeviceInfoId) {
                    dispatch(
                        setSnackbar({
                            message: `Vui lòng chọn mã định danh thiết bị ở dòng thứ ${idx + 1}!`,
                            color: colorsNotifi['error'].color,
                            backgroundColor: colorsNotifi['error'].background,
                        })
                    )
                }
            })

            currentCreatedForm.listDeviceInfo.forEach((item: any, idx: number) => {
                if (isHaveSameDeviceInfoIds) {
                    return;
                }
                currentCreatedForm.listDeviceInfo.slice(idx + 1,).forEach((x: any) => {
                    if (isHaveSameDeviceInfoIds) {
                        return;
                    }
                    if (x.DeviceId === item.DeviceId && x.DeviceInfoId === item.DeviceInfoId) {
                        let duplicatedIdx = currentCreatedForm.listDeviceInfo.findIndex((y: any) => y === x);
                        if (duplicatedIdx) {
                            dispatch(
                                setSnackbar({
                                    message: `Vui lòng chọn mã định danh thiết bị ở dòng thứ ${duplicatedIdx + 1} khác với  mã định danh thiết bị ở dòng thứ ${idx + 1}!`,
                                    color: colorsNotifi['error'].color,
                                    backgroundColor: colorsNotifi['error'].background,
                                })
                            )
                            isHaveSameDeviceInfoIds = true;
                        }
                    }
                })
            })

            if (!isHaveAllDeviceInfoIds || isHaveSameDeviceInfoIds) {
                return;
            }
            else {
                try {
                    await forwardApproveExportToOtherDepartmentManagementForm(currentCreatedForm, id, contentAccept);
                    dispatch(
                        setSnackbar({
                            message: 'Trình duyệt phiếu xuất thành công!!!',
                            color: colorsNotifi['success'].color,
                            backgroundColor: colorsNotifi['success'].background,
                        })
                    )

                    const listOfExportToOtherDepartmentManagementFormTypes: IExportToOtherDepartmentManagementFormType[] = await getExportToOtherDepartmentManagementForms();
                    if (listOfExportToOtherDepartmentManagementFormTypes) {
                        dispatch(setListOfExportToOtherDepartmentManagementForms(listOfExportToOtherDepartmentManagementFormTypes));
                    }
                    handleClose()
                }
                catch {
                    dispatch(
                        setSnackbar({
                            message: 'Trình duyệt phiếu xuât thất bại!',
                            color: colorsNotifi['error'].color,
                            backgroundColor: colorsNotifi['error'].background,
                        })
                    )
                }
            }
        }
    }

    const handleDeleteExportToOtherDepartmentManagementForm = async (id: string) => {
        try {
            await deleteExportToOtherDepartmentManagementForm(id);
            dispatch(
                setSnackbar({
                    message: 'Xóa phiếu xuất thành công!!!',
                    color: colorsNotifi['success'].color,
                    backgroundColor: colorsNotifi['success'].background,
                })
            )

            const listOfExportToOtherDepartmentManagementFormTypes: IExportToOtherDepartmentManagementFormType[] = await getExportToOtherDepartmentManagementForms();
            if (listOfExportToOtherDepartmentManagementFormTypes) {
                dispatch(setListOfExportToOtherDepartmentManagementForms(listOfExportToOtherDepartmentManagementFormTypes));
            }
            handleClose()
        }
        catch {
            dispatch(
                setSnackbar({
                    message: 'Xóa phiếu xuât thất bại!',
                    color: colorsNotifi['error'].color,
                    backgroundColor: colorsNotifi['error'].background,
                })
            )
        }
    }

    const handleReject = async (id: string) => {
        if (!reason) {
            dispatch(
                setSnackbar({
                    message: 'Vui lòng điền lý do không duyệt!',
                    color: colorsNotifi['error'].color,
                    backgroundColor: colorsNotifi['error'].background,
                })
            )
            return;
        } else {
            try {
                await rejectExportToOtherDepartmentManagementForm(exportManagementForm, id, reason);
                dispatch(
                    setSnackbar({
                        message: 'Không duyệt phiếu xuất thành công!!!',
                        color: colorsNotifi['success'].color,
                        backgroundColor: colorsNotifi['success'].background,
                    })
                )

                const listOfExportToOtherDepartmentManagementFormTypes: IExportToOtherDepartmentManagementFormType[] = await getExportToOtherDepartmentManagementForms();
                if (listOfExportToOtherDepartmentManagementFormTypes) {
                    dispatch(setListOfExportToOtherDepartmentManagementForms(listOfExportToOtherDepartmentManagementFormTypes));
                }
                handleClose()
            }
            catch {
                dispatch(
                    setSnackbar({
                        message: 'Không duyệt phiếu xuât thất bại!',
                        color: colorsNotifi['error'].color,
                        backgroundColor: colorsNotifi['error'].background,
                    })
                )
            }
        }
    }

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
                    <b>Phiếu đề nghị xuất thiết bị {exportManagementForm.ExportOutId}</b>

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
                    <Box height="500px">
                        <Grid container spacing={1}>
                            <Grid item sm={1}>
                                <b>Trạng thái: </b>
                            </Grid>
                            <Grid item sm={11} xs={12}>
                                <Stepper activeStep={progressStep} alternativeLabel>
                                    <Step key="StepStart">
                                        <StepLabel StepIconComponent={(props: StepIconProps) => <CheckCircleIcon color="success" />}>
                                            <div style={{ "fontSize": "0.75rem" }}>
                                                Tạo lúc {moment.unix(Number(exportManagementForm.listAccept[0].AcceptDate)).format('HH:mm - DD/MM/YYYY')}
                                            </div>
                                            <div style={{ "fontSize": "0.75rem" }}>
                                                Người tạo: {exportManagementForm.EmployeeCreateId} - {exportManagementForm.EmployeeCreateName}
                                            </div>
                                        </StepLabel>
                                    </Step>
                                    {exportManagementForm.listAccept.map((label, idx) => (
                                        <Step key={label.AcceptValue} color="success">
                                            <StepLabel StepIconComponent={(props: StepIconProps) => {
                                                if (label.AcceptValue === "Không duyệt") {
                                                    return <WarningIcon sx={{ color: "red" }} />;
                                                }
                                                else if (label.AcceptValue === "Hoàn thành") {
                                                    return <CheckCircleIcon color="success" />;
                                                }
                                                else if (idx < exportManagementForm.listAccept.length - 1) {
                                                    return <CheckCircleIcon color="success" />;
                                                }
                                                else {
                                                    return <AutorenewIcon color="primary" />;
                                                }
                                            }}>
                                                <div style={{ "fontSize": "0.75rem" }}>{label.AcceptValue}</div>
                                                {label.AcceptValue !== "Không duyệt" &&
                                                    label.AcceptValue !== "Hoàn thành" &&
                                                    idx < exportManagementForm.listAccept.length - 1 &&
                                                    <>
                                                        <div style={{ "fontSize": "0.75rem" }}>
                                                            Đã duyệt lúc {moment.unix(Number(exportManagementForm.listAccept[idx + 1].AcceptDate)).format('HH:mm - DD/MM/YYYY')}
                                                        </div>
                                                        <div style={{ "fontSize": "0.75rem" }}>
                                                            Người duyệt: {exportManagementForm.listAccept[idx + 1].EmployeeAcceptId} - {exportManagementForm.listAccept[idx + 1].EmployeeAcceptName}
                                                        </div>
                                                        {exportManagementForm.listAccept[idx + 1].ContentAccept && <div style={{ "fontSize": "0.75rem" }}>
                                                            Nội dung: {exportManagementForm.listAccept[idx + 1].ContentAccept}
                                                        </div>}
                                                    </>
                                                }
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Grid>
                        </Grid>


                        <Grid item p={1}>
                            <TextField
                                label="Tiêu đề"
                                variant="standard"
                                type="text"
                                fullWidth
                                disabled
                                inputProps={{
                                    value: `${exportManagementForm.Title}`,
                                }}
                            />
                            <TextField
                                label="Nội dung"
                                variant="standard"
                                type="text"
                                fullWidth
                                disabled
                                inputProps={{
                                    value: `${exportManagementForm.Content}`,
                                }}
                            />
                        </Grid>

                        <DataGridFunc
                            owner={owner}
                            dataSource={dataSource}
                            dataGridRef={dataGridRef}
                            listOfDeviceInfo={listOfDeviceInfo}
                            exportManagementForm={exportManagementForm}
                            setCurrentCreatedForm={setCurrentCreatedForm}
                        />

                        {['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName) &&
                            owner.DepartmentName === exportManagementForm.DepartmentCreateName &&
                            exportManagementForm.Status !== "Hoàn thành" &&
                            <Box
                                sx={{ float: "right" }}
                                alignItems="center"
                                justifyContent="space-between"
                                display="flex"
                            >
                                <Box display="flex" alignItems="end">
                                    <Tooltip arrow placement="left" title="Xóa phiếu đề nghị">
                                        <Button
                                            variant="contained"
                                            onClick={() => handleDeleteExportToOtherDepartmentManagementForm(exportManagementForm.ExportOutId)}
                                        >
                                            Xóa
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Box>
                        }

                        {exportManagementForm.Lock === "False" &&
                            <>
                                {exportManagementForm.DisplayMode === "trinh_duyet" && <TextField
                                    label="Đề xuất hướng xử lý:"
                                    variant="standard"
                                    type="text"
                                    sx={{ "paddingBottom": "10px", width: "50%" }}
                                    onChange={handleEditContentAccept}
                                />}

                                {exportManagementForm.DisplayMode === "duyet_khongduyet" && <TextField
                                    label="Lý do:"
                                    variant="standard"
                                    type="text"
                                    sx={{ "paddingBottom": "10px", width: "50%" }}
                                    onChange={handleEditReason}
                                />}

                                <Box
                                    sx={{ float: "right" }}
                                    alignItems="center"
                                    justifyContent="space-between"
                                    display="flex"
                                >
                                    {[
                                        'Trưởng đơn vị sử dụng',
                                        'Trưởng phòng TT TNTH',
                                    ].includes(owner.GroupName) &&
                                        owner.DepartmentName === exportManagementForm.DepartmentCreateName &&
                                        <Box display="flex" alignItems="end">
                                            <Tooltip arrow placement="left" title="Duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApprove(exportManagementForm.ExportOutId)}
                                                >
                                                    Duyệt
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    }

                                    {(owner.GroupName === 'Chuyên viên phòng QTTB' ||
                                        (['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName) &&
                                            owner.DepartmentName === exportManagementForm.DepartmentManageName)) &&
                                        <Box display="flex" alignItems="end">
                                            <Tooltip arrow placement="left" title="Trình duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleForwardApprove(exportManagementForm.ExportOutId)}
                                                >
                                                    Trình duyệt
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    }

                                    {(owner.GroupName === 'Trưởng phòng QTTB' ||
                                        (['Trưởng phòng TT TNTH', 'Trưởng đơn vị sử dụng'].includes(owner.GroupName) &&
                                            owner.DepartmentName === exportManagementForm.DepartmentManageName)) &&
                                        <>
                                            <Tooltip arrow placement="left" title="Không duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleReject(exportManagementForm.ExportOutId)}
                                                >
                                                    Không duyệt
                                                </Button>
                                            </Tooltip>

                                            <Tooltip arrow placement="left" title="Duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApprove(exportManagementForm.ExportOutId)}
                                                    sx={{ marginLeft: '24px' }}>
                                                    Duyệt
                                                </Button>
                                            </Tooltip>
                                        </>
                                    }

                                </Box>
                            </>
                        }
                    </Box>

                </DialogContent>
            </Dialog >
        </>
    )
}

export default RowExportToOtherDepartmentManagementFormType

type IDataGridFuncProps = {
    owner: any;
    dataSource: any;
    dataGridRef: any;
    exportManagementForm: any;
    setCurrentCreatedForm: any;
    listOfDeviceInfo: any;
}

const DataGridFunc = React.memo(function DataGridFunc({
    owner,
    dataSource,
    dataGridRef,
    listOfDeviceInfo,
    exportManagementForm,
    setCurrentCreatedForm,
}: IDataGridFuncProps) {
    const dispatch = useAppDispatch()

    const onContentReady = (e: any) => {
        let allRows = e.component.getVisibleRows();

        e.component.getVisibleRows().forEach((item: any) => {
            if (item?.isEditing && listOfDeviceInfo?.length > 0) {
                let deviceInfoIds = listOfDeviceInfo.find((x: any) => x.DeviceId === item.values[0])

                if (!deviceInfoIds?.DeviceId) {
                    dispatch(
                        setSnackbar({
                            message: 'Khoa/phòng ban/trung tâm không có thiết bị này!!!',
                            color: colorsNotifi['success'].color,
                            backgroundColor: colorsNotifi['success'].background,
                        })
                    )
                }

            }
            setCurrentCreatedForm((prevState: any) => {
                let newListDeviceInfo = allRows.map((rowItem: any, idx: number) => Object.assign({}, {
                    ...prevState.listDeviceInfo[idx],
                    DeviceId: rowItem.values[0],
                    DeviceInfoId: rowItem.values[7]
                }))

                return Object.assign({}, {
                    ...prevState,
                    listDeviceInfo: newListDeviceInfo
                })
            })
        })
    }

    const getFilteredDeviceInfoIds = (options: any) => {
        return {
            store: listOfDeviceInfo,
            filter: options.data ? ['DeviceId', '=', options.data.DeviceId] : null,
        };
    }

    return (
        <DataGrid
            dataSource={dataSource}
            ref={dataGridRef}
            id="gridContainer"
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
                // confirmDelete: true,
                // allowDeleting: true,
                // allowAdding: true,
                allowUpdating: ['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName) &&
                    owner.DepartmentName === exportManagementForm.DepartmentManageName ? true : false,
                mode: 'batch',
            }}
            elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
        >
            <ColumnChooser enabled={true} mode="select" />
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
            {commonFieldsShow.map(col => {
                if (col.id !== "DeviceInfoId") {
                    return <Column
                        key={col.id}
                        dataField={col.id}
                        dataType="string"
                        headerCellRender={data => renderHeader(data)}
                        caption={col.header}
                        allowEditing={false}
                        cellRender={data => (
                            <span>
                                {Number(data.text) && col?.type === 'date'
                                    ? moment.unix(Number(data.text)).format('DD/MM/YYYY')
                                    : data.text}
                            </span>
                        )}
                    />
                }

                else if (
                    ['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName) &&
                    owner.DepartmentName === exportManagementForm.DepartmentManageName
                ) {
                    return <Column
                        key="DeviceInfoId"
                        dataField="DeviceInfoId"
                        dataType="string"
                        caption="Mã định danh thiết bị"
                        headerCellRender={data => renderHeader(data, true)}
                        allowEditing={exportManagementForm.Lock === "False"}
                    >
                        {listOfDeviceInfo?.length > 0 && <Lookup
                            dataSource={getFilteredDeviceInfoIds}
                            valueExpr="DeviceInfoId"
                            displayExpr="DeviceInfoId"
                        />}
                    </Column>
                }
                else if (
                    ['Admin', 'Trưởng phòng QTTB', 'Chuyên viên phòng QTTB'].includes(owner.GroupName) ||
                    (['Trưởng đơn vị sử dụng', 'Trưởng phòng TT TNTH'].includes(owner.GroupName) &&
                        owner.DepartmentName === exportManagementForm.DepartmentManageName)
                ) {
                    return <Column
                        key="DeviceInfoId"
                        dataField="DeviceInfoId"
                        dataType="string"
                        caption="Mã định danh thiết bị"
                        allowEditing={false}
                        headerCellRender={data => renderHeader(data)}
                    >
                    </Column>
                }
                else {
                    return <></>
                }
            }
            )}

            <Toolbar>
                <Item name="columnChooserButton" />
                <Item name="searchPanel" showText="always" />
            </Toolbar>
        </DataGrid>
    )
})