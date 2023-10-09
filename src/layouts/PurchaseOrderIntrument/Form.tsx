import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  SxProps,
  TextField,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { IPurchaseOrderInstrument } from "../../types/IPurchaseOrderInstruments";
import { Close as CloseIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import moment from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import TableInstrumentInfo from "./TableInstrumentInfo";
import AlertDialog from "../../components/AlertDialog";
import TableAccept from "./TableAccept";

interface IProps {
  initData: IPurchaseOrderInstrument;
  onClose: () => void;
  onsubmit: (data: IPurchaseOrderInstrument) => void;
  showButtonSave?: boolean;
  handleSave?: (data: IPurchaseOrderInstrument) => void;
  showButtonAccept?: boolean;
  handleClickButtonAccept?: (data: IPurchaseOrderInstrument) => void;
  showButtonReSave?: boolean;
  handleClickButtonResave?: (data: IPurchaseOrderInstrument) => void;
  showButtonDelete?: boolean;
  handleDelete?: (data: IPurchaseOrderInstrument) => void;
  showButtonUnAccept?: boolean;
  handleClickUnButtonAccept?: (
    data: IPurchaseOrderInstrument,
    text: string
  ) => void;
}
const Form = ({
  initData,
  onClose,
  onsubmit,
  showButtonSave,
  handleSave,
  showButtonAccept,
  handleClickButtonAccept,
  showButtonUnAccept,
  handleClickUnButtonAccept,
  showButtonReSave,
  handleClickButtonResave,
  showButtonDelete,
  handleDelete,
}: IProps) => {
  const [data, setData] = useState(initData);
  const [showBoxDelete, setShowBoxDelete] = useState(false);
  const [value, setValue] = useState("listDeviceInfo");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    setData(initData);
  }, [initData]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    onsubmit(data);
  }

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <DialogTitle textAlign="left">
        <b>Form Thông tin</b>
        <IconButton
          aria-label="close"
          onClick={onClose}
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
      <form onSubmit={handleSubmit}>
        <Box sx={{ ...style }}>
          {Object.keys(initData).map((x) => {
            const key = x as keyof IPurchaseOrderInstrument;
            if (
              key === "listAccept" ||
              key === "listInstrumentInfo" ||
              key === "Lock"
            )
              return <React.Fragment key={key}></React.Fragment>;

            if (key === "DateCreate")
              return (
                <LocalizationProvider key={key} dateAdapter={AdapterMoment}>
                  <DatePicker
                    label={key}
                    value={new Date(Number(data[key]) * 1000)}
                    onChange={(val: any) => {
                      setData({
                        ...data,
                        [key]: moment(Date.parse(val)).unix().toString(),
                      });
                    }}
                    renderInput={(params: any) => (
                      <TextField key={key} {...params} />
                    )}
                    inputFormat="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              );

            return (
              <TextField
                value={data[key] ?? ""}
                key={key}
                label={key}
                variant="outlined"
                name={key}
                onChange={(e) => {
                  setData({ ...data, [key]: e.target.value });
                }}
              />
            );
          })}

          <Box sx={{ width: "100%" }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab
                value={"listDeviceInfo"}
                label={"Danh sách thông tin thiết bị"}
              />
              <Tab value={"listAccept"} label={"Lịch sử xác nhận"} />;
            </Tabs>

            <Box sx={{ m: "2rem" }}>
              {value === "listDeviceInfo" && (
                <TableInstrumentInfo
                  onEditRow={(row) => {
                    setData({
                      ...data,
                      listInstrumentInfo: [...data.listInstrumentInfo].map(
                        (x) => (x.InstrumentId === row.InstrumentId ? row : x)
                      ),
                    });
                  }}
                  dataSource={data.listInstrumentInfo}
                />
              )}
              {value === "listAccept" && (
                <TableAccept dataSource={data.listAccept} />
              )}
            </Box>
          </Box>

          <AlertDialog
            head="Form xác nhận"
            message="nhập nội dung đính kèm"
            isOpen={showBoxDelete}
            handleClose={() => setShowBoxDelete(false)}
            handleOk={(text) => {
              if (handleClickUnButtonAccept)
                handleClickUnButtonAccept(data, text || "");
            }}
            showBoxInput
            boxInputProps={{
              label: "nội dung",
            }}
          />

          <Box
            sx={{
              my: 2,
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              gap: 2,
            }}
          >
            {showButtonUnAccept && (
              <Button
                onClick={() => setShowBoxDelete(true)}
                variant="contained"
                color="error"
              >
                không xác nhận
              </Button>
            )}

            {showButtonAccept && (
              <Button
                onClick={() =>
                  handleClickButtonAccept && handleClickButtonAccept(data)
                }
                variant="contained"
                color="success"
              >
                xác nhận
              </Button>
            )}

            {showButtonDelete && (
              <Button
                onClick={() => handleDelete && handleDelete(data)}
                variant="contained"
                color="error"
              >
                xoá vĩnh viễn
              </Button>
            )}

            {showButtonReSave && (
              <Button
                onClick={() =>
                  handleClickButtonResave && handleClickButtonResave(data)
                }
                variant="contained"
                color="warning"
              >
                lưu dè dữ liệu
              </Button>
            )}

            {showButtonSave && (
              <Button
                onClick={() => handleSave && handleSave(data)}
                variant="contained"
              >
                Save
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Dialog>
  );
};

export default Form;

const style: SxProps = {
  display: "flex",
  padding: "1rem",
  flexWrap: "wrap",
  borderRadius: "5px",
  justifyContent: "center",
  "& .MuiFormControl-root ": { m: 1, minWidth: "300px" },
};
