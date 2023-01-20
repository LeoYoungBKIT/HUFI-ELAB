import React, { FC, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import SearchIcon from '@mui/icons-material/Search';
import moment from 'moment';

import {
  debounce,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Box } from '@mui/system';
import { ColumnType, descendingComparator, removeAccents, renderArrowSort } from '../Utils';
import { IListChemicalRegisterGeneralType } from '../../../types/registerGeneralType';

const StyledTableCell = styled(TableCell)(theme => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'lightgray',
  },
}));

const RegisterGeneralChemicalTable: FC<{ 
    chemicalData: IListChemicalRegisterGeneralType[]; 
    columns: ColumnType[]; 
}> = ({ chemicalData, columns }) => {
  const [tableData, setTableData] = useState<IListChemicalRegisterGeneralType[]>(chemicalData);
  const [order, setOrder] = useState<string>('asc');
  const [orderBy, setOrderBy] = useState<string>('ChemicalId');
  const [keyword, setKeyword] = useState<string>('');
  const [dataSearch, setDataSearch] = useState<any>([]);


  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    setTableData(prev => {
      let data = [...prev];
      data?.sort((a: IListChemicalRegisterGeneralType, b: IListChemicalRegisterGeneralType) => {
        let i =
          order === 'desc'
            ? descendingComparator<any>(a, b, orderBy)
            : -descendingComparator<any>(a, b, orderBy);
        return i;
      });
      return data;
    });
  }, [order, orderBy]);


  useEffect(() => {
    const chemicalDataItems: IListChemicalRegisterGeneralType[] = chemicalData || [];
    const data = chemicalDataItems?.map((x: IListChemicalRegisterGeneralType) => {
      let string: String = '';

      Object.keys(x).forEach(key => {
        if (typeof x[key as keyof typeof x] === 'string') string += x[key as keyof typeof x] + ' ';
        if (typeof x[key as keyof typeof x] === 'number') string += x[key as keyof typeof x]?.toString() + ' ';
      });

      return {
        label: removeAccents(string.toUpperCase()),
        id: x?.ChemicalId,
      };
    });
    setDataSearch(data);
  }, []);

  useEffect(() => {
    const listId = dataSearch.filter((x: any) => x?.label?.includes(keyword)).map((y: any) => y.id);
    const chemicalDataItems: IListChemicalRegisterGeneralType[] = chemicalData || [];

    if (keyword === '') {
      setTableData(chemicalDataItems);
    } else {
      const data = chemicalDataItems?.filter((x: any) => listId.indexOf(x?.ChemicalId) !== -1);
      setTableData(data);
    }
  }, [keyword, dataSearch]);

  return (
    <>
      <Box component="div" alignItems="center" justifyContent="space-between" display="flex" mb={2}>
        <Typography fontWeight="bold">Thông tin hóa chất đăng ký</Typography>
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
            onChange={debounce(e => setKeyword(removeAccents(e.target.value.toUpperCase())), 300)}
          />
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: '400px', marginBottom: '24px', overflow: 'overlay' }}>
        <Table sx={{ minWidth: 650 }} stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <b>#</b>
              </StyledTableCell>
              {columns.map(col => {
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
            {tableData.length > 0 ? tableData?.map((chemDeptItem: IListChemicalRegisterGeneralType, index: number) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="left">{index + 1}</TableCell>
                {columns.map(col => {
                  if (col.renderValue) {
                    return (
                      <TableCell align="left" key={col.id}>
                        {`${col.renderValue(
                          `${chemDeptItem[col.id as keyof typeof chemDeptItem]}`,
                          chemDeptItem.Unit
                        )}`}
                      </TableCell>
                    );
                  }
                  if (col.type === 'date')
                    return (
                      <TableCell align="left" key={col.id}>
                        {moment
                          .unix(Number(chemDeptItem[col.id as keyof typeof chemDeptItem]))
                          .format('DD/MM/YYYY')}
                      </TableCell>
                    );

                  return (
                    <TableCell align="left" key={col.id}>
                      {chemDeptItem[col.id as keyof typeof chemDeptItem]
                        ? `${chemDeptItem[col.id as keyof typeof chemDeptItem]}`
                        : ''}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
              :
              <TableRow>
                <TableCell colSpan={12} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom align="center" component="div">
                    Trống
                  </Typography>
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default React.memo(RegisterGeneralChemicalTable);
