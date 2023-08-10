import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store";
import { IExportLab } from "../../../types/IInternalDevice";
import { getAll } from "../../../services/internalDevice";

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

    reset: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllAction.rejected, (_, actions) => {
      return { ...initialState, error: actions.error.message };
    });
  },
});

export const { sendRequest, reset, getAllSuccess, createSuccess } =
  exportLabSlice.actions;

export const getAllAction = createAsyncThunk(
  "exportLabSlice/getAllAction",
  async (_: undefined, { dispatch }) => {
    dispatch(sendRequest());
    dispatch(getAllSuccess(await getAll()));
  }
);

export const exportLabSelect = (app: RootState) => app.exportLab;

export default exportLabSlice.reducer;
