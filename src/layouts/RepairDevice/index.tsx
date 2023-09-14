import { Box, Typography } from "@mui/material";
import Button from "devextreme-react/button";
import DataGrid, {
  Column,
  ColumnFixing,
  Button as DevButtonGrid,
  FilterPanel,
  FilterRow,
  GroupPanel,
  Grouping,
  HeaderFilter,
  IColumnProps,
  Item,
  LoadPanel,
  Paging,
  Scrolling,
  Toolbar,
} from "devextreme-react/data-grid";
import FileUploader from "devextreme-react/file-uploader";
import Form, { Item as FormItem } from "devextreme-react/form";
import Popup from "devextreme-react/popup";
import { RequiredRule } from "devextreme-react/validator";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
import { ColumnCellTemplateData } from "devextreme/ui/data_grid";
import moment from "moment";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { colorsNotifi } from "../../configs/color";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setSnackbar } from "../../pages/appSlice";
import { getDeviceGeneral } from "../../services/deviceServices";
import {
  getRepairDevices,
  postNewRepairDevice,
} from "../../services/maintenanceDevicesServices";
import { IDeviceGeneral } from "../../types/deviceType";
import { IRepairDevice } from "../../types/maintenanceDevicesType";
import RepairDeviceDetail from "./Dialog/RepairDeviceDetail";
import { useLoading } from "../../hooks/useLoading";
import LoadIndicator from "devextreme-react/load-indicator";
import { ADMIN, UNIT_UTILIZATION_SPECIALIST } from "../../configs/permissions";

const RepairDevice = () => {
  const [repairs, setRepairs] = useState<IRepairDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IRepairDevice>();
  const [deviceGenerals, setDeviceGenerals] = useState<IDeviceGeneral[]>([]);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const { owner } = useAppSelector((state) => state.userManager);
  const dispatch = useAppDispatch();

  const [getRepair, isLoadingGetRepair] = useLoading(async () => {
    try {
      const repairs = await getRepairDevices();
      setRepairs(repairs);
    } catch (error) {
      console.log(error);
    }
  });

  const hidePopup = useCallback(() => {
    setPopupVisible(false);
  }, [setPopupVisible]);

  const showPopup = useCallback(() => {
    setPopupVisible(true);
  }, [setPopupVisible]);

  const getDeviceInfo = async () => {
    const devicesInfo = await getDeviceGeneral();
    setDeviceGenerals(devicesInfo);
  };

  const dataGridFromRef = useRef<DataGrid<IRepairDevice, string> | null>(null);

  const dataSourceFrom = useMemo(() => {
    return new DataSource<IRepairDevice, string>({
      store: new ArrayStore({
        data:
          repairs.map((repair) => ({
            ...repair,
            DateCreate: moment(Number(repair.DateCreate) * 1000).format(
              "YYYY/MM/DD"
            ),
          })) || [],
        key: "RepairId",
      }),
    });
  }, [repairs]);

  const columns = useRef<(IColumnProps & { typeCreate?: string })[]>([
    { dataField: "RepairId", caption: "Mã sửa chữa", width: 100 },
    {
      dataField: "Title",
      caption: "Tiêu đề",
      minWidth: 200,
      typeCreate: "textbox",
    },
    {
      dataField: "ContentRepair",
      caption: "Nội dung sửa chữa",
      width: 280,
      typeCreate: "textbox",
    },
    {
      dataField: "ContentReport",
      caption: "Nội dung tường trình",
      width: 280,
      typeCreate: "textbox",
    },
    { dataField: "DateCreate", caption: "Ngày tạo", width: 100 },
    {
      dataField: "DeviceInfoId",
      caption: "Mã định danh thiết bị",
      width: 100,
      typeCreate: "selectbox",

      editorOptions: {
        displayExpr: function (item: any) {
          return item?.DeviceInfoId
            ? `${item?.DeviceInfoId} - ${item?.DeviceName}`
            : "";
        },
        valueExpr: "DeviceInfoId",
        searchEnabled: true,
      },
    },
    { dataField: "DeviceName", caption: "Tên thiết bị", width: 280 },
    {
      dataField: "LinkReportFile",
      caption: "Bản tường trình",
      visible: false,
      typeCreate: "file",
    },
    {
      dataField: "LinkCheckFile",
      caption: "Biên bản kiểm tra",
      visible: false,
      typeCreate: "file",
    },
    {
      dataField: "LinkHandoverFile",
      caption: "Biên bản bàn giao",
      visible: false,
      typeCreate: "file",
    },
    { dataField: "Status", caption: "Trạng thái", width: 150 },
  ]);

  const [handleSaving, isLoadingHanleSaving] = useLoading(
    async (e: FormEvent<HTMLFormElement>) => {
      const form = e.target as HTMLFormElement;
      try {
        e.preventDefault();
        const formData = new FormData(form);
        await postNewRepairDevice(formData);

        dispatch(
          setSnackbar({
            message: "Tạo phiếu thành công!!!",
            color: colorsNotifi["success"].color,
            backgroundColor: colorsNotifi["success"].background,
          })
        );
        setPopupVisible(false);
        getRepair().catch(console.error);
      } catch (error) {
        dispatch(
          setSnackbar({
            message: "Đã xảy ra lỗi!!!",
            color: colorsNotifi["error"].color,
            backgroundColor: colorsNotifi["error"].background,
          })
        );
        console.log(error);
      } finally {
        console.log(e);
        form.reset();
      }
    }
  );

  const handleRefresh = useCallback(() => {
    getRepair().catch(console.error);
  }, []);

  useEffect(() => {
    getRepair().catch(console.error);
    getDeviceInfo().catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      setSelectedDevice((prev) =>
        repairs.find((r) => r.RepairId === prev?.RepairId)
      );
    }
  }, [repairs, setSelectedDevice]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        component="div"
        boxShadow="none"
        border="none"
        justifyContent="space-between"
        display="flex"
        flexWrap="wrap"
        flexDirection="column"
        overflow="auto"
        m={2}
      >
        <Typography
          fontWeight="bold"
          align="left"
          variant="h6"
          whiteSpace="nowrap"
        >
          Sửa chữa thiết bị
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: "24px",
          overflow: "overlay",
          flex: "1",
          padding: "0 16px 16px 16px",
          boxShadow: "none",
          border: "none",
        }}
      >
        <DataGrid
          dataSource={dataSourceFrom}
          ref={dataGridFromRef}
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          columnResizingMode="widget"
          searchPanel={{
            visible: true,
            width: 240,
            placeholder: "Tìm kiếm",
          }}
          elementAttr={{
            style:
              "height: 100%; padding: 10px 0; width: 100%;min-width: 600px",
          }}
          wordWrapEnabled={true}
          columnHidingEnabled={true}
        >
          <Paging enabled={false} />
          <FilterRow visible={true} applyFilter={true} />
          <HeaderFilter visible={true} />
          <ColumnFixing enabled={false} />
          <Grouping contextMenuEnabled={true} />
          <FilterPanel visible={true} />
          <Scrolling mode="infinite" />
          <LoadPanel enabled={true} showPane={isLoadingGetRepair} />
          {columns.current.map((col) => (
            <Column key={col.dataField} {...col} />
          ))}
          <Column type="buttons" width={60} fixed={true}>
            <DevButtonGrid
              icon="chevrondown"
              onClick={(e: ColumnCellTemplateData<IRepairDevice, string>) => {
                setSelectedDevice(e.row.data);

                if (e.row.data) {
                  setIsOpenDetail(true);
                } else {
                  setIsOpenDetail(false);
                }
              }}
            />
          </Column>
          <Toolbar>
            <Item location="before">
              <Button
                stylingMode="contained"
                disabled={isLoadingGetRepair}
                type="default"
                onClick={handleRefresh}
              >
                <LoadIndicator
                  id="small-indicator"
                  height={20}
                  width={20}
                  visible={isLoadingGetRepair}
                  elementAttr={{ class: "indicator-white" }}
                />
                Làm mới
              </Button>
            </Item>
            {[ADMIN, UNIT_UTILIZATION_SPECIALIST].includes(owner.GroupName) && (
              <Item location="after">
                <Button icon="add" onClick={showPopup} />
              </Item>
            )}
            <Item location="after" name="searchPanel" showText="always" />
          </Toolbar>
        </DataGrid>
      </Box>
      {selectedDevice && isOpenDetail && (
        <RepairDeviceDetail
          data={selectedDevice}
          isOpen={isOpenDetail}
          onClose={() => {
            setIsOpenDetail(false);
            setSelectedDevice(undefined);
          }}
          changeData={() => {
            getRepair().catch(console.error);
          }}
        />
      )}
      {popupVisible && (
        <Popup
          visible={popupVisible}
          onHiding={hidePopup}
          dragEnabled={true}
          hideOnOutsideClick={false}
          showCloseButton={true}
          showTitle={true}
          title="Thêm phiếu sửa chữa"
          height="auto"
          resizeEnabled={true}
          width={700}
        >
          <form
            onSubmit={handleSaving}
            encType="multipart/form-data"
            noValidate={true}
          >
            <Form>
              {columns.current.map((col) => {
                if (col?.typeCreate === "textbox") {
                  return (
                    <FormItem
                      key={col.dataField}
                      dataField={col.dataField}
                      caption={col.caption}
                      colSpan={2}
                      label={{
                        text: col.caption,
                      }}
                    >
                      <RequiredRule />
                    </FormItem>
                  );
                }
                if (col?.typeCreate === "selectbox") {
                  return (
                    <FormItem
                      key={col.dataField}
                      dataField={col.dataField}
                      caption={col.caption}
                      editorType="dxSelectBox"
                      editorOptions={{
                        ...col.editorOptions,
                        dataSource: deviceGenerals,
                      }}
                      colSpan={2}
                      label={{
                        text: col.caption,
                      }}
                    >
                      <RequiredRule />
                    </FormItem>
                  );
                }
                if (col?.typeCreate === "file") {
                  return (
                    <FormItem
                      key={col.dataField}
                      cssClass="items-center disable-padding-top  disable-padding-bottom disable-padding-left"
                      dataField={col.dataField}
                      caption={col.caption}
                      colSpan={2}
                      label={{
                        text: col.caption,
                      }}
                    >
                      <RequiredRule />
                      <FileUploader
                        selectButtonText="Chọn file"
                        labelText=""
                        elementAttr={{
                          class: "uploader-horizontal",
                        }}
                        inputAttr={{
                          required: "required",
                        }}
                        accept="application/pdf,application/vnd.ms-excel"
                        uploadMode="useForm"
                        name={col.dataField}
                      />
                    </FormItem>
                  );
                }
              })}
            </Form>
            <Box display="flex">
              <Button
                type="default"
                elementAttr={{ style: "margin-left: auto; width: 120px;" }}
                width={120}
                useSubmitBehavior={true}
                disabled={isLoadingHanleSaving}
              >
                <LoadIndicator
                  id="small-indicator"
                  height={20}
                  width={20}
                  visible={isLoadingHanleSaving}
                  elementAttr={{ class: "indicator-white" }}
                />
                Lưu
              </Button>
              <Button
                type="normal"
                text="Hủy"
                onClick={hidePopup}
                elementAttr={{ style: "margin-left: 16px; width: 80px" }}
                width={80}
              />
            </Box>
          </form>
        </Popup>
      )}
    </div>
  );
};

export default RepairDevice;
