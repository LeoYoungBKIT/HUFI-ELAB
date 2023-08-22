import { Box, Button as ButtonMUI } from "@mui/material";

import DataGrid, { Button, Column } from "devextreme-react/data-grid";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { IPurchaseOrderInstrument } from "../../types/IPurchaseOrderInstruments";
import {
  acceptAction,
  createAction,
  getAllAction,
  removeAction,
  unAcceptAction,
  updateAction,
} from "./purchaseOrderInstrumentSlice";
import Form from "./Form";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import moment from "moment";
import { getDataFile } from "../../services/purchaseOrderInstrument";
import ErrorComponent from "../../components/ErrorToast";
import SuccessToast from "../../components/Success";
import { matchAccept } from "./utils";
import { GroupNames } from "../../types/userManagerType";

const Index = () => {
  const { data, loading, successMessage, error } = useAppSelector(
    (state) => state.purchaseOrderInstrument
  );
  const {
    owner: { GroupName },
  } = useAppSelector((state) => state.userManager);
  const [curData, setCurData] = useState<IPurchaseOrderInstrument>();
  const [typeForm, setTypeForm] = useState<"create" | "update">("create");

  const dispatch = useAppDispatch();

  const handleShowFormDetails = (
    typeForm: "create" | "update",
    data: IPurchaseOrderInstrument
  ) => {
    setCurData(data);
    setTypeForm(typeForm);
  };

  const handleGetFile: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const { data } = await getDataFile(file);
      console.log(data);
      handleShowFormDetails("create", data);
    }

    e.target.value = "";
  };

  function handleSubmit(data: IPurchaseOrderInstrument) {
    if (typeForm === "create") dispatch(createAction(data));
  }

  const handleAccept = (data: IPurchaseOrderInstrument) => {
    dispatch(acceptAction(data));
  };

  const handleUnAccept = (data: IPurchaseOrderInstrument, text: string) => {
    dispatch(unAcceptAction({ body: data, message: text }));
  };

  const handleUpdate = (data: IPurchaseOrderInstrument) => {
    dispatch(updateAction(data));
  };

  useEffect(() => {
    dispatch(getAllAction());
  }, [dispatch]);

  const handleDelete = (data: IPurchaseOrderInstrument) => {
    dispatch(removeAction(data));
  };

  return (
    <Box>
      {error && <ErrorComponent errorMessage={error} />}

      {successMessage && (
        <SuccessToast
          isOpen={successMessage ? true : false}
          message={successMessage}
        />
      )}

      {curData && (
        <Form
          onsubmit={handleSubmit}
          initData={curData}
          onClose={() => {
            setCurData(undefined);
            dispatch(getAllAction());
          }}
          showButtonSave={
            GroupName === GroupNames["Chuyên viên TT TNTH"] &&
            typeForm === "create"
          }
          handleSave={handleSubmit}
          showButtonAccept={
            matchAccept(GroupName, curData.Status ?? "") &&
            typeForm === "update" &&
            GroupName !== GroupNames["Chuyên viên TT TNTH"]
          }
          handleClickButtonAccept={handleAccept}
          showButtonUnAccept={
            matchAccept(GroupName, curData.Status ?? "") &&
            typeForm === "update" &&
            GroupName !== GroupNames["Chuyên viên TT TNTH"]
          }
          showButtonReSave={
            matchAccept(GroupName, curData.Status ?? "") &&
            typeForm === "update" &&
            GroupName === GroupNames["Chuyên viên TT TNTH"]
          }
          handleClickUnButtonAccept={handleUnAccept}
          handleClickButtonResave={handleUpdate}
          showButtonDelete={
            matchAccept(GroupName, curData.Status ?? "") &&
            typeForm === "update" &&
            GroupName === GroupNames["Chuyên viên TT TNTH"]
          }
          handleDelete={handleDelete}
        />
      )}
      <Box sx={{ my: 2, display: "flex", justifyContent: "start", gap: 2 }}>
        <ButtonMUI
          variant="contained"
          endIcon={<DriveFileMoveIcon />}
          component="label"
        >
          Import File
          <input type="file" hidden onChange={handleGetFile} />
        </ButtonMUI>
        <ButtonMUI
          color="secondary"
          variant="contained"
          onClick={() => dispatch(getAllAction())}
        >
          Làm mới
        </ButtonMUI>
      </Box>
      <DataGrid
        dataSource={data}
        allowColumnReordering={true}
        rowAlternationEnabled={true}
        showBorders={true}
        loadPanel={{
          enabled: loading,
        }}
        allowColumnResizing={true}
      >
        <Column type="buttons" width={110}>
          <Button
            name="edit"
            visible={true}
            icon={"edit"}
            onClick={(e: any) => handleShowFormDetails("update", e.row.data)}
          />
          <Button name="delete" />
        </Column>
        <Column dataField="OrderId" caption="Mã phiếu nhập" dataType="string" />
        <Column dataField="Status" caption="Trạng thái" dataType="string" />
        <Column dataField="Title" caption="Tiêu đề" dataType="string" />
        <Column
          dataField="EmployeeCreateId"
          caption="Mã nhân viên tạo"
          dataType="string"
        />
        <Column
          dataField="EmployeeCreateName"
          caption="Tên nhân viên tạo"
          dataType="string"
        />
        <Column
          dataField="DepartmentImportId"
          caption="Mã Phòng Ban"
          dataType="string"
        />
        <Column
          dataField="DepartmentImportName"
          caption="Tên Phòng Ban"
          dataType="string"
        />
        <Column
          dataField="DateCreate"
          caption="ngày tạo"
          dataType="string"
          calculateCellValue={(row: any) => {
            return moment.unix(Number(row.DateCreate)).format("DD/MM/YYYY");
          }}
        />
      </DataGrid>
    </Box>
  );
};

export default Index;
