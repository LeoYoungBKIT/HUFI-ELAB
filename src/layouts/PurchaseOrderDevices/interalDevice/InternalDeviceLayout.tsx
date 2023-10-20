import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Button as ButtonMui,
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";
import DataGrid, {
    Column,
    ColumnFixing,
    FilterPanel,
    FilterRow,
    Grouping,
    HeaderFilter,
    Button,
} from "devextreme-react/data-grid";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import ErrorComponent from "../../../components/ErrorToast";
import SuccessToast from "../../../components/Success";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { IExportLab, initExportLab } from "../../../types/IInternalDevice";
import FormCmp from "./Form";
import {
    acceptExportLabAction,
    addExportLabAction,
    deleteExportLabAction,
    getAllAction,
    unAcceptExportLabAction,
    updateExportLabAction,
} from "./internalDeviceSlice";
import { ObjAccept, exportLabStatusEditing, nextStatus } from "./utils";

export default function InternalDeviceLayout() {
    const { data, loading, error, successMessage } = useAppSelector(
        (state) => state.exportLab
    );
    const dispatch = useAppDispatch();
    const [isOpenModalForm, setOpenModalForm] = useState(false);
    const [dataForm, setDataForm] = useState(initExportLab);
    const [typeForm, setTypeForm] = useState<"create" | "update" | "reupdate">(
        "create"
    );

    const handleToggleForm = () => {
        setOpenModalForm(!isOpenModalForm);
        if (isOpenModalForm) dispatch(getAllAction());
    };

    const handleForm = (
        dataForm: IExportLab,
        type: "create" | "update" | "reupdate"
    ) => {
        setOpenModalForm(true);
        setDataForm(dataForm);
        setTypeForm(type);
    };

    const handleSave = (dataExport: IExportLab) => {
        if (typeForm === "create")
            dispatch(addExportLabAction(dataExport)).then(handleToggleForm);
        else if (typeForm === "update")
            dispatch(
                updateExportLabAction({
                    ...dataExport,
                    Status: nextStatus[dataExport.Status],
                })
            ).then(handleToggleForm);
        else if (typeForm === "reupdate")
            dispatch(
                updateExportLabAction({
                    ...dataExport,
                    Status: ObjAccept["Cán bộ phụ trách PTN"],
                })
            ).then(handleToggleForm);
    };

    useEffect(() => {
        dispatch(getAllAction());
    }, [dispatch]);

    function handleAccept(exportLab: IExportLab) {
        dispatch(
            acceptExportLabAction({
                ...exportLab,
                Status: nextStatus[exportLab.Status],
            })
        ).then(handleToggleForm);
    }

    function handleUnAcceps(dataForm: IExportLab, message: string): void {
        dispatch(
            unAcceptExportLabAction({
                body: { ...dataForm, Status: exportLabStatusEditing },
                message,
            })
        ).then(handleToggleForm);
    }

    async function handleDelete(data: IExportLab) {
        await dispatch(deleteExportLabAction(data.ExportLabId));
        handleToggleForm();
    }

    return (
        <Box>
            <Box
                sx={{ display: "flex", justifyContent: "space-between", my: 1 }}
            >
                <Typography variant="h5">Quản lí xuất thiết bị</Typography>
                <ButtonMui
                    onClick={() => handleForm(initExportLab, "create")}
                    variant="contained"
                    color="primary"
                >
                    Tạo mới
                </ButtonMui>
            </Box>
            <Dialog
                fullScreen
                open={isOpenModalForm}
                onClose={handleToggleForm}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <DialogTitle textAlign="left">
                    <b>Chi tiết phiếu nhập kho phân phối</b>
                    <IconButton
                        aria-label="close"
                        onClick={handleToggleForm}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <FormCmp
                    handleSave={handleSave}
                    columnsForm={columns}
                    initDataForm={dataForm}
                    showAllForm={typeForm === "update"}
                    loading={loading}
                    showFormCreate={typeForm === "create"}
                    handleAccept={handleAccept}
                    handleOnclickNoAccept={handleUnAcceps}
                    typeForm={typeForm}
                    handleDelete={handleDelete}
                />
            </Dialog>

            {error && <ErrorComponent errorMessage={error} />}
            {successMessage && (
                <SuccessToast
                    isOpen={successMessage ? true : false}
                    message={successMessage}
                />
            )}
            <DataGrid
                columnAutoWidth={true}
                allowColumnResizing={true}
                columnResizingMode="widget"
                wordWrapEnabled={true}
                repaintChangesOnly={true}
                searchPanel={{
                    visible: true,
                    width: 300,
                    placeholder: "Tìm kiếm",
                }}
                columnMinWidth={100}
                dataSource={data}
                allowColumnReordering={true}
                rowAlternationEnabled={true}
                showBorders={true}
                loadPanel={{
                    enabled: loading,
                }}
            >
                <FilterRow visible={true} applyFilter={true} />
                <HeaderFilter visible={true} />
                <ColumnFixing enabled={false} />
                <Grouping contextMenuEnabled={true} expandMode="rowClick" />
                <FilterPanel visible={true} />
                <Column type="buttons" width={110} caption={"Thao tác"}>
                    <Button
                        name="edit"
                        visible={true}
                        icon={"edit"}
                        onClick={(e: any) => {
                            const type =
                                e.row.data.Status ===
                                ObjAccept["Cán bộ phụ trách PTN"]
                                    ? "reupdate"
                                    : "update";
                            handleForm(e.row.data, type);
                        }}
                    />
                    <Button name="delete" />
                </Column>
                {Object.keys(columnHeads).map((x) => {
                    const key = x as keyof IExportLab;

                    if (
                        [
                            "listAccept",
                            "listDevice",
                            "EmployeeCreateName",
                            "Lock",
                            "EmployeeManageLabName",
                            "DepartmentCreateName",
                        ].includes(key)
                    )
                        return <React.Fragment key={x}></React.Fragment>;

                    if (key === "EmployeeCreateId")
                        return (
                            <Column
                                key={key}
                                dataField={key}
                                caption={columnHeads[key]}
                                calculateCellValue={(row: any) => {
                                    return (
                                        row.EmployeeCreateId +
                                        " - " +
                                        row.EmployeeCreateName
                                    );
                                }}
                            />
                        );

                    if (key === "EmployeeManageLabId")
                        return (
                            <Column
                                key={key}
                                dataField={key}
                                caption={columnHeads[key]}
                                calculateCellValue={(row: any) => {
                                    return (
                                        row.EmployeeManageLabId +
                                        " - " +
                                        row.EmployeeManageLabName
                                    );
                                }}
                            />
                        );

                    if (key === "DepartmenCreatetId")
                        return (
                            <Column
                                key={key}
                                dataField={key}
                                caption={columnHeads[key]}
                                calculateCellValue={(row: any) => {
                                    return (
                                        row.DepartmenCreatetId +
                                        " - " +
                                        row.DepartmentCreateName
                                    );
                                }}
                            />
                        );

                    if (key === "DateCreate")
                        return (
                            <Column
                                key={key}
                                dataField={key}
                                caption={columnHeads[key]}
                                calculateCellValue={(row: any) => {
                                    return moment
                                        .unix(Number(row.DateCreate))
                                        .format("DD/MM/YYYY");
                                }}
                            />
                        );

                    return (
                        <Column
                            key={key}
                            dataField={key}
                            caption={columnHeads[key]}
                        />
                    );
                })}
            </DataGrid>
        </Box>
    );
}

const renderRow = (
    key: keyof IExportLab,
    header: string
): MRT_ColumnDef<IExportLab> => {
    return {
        accessorFn: (row: IExportLab) => {
            if (key === "DateCreate")
                return moment.unix(Number(row.DateCreate)).format("DD/MM/YYYY");
            return row[key] ?? "trống";
        },
        accessorKey: key,
        header,
    };
};

const columns: MRT_ColumnDef<IExportLab>[] = [
    { ...renderRow("ExportLabId", "mã phiếu PP") },
    { ...renderRow("Status", "Tình trạng ") },
    { ...renderRow("DateCreate", "Ngày tạo") },
    { ...renderRow("EmployeeCreateId", "Nhân viên tạo") },
    { ...renderRow("EmployeeCreateName", "Nhân viên tạo(name)") },
    { ...renderRow("DepartmenCreatetId", "Phòng Tạo") },
    { ...renderRow("DepartmentCreateName", "Phòng tạo(name)") },
    { ...renderRow("EmployeeManageLabId", "Nhân viên phụ trách PTN") },
    { ...renderRow("EmployeeManageLabName", "Nhân viên quản lí(name)") },
];

const columnHeads: { [key in keyof IExportLab]: string } = {
    ExportLabId: "Mã phiếu PP",
    Status: "Tình trạng ",
    DateCreate: "Ngày tạo",
    EmployeeCreateId: "Nhân viên tạo",
    EmployeeCreateName: "Nhân viên tạo(name)",
    DepartmenCreatetId: "Phòng Tạo",
    DepartmentCreateName: "Phòng tạo(name)",
    EmployeeManageLabId: "Nhân viên phụ trách PTN",
    EmployeeManageLabName: "Nhân viên quản lí(name)",
    Content: "Nội dung",
    Lock: "Khoá",
    listAccept: "Danh sách xác nhận",
    listDevice: "Danh sách thiết bị",
};
