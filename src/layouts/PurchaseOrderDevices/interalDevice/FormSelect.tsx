import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getDeviceForCreate } from "../../../services/internalDevice";
import {
  IDevice,
  IDeviceForCreate,
  initDevice,
} from "../../../types/IInternalDevice";

interface IProps {
  handleAddRecord: (device: IDevice) => void;
}
export default function FormSelect({}: IProps) {
  const [devices, setDevices] = useState<IDeviceForCreate[]>([]);
  const [deviceSelected, setDeviceSelected] = useState<IDevice>(initDevice);
  const [labs, setLabs] = useState("");

  useEffect(() => {
    getDeviceForCreate().then((data) => {
      setDevices(data);
      data.length &&
        setDeviceSelected({
          ...deviceSelected,
          DeviceId: data[0].DeviceId,
          DeviceInfoId: data[0].listDevice[0]?.DeviceInfoId || "",
        });
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
        <InputLabel>DS Thiết bị</InputLabel>
        <Select
          label="DS ThietBi"
          value={deviceSelected.DeviceInfoId}
          onChange={(e) => {
            setDeviceSelected({
              ...deviceSelected,
              DeviceInfoId: e.target.value as string,
            });
          }}
        >
          {devices
            .find((x) => x.DeviceId === deviceSelected.DeviceId)
            ?.listDevice.map((x) => (
              <MenuItem key={x.DeviceInfoId} value={x.DeviceInfoId}>
                {x.DeviceName}
              </MenuItem>
            ))}
        </Select>
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
