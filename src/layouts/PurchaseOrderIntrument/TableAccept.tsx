import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
} from "@mui/material";
import { IAccept } from "../../types/IPurchaseOrderInstruments";
import { styled } from "@mui/material/styles";

interface IProps {
  dataSource: IAccept[];
}

const TableAccept = ({ dataSource }: IProps) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {columns.map((x) => {
              return <StyledTableCell key={x}>{x}</StyledTableCell>;
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row, index) => (
            <StyledTableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <StyledTableCell component="th" scope="row">
                {row.AcceptDate}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.AcceptValue}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.ContentAccept}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.EmployeeAcceptId}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.EmployeeAcceptName}
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
const columns = [
  "ngày xác nhận",
  "giá trị xác nhận ",
  "nội dung",
  "mã nhân viên",
  "Tên nhân viên",
];

export default TableAccept;
