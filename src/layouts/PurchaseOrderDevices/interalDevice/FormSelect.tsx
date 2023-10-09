import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getDeviceForCreate,
  getEmployeeManageLab,
} from "../../../services/internalDevice";
import {
  IDevice,
  IDeviceForCreate,
  IEmployeeManagerLab,
  initDevice,
} from "../../../types/IInternalDevice";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import _ from "lodash";

interface IProps {
  handleAddRecord: (device: IDevice) => void;
  handleChoiceEmployee?: (employee: IEmployeeManagerLab) => void;
  loading: boolean;
}

export default function FormSelect({
  handleAddRecord,
  handleChoiceEmployee,
  loading,
}: IProps) {
  const [devices, setDevices] = useState<IDeviceForCreate[]>([]);
  const [deviceSelected, setDeviceSelected] = useState<IDevice>(initDevice);
  const [deviceCur, setDeviceCur] = useState<IDeviceForCreate>();
  const [employeeCur, setEmployeeCur] = useState<IEmployeeManagerLab>();
  const [employees, setEmployees] = useState<IEmployeeManagerLab[]>([]);

  useEffect(() => {
    getDeviceForCreate().then((data) => {
      if (!_.isEmpty(data)) {
        setDevices(data);
        if (data.length) {
          const device = data[0];
          setDeviceCur(device);
          setDeviceSelected({
            ...deviceSelected,
            QuantityImport: device.listDevice[0]?.QuantityImport ?? 0,
            QuantityDistribute: 1,
            DeviceName: device.listDevice[0]?.DeviceName ?? "",
            DeviceEnglishName: device.listDevice[0]?.DeviceEnglishName ?? "",
            DeviceId: device.DeviceId ?? "",
            DeviceInfoId: device.listDevice[0]?.DeviceInfoId ?? "",
          });
        }
      }
    });

    getEmployeeManageLab().then((data) => {
      if (!_.isEmpty(data)) {
        setEmployees(data);
      }
    });
  }, []);

  useEffect(() => {
    if (employeeCur && handleChoiceEmployee) handleChoiceEmployee(employeeCur);
  }, [employeeCur, handleChoiceEmployee]);

  return (
    <Box sx={{ ...style }}>
      {loading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
      <FormControl>
        <InputLabel>Thiết bị</InputLabel>
        <Select
          label="Thiết bị"
          value={deviceSelected.DeviceId || deviceCur?.DeviceId || ""}
          onChange={(e) => {
            const deviceCur = devices.find(
              (x) => x.DeviceId === e.target.value
            );
            setDeviceCur(deviceCur);
            setDeviceSelected({
              ...deviceSelected,
              DeviceId: deviceCur?.DeviceId || "",
              DeviceName: deviceCur?.DeviceName || "",
              DeviceInfoId: deviceCur?.listDevice[0]?.DeviceInfoId || "",
              QuantityImport: deviceCur?.listDevice[0]?.QuantityImport ?? 0,
            });
          }}
        >
          {devices.map((x) => (
            <MenuItem key={x.DeviceId} value={x.DeviceId}>
              {x.DeviceId}-{x.DeviceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>DS Thiet bi</InputLabel>
        <Select
          label="DS Thiet bi"
          value={
            deviceSelected.DeviceInfoId ||
            deviceCur?.listDevice[0]?.DeviceInfoId ||
            ""
          }
          onChange={(e) => {
            const deviceInfo = deviceCur?.listDevice.find(
              (x) => x.DeviceInfoId === e.target.value
            );
            setDeviceSelected({
              ...deviceSelected,
              DeviceInfoId: deviceInfo?.DeviceInfoId ?? "",
              DeviceName: deviceInfo?.DeviceName ?? "",
              DeviceEnglishName: deviceInfo?.DeviceEnglishName ?? "",
              QuantityImport: deviceInfo?.QuantityImport ?? 0,
            });
          }}
        >
          {deviceCur?.listDevice.map((x) => (
            <MenuItem key={x.DeviceInfoId} value={x.DeviceInfoId}>
              {x.DeviceInfoId}-{x.DeviceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <TextField
          disabled
          label="số lượng nhập"
          value={deviceSelected.QuantityImport}
          onChange={() => {}}
        />
      </FormControl>

      <FormControl>
        <TextField
          type="number"
          label="số lượng phân phối"
          value={deviceSelected.QuantityDistribute}
          onChange={(e) => {
            setDeviceSelected({
              ...deviceSelected,
              QuantityDistribute: Number(e.target.value),
            });
          }}
        />
      </FormControl>

      <FormControl>
        <InputLabel>Danh sach nhan vien</InputLabel>
        <Select
          label="Danh sach nhan vien"
          value={employeeCur?.EmployeeId || ""}
          onChange={(e) => {
            const empoloyeeCur = employees.find(
              (x) => x.EmployeeId === e.target.value
            );

            setEmployeeCur(empoloyeeCur);

            setDeviceSelected({
              ...deviceSelected,
              LabId: empoloyeeCur?.listLab[0]?.LabId || "",
            });
          }}
        >
          {employees.map((x) => (
            <MenuItem key={x.EmployeeId} value={x.EmployeeId}>
              {x.Fullname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>Danh sach phong lab</InputLabel>
        <Select
          label="Danh sach phong lab"
          value={deviceSelected.LabId}
          onChange={(e) => {
            setDeviceSelected({
              ...deviceSelected,
              LabId: e.target.value as string,
            });
          }}
        >
          {employeeCur?.listLab.map((x) => (
            <MenuItem key={x.LabId} value={x.LabId}>
              {x.LabName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <Button
          onClick={() => handleAddRecord(deviceSelected)}
          color="success"
          variant="contained"
          startIcon={<ArrowDownwardIcon />}
        >
          Thêm vào danh sách
        </Button>
      </FormControl>
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
