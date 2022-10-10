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
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { dummySupplierData, ISupplierType } from '../../types/supplierType';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { deleteSupplier, getSuppliers, postSupplier, updateSupplier } from '../../services/supplierServices';
import { RootState } from '../../store';
import { setListOfSuppliers } from './supplierSlice';

const SupplierTable: FC = () => {
  const supplierData = useAppSelector((state: RootState) => state.supplier.listOfSuppliers);
  const dispatch = useAppDispatch();

  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [tableData, setTableData] = useState<ISupplierType[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const [updatedRow, setUpdatedRow] = useState<any>(dummySupplierData);
  const [deletedRow, setDeletedRow] = useState<any>(dummySupplierData);
  const [createdRow, setCreatedRow] = useState<any>(dummySupplierData);

  const getTableData = async () => {
    const listOfSupplier: ISupplierType[] = await getSuppliers();
    if (listOfSupplier) {
      dispatch(setListOfSuppliers(listOfSupplier));
    }
  }

  useEffect(() => {
    getTableData();
  }, [])

  useEffect(() => {
    setTableData(supplierData);
  }, [supplierData])

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<ISupplierType>,
    ): MRT_ColumnDef<ISupplierType>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
      };
    },
    [validationErrors],
  );

  const columns = useMemo<MRT_ColumnDef<ISupplierType>[]>(
    () => [
      {
        accessorKey: 'SupplierId',
        header: 'Id nhà cung cấp',
        enableColumnOrdering: true,
        enableEditing: false, //disable editing on this column
        enableSorting: false,
        size: 50,
      },
      {
        accessorKey: 'Name',
        header: 'Tên nhà cung cấp',
        size: 100,
      },
      {
        accessorKey: 'Email',
        header: 'Email',
        size: 140,
      },
      {
        accessorKey: 'PhoneNumber',
        header: 'Số điện thoại',
        size: 140,
      },
      {
        accessorKey: 'Address',
        header: 'Địa chỉ',
        size: 140,
      },
      {
        accessorKey: 'Status',
        header: 'Trạng thái',
        size: 140,
      },
      {
        accessorKey: 'PurchaseOrders',
        header: 'Đơn mua hàng',
        size: 140,
      },
    ],
    [getCommonEditTextFieldProps],
  );

  const handleOpenEditModal = (row: any) => {
    setUpdatedRow(row.original);
    setIsEditModal(true);
  }

  const onCloseEditModal = () => {
    setIsEditModal(false);
  }

  const handleSubmitEditModal = async () => {
    const isUpdatedSuccess = await updateSupplier(updatedRow);
    if (isUpdatedSuccess) {
      let updatedIdx = supplierData.findIndex(x => x.SupplierId === updatedRow.SupplierId);
      let newListOfSuppliers = [...supplierData.slice(0, updatedIdx), updatedRow, ...supplierData.slice(updatedIdx + 1,)]
      dispatch(setListOfSuppliers(newListOfSuppliers));
    }

    setIsEditModal(false);
    setUpdatedRow(dummySupplierData);
  }

  const handleOpenDeleteModal = (row: any) => {
    setDeletedRow(row.original);
    setIsDeleteModal(true);
  }

  const onCloseDeleteModal = () => {
    setIsDeleteModal(false);
  }

  const handleSubmitDeleteModal = async () => {
    await deleteSupplier(deletedRow.SupplierId);

    let deletedIdx = supplierData.findIndex(x => x.SupplierId === deletedRow.SupplierId);
    let newListOfSuppliers = [...supplierData.slice(0, deletedIdx), ...supplierData.slice(deletedIdx + 1,)]
    dispatch(setListOfSuppliers(newListOfSuppliers));

    setIsDeleteModal(false);
    setDeletedRow(dummySupplierData);
  }

  const handleOpenCreateModal = (row: any) => {
    setIsCreateModal(true);
  }

  const onCloseCreateModal = () => {
    setIsCreateModal(false);
  }

  const handleSubmitCreateModal = async () => {
    const createdSupplier = await postSupplier({
      "Name": createdRow.Name, 
      "Email": createdRow.Email, 
      "PhoneNumber": createdRow.PhoneNumber, 
      "Address": createdRow.Address, 
      "Status": createdRow.Status, 
      "PurchaseOrders": createdRow.PurchaseOrders
    })

    if(createdSupplier){
      const newListOfSuppliers: ISupplierType[] = await getSuppliers();
      if(newListOfSuppliers){
        dispatch(setListOfSuppliers(newListOfSuppliers));
      }
    }
    setIsCreateModal(false);
    setCreatedRow(dummySupplierData);
  }

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 120,
          },
        }}
        columns={columns}
        data={tableData}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Sửa thông tin nhà cung cấp">
              <IconButton onClick={() => handleOpenEditModal(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Xoá thông tin nhà cung cấp">
              <IconButton color="error" onClick={() => handleOpenDeleteModal(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderBottomToolbarCustomActions={() => (
          <Button
            color="primary"
            onClick={handleOpenCreateModal}
            variant="contained"
            style={{ "margin": "10px" }}
          >
            Tạo nhà cung cấp mới
          </Button>
        )}
      />

      <Dialog open={isEditModal}>
        <DialogTitle textAlign="center"><b>Sửa thông tin nhà cung cấp</b></DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.map((column) => (
                column.id === "SupplierId" ?
                  <TextField
                    disabled
                    key="SupplierId"
                    label="SupplierId"
                    name="SupplierId"
                    defaultValue={updatedRow["SupplierId"]}
                  /> :
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.id && updatedRow[column.id]}
                    onChange={(e) =>
                      setUpdatedRow({ ...updatedRow, [e.target.name]: e.target.value })
                    }
                  />
              ))}

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
        <DialogTitle textAlign="center"><b>Xoá thông tin nhà cung cấp</b></DialogTitle>
        <DialogContent>
          <div>Bạn có chắc muốn xoá thông tin nhà cung cấp {`${deletedRow.Name}`} không?</div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseDeleteModal}>Huỷ</Button>
          <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateModal}>
        <DialogTitle textAlign="center"><b>Tạo thông tin nhà cung cấp</b></DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.slice(1, ).map((column) => (
                  <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.id && updatedRow[column.id]}
                    onChange={(e) =>
                      setCreatedRow({ ...createdRow, [e.target.name]: e.target.value })
                    }
                  />
              ))}

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

export default SupplierTable;
