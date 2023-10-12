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
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import AlertDialog from "../../../components/AlertDialog";
import { useAppSelector } from "../../../hooks";
import {
    IDevice,
    IEmployeeManagerLab,
    IExportLab,
} from "../../../types/IInternalDevice";
import { GroupNames } from "../../../types/userManagerType";
import FormSelect from "./FormSelect";
import TableDevice from "./TableDevice";
import TableListAccept from "./TableListAccepts";
import { exportLabStatusEditing, matchAccept } from "./utils";
import DataGrid, { Column } from "devextreme-react/data-grid";

interface IProps {
    loading?: boolean;
    handleSave?: (data: IExportLab) => void;
    columnsForm: MRT_ColumnDef<IExportLab>[];
    showAllForm?: boolean;
    initDataForm: IExportLab;
    handleAccept?: (exportLab: IExportLab) => void;
    handleOnclickNoAccept?: (dataForm: IExportLab, message: string) => void;
    showFormCreate: boolean;
}

export default function FormCmp({
    loading,
    columnsForm,
    initDataForm,
    showAllForm,
    handleSave,
    handleAccept,
    handleOnclickNoAccept,
    showFormCreate,
}: IProps) {
    console.log(initDataForm);
    const { owner } = useAppSelector((state) => state.userManager);
    const [showBox, setShowBox] = useState(false);

    const [values, setValues] = useState(initDataForm);

    const onsubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        setValues(initDataForm);
    }, [initDataForm]);

    const handleDeleteRowDevice = (device: IDevice) => {
        setValues({
            ...values,
            listDevice: values.listDevice.filter(
                (x) => x.DeviceInfoId !== device.DeviceInfoId
            ),
        });
    };

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
        setValues({ ...values, listDevice: [device, ...values.listDevice] });
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
                    loadPanel={{
                        enabled: loading,
                    }}
                >
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

                {owner.GroupName === GroupNames["Chuyên viên đơn vị sử dụng"] &&
                    (values.Status === exportLabStatusEditing ||
                        showFormCreate) && (
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
    DeviceInfoId: "Tên thiết bị",
    DeviceName: "Tên tiếng Việt",
    DeviceEnglishName: "Tên tiếng Anh",
    QuantityImport: "Số lượng nhập",
    QuantityDistribute: "Số lượng phân phối",
    LabId: "Mã phòng",
};
