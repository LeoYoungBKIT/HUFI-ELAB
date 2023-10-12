import CloseIcon from "@mui/icons-material/Close";
import {
    Button as ButtonMui,
    Dialog,
    DialogTitle,
    IconButton,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import DataGrid, {
    Button,
    Column,
    ColumnFixing,
    FilterPanel,
    FilterRow,
    Grouping,
    HeaderFilter,
} from "devextreme-react/data-grid";

import { MRT_Row } from "material-react-table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ErrorComponent from "../../components/ErrorToast";
import SuccessToast from "../../components/Success";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
    IDeviceServiceInfo,
    initDeviceServiceInfo,
} from "../../types/IDeviceServiceInfo";
import { GroupNames } from "../../types/userManagerType";
import FormCmp from "./Form";
import InternalDeviceLayout from "./interalDevice/InternalDeviceLayout";
import {
    acceptPurchaseOrderDeviceAction,
    deletePurchaseOrderDeviceAction,
    getAllAction,
    noAcceptPurchaseOrderDeviceAction,
    purchaseOrderDeviceSelect,
    savePurchaseOrderDeviceAction,
    updatePurchaseOrderDeviceAction,
} from "./purchaseOrderDeviceSlice";
import { DeviceEditing, nextStatus } from "./utils";

const renderRow = (key: keyof IDeviceServiceInfo) => {
    return (row: IDeviceServiceInfo) => row[key] ?? "trống";
};

const PurchaseOrderDevices = () => {
    const { data, loading, error, successMessage } = useSelector(
        purchaseOrderDeviceSelect
    );
    const { owner } = useAppSelector((state) => state.userManager);
    const dispatch = useAppDispatch();
    const [valueTab, setValueTab] = useState("1");
    const [isOpenModalForm, setOpenModalForm] = useState(false);
    const [dataForm, setDataForm] = useState<IDeviceServiceInfo>(
        initDeviceServiceInfo
    );
    const [typeForm, setTypeForm] = useState<"create" | "update" | "reupdate">(
        "create"
    );

    const handlechangeValueTab = (_e: any, value: string) => {
        setValueTab(value);
    };

    const handleToggleForm = () => {
        setOpenModalForm(!isOpenModalForm);
        if (isOpenModalForm) dispatch(getAllAction());
    };

    const handleShowForm = (
        data: IDeviceServiceInfo,
        typeForm: "create" | "update" | "reupdate"
    ) => {
        setDataForm(data);
        setTypeForm(typeForm);
        handleToggleForm();
    };

    const handleSubmitForm = (data: IDeviceServiceInfo) => {
        if (typeForm === "create")
            dispatch(savePurchaseOrderDeviceAction(data));
    };

    const handleShowModalDelete = (row: MRT_Row<IDeviceServiceInfo>) => {
        setDataForm(row.original);
    };

    function handleDelete(data: IDeviceServiceInfo): void {
        dispatch(deletePurchaseOrderDeviceAction(data.OrderId));
    }

    const handleAccept = (dataForm: IDeviceServiceInfo) => {
        dispatch(
            acceptPurchaseOrderDeviceAction({
                ...dataForm,
                Status: nextStatus[dataForm.Status || ""],
            })
        );
    };

    const handleNoAccept = (dataForm: IDeviceServiceInfo, message: string) => {
        dispatch(
            noAcceptPurchaseOrderDeviceAction({
                body: { ...dataForm, Status: DeviceEditing },
                message,
            })
        );
    };

    const handleReUpdate = (body: IDeviceServiceInfo) => {
        dispatch(updatePurchaseOrderDeviceAction({ ...body, listAccept: [] }));
    };

    useEffect(() => {
        dispatch(getAllAction());
    }, [dispatch]);

    return (
        <Box>
            <Tabs value={valueTab} onChange={handlechangeValueTab}>
                <Tab value={"1"} label={"Nhập kho – phân phối cấp đơn vị"} />;
                <Tab value={"2"} label={"Nhập kho – phân phối nội bộ"} />;
            </Tabs>

            {valueTab === "1" && (
                <>
                    {error && <ErrorComponent errorMessage={error} />}

                    {successMessage && (
                        <SuccessToast
                            isOpen={successMessage ? true : false}
                            message={successMessage}
                        />
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            my: 1,
                        }}
                    >
                        <Typography variant="h5">Quản lí phiếu nhập</Typography>
                        {(owner.GroupName === GroupNames["Trưởng phòng QTTB"] ||
                            owner.GroupName ===
                                GroupNames["Chuyên viên phòng QTTB"]) && (
                            <ButtonMui
                                onClick={() =>
                                    handleShowForm(
                                        initDeviceServiceInfo,
                                        "create"
                                    )
                                }
                                variant="contained"
                            >
                                Tạo mới
                            </ButtonMui>
                        )}
                    </Box>
                    <Dialog
                        fullScreen
                        open={isOpenModalForm}
                        onClose={handleToggleForm}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <DialogTitle textAlign="left">
                            <b>Chi tiết phiếu nhập</b>
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
                            onDeleteOnclick={handleDelete}
                            handleSubmit={handleSubmitForm}
                            dataInit={dataForm}
                            enableUpload={typeForm === "create"}
                            handleOnClickAccept={handleAccept}
                            enableAcceptButton={typeForm === "update"}
                            handleOnclickNoAccept={handleNoAccept}
                            handleReUpdate={handleReUpdate}
                            enableSaveButton={typeForm === "create"}
                        />
                    </Dialog>

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
                        columnMinWidth={60}
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
                        <Grouping
                            contextMenuEnabled={true}
                            expandMode="rowClick"
                        />
                        <FilterPanel visible={true} />
                        <Column type="buttons" width={110} caption={"Thao tác"}>
                            <Button
                                name="edit"
                                visible={true}
                                icon={"edit"}
                                onClick={(e: any) =>
                                    handleShowForm(e.row.data, "update")
                                }
                            />
                            <Button name="delete" />
                        </Column>

                        {Object.keys(columnHeads).map((x) => {
                            const key = x as keyof IDeviceServiceInfo;

                            if (
                                [
                                    "listAccept",
                                    "listDeviceInfo",
                                    "Lock",
                                    "EmployeeCreateId",
                                    "DepartmentImportId",
                                ].includes(key)
                            )
                                return (
                                    <React.Fragment key={x}></React.Fragment>
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

                            if (key === "DepartmentImportName") {
                                return (
                                    <Column
                                        key={key}
                                        dataField={key}
                                        calculateCellValue={(row: any) => {
                                            return (
                                                row.DepartmentImportId +
                                                " - " +
                                                row.DepartmentImportName
                                            );
                                        }}
                                        caption={columnHeads[key]}
                                    />
                                );
                            }

                            if (key === "EmployeeCreateName") {
                                return (
                                    <Column
                                        key={key}
                                        dataField={key}
                                        calculateCellValue={(row: any) => {
                                            return (
                                                row.EmployeeCreateId +
                                                " - " +
                                                row.EmployeeCreateName
                                            );
                                        }}
                                        caption={columnHeads[key]}
                                    />
                                );
                            }

                            return (
                                <Column
                                    key={key}
                                    dataField={key}
                                    caption={columnHeads[key]}
                                />
                            );
                        })}
                    </DataGrid>
                </>
            )}

            {valueTab === "2" && <InternalDeviceLayout />}
        </Box>
    );
};

const columnHeads: { [key in keyof IDeviceServiceInfo]: string } = {
    OrderId: "Mã phiếu nhập",
    Status: "Trạng Thái",
    Content: "Nội dung",
    DepartmentImportId: "Phòng nhập",
    DepartmentImportName: "Phòng nhập",
    EmployeeCreateId: "Người Tạo",
    EmployeeCreateName: "Người tạo",
    DateCreate: "Ngày tạo",
    Lock: "Khoá",
    Title: "Tiều dề",
    listAccept: "danh sách xác nhân",
    listDeviceInfo: "danh sách thiết bị",
};

export default React.memo(PurchaseOrderDevices);
