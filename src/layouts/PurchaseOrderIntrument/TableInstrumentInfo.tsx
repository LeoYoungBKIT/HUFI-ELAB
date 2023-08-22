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
import { InstrumentInfo } from "../../types/IPurchaseOrderInstruments";
import { styled } from "@mui/material/styles";

interface IProps {
  dataSource: InstrumentInfo[];
  onEditRow?: (row: InstrumentInfo) => void;
}

const TableInstrumentInfo = ({ dataSource, onEditRow }: IProps) => {
  function handleDelete(row: InstrumentInfo): void {
    throw new Error("Function not implemented.");
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {columns.map((x) => {
              return <StyledTableCell key={x}>{x}</StyledTableCell>;
            })}
            <StyledTableCell>Thao tác</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row, index) => (
            <StyledTableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <StyledTableCell component="th" scope="row">
                {row.QuantityDistribute}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.Status}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.DepartmentImportId}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.DepartmentImportName}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.InstrumentId}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.InstrumentName}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.Specification}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.Unit}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                <Button
                  onClick={() => handleDelete(row)}
                  size="small"
                  color="error"
                  variant="contained"
                >
                  delete
                </Button>
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
  "So Luong",
  "Tình trạng ",
  "Mã khoa",
  "Tên khoa",
  "Mã dụng cụ",
  "Tên dụng cụ",
  "Thể tích",
  "dv tính",
];

export default TableInstrumentInfo;
