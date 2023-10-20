import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { IExportLab } from "../../../types/IInternalDevice";
import {
    acceptExportLab,
    addExportLab,
    deleteExportLab,
    getAll,
    unAcceptExportLab,
    updateExportLab,
} from "../../../services/internalDevice";

interface IState {
    data: IExportLab[];
    loading?: boolean;
    error?: string;
    successMessage?: string;
}

const initialState: IState = {
    data: [],
};

export const exportLabSlice = createSlice({
    name: "exportLabSlice",
    initialState,
    reducers: {
        sendRequest: (state) => {
            state.loading = true;
        },

        getAllSuccess: (_, { payload }: PayloadAction<IExportLab[]>) => {
            return { ...initialState, data: payload };
        },

        createSuccess: (_, { payload }: PayloadAction<IExportLab>) => {
            return {
                ...initialState,
                data: [payload, ..._.data],
                successMessage: "lưu thành công",
            };
        },
        updateSuccess: (_, { payload }: PayloadAction<IExportLab>) => {
            return {
                ...initialState,
                data: [
                    ..._.data.map((x) =>
                        x.ExportLabId === payload.ExportLabId ? payload : x
                    ),
                ],
                successMessage: "thay đổi thành công",
            };
        },

        reset: () => {
            return { ...initialState };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });

        builder.addCase(addExportLabAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });

        builder.addCase(acceptExportLabAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });

        builder.addCase(updateExportLabAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });

        builder.addCase(unAcceptExportLabAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });
        builder.addCase(deleteExportLabAction.rejected, (_, actions) => {
            return { ...initialState, error: actions.error.message };
        });
    },
});

export const {
    sendRequest,
    reset,
    getAllSuccess,
    createSuccess,
    updateSuccess,
} = exportLabSlice.actions;

export const getAllAction = createAsyncThunk(
    "exportLabSlice/getAllAction",
    async (_: undefined, { dispatch }) => {
        dispatch(sendRequest());
        dispatch(getAllSuccess(await getAll()));
    }
);

export const addExportLabAction = createAsyncThunk(
    "exportLabSlice/addExportLabAction",
    async (_: IExportLab, { dispatch }) => {
        dispatch(sendRequest());
        await addExportLab(_);
        dispatch(getAllSuccess(await getAll()));
    }
);

export const acceptExportLabAction = createAsyncThunk(
    "exportLabSlice/acceptExportLabAction",
    async (_: IExportLab, { dispatch }) => {
        dispatch(sendRequest());
        const data = await acceptExportLab(_.ExportLabId);
        console.log(data);
        dispatch(updateSuccess(_));
    }
);

export const unAcceptExportLabAction = createAsyncThunk(
    "exportLabSlice/unAcceptExportLabAction",
    async (_: { body: IExportLab; message: string }, { dispatch }) => {
        dispatch(sendRequest());
        await unAcceptExportLab(_.body.ExportLabId, _.message);
        dispatch(updateSuccess(_.body));
    }
);

export const updateExportLabAction = createAsyncThunk(
    "exportLabSlice/updateExportLabAction",
    async (_: IExportLab, { dispatch }) => {
        dispatch(sendRequest());
        await updateExportLab(_);
        dispatch(updateSuccess(_));
    }
);

export const deleteExportLabAction = createAsyncThunk(
    "exportLabSlice/deleteExportLabAction",
    async (id: string, { dispatch }) => {
        dispatch(sendRequest());
        await deleteExportLab(id);
        dispatch(getAllAction());
    }
);

export const exportLabSelect = (app: RootState) => app.exportLab;

export default exportLabSlice.reducer;
