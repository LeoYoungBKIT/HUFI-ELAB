import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";

import DataGrid, {
  Column,
  ColumnChooser,
  ColumnFixing,
  FilterPanel,
  FilterRow,
  Grouping,
  HeaderFilter,
  LoadPanel,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { useMemo, useRef } from "react";
import { IRepairDevice } from "../../../types/maintenanceDevicesType";
import { DialogProps } from "./DialogType";

const DialogMaintenanceDevice = ({
  isOpen,
  onClose,
  data,
  loading,
}: DialogProps & {
  data: IRepairDevice | null;
  loading: boolean;
}) => {
  const dataGridRef = useRef<DataGrid<any, any> | null>(null);
  const dataSource = useMemo(() => {
    return new DataSource({
      store: new ArrayStore({
        data: [],
        key: "Id",
      }),
    });
  }, []);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{ style: { width: "800px", maxWidth: "unset" } }}
    >
      <DialogTitle textAlign="left">
        <b>Lịch sử sửa chữa - hiệu chuẩn/bảo trì</b>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {!loading ? (
          <>
            <DataGrid
              dataSource={dataSource}
              ref={dataGridRef}
              showBorders={true}
              columnAutoWidth={true}
              allowColumnResizing={true}
              columnResizingMode="widget"
              columnMinWidth={100}
              searchPanel={{
                visible: true,
                width: 240,
                placeholder: "Tìm kiếm",
              }}
              elementAttr={{
                style:
                  "height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px",
              }}
            >
              <ColumnChooser enabled={true} mode="select" />
              <Paging enabled={false} />
              <FilterRow visible={true} applyFilter={true} />
              <HeaderFilter visible={true} />
              <ColumnFixing enabled={false} />
              <Grouping contextMenuEnabled={true} expandMode="rowClick" />
              <FilterPanel visible={true} />
              <Pager
                allowedPageSizes={true}
                showInfo={true}
                showNavigationButtons={true}
                showPageSizeSelector={true}
                visible={true}
              />
              <LoadPanel enabled={true} />
              <Paging defaultPageSize={30} enabled={true} />
              <Column dataField="DateCreate" caption="Ngày tạo" />
              <Column dataField="DateComplete" caption="Ngày hoàn thành" />
              <Column dataField="Content" caption="Nội dung sửa chữa" />
              <Column dataField="Status" caption="Trạng thái" />
            </DataGrid>
          </>
        ) : (
          <Box textAlign="center">
            <CircularProgress disableShrink />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogMaintenanceDevice;
