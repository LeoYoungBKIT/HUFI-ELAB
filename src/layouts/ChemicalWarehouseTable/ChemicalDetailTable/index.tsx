import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";
import {
  Collapse,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  debounce,
  tableCellClasses,
} from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import React, { FC, useEffect, useRef, useState } from "react";
import { IChemicalDetailType } from "../../../types/chemicalWarehouseType";
import {
  ColumnType,
  descendingComparator,
  removeAccents,
  renderArrowSort,
} from "../Utils";
import ChemicalDeptTable from "./ChemicalDeptTable";

const StyledTableCell = styled(TableCell)((theme) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "lightgray",
  },
}));

const ChemicalDetailTable: FC<{
  chemicalDetail: IChemicalDetailType[];
  columns: ColumnType[];
}> = ({ chemicalDetail, columns }) => {
  const [tableData, setTableData] =
    useState<IChemicalDetailType[]>(chemicalDetail);
  const [order, setOrder] = useState<string>("asc");
  const [orderBy, setOrderBy] = useState<string>("ChemDetailId");
  const [keyword, setKeyword] = useState<string>("");
  const [dataSearch, setDataSearch] = useState<any>([]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  useEffect(() => {
    setTableData((prev) => {
      let data = [...prev];
      data?.sort((a: IChemicalDetailType, b: IChemicalDetailType) => {
        let i =
          order === "desc"
            ? descendingComparator<any>(a, b, orderBy)
            : -descendingComparator<any>(a, b, orderBy);
        return i;
      });
      return data;
    });
  }, [order, orderBy]);

  useEffect(() => {
    const chemicalDeptItems: IChemicalDetailType[] = chemicalDetail || [];
    const data = chemicalDeptItems?.map((x: IChemicalDetailType) => {
      let string: String = "";

      Object.keys(x).forEach((key) => {
        if (typeof x[key as keyof typeof x] === "string")
          string += x[key as keyof typeof x] + " ";
        if (typeof x[key as keyof typeof x] === "number")
          string += x[key as keyof typeof x]?.toString() + " ";
      });

      return {
        label: removeAccents(string.toUpperCase()),
        id: x?.ChemDetailId,
      };
    });
    setDataSearch(data);
  }, []);

  useEffect(() => {
    const listId = dataSearch
      .filter((x: any) => x?.label?.includes(keyword))
      .map((y: any) => y.id);
    const chemicalDeptItems: IChemicalDetailType[] = chemicalDetail || [];

    if (keyword === "") {
      setTableData(chemicalDeptItems);
    } else {
      const data = chemicalDeptItems?.filter(
        (x: any) => listId.indexOf(x?.ChemDetailId) !== -1
      );
      setTableData(data);
    }
  }, [keyword, dataSearch]);

  const chemicalDeptTableColumns = useRef<ColumnType[]>([
    {
      id: "ChemDeptId",
      header: "Mã xuất",
    },
    {
      id: "DepartmentName",
      header: "Khoa",
    },
    {
      id: "AmountOriginal",
      header: "SL xuất",
      renderValue: (AmountExport, Unit) => `${AmountExport} (${Unit})`,
    },
  ]);

  return (
    <>
      <Box
        component="div"
        alignItems="center"
        justifyContent="space-between"
        display="flex"
        mb={2}
      >
        <Typography fontWeight="bold">Thông tin lô hóa chất</Typography>
        <Box display="flex" alignItems="end">
          <TextField
            id="filled-search"
            type="search"
            variant="standard"
            placeholder="Tìm kiếm..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={debounce(
              (e) => setKeyword(removeAccents(e.target.value.toUpperCase())),
              300
            )}
          />
        </Box>
      </Box>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "400px", marginBottom: "24px", overflow: "overlay" }}
      >
        <Table sx={{ minWidth: 650 }} stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <b>#</b>
              </StyledTableCell>
              {columns.map((col) => {
                return (
                  <StyledTableCell
                    align="left"
                    key={col.id}
                    onClick={() => handleRequestSort(col.id)}
                  >
                    <b>{col.header}</b>
                    {renderArrowSort(order, orderBy, col.id)}
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length > 0 ? (
              tableData?.map(
                (chemDeptItem: IChemicalDetailType, index: number) => (
                  <>
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell align="left">{index + 1}</TableCell>
                      {columns.map((col) => {
                        if (col.renderValue) {
                          return (
                            <TableCell align="left" key={col.id}>
                              {`${col.renderValue(
                                `${
                                  chemDeptItem[
                                    col.id as keyof typeof chemDeptItem
                                  ]
                                }`
                                // chemDeptItem.Unit
                              )}`}
                            </TableCell>
                          );
                        }
                        if (col.type === "date")
                          return (
                            <TableCell align="left" key={col.id}>
                              {moment
                                .unix(
                                  Number(
                                    chemDeptItem[
                                      col.id as keyof typeof chemDeptItem
                                    ]
                                  )
                                )
                                .format("DD/MM/YYYY")}
                            </TableCell>
                          );

                        return (
                          <TableCell align="left" key={col.id}>
                            {`${
                              chemDeptItem[col.id as keyof typeof chemDeptItem]
                            }`}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{
                          paddingBottom: 0,
                          paddingTop: 0,
                          background: "#f3f3f3",
                        }}
                        colSpan={14}
                      >
                        <Collapse in={true} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            {chemicalDetail.length !== 0 ? (
                              chemicalDetail.map((item) => (
                                <>
                                  <ChemicalDeptTable
                                    chemicalDept={item.listChemDept}
                                    columns={chemicalDeptTableColumns.current}
                                  />
                                </>
                              ))
                            ) : (
                              <Typography
                                variant="h5"
                                gutterBottom
                                align="center"
                                component="div"
                              >
                                Trống
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={12} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    align="center"
                    component="div"
                  >
                    Trống
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default React.memo(ChemicalDetailTable);
