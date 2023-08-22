import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

import { IPurchaseOrderInstrument } from "../../types/IPurchaseOrderInstruments";
import {
  accept,
  create,
  getAll,
  remove,
  unAccept,
  update,
} from "../../services/purchaseOrderInstrument";

interface IState {
  data: IPurchaseOrderInstrument[];
  loading?: boolean;
  error?: string;
  successMessage?: string;
}

const initialState: IState = {
  data: [],
};

export const purchaseOrderInstrumentSlice = createSlice({
  name: "purchaseOrderDeviceSlice",
  initialState,
  reducers: {
    sendRequest: (state) => {
      state.loading = true;
    },

    getAllSuccess: (
      _,
      { payload }: PayloadAction<IPurchaseOrderInstrument[]>
    ) => {
      return { ...initialState, data: payload };
    },

    createSuccess: (
      _,
      { payload }: PayloadAction<IPurchaseOrderInstrument>
    ) => {
      return {
        ...initialState,
        data: [payload, ..._.data],
        successMessage: "lưu thành công",
      };
    },

    updateSuccess: (
      _,
      { payload }: PayloadAction<IPurchaseOrderInstrument>
    ) => {
      return {
        ...initialState,
        data: [
          ..._.data.map((x) => (x.OrderId === payload.OrderId ? payload : x)),
        ],
        successMessage: "thay đổi thành công",
      };
    },

    deleteSuccess: (_, { payload }: PayloadAction<string>) => {
      return {
        ...initialState,
        data: [..._.data.filter((x) => x.OrderId !== payload)],
        successMessage: "xoá thành công",
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
    builder.addCase(createAction.rejected, (_, actions) => {
      return { ...initialState, error: actions.error.message };
    });
    builder.addCase(acceptAction.rejected, (_, actions) => {
      return { ...initialState, error: actions.error.message };
    });
    builder.addCase(unAcceptAction.rejected, (_, actions) => {
      return { ...initialState, error: actions.error.message };
    });
    builder.addCase(updateAction.rejected, (_, actions) => {
      return { ...initialState, error: actions.error.message };
    });
    builder.addCase(removeAction.rejected, (_, actions) => {
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
  deleteSuccess,
} = purchaseOrderInstrumentSlice.actions;

export const getAllAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/getAllAction",
  async (_: undefined, { dispatch }) => {
    dispatch(sendRequest());
    dispatch(getAllSuccess(await getAll()));
  }
);

export const createAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/createAction",
  async (_: IPurchaseOrderInstrument, { dispatch }) => {
    dispatch(sendRequest());
    await create(_);
    dispatch(createSuccess(_));
  }
);

export const acceptAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/acceptAction",
  async (_: IPurchaseOrderInstrument, { dispatch }) => {
    dispatch(sendRequest());
    await accept(_.OrderId);
    dispatch(updateSuccess(_));
  }
);

export const updateAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/updateAction",
  async (_: IPurchaseOrderInstrument, { dispatch }) => {
    dispatch(sendRequest());
    await update(_);
    dispatch(updateSuccess(_));
  }
);

export const unAcceptAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/unAcceptAction",
  async (
    _: {
      body: IPurchaseOrderInstrument;
      message: string;
    },
    { dispatch }
  ) => {
    dispatch(sendRequest());
    await unAccept(_.body.OrderId, _.message);
    dispatch(updateSuccess(_.body));
  }
);

export const removeAction = createAsyncThunk(
  "purchaseOrderInstrumentSlice/removeAction",
  async (_: IPurchaseOrderInstrument, { dispatch }) => {
    dispatch(sendRequest());
    await remove(_.OrderId);
    dispatch(deleteSuccess(_.OrderId));
  }
);

export const purchaseOrderInstrumentSelect = (app: RootState) =>
  app.purchaseOrderDevice;

export default purchaseOrderInstrumentSlice.reducer;
