import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import DataGrid, {
    Column,
    Button as ButtonDataGrid,
} from "devextreme-react/data-grid";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import AlertDialog from "../../../components/AlertDialog";
import { colorsNotifi } from "../../../configs/color";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { setSnackbar } from "../../../pages/appSlice";
import {
    IDevice,
    IEmployeeManagerLab,
    IExportLab,
} from "../../../types/IInternalDevice";
import { GroupNames } from "../../../types/userManagerType";
import FormSelect from "./FormSelect";
import TableListAccept from "./TableListAccepts";
import { exportLabStatusEditing, matchAccept } from "./utils";

interface IProps {
    loading?: boolean;
    handleSave?: (data: IExportLab) => void;
    columnsForm: MRT_ColumnDef<IExportLab>[];
    showAllForm?: boolean;
    initDataForm: IExportLab;
    handleAccept?: (exportLab: IExportLab) => void;
    handleOnclickNoAccept?: (dataForm: IExportLab, message: string) => void;
    showFormCreate: boolean;
    typeForm?: string;
    handleDelete?: (data: IExportLab) => void;
}

export default function FormCmp({
    loading,
    columnsForm,
    initDataForm,
    showAllForm,
    handleSave,
    handleDelete,
    handleAccept,
    handleOnclickNoAccept,
    showFormCreate,
    typeForm,
}: IProps) {
    const { owner } = useAppSelector((state) => state.userManager);
    const [showBox, setShowBox] = useState(false);
    const dispatch = useAppDispatch();
    const [values, setValues] = useState(initDataForm);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const onsubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        setValues(initDataForm);
    }, [initDataForm]);

    const handleChoiceEmployee = useMemo(
        () => (employee: IEmployeeManagerLab) => {
            setValues((values) => ({
                ...values,
                EmployeeManageLabId: employee.EmployeeId,
            }));
        },
        []
    );

    const handleAddRecord = (device: IDevice) => {
        const isExist = values.listDevice.find(
            (x) => x.DeviceId === device.DeviceId
        );

        if (isExist) {
            dispatch(
                setSnackbar({
                    message: "thiết bị đã được thêm!",
                    color: colorsNotifi["error"].color,
                    backgroundColor: colorsNotifi["error"].background,
                })
            );
            return;
        }
        const newListDevice = [...values.listDevice, device];
        setValues({ ...values, listDevice: [...newListDevice] });
    };

    return (
        <Box
            component="form"
            sx={{
                border: "1px solid  rgba(0,0,0,0.2)",
                m: 2,
                padding: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
            noValidate
            autoComplete="off"
            onSubmit={onsubmit}
        >
            {loading && (
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={true}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            <div style={{ overflow: "auto" }}>
                {values.listAccept.length ? (
                    <TableListAccept dataSource={values.listAccept} />
                ) : (
                    <></>
                )}
            </div>

            {showAllForm && (
                <Stack
                    sx={{
                        width: "100%",
                        minWidth: { xs: "300px", sm: "360px", md: "400px" },
                        gap: "1.5rem",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    {columnsForm.map(({ accessorKey, header }, i) => {
                        if (!accessorKey)
                            return <React.Fragment key={i}></React.Fragment>;

                        if (
                            [
                                "EmployeeCreateName",
                                "DepartmentCreateName",
                                "EmployeeCreateName",
                                "EmployeeManageLabName",
                            ].includes(accessorKey)
                        )
                            return <React.Fragment key={i}></React.Fragment>;

                        const value = values[accessorKey];

                        if (accessorKey === "DateCreate")
                            return (
                                <div key={i} style={{ maxWidth: 300 }}>
                                    <LocalizationProvider
                                        dateAdapter={AdapterMoment}
                                    >
                                        <DatePicker
                                            label={header}
                                            value={
                                                new Date(Number(value) * 1000)
                                            }
                                            onChange={(val: any) => {
                                                setValues({
                                                    ...values,
                                                    [accessorKey]: moment(
                                                        Date.parse(val)
                                                    )
                                                        .unix()
                                                        .toString(),
                                                });
                                            }}
                                            renderInput={(params: any) => (
                                                <TextField
                                                    disabled={[
                                                        "edit",
                                                        "update",
                                                        "reupdate",
                                                    ].includes(
                                                        typeForm || "not found"
                                                    )}
                                                    key={accessorKey}
                                                    {...params}
                                                />
                                            )}
                                            inputFormat="DD/MM/YYYY"
                                        />
                                    </LocalizationProvider>
                                </div>
                            );

                        if (accessorKey === "EmployeeCreateId")
                            return (
                                <div key={i} style={{ minWidth: 350 }}>
                                    <TextField
                                        disabled={[
                                            "edit",
                                            "update",
                                            "reupdate",
                                        ].includes(typeForm || "not found")}
                                        sx={{ width: "100%" }}
                                        value={`${values[accessorKey]} - ${values.EmployeeCreateName}`}
                                        label={header}
                                        name={accessorKey}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                [e.target.name]: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            );

                        if (accessorKey === "DepartmenCreatetId")
                            return (
                                <div key={i} style={{ minWidth: 350 }}>
                                    <TextField
                                        disabled={[
                                            "edit",
                                            "update",
                                            "reupdate",
                                        ].includes(typeForm || "not found")}
                                        sx={{ width: "100%" }}
                                        value={`${values[accessorKey]} - ${values.DepartmentCreateName}`}
                                        label={header}
                                        name={accessorKey}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                [e.target.name]: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            );

                        if (accessorKey === "EmployeeManageLabId")
                            return (
                                <div key={i} style={{ minWidth: 350 }}>
                                    <TextField
                                        disabled={[
                                            "edit",
                                            "update",
                                            "reupdate",
                                        ].includes(typeForm || "not found")}
                                        sx={{ width: "100%" }}
                                        value={`${values[accessorKey]} - ${values.EmployeeManageLabName}`}
                                        label={header}
                                        name={accessorKey}
                                        onChange={(e) =>
                                            setValues({
                                                ...values,
                                                [e.target.name]: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            );

                        return (
                            <div key={i} style={{ minWidth: 350 }}>
                                <TextField
                                    disabled={[
                                        "edit",
                                        "update",
                                        "reupdate",
                                    ].includes(typeForm || "not found")}
                                    sx={{ width: "100%" }}
                                    value={values[accessorKey] || ""}
                                    label={header}
                                    name={accessorKey}
                                    onChange={(e) =>
                                        setValues({
                                            ...values,
                                            [e.target.name]: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        );
                    })}
                </Stack>
            )}

            <AlertDialog
                head="Form xác nhận"
                message="nhập nội dung đính kèm"
                isOpen={showBox}
                handleClose={() => setShowBox(false)}
                handleOk={(text) => {
                    if (handleOnclickNoAccept)
                        handleOnclickNoAccept(values, text || "");
                }}
                showBoxInput
                boxInputProps={{
                    label: "nội dung",
                }}
            />

            {owner.GroupName === GroupNames["Chuyên viên đơn vị sử dụng"] &&
                (values.Status === exportLabStatusEditing ||
                    showFormCreate) && (
                    <FormSelect
                        loading={loading ?? false}
                        handleAddRecord={handleAddRecord}
                        handleChoiceEmployee={handleChoiceEmployee}
                    />
                )}

            {owner.GroupName === GroupNames["Chuyên viên đơn vị sử dụng"] &&
                typeForm === "reupdate" && (
                    <FormSelect
                        disableEmployee
                        EmployeeManageLabId={initDataForm.EmployeeManageLabId}
                        loading={loading ?? false}
                        handleAddRecord={handleAddRecord}
                        handleChoiceEmployee={handleChoiceEmployee}
                    />
                )}

            <Box sx={{ width: "100%" }}>
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
                    dataSource={values.listDevice}
                    allowColumnReordering={true}
                    rowAlternationEnabled={true}
                    showBorders={true}
                >
                    <ButtonDataGrid>Delete</ButtonDataGrid>

                    {typeForm === "reupdate" && (
                        <Column type="buttons" width={110} caption={"Thao tác"}>
                            <ButtonDataGrid
                                render={() => (
                                    <Button color="error">delete</Button>
                                )}
                                onClick={(e: any) => {
                                    const data = e.row.data as IDevice;

                                    setValues({
                                        ...values,
                                        listDevice: [
                                            ...values.listDevice.filter(
                                                (device) =>
                                                    device.DeviceId !==
                                                    data.DeviceId
                                            ),
                                        ],
                                    });
                                }}
                            ></ButtonDataGrid>
                        </Column>
                    )}
                    {Object.keys(columnHeads).map((x) => {
                        const key = x as keyof IDevice;
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

            <Box sx={{ my: 2, gap: 2, display: "flex", justifyContent: "end" }}>
                {matchAccept(owner.GroupName, values.Status) && (
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => {
                            setShowBox(true);
                        }}
                        color="error"
                    >
                        không xác nhận
                    </Button>
                )}
                {matchAccept(owner.GroupName, values.Status) && (
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => {
                            handleAccept && handleAccept(values);
                        }}
                    >
                        xác nhận
                    </Button>
                )}

                {showConfirmDelete && handleDelete && (
                    <AlertDialog
                        isOpen={showConfirmDelete || false}
                        message="Bạn chắc chắn muốn xoá ?"
                        handleClose={() => setShowConfirmDelete(false)}
                        handleOk={() => {
                            handleDelete(values);
                        }}
                    />
                )}

                {handleDelete && typeForm === "reupdate" && (
                    <Button
                        onClick={() => setShowConfirmDelete(true)}
                        type="submit"
                        color="error"
                        variant="contained"
                    >
                        xoá
                    </Button>
                )}

                {owner.GroupName === GroupNames["Chuyên viên đơn vị sử dụng"] &&
                    (values.Status === exportLabStatusEditing ||
                        showFormCreate ||
                        typeForm === "reupdate") && (
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={() => {
                                handleSave && handleSave(values);
                            }}
                        >
                            Lưu lại
                        </Button>
                    )}
            </Box>
        </Box>
    );
}

const columnHeads: { [key in keyof IDevice]: string } = {
    DeviceId: "Mã thiết bị",
    DeviceInfoId: "Mã định danh thiết bị",
    DeviceName: "Tên tiếng Việt",
    DeviceEnglishName: "Tên tiếng Anh",
    QuantityImport: "Số lượng nhập",
    QuantityDistribute: "Số lượng phân phối",
    LabId: "Mã phòng",
};
