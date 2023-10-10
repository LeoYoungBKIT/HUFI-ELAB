import { Box } from "@mui/system";
import {
    IDeviceInfor,
    IDeviceServiceInfo,
} from "../../types/IDeviceServiceInfo";
import TableListDeviceInfo from "./TableListDeviceInfor";

interface IProps {
    data: IDeviceServiceInfo;
    onTableDeviceInfoChange: (data: IDeviceInfor[]) => any;
}

const DetailPannel = (props: IProps) => {
    const { listDeviceInfo } = props.data;

    return (
        <Box>
            <TableListDeviceInfo
                deviceServiceInfo={props.data}
                alowExportCsv
                dataSource={listDeviceInfo ?? []}
                onTableChange={props.onTableDeviceInfoChange}
            />
        </Box>
    );
};

export default DetailPannel;
