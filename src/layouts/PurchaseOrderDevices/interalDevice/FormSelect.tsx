import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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
import _ from "lodash";

interface IProps {
  handleAddRecord: (device: IDevice) => void;
}
export default function FormSelect({}: IProps) {
  const [devices, setDevices] = useState<IDeviceForCreate[]>([]);
  const [deviceSelected, setDeviceSelected] = useState<IDevice>(initDevice);
  const [employeeCur, setEmployeeCur] = useState<IEmployeeManagerLab>();
  const [employees, setEmployees] = useState<IEmployeeManagerLab[]>([]);

  const listDevices = useMemo(() => {
    return (
      devices.find((x) => x.DeviceId === deviceSelected.DeviceId)?.listDevice ||
      []
    );
  }, [deviceSelected.DeviceId]);

  useEffect(() => {
    getDeviceForCreate().then((data) => {
      if (!_.isEmpty(data)) {
        setDevices(data);
      }
    });

    getEmployeeManageLab().then((data) => {
      if (!_.isEmpty(data)) {
        setEmployees(data);
        data.length && setEmployeeCur(data[0]);
      }
    });
  }, []);

  return (
    <Box sx={{ ...style }}>
      <FormControl>
        <InputLabel>Thiết bị</InputLabel>
        <Select
          label="Thiết bị"
          value={deviceSelected.DeviceId}
          onChange={(e) => {
            const deviceId = e.target.value as string;
            setDeviceSelected({
              ...deviceSelected,
              DeviceId: deviceId,
              DeviceInfoId:
                devices.find((x) => x.DeviceId === deviceId)?.listDevice[0]
                  ?.DeviceInfoId || "",
            });
          }}
        >
          {devices.map((x) => (
            <MenuItem key={x.DeviceId} value={x.DeviceId}>
              {x.DeviceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>DS Thiet bi</InputLabel>
        <Select
          label="DS Thiet bi"
          value={deviceSelected.DeviceInfoId}
          onChange={(e) => {
            setDeviceSelected({
              ...deviceSelected,
              DeviceInfoId: e.target.value as string,
            });
          }}
        >
          {listDevices.map((x) => (
            <MenuItem key={x.DeviceInfoId} value={x.DeviceInfoId}>
              {x.DeviceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel>Danh sach nhan vien</InputLabel>
        <Select
          label="Danh sach nhan vien"
          value={employeeCur?.EmployeeId || ""}
          onChange={(e) => {
            setEmployeeCur(
              employees.find((x) => x.EmployeeId === e.target.value)
            );
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
          value={deviceSelected.LabId || employeeCur?.listLab[0]?.LabId || ""}
          onChange={(e) => {
            setEmployeeCur(
              employees.find((x) => x.EmployeeId === e.target.value)
            );
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
        <Button color="success">Thêm vào danh sách</Button>
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
