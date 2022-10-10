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
import { dummyManufacturerData, IManufacturerType } from '../../types/manufacturerType';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { deleteManufacturer, getManufacturers, postManufacturer, updateManufacturer } from '../../services/manufacturerServices';
import { RootState } from '../../store';
import { setListOfManufacturers } from './manufacturerSlice';
import AddIcon from '@mui/icons-material/Add';

const ManufacturersTable: FC = () => {
  const manufacturersData = useAppSelector((state: RootState) => state.manufacturer.listOfManufacturers);
  const dispatch = useAppDispatch();

  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [tableData, setTableData] = useState<IManufacturerType[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const [updatedRow, setUpdatedRow] = useState<any>(dummyManufacturerData);
  const [deletedRow, setDeletedRow] = useState<any>(dummyManufacturerData);
  const [createdRow, setCreatedRow] = useState<any>(dummyManufacturerData);

  const getTableData = async () => {
    const listOfManufacturers: IManufacturerType[] = await getManufacturers();
    if (listOfManufacturers) {
      dispatch(setListOfManufacturers(listOfManufacturers));
    }
  }

  useEffect(() => {
    getTableData();
  }, [])

  useEffect(() => {
    setTableData(manufacturersData);
  }, [manufacturersData])

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<IManufacturerType>,
    ): MRT_ColumnDef<IManufacturerType>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
      };
    },
    [validationErrors],
  );

  const columns = useMemo<MRT_ColumnDef<IManufacturerType>[]>(
    () => [
      {
        accessorKey: 'Name',
        header: 'Tên nhà sản xuất',
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
    ],
    [getCommonEditTextFieldProps],
  );

  const handleOpenEditModal = (row: any) => {
    setUpdatedRow(row.original);
    setIsEditModal(true);
  }

  const onCloseEditModal = () => {
    setUpdatedRow(dummyManufacturerData);
    setIsEditModal(false);
  }

  const handleSubmitEditModal = async () => {
    const isUpdatedSuccess = await updateManufacturer(updatedRow.ManufacturerId, updatedRow);
    if (isUpdatedSuccess) {
      let updatedIdx = manufacturersData.findIndex(x => x.ManufacturerId === updatedRow.ManufacturerId);
      let newListOfManufacturers = [...manufacturersData.slice(0, updatedIdx), updatedRow, ...manufacturersData.slice(updatedIdx + 1,)]
      dispatch(setListOfManufacturers(newListOfManufacturers));
    }

    onCloseEditModal();
  }

  const handleOpenDeleteModal = (row: any) => {
    setDeletedRow(row.original);
    setIsDeleteModal(true);
  }

  const onCloseDeleteModal = () => {
    setDeletedRow(dummyManufacturerData);
    setIsDeleteModal(false);
  }

  const handleSubmitDeleteModal = async () => {
    await deleteManufacturer(deletedRow.ManufacturerId);

    let deletedIdx = manufacturersData.findIndex(x => x.ManufacturerId === deletedRow.ManufacturerId);
    let newListOfManufacturers = [...manufacturersData.slice(0, deletedIdx), ...manufacturersData.slice(deletedIdx + 1,)]
    dispatch(setListOfManufacturers(newListOfManufacturers));

    onCloseDeleteModal();
  }

  const handleOpenCreateModal = (row: any) => {
    setIsCreateModal(true);
  }

  const onCloseCreateModal = () => {
    setCreatedRow(dummyManufacturerData);
    setIsCreateModal(false);
  }

  const handleSubmitCreateModal = async () => {
    const createdManufacturer = await postManufacturer({
      "Name": createdRow.Name,
      "Email": createdRow.Email,
      "PhoneNumber": createdRow.PhoneNumber,
      "Address": createdRow.Address,
      "Status": createdRow.Status
    })
    if(createdManufacturer){
      const newListOfManufacturers: IManufacturerType[] = await getManufacturers();
      if(newListOfManufacturers){
        dispatch(setListOfManufacturers(newListOfManufacturers));
      }
    }
    onCloseCreateModal();
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
        enableRowNumbers
        enablePinning
        initialState={{
          density: 'compact',
        }}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Sửa thông tin nhà sản xuất">
              <IconButton onClick={() => handleOpenEditModal(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Xoá thông tin nhà sản xuất">
              <IconButton color="error" onClick={() => handleOpenDeleteModal(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderBottomToolbarCustomActions={() => (
          <Tooltip title="Tạo nhà sản xuất mới" placement="right-start">
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
        <DialogTitle textAlign="center"><b>Sửa thông tin nhà sản xuất</b></DialogTitle>
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
                column.id === "ManufacturerId" ?
                  <TextField
                    disabled
                    key="ManufacturerId"
                    label="ManufacturerId"
                    name="ManufacturerId"
                    defaultValue={updatedRow["ManufacturerId"]}
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
        <DialogTitle textAlign="center"><b>Xoá thông tin nhà sản xuất</b></DialogTitle>
        <DialogContent>
          <div>Bạn có chắc muốn xoá thông tin nhà sản xuất {`${deletedRow.ManufacturerId}`} không?</div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseDeleteModal}>Huỷ</Button>
          <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateModal}>
        <DialogTitle textAlign="center"><b>Tạo thông tin nhà sản xuất</b></DialogTitle>
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

export default ManufacturersTable;
