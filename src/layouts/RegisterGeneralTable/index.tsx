import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MaterialReactTable, {
  MRT_Cell,
  MRT_ColumnDef,
} from 'material-react-table';
import {
  Autocomplete,
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
import { dummyRegisterGeneralData, IRegisterGeneralType } from '../../types/registerGeneralType';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  deleteRegisterGeneral,
  getRegisterGenerals,
  postRegisterGeneral,
  updateRegisterGeneral
} from '../../services/registerGeneralServices';
import { RootState } from '../../store';
import { setListOfRegisterGenerals } from './registerGeneralSlice';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { setSnackbarMessage } from '../../pages/appSlice';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { ColumnType } from './Utils';
import RegisterGeneralChemicalTable from './RegisterGeneralChemicalTable';
import RegisterGeneralDeviceTable from './RegisterGeneralDeviceTable';
import RegisterGeneralInstrumentTable from './RegisterGeneralInstrumentTable';
import RegisterGeneralToolTable from './RegisterGeneralToolTable';

const RegisterGeneralsTable: FC = () => {
  const registerGeneralsData = useAppSelector((state: RootState) => state.registerGeneral.listOfRegisterGenerals);
  const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
  const researcherData = useAppSelector((state: RootState) => state.researchTeam.listOfResearchers);
  const dispatch = useAppDispatch();

  const [isCreateModal, setIsCreateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [tableData, setTableData] = useState<IRegisterGeneralType[]>([]);
  const [employeeDataValue, setEmployeeDataValue] = useState<any>([]);
  const [researcherDataValue, setResearcherDataValue] = useState<any>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const [updatedRow, setUpdatedRow] = useState<any>(dummyRegisterGeneralData);
  const [deletedRow, setDeletedRow] = useState<any>(dummyRegisterGeneralData);
  const [createdRow, setCreatedRow] = useState<any>(dummyRegisterGeneralData);

  useEffect(() => {
    if (employeeData.length > 0) {
      const list = employeeData.map(x => ({
        label: `${x.EmployeeId} - ${x.Fullname}`,
        id: x.EmployeeId,
        name: x.Fullname
      }));
      setEmployeeDataValue(list);
    }
  }, [employeeData])

  useEffect(() => {
    if (researcherData.length > 0) {
      const list = researcherData.map(x => ({
        label: `${x.ResearcherId} - ${x.Fullname}`,
        id: x.ResearcherId,
        name: x.Fullname
      }));
      setResearcherDataValue(list);
    }
  }, [researcherData])

  useEffect(() => {
    if (registerGeneralsData.length > 0) {
      let formatedRegisterGeneral = registerGeneralsData.map((item: IRegisterGeneralType) => {
        return Object.assign({}, {
          ...item,
          formatedDateCreate: moment.unix(Number(item.DateCreate)).format('DD/MM/YYYY'),
          formatedStartDate: moment.unix(Number(item.StartDate)).format('DD/MM/YYYY'),
          formatedEndDate: moment.unix(Number(item.EndDate)).format('DD/MM/YYYY'),
        })
      })
      setTableData(formatedRegisterGeneral);
    }

  }, [registerGeneralsData])

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<IRegisterGeneralType>,
    ): MRT_ColumnDef<IRegisterGeneralType>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
      };
    },
    [validationErrors],
  );

  const columns = useMemo<MRT_ColumnDef<IRegisterGeneralType>[]>(
    () => [
      {
        accessorKey: 'RegisterGeneralId',
        header: 'M?? phi???u ??K',
      },
      {
        accessorKey: 'formatedDateCreate',
        header: 'Ng??y t???o',
      },
      {
        accessorKey: 'Instructor',
        header: 'Ng?????i h?????ng d???n',
      },
      {
        accessorKey: 'ThesisName',
        header: 'T??n lu???n v??n',
      },
      {
        accessorKey: 'ResearchSubject',
        header: 'Ch??? ????? nghi??n c???u',
      },
      {
        accessorKey: 'formatedStartDate',
        header: 'Ng??y B??',
      },
      {
        accessorKey: 'formatedEndDate',
        header: 'Ng??y KT',
      },
      // {
      //   accessorKey: 'ResearcherId',
      //   header: 'M?? nghi??n c???u vi??n',
      // },
      {
        accessorKey: 'ResearcherName',
        header: 'T??n nghi??n c???u vi??n',
      },
      // {
      //   accessorKey: 'EmployeeId',
      //   header: 'M?? nh??n vi??n',
      // },
      {
        accessorKey: 'EmployeeName',
        header: 'T??n nh??n vi??n',
      },
    ],
    [getCommonEditTextFieldProps],
  );

  const RegisterGeneralChemicalTableColumns = useRef<ColumnType[]>([
    {
      id: 'Purpose',
      header: 'M???c ????ch',
    },
    {
      id: 'ChemicalId',
      header: 'M?? ho?? ch???t',
    },
    {
      id: 'ChemicalName',
      header: 'T??n ho?? ch???t',
    },
    {
      id: 'Specifications',
      header: 'CTHH',
    },
    {
      id: 'Amount',
      header: 'S??? l?????ng',
      renderValue: (Amount, Unit) => `${Amount} (${Unit})`
    },
    {
      id: 'Note',
      header: 'Ghi ch??',
    }
  ]);

  const RegisterGeneralDeviceTableColumns = useRef<ColumnType[]>([
    {
      id: 'Purpose',
      header: 'M???c ????ch',
    },
    {
      id: 'DeviceId',
      header: 'M?? thi???t b???',
    },
    {
      id: 'DeviceName',
      header: 'T??n thi???t b???',
    },
    {
      id: 'Standard',
      header: 'Quy c??ch',
    },
    {
      id: 'Quantity',
      header: 'S??? l?????ng',
      renderValue: (Quantity, Unit) => `${Quantity} (${Unit})`
    },
    {
      id: 'Note',
      header: 'Ghi ch??',
    }
  ]);

  const handleOpenEditModal = (row: any) => {
    setUpdatedRow(row.original);
    setIsEditModal(true);
  }

  const onCloseEditModal = () => {
    setUpdatedRow(dummyRegisterGeneralData);
    setIsEditModal(false);
  }

  const handleSubmitEditModal = async () => {
    const isUpdatedSuccess = await updateRegisterGeneral(updatedRow);
    if (isUpdatedSuccess) {
      dispatch(setSnackbarMessage("C???p nh???t th??ng tin phi???u ????ng k?? chung th??nh c??ng"));
      let updatedIdx = registerGeneralsData.findIndex(x => x.RegisterGeneralId === updatedRow.RegisterGeneralId);
      let newListOfRegisterGenerals = [...registerGeneralsData.slice(0, updatedIdx), updatedRow, ...registerGeneralsData.slice(updatedIdx + 1,)]
      dispatch(setListOfRegisterGenerals(newListOfRegisterGenerals));
    }

    onCloseEditModal();
  }

  const handleOpenDeleteModal = (row: any) => {
    setDeletedRow(row.original);
    setIsDeleteModal(true);
  }

  const onCloseDeleteModal = () => {
    setDeletedRow(dummyRegisterGeneralData);
    setIsDeleteModal(false);
  }

  const handleSubmitDeleteModal = async () => {
    await deleteRegisterGeneral(deletedRow.RegisterGeneralId);
    dispatch(setSnackbarMessage("X??a th??ng tin phi???u ????ng k?? chung th??nh c??ng"));
    let deletedIdx = registerGeneralsData.findIndex(x => x.RegisterGeneralId === deletedRow.RegisterGeneralId);
    let newListOfRegisterGenerals = [...registerGeneralsData.slice(0, deletedIdx), ...registerGeneralsData.slice(deletedIdx + 1,)]
    dispatch(setListOfRegisterGenerals(newListOfRegisterGenerals));

    onCloseDeleteModal();
  }

  const handleOpenCreateModal = (row: any) => {
    setIsCreateModal(true);
  }

  const onCloseCreateModal = () => {
    setCreatedRow(dummyRegisterGeneralData);
    setIsCreateModal(false);
  }

  const handleSubmitCreateModal = async () => {
    // const createdRegisterGeneral = await postRegisterGeneral({
    //   "Name": createdRow.Name,
    //   "Email": createdRow.Email,
    //   "PhoneNumber": createdRow.PhoneNumber,
    //   "Address": createdRow.Address,
    // })
    // if (createdRegisterGeneral) {
    //   const newListOfRegisterGenerals: IRegisterGeneralType[] = await getRegisterGenerals();
    //   if (newListOfRegisterGenerals) {
    //     dispatch(setSnackbarMessage("T???o th??ng tin phi???u ????ng k?? chung m???i th??nh c??ng"));
    //     dispatch(setListOfRegisterGenerals(newListOfRegisterGenerals));
    //   }
    // }
    // onCloseCreateModal();
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
            'mrt-row-expand',
            'mrt-row-numbers',
            ...columns.map(x => x.accessorKey || ''),
            'mrt-row-actions'
          ]
        }}
        renderDetailPanel={({ row }) => (
          <>
            <RegisterGeneralChemicalTable
              chemicalData={row.original.ListChemical}
              columns={RegisterGeneralChemicalTableColumns.current}
            />
            <RegisterGeneralDeviceTable
              deviceData={row.original.ListDevice}
              columns={RegisterGeneralDeviceTableColumns.current}
            />
            <RegisterGeneralInstrumentTable
              deviceData={row.original.ListInstrument}
              columns={RegisterGeneralDeviceTableColumns.current}
            />
            <RegisterGeneralToolTable
              deviceData={row.original.ListTool}
              columns={RegisterGeneralDeviceTableColumns.current}
            />
          </>
        )}
        renderRowActions={({ row, table }) => (
          <>
            <Tooltip arrow placement="left" title="S???a th??ng tin phi???u ????ng k?? chung">
              <IconButton onClick={() => handleOpenEditModal(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Xo?? th??ng tin phi???u ????ng k?? chung">
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
            <span>Th??ng tin phi???u ????ng k?? chung</span>
          </h3>
        )}
        renderBottomToolbarCustomActions={() => (
          <Tooltip title="T???o phi???u ????ng k?? chung m???i" placement="right-start">
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
        <DialogTitle textAlign="center"><b>S???a th??ng tin phi???u ????ng k?? chung</b></DialogTitle>
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
                if (
                  column.accessorKey === "RegisterGeneralId" ||
                  column.accessorKey === 'formatedDateCreate'
                ) {
                  return <TextField
                    disabled
                    key={"Updated" + column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={updatedRow[column.accessorKey]}
                  />
                }
                else if (
                  column.accessorKey === 'formatedStartDate' ||
                  column.accessorKey === 'formatedEndDate'
                ) {
                  return <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      key={"Update" + column.accessorKey}
                      label={column.header}
                      value={new Date(updatedRow[`${column.accessorKey.slice(8,)}`] * 1000)}
                      onChange={(val: any) => {
                        setUpdatedRow({
                          ...updatedRow,
                          [`${column.accessorKey}`]: moment.unix(Date.parse(val) / 1000).format('DD/MM/YYYY'),
                          [`${column?.accessorKey?.slice(8,)}`]: Date.parse(val) / 1000
                        })
                      }
                      }
                      renderInput={(params: any) => <TextField key={"UpdateTextField" + column.accessorKey} {...params} />}
                      inputFormat='DD/MM/YYYY'
                    />
                  </LocalizationProvider>
                }
                else if (column.accessorKey === "EmployeeName") {
                  return (
                    <Autocomplete
                      key={column.accessorKey}
                      options={employeeDataValue}
                      noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                      value={employeeDataValue.find((x: any) => x.id === updatedRow.EmployeeId) || null}
                      getOptionLabel={option => option?.label}
                      renderInput={params => {
                        return (
                          <TextField
                            {...params}
                            label={column.header}
                            placeholder="Nh???p ????? t??m ki???m"
                          />
                        );
                      }}
                      onChange={(event, value) => {
                        setUpdatedRow({
                          ...updatedRow,
                          "EmployeeId": value?.id,
                          "EmployeeName": value?.name,
                        });
                      }}
                    />
                  );
                }
                else if (column.accessorKey === "ResearcherName") {
                  return (
                    <Autocomplete
                      key={column.accessorKey}
                      options={researcherDataValue}
                      noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                      value={researcherDataValue.find((x: any) => x.id === updatedRow.ResearcherId) || null}
                      getOptionLabel={option => option?.label}
                      renderInput={params => {
                        return (
                          <TextField
                            {...params}
                            label={column.header}
                            placeholder="Nh???p ????? t??m ki???m"
                          />
                        );
                      }}
                      onChange={(event, value) => {
                        setUpdatedRow({
                          ...updatedRow,
                          "ResearcherId": value?.id,
                          "ResearcherName": value?.ResearcherName,
                        });
                      }}
                    />
                  );
                }
                else {
                  return <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.accessorKey && updatedRow[column.accessorKey]}
                    onChange={(e) =>
                      setUpdatedRow({ ...updatedRow, [e.target.name]: e.target.value })
                    }
                  />
                }
              })}

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
        <DialogTitle textAlign="center"><b>Xo?? th??ng tin phi???u ????ng k?? chung</b></DialogTitle>
        <DialogContent>
          <div>B???n c?? ch???c mu???n xo?? th??ng tin phi???u ????ng k?? chung {`${deletedRow.RegisterGeneralId}`} kh??ng?</div>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={onCloseDeleteModal}>H???y</Button>
          <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
            X??c nh???n
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isCreateModal}>
        <DialogTitle textAlign="center"><b>T???o th??ng tin phi???u ????ng k?? chung</b></DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.slice(2,).map((column) => {
                if (
                  column.accessorKey === 'formatedStartDate' ||
                  column.accessorKey === 'formatedEndDate'
                ) {
                  return <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      key={"Create" + column.accessorKey}
                      label={column.header}
                      value={new Date(createdRow[`${column.accessorKey.slice(8,)}`] * 1000)}
                      onChange={(val: any) => {
                        setCreatedRow({
                          ...createdRow,
                          [`${column.accessorKey}`]: moment.unix(Date.parse(val) / 1000).format('DD/MM/YYYY'),
                          [`${column?.accessorKey?.slice(8,)}`]: Date.parse(val) / 1000
                        })
                      }
                      }
                      renderInput={(params: any) => <TextField key={"CreateTextField" + column.accessorKey} {...params} />}
                      inputFormat='DD/MM/YYYY'
                    />
                  </LocalizationProvider>
                }
                else if (column.accessorKey === "EmployeeName") {
                  return <Autocomplete
                    key={"CreateEmployeeName"}
                    options={employeeDataValue}
                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                    sx={{ "width": "450px" }}
                    value={employeeDataValue.find((x: any) => x.id === createdRow.EmployeeId) || null}
                    getOptionLabel={option => option?.label}
                    renderInput={params => {
                      return (
                        <TextField
                          {...params}
                          label={"Ng?????i l???p"}
                          placeholder="Nh???p ????? t??m ki???m"
                        />
                      );
                    }}
                    onChange={(event, value) => {
                      setCreatedRow({
                        ...createdRow,
                        "EmployeeId": value?.id,
                        "EmployeeName": value?.name,
                      });
                    }}
                  />
                }
                else if (column.accessorKey === "ResearcherName") {
                  return <Autocomplete
                    key={"CreateResearcherName"}
                    options={researcherDataValue}
                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                    sx={{ "width": "450px" }}
                    value={researcherDataValue.find((x: any) => x.id === createdRow.ResearcherId) || null}
                    getOptionLabel={option => option?.label}
                    renderInput={params => {
                      return (
                        <TextField
                          {...params}
                          label={column.header}
                          placeholder="Nh???p ????? t??m ki???m"
                        />
                      );
                    }}
                    onChange={(event, value) => {
                      setCreatedRow({
                        ...createdRow,
                        "ResearcherId": value?.id,
                        "ResearcherName": value?.ResearcherName,
                      });
                    }}
                  />
                }
                else {
                  return <TextField
                    key={column.accessorKey}
                    label={column.header}
                    name={column.accessorKey}
                    defaultValue={column.accessorKey && createdRow[column.accessorKey]}
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
          <Button onClick={onCloseCreateModal}>H???y</Button>
          <Button color="primary" onClick={handleSubmitCreateModal} variant="contained">
            T???o
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(RegisterGeneralsTable);
