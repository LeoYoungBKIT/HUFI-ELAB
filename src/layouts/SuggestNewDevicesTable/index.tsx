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
import {
    dummyListDeviceInSuggestNewDeviceData,
    dummySuggestNewDeviceData,
    IListDeviceInSuggestNewDeviceType,
    ISuggestNewDeviceType
} from '../../types/suggestNewDeviceType';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    deleteSuggestNewDevice,
    getSuggestNewDevices,
    postSuggestNewDevice,
    updateSuggestNewDevice
} from '../../services/suggestNewDeviceServices';
import { RootState } from '../../store';
import {
    setCurrentSuggestNewDevice,
    setCurrentSuggestNewDeviceForm,
    setListOfSuggestNewDevices
} from './suggestNewDeviceSlice';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { setSnackbarMessage } from '../../pages/appSlice';
import DetailsSuggestNewDevices from './Details/DetailsSuggestNewDevices';
import { ColumnType } from './Utils';
import DetailNewDevices from './Details/DetailNewDevices';
import CreateDetailNewDevicesDialog from './Dialog/CreateDetailNewDevicesDialog';
import EditDetailNewDevicesDialog from './Dialog/EditDetailNewDevicesDialog';
import DeleteDetailNewDevicesDialog from './Dialog/DeleteDetailNewDevicesDialog';

const SuggestNewDevicesTable: FC = () => {
    const suggestNewDevicesData = useAppSelector((state: RootState) => state.suggestNewDevice.listOfSuggestNewDevices);
    const employeeData = useAppSelector((state: RootState) => state.employee.listOfEmployees);
    const departmentData = useAppSelector((state: RootState) => state.department.listOfDepartments);
    const { currentSuggestNewDeviceForm, currentSuggestNewDevice } = useAppSelector((state: RootState) => state.suggestNewDevice);

    const dispatch = useAppDispatch();

    const [isCreateModal, setIsCreateModal] = useState(false);
    const [isEditModal, setIsEditModal] = useState<boolean>(false);
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
    const [employeeDataValue, setEmployeeDataValue] = useState<any>([]);
    const [departmentDataValue, setDepartmentDataValue] = useState<any>([]);
    const [tableData, setTableData] = useState<ISuggestNewDeviceType[]>([]);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const [isCreateDetailNewDevicesModal, setIsCreateDetailNewDevicesModal] = useState<boolean>(false);
    const [isEditDetailNewDevicesModal, setIsEditDetailNewDevicesModal] = useState<boolean>(false);
    const [isDeleteDetailNewDevicesModal, setIsDeleteDetailNewDevicesModal] = useState<boolean>(false);
    const [previousModal, setPreviousModal] = useState<string>('create');

    useEffect(() => {
        setTableData(suggestNewDevicesData);
    }, [suggestNewDevicesData])

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
        if (departmentData.length > 0) {
            const list = departmentData.map(x => ({
                label: `${x.DepartmentId} - ${x.DepartmentName}`,
                id: x.DepartmentId,
                name: x.DepartmentName
            }));
            setDepartmentDataValue(list);
        }
    }, [departmentData])

    const getCommonEditTextFieldProps = useCallback(
        (
            cell: MRT_Cell<ISuggestNewDeviceType>,
        ): MRT_ColumnDef<ISuggestNewDeviceType>['muiTableBodyCellEditTextFieldProps'] => {
            return {
                error: !!validationErrors[cell.id],
                helperText: validationErrors[cell.id],
            };
        },
        [validationErrors],
    );

    const columns = useMemo<MRT_ColumnDef<ISuggestNewDeviceType>[]>(
        () => [
            {
                accessorKey: 'SuggestId',
                header: 'M?? phi???u ????? ngh???',
            },
            {
                accessorKey: 'EmployeeName',
                header: 'T??n nh??n vi??n',
            },
            {
                accessorKey: 'DepartmentName',
                header: 'Ph??ng ban/Khoa',
            },
            {
                accessorKey: 'Stage',
                header: 'Giai ??o???n',
            },
            {
                accessorKey: 'StartYear',
                header: 'N??m B??',
            },
            {
                accessorKey: 'EndYear',
                header: 'N??m KT',
            },
        ],
        [getCommonEditTextFieldProps],
    );

    const detailsSuggestNewDevicesColumns = useRef<ColumnType[]>([
        {
            id: 'SuggestDetailId',
            header: 'M?? ????? ngh??? chi ti???t',
        },
        {
            id: 'DeviceId',
            header: 'M?? TB',
        },
        {
            id: 'DeviceName',
            header: 'T??n TB',
        },
        {
            id: 'QuantityAvailable',
            header: 'SL c?? s???n',
            renderValue: (Quantity, Unit) => `${Quantity} (${Unit})`
        },
        {
            id: 'Quantitysuggest',
            header: 'SL ????? ngh???',
            renderValue: (Quantity, Unit) => `${Quantity} (${Unit})`
        },
        {
            id: 'Price',
            header: 'Gi??',
        },
        {
            id: 'NewStandard',
            header: 'Qui c??ch',
        },
        {
            id: 'ExplainUsage',
            header: 'M???c ????ch SD',
        },
        {
            id: 'Note',
            header: 'Ghi ch??',
        },
    ]);

    const handleOpenEditModal = (row: any) => {
        dispatch(setCurrentSuggestNewDeviceForm((row.original)));
        setIsEditModal(true);
    }

    const onCloseEditModal = () => {
        dispatch(setCurrentSuggestNewDeviceForm((dummySuggestNewDeviceData)));
        setIsEditModal(false);
    }

    const handleSubmitEditModal = async () => {
        const isUpdatedSuccess = await updateSuggestNewDevice(currentSuggestNewDeviceForm);
        if (isUpdatedSuccess) {
            dispatch(setSnackbarMessage("C???p nh???t th??ng tin phi???u ????? ngh??? th??nh c??ng"));
            let updatedIdx = suggestNewDevicesData.findIndex(x => x.SuggestId === currentSuggestNewDeviceForm.SuggestId);
            let newListOfSuggestNewDevices = [...suggestNewDevicesData.slice(0, updatedIdx), currentSuggestNewDeviceForm, ...suggestNewDevicesData.slice(updatedIdx + 1,)]
            dispatch(setListOfSuggestNewDevices(newListOfSuggestNewDevices));
        }

        onCloseEditModal();
    }

    const handleOpenDeleteModal = (row: any) => {
        dispatch(setCurrentSuggestNewDeviceForm((row.original)));
        setIsDeleteModal(true);
    }

    const onCloseDeleteModal = () => {
        dispatch(setCurrentSuggestNewDeviceForm((dummySuggestNewDeviceData)));
        setIsDeleteModal(false);
    }

    const handleSubmitDeleteModal = async () => {
        if (currentSuggestNewDeviceForm.SuggestId) {
            await deleteSuggestNewDevice(currentSuggestNewDeviceForm.SuggestId);
            dispatch(setSnackbarMessage("X??a th??ng tin phi???u ????? ngh??? th??nh c??ng"));
            let deletedIdx = suggestNewDevicesData.findIndex((x: ISuggestNewDeviceType) => x.SuggestId === currentSuggestNewDeviceForm.SuggestId);
            let newListOfSuggestNewDevices = [
                ...suggestNewDevicesData.slice(0, deletedIdx),
                ...suggestNewDevicesData.slice(deletedIdx + 1,)
            ]
            dispatch(setListOfSuggestNewDevices(newListOfSuggestNewDevices));
        }

        onCloseDeleteModal();
    }

    const handleOpenCreateModal = (row: any) => {
        setIsCreateModal(true);
    }

    const onCloseCreateModal = () => {
        dispatch(setCurrentSuggestNewDeviceForm((dummySuggestNewDeviceData)));
        setIsCreateModal(false);
    }

    const handleSubmitCreateModal = async () => {
        const createdSuggestNewDevice = await postSuggestNewDevice({
            "EmployeeId": currentSuggestNewDeviceForm.EmployeeId,
            "EmployeeName": currentSuggestNewDeviceForm.EmployeeName,
            "DepartmentId": currentSuggestNewDeviceForm.DepartmentId,
            "DepartmentName": currentSuggestNewDeviceForm.DepartmentName,
            "Stage": currentSuggestNewDeviceForm.Stage,
            "StartYear": currentSuggestNewDeviceForm.StartYear,
            "EndYear": currentSuggestNewDeviceForm.EndYear,
            "ListDevice": currentSuggestNewDeviceForm.ListDevice
        })
        if (createdSuggestNewDevice) {
            const newListOfSuggestNewDevices: ISuggestNewDeviceType[] = await getSuggestNewDevices("2");
            if (newListOfSuggestNewDevices) {
                dispatch(setSnackbarMessage("T???o th??ng tin phi???u ????? ngh??? m???i th??nh c??ng"));
                dispatch(setListOfSuggestNewDevices(newListOfSuggestNewDevices));
            }
        }
        onCloseCreateModal();
    }

    const handleOpenCreateDetailNewDevicesModal = () => {
        setIsCreateDetailNewDevicesModal(true);
        if (isEditModal) {
            setIsEditModal(false);
            setPreviousModal('edit');
        } else {
            setIsCreateModal(false);
            setPreviousModal('create');
        }
    }

    const onCloseCreateDetailNewDevicesModal = () => {
        setIsCreateDetailNewDevicesModal(false);
        dispatch(setCurrentSuggestNewDevice(dummyListDeviceInSuggestNewDeviceData));
        if (previousModal === 'create') {
            setIsCreateModal(true);
        } else {
            setIsEditModal(true);
        }
    }

    const handleSubmitCreateDetailNewDevicesModal = () => {
        dispatch(setCurrentSuggestNewDeviceForm({
            ...currentSuggestNewDeviceForm,
            "ListDevice": [...currentSuggestNewDeviceForm.ListDevice, currentSuggestNewDevice]
        }))

        onCloseCreateDetailNewDevicesModal();
    }

    const handleOpenEditDetailNewDevicesModal = (row: any) => {
        dispatch(setCurrentSuggestNewDevice(row.original));
        setIsEditDetailNewDevicesModal(true);
        if (isEditModal) {
            setIsEditModal(false);
            setPreviousModal('edit');
        } else {
            setIsCreateModal(false);
            setPreviousModal('create');
        }
    }

    const onCloseEditDetailNewDevicesModal = () => {
        setIsEditDetailNewDevicesModal(false);
        dispatch(setCurrentSuggestNewDevice(dummyListDeviceInSuggestNewDeviceData));
        if (previousModal === 'create') {
            setIsCreateModal(true);
        } else {
            setIsEditModal(true);
        }
    }

    const handleSubmitEditDetailNewDevicesModal = () => {
        let updatedIdx = currentSuggestNewDeviceForm.ListDevice.findIndex((item: IListDeviceInSuggestNewDeviceType) => item.SuggestDetailId === currentSuggestNewDevice.SuggestDetailId);

        dispatch(setCurrentSuggestNewDeviceForm({
            ...currentSuggestNewDeviceForm,
            ListDevice: [
                ...currentSuggestNewDeviceForm.ListDevice.slice(0, updatedIdx),
                currentSuggestNewDevice,
                ...currentSuggestNewDeviceForm.ListDevice.slice(updatedIdx + 1,)
            ]
        }));

        onCloseEditDetailNewDevicesModal();
    }

    const handleOpenDeleteDetailNewDevicesModal = (row: any) => {
        dispatch(setCurrentSuggestNewDevice(row.original));
        setIsDeleteDetailNewDevicesModal(true);
        if (isEditModal) {
            setIsEditModal(false);
            setPreviousModal('edit');
        } else {
            setIsCreateModal(false);
            setPreviousModal('create');
        }
    }

    const onCloseDeleteDetailNewDevicesModal = () => {
        setIsDeleteDetailNewDevicesModal(false);
        dispatch(setCurrentSuggestNewDevice(dummyListDeviceInSuggestNewDeviceData));
        if (previousModal === 'create') {
            setIsCreateModal(true);
        } else {
            setIsEditModal(true);
        }
    }

    const handleSubmitDeleteDetailNewDevicesModal = () => {
        let deletedIdx = currentSuggestNewDeviceForm.ListDevice.findIndex((item: IListDeviceInSuggestNewDeviceType) => item.SuggestDetailId === currentSuggestNewDevice.SuggestDetailId);
        if (deletedIdx) {
            dispatch(setCurrentSuggestNewDeviceForm({
                ...currentSuggestNewDeviceForm,
                "ListDevice": [
                    ...currentSuggestNewDeviceForm.ListDevice.slice(0, deletedIdx),
                    ...currentSuggestNewDeviceForm.ListDevice.slice(deletedIdx + 1,)
                ]
            }))
        }

        onCloseDeleteDetailNewDevicesModal();
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
                renderRowActions={({ row, table }) => (
                    <>
                        <Tooltip arrow placement="left" title="S???a th??ng tin phi???u ????? ngh???">
                            <IconButton onClick={() => handleOpenEditModal(row)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Xo?? th??ng tin phi???u ????? ngh???">
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
                        <span>Th??ng tin phi???u ????? ngh???</span>
                    </h3>
                )}
                renderBottomToolbarCustomActions={() => (
                    <Tooltip title="T???o phi???u ????? ngh??? m???i" placement="right-start">
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
                renderDetailPanel={({ row }) => (
                    <DetailsSuggestNewDevices
                        deviceData={row.original.ListDevice}
                        columns={detailsSuggestNewDevicesColumns.current}
                    />
                )}
            />

            <Dialog
                open={isEditModal}
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "1200px",  // Set your width here
                        },
                    },
                }}
            >
                <DialogTitle textAlign="center"><b>S???a th??ng tin phi???u ????? ngh???</b></DialogTitle>
                <DialogContent>
                    <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
                        <Stack
                            sx={{
                                width: '100%',
                                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                                gap: '1.5rem',
                            }}
                        >
                            <div className="createGroup1" style={{ "display": "flex" }}>
                                <Autocomplete
                                    key={"EmployeeName"}
                                    options={employeeDataValue}
                                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                                    sx={{ "width": "550px", "margin": "0px 10px" }}
                                    value={employeeDataValue.find((x: any) => x.id === currentSuggestNewDeviceForm.EmployeeId) || null}
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
                                        dispatch(setCurrentSuggestNewDeviceForm({
                                            ...currentSuggestNewDeviceForm,
                                            "EmployeeId": value?.id,
                                            "EmployeeName": value?.name,
                                        }));
                                    }}
                                />
                                <Autocomplete
                                    key={"DepartmentName"}
                                    options={departmentDataValue}
                                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                                    sx={{ "width": "550px" }}
                                    value={departmentDataValue.find((x: any) => x.id === currentSuggestNewDeviceForm.DepartmentId) || null}
                                    getOptionLabel={option => option?.label}
                                    renderInput={params => {
                                        return (
                                            <TextField
                                                {...params}
                                                label={"Khoa/Ph??ng ban"}
                                                placeholder="Nh???p ????? t??m ki???m"
                                            />
                                        );
                                    }}
                                    onChange={(event, value) => {
                                        dispatch(setCurrentSuggestNewDeviceForm({
                                            ...currentSuggestNewDeviceForm,
                                            "DepartmentId": value?.id,
                                            "EmployeeName": value?.name,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="createGroup2" style={{ "display": "flex" }}>
                                {columns.slice(3,).map(column => {
                                    return <TextField
                                        key={"create" + column.accessorKey}
                                        sx={{ "width": "350px", "margin": "0px 13px" }}
                                        label={column.header}
                                        name={column.accessorKey}
                                        defaultValue={column.accessorKey && currentSuggestNewDeviceForm[column.accessorKey]}
                                        onChange={(e) => {
                                            dispatch(setCurrentSuggestNewDeviceForm({
                                                ...currentSuggestNewDeviceForm,
                                                [e.target.name]: e.target.value
                                            }))
                                        }}
                                    />
                                })}
                            </div>
                        </Stack>
                    </form>

                    <DetailNewDevices
                        handleOpenCreateModal={handleOpenCreateDetailNewDevicesModal}
                        handleOpenEditModal={handleOpenEditDetailNewDevicesModal}
                        handleOpenDeleteModal={handleOpenDeleteDetailNewDevicesModal}
                    />

                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={onCloseEditModal}>H???y</Button>
                    <Button color="primary" onClick={handleSubmitEditModal} variant="contained">
                        L??u thay ?????i
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDeleteModal}>
                <DialogTitle textAlign="center"><b>Xo?? th??ng tin phi???u ????? ngh???</b></DialogTitle>
                <DialogContent>
                    <div>B???n c?? ch???c mu???n xo?? th??ng tin phi???u ????? ngh??? {`${currentSuggestNewDeviceForm.SuggestId}`} kh??ng?</div>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={onCloseDeleteModal}>H???y</Button>
                    <Button color="primary" onClick={handleSubmitDeleteModal} variant="contained">
                        X??c nh???n
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isCreateModal}
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "1200px",  // Set your width here
                        },
                    },
                }}
            >
                <DialogTitle textAlign="center"><b>T???o th??ng tin phi???u ????? ngh???</b></DialogTitle>
                <DialogContent>
                    <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
                        <Stack
                            sx={{
                                width: '100%',
                                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                                gap: '1.5rem',
                            }}
                        >
                            <div className="createGroup1" style={{ "display": "flex" }}>
                                <Autocomplete
                                    key={"EmployeeName"}
                                    options={employeeDataValue}
                                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                                    sx={{ "width": "550px", "margin": "0px 10px" }}
                                    value={employeeDataValue.find((x: any) => x.id === currentSuggestNewDeviceForm.EmployeeId) || null}
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
                                        dispatch(setCurrentSuggestNewDeviceForm({
                                            ...currentSuggestNewDeviceForm,
                                            "EmployeeId": value?.id,
                                            "EmployeeName": value?.name,
                                        }));
                                    }}
                                />

                                <Autocomplete
                                    key={"DepartmentName"}
                                    options={departmentDataValue}
                                    noOptionsText="Kh??ng c?? k???t qu??? tr??ng kh???p"
                                    sx={{ "width": "550px" }}
                                    value={departmentDataValue.find((x: any) => x.id === currentSuggestNewDeviceForm.DepartmentId) || null}
                                    getOptionLabel={option => option?.label}
                                    renderInput={params => {
                                        return (
                                            <TextField
                                                {...params}
                                                label={"Khoa/Ph??ng ban"}
                                                placeholder="Nh???p ????? t??m ki???m"
                                            />
                                        );
                                    }}
                                    onChange={(event, value) => {
                                        dispatch(setCurrentSuggestNewDeviceForm({
                                            ...currentSuggestNewDeviceForm,
                                            "DepartmentId": value?.id,
                                            "EmployeeName": value?.name,
                                        }));
                                    }}
                                />
                            </div>

                            <div className="createGroup2" style={{ "display": "flex" }}>
                                {columns.slice(3,).map(column => {
                                    return <TextField
                                        key={"create" + column.accessorKey}
                                        sx={{ "width": "350px", "margin": "0px 13px" }}
                                        label={column.header}
                                        name={column.accessorKey}
                                        defaultValue={column.accessorKey && currentSuggestNewDeviceForm[column.accessorKey]}
                                        onChange={(e) => {
                                            dispatch(setCurrentSuggestNewDeviceForm({
                                                ...currentSuggestNewDeviceForm,
                                                [e.target.name]: e.target.value
                                            }))
                                        }}
                                    />
                                })}
                            </div>
                        </Stack>
                    </form>

                    <DetailNewDevices
                        handleOpenCreateModal={handleOpenCreateDetailNewDevicesModal}
                        handleOpenEditModal={handleOpenEditDetailNewDevicesModal}
                        handleOpenDeleteModal={handleOpenDeleteDetailNewDevicesModal}
                    />

                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={onCloseCreateModal}>H???y</Button>
                    <Button color="primary" onClick={handleSubmitCreateModal} variant="contained">
                        T???o
                    </Button>
                </DialogActions>
            </Dialog>

            <CreateDetailNewDevicesDialog
                isOpen={isCreateDetailNewDevicesModal}
                onClose={onCloseCreateDetailNewDevicesModal}
                handleSubmit={handleSubmitCreateDetailNewDevicesModal}
                columns={detailsSuggestNewDevicesColumns.current}
            />

            <EditDetailNewDevicesDialog
                isOpen={isEditDetailNewDevicesModal}
                onClose={onCloseEditDetailNewDevicesModal}
                handleSubmit={handleSubmitEditDetailNewDevicesModal}
                columns={detailsSuggestNewDevicesColumns.current}
            />

            <DeleteDetailNewDevicesDialog
                isOpen={isDeleteDetailNewDevicesModal}
                onClose={onCloseDeleteDetailNewDevicesModal}
                handleSubmit={handleSubmitDeleteDetailNewDevicesModal}
            />
        </>
    );
};

export default SuggestNewDevicesTable;
