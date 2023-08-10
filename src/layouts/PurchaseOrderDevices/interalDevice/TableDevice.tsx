import { styled } from "@mui/material/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { IDevice } from "../../../types/IInternalDevice";

interface IProps {
  dataSource: IDevice[];
}

const TableDevice = ({ dataSource }: IProps) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Mã thiết bị</StyledTableCell>
            <StyledTableCell align="center">
              Mã định danh thiết bị
            </StyledTableCell>
            <StyledTableCell align="center">Tên thiết bị</StyledTableCell>
            <StyledTableCell align="center">Tên tiếng anh</StyledTableCell>
            <StyledTableCell align="center">Vị trí</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row, index) => (
            <StyledTableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <StyledTableCell component="th" scope="row">
                {row.DeviceId}
              </StyledTableCell>

              <StyledTableCell component="th" scope="row">
                {row.DeviceInfoId}
              </StyledTableCell>

              <StyledTableCell component="th" scope="row">
                {row.DeviceName}
              </StyledTableCell>

              <StyledTableCell component="th" scope="row">
                {row.DeviceEnglishName}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.LabId}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "& td, & th": {
    border: "1px solid #eee",
  },
}));

export default TableDevice;
