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
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { setSnackbarMessage } from '../../pages/appSlice';

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
        header: 'T??n nh?? s???n xu???t',
        size: 100,
      },
      {
        accessorKey: 'Email',
        header: 'Email',
        size: 140,
      },
      {
        accessorKey: 'PhoneNumber',
        header: 'S??? ??i???n tho???i',
        size: 140,
      },
      {
        accessorKey: 'Address',
        header: '?????a ch???',
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
    const isUpdatedSuccess = await updateManufacturer(updatedRow);
    if (isUpdatedSuccess) {
      dispatch(setSnackbarMessage("C???p nh???t th??ng tin nh?? s???n xu???t th??nh c??ng"));
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
    dispatch(setSnackbarMessage("X??a th??ng tin nh?? s???n xu???t th??nh c??ng"));
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
    })
    if (createdManufacturer) {
      const newListOfManufacturers: IManufacturerType[] = await getManufacturers();
      if (newListOfManufacturers) {
        dispatch(setSnackbarMessage("T???o th??ng tin nh?? s???n xu???t m???i th??nh c??ng"));
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
            header: 'C??c h??nh ?????ng',
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
            ...columns.map(x => x.accessorKey || ''),
            'mrt-row-actions'
          ]
        }}
        renderRowActions={({ row, table }) => (
          <>
            <Tooltip arrow placement="left" title="S???a th??ng tin nh?? s???n xu???t">
              <IconButton onClick={() => handleOpenEditModal(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Xo?? th??ng tin nh?? s???n xu???t">
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
            <span>Danh m???c nh?? s???n xu???t</span>
          </h3>
        )}
        renderBottomToolbarCustomActions={() => (
          <Tooltip title="T???o nh?? s???n xu???t m???i" placement="right-start">
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
        <DialogTitle textAlign="center"><b>S???a th??ng tin nh?? s???n xu???t</b></DialogTitle>
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
                    setUpdatedRow({ ...updatedRow, [e.target.name]: e.target.value })
                  }
                />
              ))}

            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseEditModal}>H???y</Button>
          <Button color="primary" onClick={handleSubmitEditModal} variant="contained">
            L??u thay ?????i
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteModal}>
        <DialogTitle textAlign="center"><b>Xo?? th??ng tin nh?? s???n xu???t</b></DialogTitle>
        <DialogContent>
          <div>B???n c?? ch???c mu???n xo?? th??ng tin nh?? s???n xu???t {`${deletedRow.ManufacturerId}`} kh??ng?</div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseDeleteModal}>H???y</Button>
          <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
            X??c nh???n
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateModal}>
        <DialogTitle textAlign="center"><b>T???o th??ng tin nh?? s???n xu???t</b></DialogTitle>
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
                  defaultValue={column.accessorKey && createdRow[column.accessorKey]}
                  onChange={(e) =>
                    setCreatedRow({ ...createdRow, [e.target.name]: e.target.value })
                  }
                />
              ))}

            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseCreateModal}>H???y</Button>
          <Button color="primary" onClick={handleSubmitCreateModal} variant="contained">
            T???o
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default ManufacturersTable;
