import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  SxProps,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { IExportLab } from "../../../types/IInternalDevice";
import TableDevice from "./TableDevice";

interface IProps {
  loading?: boolean;
  handleSave?: (data: IExportLab) => void;
  columnsForm: MRT_ColumnDef<IExportLab>[];
  showAllForm?: boolean;
  initDataForm: IExportLab;
}

export default function FormCmp({
  loading,
  columnsForm,
  initDataForm,
  showAllForm,
}: IProps) {
  const [values, setValues] = useState(initDataForm);

  const onsubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    setValues(initDataForm);
  }, [initDataForm]);

  return (
    <Box
      component="form"
      sx={{
        border: "1px solid  rgba(0,0,0,0.2)",
        m: 2,
        padding: 1,
      }}
      noValidate
      autoComplete="off"
      onSubmit={onsubmit}
    >
      {loading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {showAllForm && (
        <Stack
          sx={{
            width: "100%",
            minWidth: { xs: "300px", sm: "360px", md: "400px" },
            gap: "1.5rem",
          }}
        >
          {columnsForm.map(({ accessorKey, header }, i) => {
            if (!accessorKey) return <React.Fragment key={i}></React.Fragment>;

            const value = values[accessorKey];

            if (accessorKey === "DateCreate")
              return (
                <LocalizationProvider key={i} dateAdapter={AdapterMoment}>
                  <DatePicker
                    label={header}
                    value={new Date(Number(value) * 1000)}
                    onChange={(val: any) => {
                      setValues({
                        ...values,
                        [accessorKey]: moment(Date.parse(val))
                          .unix()
                          .toString(),
                      });
                    }}
                    renderInput={(params: any) => (
                      <TextField key={accessorKey} {...params} />
                    )}
                    inputFormat="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              );

            return (
              <TextField
                value={values[accessorKey] || ""}
                key={i}
                label={header}
                name={accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
            );
          })}
        </Stack>
      )}

      <Box sx={{ ...style }}>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Thiết bị</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Thiết bị"
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>{" "}
        <FormControl>
          <InputLabel id="demo-simple-select-label">Vị trí</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Thiết bị"
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>{" "}
      </Box>

      <TableDevice dataSource={values.listDevice} />

      <Box sx={{ my: 2, gap: 2, display: "flex", justifyContent: "end" }}>
        <Button type="submit" variant="contained">
          Lưu lại
        </Button>
      </Box>
    </Box>
  );
}

const style: SxProps = {
  display: "flex",
  padding: "1rem",
  flexWrap: "wrap",
  borderRadius: "5px",
  justifyContent: "center",
  "& .MuiFormControl-root ": { m: 1, minWidth: "300px" },
};
