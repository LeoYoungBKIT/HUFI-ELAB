import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Step, StepIconProps, StepLabel, Stepper } from "@mui/material";
import moment from "moment";

import { IAccept } from "../../../types/IInternalDevice";

interface IProps {
    dataSource: IAccept[];
}

const TableListAccept = ({ dataSource }: IProps) => {
    return (
        <Stepper activeStep={dataSource.length + 1} alternativeLabel>
            <Step sx={{ minWidth: 200 }} key="StepStart">
                <StepLabel
                    StepIconComponent={(props: StepIconProps) => (
                        <CheckCircleIcon color="success" />
                    )}
                >
                    <div>
                        Tạo lúc{" "}
                        {moment
                            .unix(Number(dataSource[0].AcceptDate))
                            .format("HH:mm - DD/MM/YYYY")}
                    </div>
                    <div>
                        Người tạo: {dataSource[0].EmployeeAcceptId} -{" "}
                        {dataSource[0].EmployeeAcceptName}
                    </div>
                </StepLabel>
            </Step>
            {dataSource.map((label, idx) => (
                <Step
                    sx={{ minWidth: 200 }}
                    key={label.AcceptValue! + idx}
                    color="success"
                >
                    <StepLabel
                        StepIconComponent={(props: StepIconProps) => {
                            return <CheckCircleIcon color="success" />;
                        }}
                    >
                        <div>{label?.AcceptValue}</div>
                        <div>
                            Lúc:{" "}
                            {moment
                                .unix(Number(label?.AcceptDate))
                                .format("HH:mm - DD/MM/YYYY")}
                        </div>
                        <div>
                            NV: {label?.EmployeeAcceptId} -{" "}
                            {label?.EmployeeAcceptName}
                        </div>
                        {label?.ContentAccept && (
                            <div>Nội dung: {label.ContentAccept}</div>
                        )}
                    </StepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default TableListAccept;
