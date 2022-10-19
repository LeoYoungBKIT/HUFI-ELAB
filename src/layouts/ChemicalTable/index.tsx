import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import MaterialReactTable, {
  MRT_Cell,
  MRT_ColumnDef,
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { dummyChemicalData, IChemicalType } from '../../types/chemicalType';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { deleteChemical, getChemicals, postChemical, updateChemical } from '../../services/chemicalServices';
import { RootState } from '../../store';
import { setListOfChemicals } from './chemicalSlice';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { setSnackbarMessage } from '../../pages/appSlice';
import { IOrderChemicalType } from '../../types/orderChemicalType';
import { detailOrderColumns, generalOrderColumns, normalColumns } from './const';
import { deleteOrderChemical, getOrderChemicals, postOrderChemicals, updateOrderChemical } from '../../services/orderChemicalServices';
import { setListOfOrderChemicals } from './orderChemicalSlice';

const ChemicalTable: FC<{ type: String, OrderId?: String }> = ({ type, OrderId }) => {
  const chemicalData = useAppSelector((state: RootState) => state.chemical.listOfChemicals);
  const orderChemicalData = useAppSelector((state: RootState) => state.orderChemical.listOfOrderChemicals);
  const manufacturersData = useAppSelector((state: RootState) => state.manufacturer.listOfManufacturers);
  const dispatch = useAppDispatch();

  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [tableData, setTableData] = useState<IChemicalType[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const [updatedRow, setUpdatedRow] = useState<any>(dummyChemicalData);
  const [deletedRow, setDeletedRow] = useState<any>(dummyChemicalData);
  const [createdRow, setCreatedRow] = useState<any>(dummyChemicalData);

  useEffect(() => {
    let formatedData: IChemicalType[] = [];
    if (type === "normal") {
      formatedData = chemicalData.map((chemical: IChemicalType) => {
        let manufacturerInfoIdx = manufacturersData.findIndex(item => item.ManufacturerId === chemical.ManufacturerId);
        return {
          ...chemical,
          "ManufacturerName": manufacturerInfoIdx > -1 ? manufacturersData[manufacturerInfoIdx].Name : ""
        }
      })
    }
    if (type === "generalOrder" || type === "detailOrder") {
      formatedData =
        (type === "detailOrder" ? orderChemicalData.filter(item => item.OrderId === OrderId) : orderChemicalData)
          .map((chemical: IOrderChemicalType) => {
            let chemicalInfo = chemicalData.find(item => item.ChemicalId === chemical.ChemicalId);
            let manufacturerInfoIdx = manufacturersData.findIndex(item => item.ManufacturerId === chemicalInfo?.ManufacturerId);
            return {
              ...chemical,
              "ChemicalName": chemicalInfo ? chemicalInfo.ChemicalName : "",
              "Specifications": chemicalInfo ? chemicalInfo.Specifications : "",
              "Origin": chemicalInfo ? chemicalInfo.Origin : "",
              "Unit": chemicalInfo ? chemicalInfo.Unit : "",
              "ManufacturerId": chemicalInfo ? chemicalInfo.ManufacturerId : -1,
              "ManufacturerName": chemicalInfo ? manufacturersData[manufacturerInfoIdx].Name : "",
            }
          })
    }
    setTableData(formatedData);
  }, [chemicalData, orderChemicalData])

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<IChemicalType>,
    ): MRT_ColumnDef<IChemicalType>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
      };
    },
    [validationErrors],
  );

  const columns = useMemo<MRT_ColumnDef<IChemicalType>[]>(
    () => type === "normal" ? normalColumns :
      type === "generalOrder" ? generalOrderColumns : detailOrderColumns
    , [getCommonEditTextFieldProps],
  );

  const handleOpenEditModal = (row: any) => {
    setUpdatedRow(row.original);
    setIsEditModal(true);
  }

  const onCloseEditModal = () => {
    setUpdatedRow(dummyChemicalData);
    setIsEditModal(false);
  }

  const handleSubmitEditModal = async () => {
    if (type === "generalOrder" || type === "detailOrder") {
      const isUpdatedSuccessOrder = await updateOrderChemical(
        type === "generalOrder" ? updatedRow.OrderId : OrderId,
        updatedRow.ChemicalId,
        {
          "OrderId": updatedRow.OrderId,
          "ChemicalId": updatedRow.ChemicalId,
          "Amount": updatedRow.Amount,
          "Price": updatedRow.Price,
        }
      );
      if (isUpdatedSuccessOrder) {
        dispatch(setSnackbarMessage("Cập nhật thông tin phiếu nhập hoá chất thành công"));
        let updatedIdx = orderChemicalData.findIndex(item => item.ChemicalId === updatedRow.ChemicalId);
        let newListOfOrderChemicals = [...orderChemicalData.slice(0, updatedIdx), updatedRow, ...orderChemicalData.slice(updatedIdx + 1,)]
        dispatch(setListOfOrderChemicals(newListOfOrderChemicals));
      }
    }
    const isUpdatedSuccess = await updateChemical({
      "ChemicalId": updatedRow.ChemicalId,
      "ChemicalName": updatedRow.ChemicalName,
      "Specifications": updatedRow.Specifications,
      "Origin": updatedRow.Origin,
      "Unit": updatedRow.Unit,
      "Amount": updatedRow.Amount,
      "ManufacturerId": updatedRow.ManufacturerId
    });
    if (isUpdatedSuccess) {
      dispatch(setSnackbarMessage("Cập nhật thông tin hoá chất thành công"));
      let updatedIdx = chemicalData.findIndex(item => item.ChemicalId === updatedRow.ChemicalId);
      let newListOfChemicals = [...chemicalData.slice(0, updatedIdx), updatedRow, ...chemicalData.slice(updatedIdx + 1,)]
      dispatch(setListOfChemicals(newListOfChemicals));
    }

    onCloseEditModal();
  }

  const handleOpenDeleteModal = (row: any) => {
    setDeletedRow(row.original);
    setIsDeleteModal(true);
  }

  const onCloseDeleteModal = () => {
    setDeletedRow(dummyChemicalData);
    setIsDeleteModal(false);
  }

  const handleSubmitDeleteModal = async () => {
    if (type === "generalOrder" || type === "detailOrder") {
      await deleteOrderChemical(type === "generalOrder" ? deletedRow.OrderId : OrderId, deletedRow.ChemicalId);
      dispatch(setSnackbarMessage("Xóa thông tin phiếu nhập hoá chất thành công"));
      let deletedIdx = orderChemicalData.findIndex(item => item.ChemicalId === deletedRow.ChemicalId);
      let newListOfOrderChemicals = [...orderChemicalData.slice(0, deletedIdx), ...orderChemicalData.slice(deletedIdx + 1,)]
      dispatch(setListOfOrderChemicals(newListOfOrderChemicals));
    }
    await deleteChemical(deletedRow.ChemicalId);
    dispatch(setSnackbarMessage("Xóa thông tin hoá chất thành công"));
    let deletedIdx = chemicalData.findIndex(item => item.ChemicalId === deletedRow.ChemicalId);
    let newListOfChemicals = [...chemicalData.slice(0, deletedIdx), ...chemicalData.slice(deletedIdx + 1,)]
    dispatch(setListOfChemicals(newListOfChemicals));

    onCloseDeleteModal();
  }

  const handleOpenCreateModal = (row: any) => {
    setIsCreateModal(true);
  }

  const onCloseCreateModal = () => {
    setCreatedRow(dummyChemicalData);
    setIsCreateModal(false);
  }

  const handleSubmitCreateModal = async () => {
    const createdChemical = await postChemical({
      "ChemicalId": createdRow.ChemicalId,
      "ChemicalName": createdRow.ChemicalName,
      "Specifications": createdRow.Specifications,
      "Origin": createdRow.Origin,
      "Unit": createdRow.Unit,
      "Amount": createdRow.Amount,
      "ManufacturerId": createdRow.ManufacturerId
    })

    if (createdChemical) {
      const newListOfChemicals: IChemicalType[] = await getChemicals();
      if (newListOfChemicals) {
        dispatch(setSnackbarMessage("Tạo thông tin hoá chất mới thành công"));
        dispatch(setListOfChemicals(newListOfChemicals));
      }
    }

    if (type === "generalOrder" || type === "detailOrder") {
      const createdOrderChemical = await postOrderChemicals([{
        "OrderId": type === "generalOrder" ? createdRow.OrderId : OrderId,
        "ChemicalId": createdRow.ChemicalId,
        "Amount": createdRow.Amount,
        "Price": createdRow.Price,
      }])
      if (createdOrderChemical) {
        const newListOfOrderChemicals: IOrderChemicalType[] = await getOrderChemicals();
        if (newListOfOrderChemicals) {
          dispatch(setSnackbarMessage("Tạo thông tin phiếu nhập hoá chất mới thành công"));
          dispatch(setListOfOrderChemicals(newListOfOrderChemicals));
        }
      }
    }

    onCloseCreateModal();
  }

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            header: 'Các hành động',
            muiTableHeadCellProps: {
              align: 'center',
            },
            muiTableBodyCellProps: {
              align: 'center',
            },
          },
          'mrt-row-numbers': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            muiTableBodyCellProps: {
              align: 'center',
            },
          }
        }}
        columns={columns}
        data={tableData}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        enableRowNumbers
        enablePinning
        initialState={{
          density: 'compact',
          columnOrder: [
            'mrt-row-numbers',
            ...columns.map(item => item.accessorKey || ''),
            'mrt-row-actions'
          ]
        }}
        renderRowActions={({ row, table }) => (
          <>
            <Tooltip arrow placement="left" title="Sửa thông tin hoá chất">
              <IconButton onClick={() => handleOpenEditModal(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Xoá thông tin hoá chất">
              <IconButton color="error" onClick={() => handleOpenDeleteModal(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        )}
        renderTopToolbarCustomActions={() => (
          <h3 style={{ "margin": "0px" }}>
            <b><KeyboardArrowRightIcon
              style={{ "margin": "0px", "fontSize": "30px", "paddingTop": "15px" }}
            ></KeyboardArrowRightIcon></b>
            <span>Thông tin hoá chất</span>
          </h3>
        )}
        renderBottomToolbarCustomActions={() => (
          <Tooltip title="Tạo hoá chất mới" placement="right-start">
            <Button
              color="primary"
              onClick={handleOpenCreateModal}
              variant="contained"
              style={{ "margin": "10px" }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Tooltip>
        )}
      />

      <Dialog open={isEditModal}>
        <DialogTitle textAlign="center"><b>Sửa thông tin hoá chất</b></DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.map((column) => {
                const manufacturerOptions: string[] = manufacturersData.map(item => item.Name.toString());

                if (column.id === "ManufacturerName" && manufacturersData.length > 0) {
                  return <FormControl sx={{ m: 0, minWidth: 120 }}>
                    <InputLabel id="manufacturer-select-select-required-label">Nhà sản xuất</InputLabel>
                    <Select
                      labelId="manufacturer-select-select-required-label"
                      id="manufacturer-select-select-required"
                      value={manufacturersData.findIndex(item => item.ManufacturerId === updatedRow.ManufacturerId) > -1 ?
                        manufacturersData.findIndex(item => item.ManufacturerId === updatedRow.ManufacturerId).toString() : ""}
                      label="Nhà sản xuất"
                      onChange={(e: SelectChangeEvent) =>
                        setUpdatedRow({
                          ...updatedRow,
                          "ManufacturerName": manufacturersData[Number(e.target.value)].Name,
                          "ManufacturerId": manufacturersData[Number(e.target.value)].ManufacturerId
                        })}
                    >
                      {manufacturerOptions.map((x, idx) => <MenuItem value={idx}>{x}</MenuItem>)}
                    </Select>
                  </FormControl>
                } else if (column.id === "ChemicalId") {
                  return <TextField
                    disabled
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.id && updatedRow[column.id]}
                    onChange={(e) =>
                      setUpdatedRow({ ...updatedRow, [e.target.name]: e.target.value })
                    }
                  />
                }
                else {
                  return <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.id && updatedRow[column.id]}
                    onChange={(e) =>
                      setUpdatedRow({ ...updatedRow, [e.target.name]: e.target.value })
                    }
                  />
                }
              }
              )}

            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseEditModal}>Huỷ</Button>
          <Button color="primary" onClick={handleSubmitEditModal} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModal}>
        <DialogTitle textAlign="center"><b>Xoá thông tin hoá chất</b></DialogTitle>
        <DialogContent>
          <div>Bạn có chắc muốn xoá thông tin hoá chất {`${deletedRow.ChemicalName}`} không?</div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseDeleteModal}>Huỷ</Button>
          <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateModal}>
        <DialogTitle textAlign="center"><b>Tạo thông tin hoá chất</b></DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.map((column) => {
                const manufacturerOptions: string[] = manufacturersData.map(item => item.Name.toString());

                if (column.id === "ManufacturerName" && manufacturersData.length > 0) {
                  return <FormControl sx={{ m: 0, minWidth: 120 }}>
                    <InputLabel id="manufacturer-select-select-required-label">Nhà sản xuất</InputLabel>
                    <Select
                      labelId="manufacturer-select-select-required-label"
                      id="manufacturer-select-select-required"
                      value={manufacturersData.findIndex(item => item.ManufacturerId === createdRow.ManufacturerId) > -1 ?
                        manufacturersData.findIndex(item => item.ManufacturerId === createdRow.ManufacturerId).toString() : ""}
                      label="Nhà sản xuất"
                      onChange={(e: SelectChangeEvent) =>
                        setCreatedRow({
                          ...createdRow,
                          "ManufacturerName": manufacturersData[Number(e.target.value)].Name,
                          "ManufacturerId": manufacturersData[Number(e.target.value)].ManufacturerId
                        })}
                    >
                      {manufacturerOptions.map((x, idx) => <MenuItem value={idx}>{x}</MenuItem>)}
                    </Select>
                  </FormControl>
                }
                else {
                  return <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.id && createdRow[column.id]}
                    onChange={(e) =>
                      setCreatedRow({ ...createdRow, [e.target.name]: e.target.value })
                    }
                  />
                }
              }
              )}
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseCreateModal}>Huỷ</Button>
          <Button color="primary" onClick={handleSubmitCreateModal} variant="contained">
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default ChemicalTable;
