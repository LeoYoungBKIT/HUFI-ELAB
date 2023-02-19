import React, { FC } from 'react';
import { MRT_ColumnDef } from 'material-react-table';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextareaAutosize,
    TextField,
} from '@mui/material';
import AddNewMemberTable from '../AddNewMemberTable';
import { IResearcherType, IResearchTeamType } from '../../../types/researchTeamType';
import { setCurrentResearchTeam } from '../researchTeamSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { RootState } from '../../../store';

const EditResearchTeamModal: FC<{
    isOpen: boolean;
    columns: MRT_ColumnDef<IResearchTeamType>[];
    onClose: any;
    handleSubmit: any;
    handleOpenDeleteMemberTeamModal: any;
    handleOpenEditMemberTeamModal: any;
    handleOpenCreateMemberTeamModal: any;
    listMemberColumns: MRT_ColumnDef<IResearcherType>[];
}> = ({
    isOpen,
    columns,
    onClose,
    handleSubmit,
    handleOpenDeleteMemberTeamModal,
    handleOpenEditMemberTeamModal,
    handleOpenCreateMemberTeamModal,
    listMemberColumns
}) => {
        const { currentResearchTeam } = useAppSelector((state: RootState) => state.researchTeam);
        const dispatch = useAppDispatch();

        return (
            <Dialog
                open={isOpen}
                sx={{
                    "& .MuiDialog-container": {
                        "& .MuiPaper-root": {
                            width: "100%",
                            maxWidth: "800px",  // Set your width here
                        },
                    },
                }}
            >
                <DialogTitle textAlign="center"><b>Sửa thông tin nhóm nghiên cứu</b></DialogTitle>
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
                                if (column.accessorKey === "Note") {
                                    return <TextareaAutosize
                                        key={"EditNote"}
                                        aria-label="minimum height"
                                        minRows={3}
                                        placeholder="Nhập ghi chú..."
                                        defaultValue={currentResearchTeam["Note"]}
                                        onChange={(e) =>
                                            dispatch(setCurrentResearchTeam({ ...currentResearchTeam, "Note": e.target.value }))
                                        }
                                    />
                                }
                                else if (column.accessorKey === 'TeamId') {
                                    return <TextField
                                        key={column.accessorKey}
                                        label={column.header}
                                        name={column.accessorKey}
                                        defaultValue={column.accessorKey && currentResearchTeam[column.accessorKey]}
                                        disabled
                                    />
                                }
                                else {
                                    return <TextField
                                        key={column.accessorKey}
                                        label={column.header}
                                        name={column.accessorKey}
                                        defaultValue={column.accessorKey && currentResearchTeam[column.accessorKey]}
                                        onChange={(e) =>
                                            dispatch(setCurrentResearchTeam({ ...currentResearchTeam, [e.target.name]: e.target.value }))
                                        }
                                    />
                                }
                            })}
                            <AddNewMemberTable
                                handleOpenDeleteMemberTeamModal={handleOpenDeleteMemberTeamModal}
                                handleOpenEditMemberTeamModal={handleOpenEditMemberTeamModal}
                                handleOpenCreateMemberTeamModal={handleOpenCreateMemberTeamModal}
                                listMemberColumns={listMemberColumns}
                            />
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button color="primary" onClick={handleSubmit} variant="contained">
                        Lưu thay đổi
                    </Button>
                </DialogActions>
            </Dialog >
        )
    }

export default React.memo(EditResearchTeamModal);
