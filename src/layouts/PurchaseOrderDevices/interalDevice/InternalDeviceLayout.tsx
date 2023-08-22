import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import CloseIcon from "@mui/icons-material/Close";
import { Edit as EditIcon } from "@mui/icons-material";
import moment from "moment";
import { IExportLab, initExportLab } from "../../../types/IInternalDevice";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  updateExportLabAction,
  addExportLabAction,
  getAllAction,
  unAcceptExportLabAction,
  acceptExportLabAction,
} from "./internalDeviceSlice";
import ErrorComponent from "../../../components/ErrorToast";
import SuccessToast from "../../../components/Success";
import FormCmp from "./Form";
import { exportLabStatusEditing, nextStatus } from "./utils";

export default function InternalDeviceLayout() {
  const { data, loading, error, successMessage } = useAppSelector(
    (state) => state.exportLab
  );
  const dispatch = useAppDispatch();
  const [isOpenModalForm, setOpenModalForm] = useState(false);
  const [dataForm, setDataForm] = useState(initExportLab);
  const [typeForm, setTypeForm] = useState<"create" | "update">("create");

  const handleToggleForm = () => {
    setOpenModalForm(!isOpenModalForm);
  };

  const handleForm = (dataForm: IExportLab, type: "create" | "update") => {
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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
        <Typography variant="h5">Quản lí xuất thiết bị</Typography>
        <Button
          onClick={() => handleForm(initExportLab, "create")}
          variant="contained"
          color="primary"
        >
          Tạo mới
        </Button>
      </Box>
      <Dialog
        fullScreen
        open={isOpenModalForm}
        onClose={handleToggleForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle textAlign="left">
          <b>Form Thông tin</b>
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
        />
      </Dialog>

      {error && <ErrorComponent errorMessage={error} />}
      {successMessage && (
        <SuccessToast
          isOpen={successMessage ? true : false}
          message={successMessage}
        />
      )}

      <MaterialReactTable
        enableRowActions
        enableStickyHeader
        columns={columns}
        data={data}
        state={{ isLoading: loading }}
        enableEditing={true}
        editingMode="modal"
        initialState={{
          density: "compact",
        }}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
            <IconButton
              onClick={() => {
                handleForm(row.original, "update");
              }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        )}
      />
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
  { ...renderRow("ExportLabId", "Mã số Export") },
  { ...renderRow("Status", "Tình trạng ") },
  { ...renderRow("DateCreate", "Ngày tạo") },
  { ...renderRow("EmployeeCreateId", "Nhân viên tạo(id)") },
  { ...renderRow("EmployeeCreateName", "Nhân viên tạo(name)") },
  { ...renderRow("DepartmenCreatetId", "Phòng Tạo(id)") },
  { ...renderRow("DepartmentCreateName", "Phòng tạo(name)") },
  { ...renderRow("EmployeeManageLabId", "Nhân viên quản lí(id)") },
  { ...renderRow("EmployeeManageLabName", "Nhân viên quản lí(name)") },
];
