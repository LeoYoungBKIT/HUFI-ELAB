import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import MaterialReactTable, {
    MRT_Cell,
    MRT_ColumnDef,
} from 'material-react-table';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Tooltip,
    IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { IChemicalsBelongingToLessonLabType, ILessonLabType } from '../../types/lessonLabType';
import Autocomplete from '@mui/material/Autocomplete';
import { IChemicalType } from '../../types/chemicalType';

const ChemicalPlanning: FC<{
    isOpen: boolean,
    currentLessonLab: ILessonLabType,
    defaultCurrentValue: IChemicalsBelongingToLessonLabType[],
    onClose: () => void,
    handleSubmit: (ChemicalPlanningData: any) => void,
}> = ({ isOpen, currentLessonLab, onClose, handleSubmit, defaultCurrentValue }) => {
    const chemicalData = useAppSelector((state: RootState) => state.chemical.listOfChemicals);
    const [tableData, setTableData] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    useEffect(() => {
        if (isOpen && currentLessonLab?.LessonId) {
            let temp = defaultCurrentValue.map(item => { return { ...item } });
            setTableData(temp);
        }

        return () => {
            if (!isOpen) {
                setTableData([]);
            }
        }
    }, [isOpen, currentLessonLab])

    const getCommonEditTextFieldProps = useCallback(
        (
            cell: MRT_Cell<ILessonLabType>,
        ): MRT_ColumnDef<ILessonLabType>['muiTableBodyCellEditTextFieldProps'] => {
            return {
                error: !!validationErrors[cell.id],
                helperText: validationErrors[cell.id],
            };
        },
        [validationErrors],
    );

    const handleSaveCell = (cell: MRT_Cell<any>, value: any) => {
        //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here
        let updatedData = [...tableData];
        if (tableData[cell.row.index].hasOwnProperty(cell.column.id)) {
            updatedData[cell.row.index][cell.column.id as keyof any] = value;
        } else {
            updatedData = tableData.map((item, idx) => {
                if (idx === Number(cell.row.index)) {
                    return {
                        ...item,
                        [cell.column.id]: value
                    }
                } else {
                    return item;
                }
            })
        }
        //send/receive api updates here
        setTableData([...updatedData]); //re-render with new data
    };

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () => [
            {
                accessorKey: 'ChemicalId',
                header: 'M?? h??a ch???t',
                enableEditing: false,
            },
            {
                accessorKey: 'ChemicalName',
                header: 'T??n ho?? ch???t',
                enableEditing: false,
            },
            {
                accessorKey: 'Specifications',
                header: 'CTHH',
                enableEditing: false,
            },
            {
                accessorKey: 'Amount',
                header: 'S??? l?????ng',
                enableEditing: true,
            },
            {
                accessorKey: 'Unit',
                header: '????n v???',
                enableEditing: true,
            },
            {
                accessorKey: 'Note',
                header: 'Ghi ch??',
                enableEditing: true,
            },
        ],
        [getCommonEditTextFieldProps],
    );

    const handleSelectAutocomplete = (e: any, val: IChemicalType[]) => {
        setTableData(val);
    }

    const handleDeletePlanning = (row: any) => {
        let updatedData = [...tableData];
        updatedData.splice(Number(row.id), 1);
        setTableData([...updatedData]);
    };

    return (
        <>
            <Dialog open={isOpen}
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "800px",  // Set your width here
                        },
                    },
                }}
            >
                <DialogTitle textAlign="center"><b>D??? tr?? ho?? ch???t cho b??i th?? nghi???m</b></DialogTitle>
                <DialogContent>
                    <form onSubmit={(e) => e.preventDefault()} style={{ "marginTop": "10px" }}>
                        <Stack
                            sx={{
                                width: '100%',
                                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                                gap: '1.5rem',
                            }}
                        >
                            <TextField
                                key={"LessonName"}
                                label={"T??n b??i th?? nghi???m"}
                                name={"LessonName"}
                                defaultValue={currentLessonLab.LessonName}
                                disabled
                            />
                            <Autocomplete
                                multiple
                                filterSelectedOptions
                                options={chemicalData}
                                value={tableData}
                                isOptionEqualToValue={(option, value) => option.ChemicalId === value.ChemicalId}
                                getOptionLabel={(option: IChemicalType) => option?.ChemicalName ? option.ChemicalId + ' - ' + option.ChemicalName.toString() : ''}
                                id="auto-complete"
                                autoComplete
                                includeInputInList
                                disableClearable
                                renderTags={(value: readonly IChemicalType[], getTagProps) =>
                                    value.map((option: IChemicalType, index: number) => (
                                        <></>
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="T??m ki???m ho?? ch???t..." variant="standard" />
                                )}
                                onChange={(e: any, val) => handleSelectAutocomplete(e, val)}
                            />

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
                                editingMode="cell"
                                enableTopToolbar={false}
                                enableEditing
                                enableColumnOrdering
                                enableRowNumbers
                                enablePinning
                                initialState={{
                                    density: 'compact',
                                    columnOrder: [
                                        'mrt-row-numbers',
                                        ...columns.map(x => x.accessorKey ? x.accessorKey.toString() : ''),
                                        'mrt-row-actions'
                                    ]
                                }}
                                muiTableBodyCellEditTextFieldProps={({ cell }) => ({
                                    //onBlur is more efficient, but could use onChange instead
                                    onBlur: (event) => {
                                        handleSaveCell(cell, event.target.value);
                                    },
                                })}
                                renderTopToolbarCustomActions={() => (
                                    <h3 style={{ "margin": "0px" }}>
                                        <b><KeyboardArrowRightIcon
                                            style={{ "margin": "0px", "fontSize": "30px", "paddingTop": "15px" }}
                                        ></KeyboardArrowRightIcon></b>
                                        <span>Th??ng tin ho?? ch???t</span>
                                    </h3>
                                )}
                                renderRowActions={({ row, table }) => (
                                    <Tooltip arrow placement="right" title="Xo??">
                                        <IconButton color="error" onClick={() => handleDeletePlanning(row)}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            />
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={onClose}>H???y</Button>
                    <Button color="primary" onClick={() => handleSubmit(tableData)} variant="contained">
                        L??u thay ?????i
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChemicalPlanning;
