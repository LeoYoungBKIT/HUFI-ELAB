import { useEffect, useMemo, useRef, useState } from "react"
import { IExportToLiquidateManagementFormType } from "../../../types/exportManagementType"
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
    approveExportToLiquidateManagementForm,
    deleteExportToLiquidateManagementForm,
    forwardApproveExportToLiquidateManagementForm,
    getListOfLiquidateDeviceForms,
    rejectExportToLiquidateManagementForm
} from "../../../services/exportManagementServices"
import { colorsNotifi } from "../../../configs/color"
import { setSnackbar } from "../../../pages/appSlice"
import { setListOfExportToLiquidateManagementForms } from "../exportManagementSlice"

type RowExportToLiquidateManagementFormProps = {
    exportManagementForm: IExportToLiquidateManagementFormType
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
    { id: 'DeviceInfoId', header: 'Mã định danh thiết bị' },
    { id: 'DeviceName', header: 'Tên thiết bị' },
    { id: 'DeviceEnglishName', header: 'Tên tiếng Anh' },
    { id: 'Model', header: 'Số Model' },
    { id: 'SerialNumber', header: 'Số Serial' },
    { id: 'Specification', header: 'Thông số kỹ thuật' },
    { id: 'Manufacturer', header: 'Hãng sản xuất' },
    { id: 'Origin', header: 'Xuất xứ' },
    { id: 'SupplierName', header: 'Nhà cung cấp' },
    { id: 'YearStartUsage', header: 'Năm đưa vào sử dụng' },
    { id: 'LinkFileRepair', header: 'Biên bản kiểm tra thiết bị từ Đơn vị phụ trách tiếp nhận sửa chữa' },
    { id: 'LinkFileMaintenace', header: 'Lịch sử bảo trì/sửa chữa' },
    { id: 'ResidualValue', header: 'Tổng số giờ sử dụng' },
    { id: 'Status', header: 'Trạng thái' },
]

const RowExportToLiquidateManagementForm = ({
    exportManagementForm,
    isOpen,
    handleClose
}: RowExportToLiquidateManagementFormProps) => {
    const dispatch = useAppDispatch()
    const dataGridRef = useRef<DataGrid<any, any> | null>(null)
    const owner = useAppSelector(selector => selector.userManager.owner)

    const [progressStep,] = useState<number>(exportManagementForm.listAccept.length + 1)
    const [contentAccept, setContentAccept] = useState<string>('')
    const [reason, setReason] = useState<string>('')

    useEffect(() => {
        setContentAccept('')
        setReason('')
    }, [])

    const dataSource = useMemo(() => {
        return new DataSource({
            store: new ArrayStore({
                data: (exportManagementForm?.listDevice || []).map(x => ({
                    ...x,
                    LiquidateId: exportManagementForm.LiquidateId,
                    DepartmentCreateName: exportManagementForm.DepartmentCreateName,
                    Title: exportManagementForm.Title,
                    Content: exportManagementForm.Content,
                    DateCreate: exportManagementForm.DateCreate,
                    EmployeeCreateName: exportManagementForm.EmployeeCreateName,
                    EmployeeCreateId: exportManagementForm.EmployeeCreateId,
                    Status: exportManagementForm?.listAccept?.length > 0 ? exportManagementForm.listAccept[exportManagementForm.listAccept.length - 1].AcceptValue : 'Mới tạo',
                    Id: uniqueId('ExportToLiquidateManagementFormTypeDetail_')
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
            await approveExportToLiquidateManagementForm(id);
            dispatch(
                setSnackbar({
                    message: 'Duyệt phiếu xuất thành công!!!',
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
            try {
                await forwardApproveExportToLiquidateManagementForm(exportManagementForm, id);
                dispatch(
                    setSnackbar({
                        message: 'Trình duyệt phiếu xuất thành công!!!',
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
                        message: 'Trình duyệt phiếu xuât thất bại!',
                        color: colorsNotifi['error'].color,
                        backgroundColor: colorsNotifi['error'].background,
                    })
                )
            }
        }
    }

    const handleDeleteExportToLiquidateManagementForm = async (id: string) => {
        try {
            await deleteExportToLiquidateManagementForm(id);
            dispatch(
                setSnackbar({
                    message: 'Xóa phiếu xuất thành công!!!',
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
                await rejectExportToLiquidateManagementForm(exportManagementForm, id, reason);
                dispatch(
                    setSnackbar({
                        message: 'Không duyệt phiếu xuất thành công!!!',
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
                    <b>Phiếu thanh lý thiết bị {exportManagementForm.LiquidateId}</b>

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
                                                else if (label.AcceptValue === "Đã thanh lý") {
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
                                                    label.AcceptValue !== "Đã thanh lý" &&
                                                    idx < exportManagementForm.listAccept.length - 1 &&
                                                    <>
                                                        <div style={{ "fontSize": "0.75rem" }}>
                                                            Đã duyệt lúc {moment.unix(Number(exportManagementForm.listAccept[idx + 1].AcceptDate)).format('HH:mm - DD/MM/YYYY')}
                                                        </div>
                                                        <div style={{ "fontSize": "0.75rem" }}>
                                                            Người duyệt: {exportManagementForm.listAccept[idx + 1].EmployeeAcceptId} - {exportManagementForm.listAccept[idx + 1].EmployeeAcceptName}
                                                        </div>
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
                            <TextField
                                label="Người lập"
                                variant="standard"
                                type="text"
                                fullWidth
                                disabled
                                inputProps={{
                                    value: `${exportManagementForm.EmployeeCreateName}`,
                                }}
                            />
                            <TextField
                                label="Đơn vị đề xuất thanh lý"
                                variant="standard"
                                type="text"
                                fullWidth
                                disabled
                                inputProps={{
                                    value: `${exportManagementForm.DepartmentCreateName}`,
                                }}
                            />
                        </Grid>
                        <DataGrid
                            dataSource={dataSource}
                            ref={dataGridRef}
                            id="gridContainer"
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
                            // editing={{
                            //     confirmDelete: true,
                            //     allowDeleting: true,
                            //     allowAdding: true,
                            //     allowUpdating: true,
                            // }}
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
                                if (
                                    ['Admin', 'Trưởng phòng QTTB', 'Chuyên viên phòng QTTB'].includes(owner.GroupName) ||
                                    ['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName)
                                ) {
                                    return <Column
                                        key={col.id}
                                        dataField={col.id}
                                        dataType="string"
                                        headerCellRender={data => renderHeader(data)}
                                        caption={col.header}
                                        cellRender={data => (
                                            <span>
                                                {/* {Number(data.text) && col?.type === 'date' */}
                                                {/* ? moment.unix(Number(data.text)).format('DD/MM/YYYY') */}
                                                {/* : */}
                                                {data.text}
                                            </span>
                                        )}
                                    />
                                } else {
                                    return <></>
                                }
                            })}

                            <Toolbar>
                                <Item name="columnChooserButton" />
                                <Item name="searchPanel" showText="always" />
                            </Toolbar>
                        </DataGrid>

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
                                            onClick={() => handleDeleteExportToLiquidateManagementForm(exportManagementForm.LiquidateId)}
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
                                                    onClick={() => handleApprove(exportManagementForm.LiquidateId)}
                                                >
                                                    Duyệt
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    }

                                    {(owner.GroupName === 'Chuyên viên phòng QTTB' ||
                                        ['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName)) &&
                                        <Box display="flex" alignItems="end">
                                            <Tooltip arrow placement="left" title="Trình duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleForwardApprove(exportManagementForm.LiquidateId)}
                                                >
                                                    Trình duyệt
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    }

                                    {owner.GroupName === 'Trưởng phòng QTTB' ||
                                        ['Trưởng phòng TT TNTH', 'Trưởng đơn vị sử dụng'].includes(owner.GroupName) &&
                                        <>
                                            <Tooltip arrow placement="left" title="Không duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleReject(exportManagementForm.LiquidateId)}
                                                >
                                                    Không duyệt
                                                </Button>
                                            </Tooltip>

                                            <Tooltip arrow placement="left" title="Duyệt phiếu đề nghị">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleApprove(exportManagementForm.LiquidateId)}
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

export default RowExportToLiquidateManagementForm