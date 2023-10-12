import DataGrid, {
    Column,
    ColumnFixing,
    Export,
    FilterPanel,
    FilterRow,
    Grouping,
    HeaderFilter,
    Item,
    LoadPanel,
    Scrolling,
} from "devextreme-react/data-grid";
import { MRT_ColumnDef } from "material-react-table";
import moment from "moment";
import React, { useEffect, useState } from "react";

import { ExportingEvent } from "devextreme/ui/data_grid";
import {
    IDeviceInfor,
    IDeviceServiceInfo,
} from "../../types/IDeviceServiceInfo";

interface IProps {
    dataSource: IDeviceInfor[];
    alowExportCsv?: boolean;
    onTableChange: (data: IDeviceInfor[]) => void;
    deviceServiceInfo: IDeviceServiceInfo;
}

const TableListDeviceInfo = ({
    dataSource,
    alowExportCsv,
    onTableChange,
    deviceServiceInfo,
}: IProps) => {
    const [data, setData] = useState(dataSource);

    useEffect(() => {
        setData(dataSource);
    }, [dataSource]);

    function onExporting(e: ExportingEvent<IDeviceInfor, any>): void {
        throw new Error("Function not implemented.");
    }

    return (
        <>
            <DataGrid
                columnAutoWidth={true}
                allowColumnResizing={true}
                columnResizingMode="widget"
                wordWrapEnabled={true}
                repaintChangesOnly={true}
                columnMinWidth={120}
                dataSource={data}
                allowColumnReordering={true}
                rowAlternationEnabled={true}
                showBorders={true}
                onExporting={onExporting}
            >
                <Export />
                <FilterRow visible={true} applyFilter={true} />
                <HeaderFilter visible={true} />
                <ColumnFixing enabled={false} />
                <Grouping contextMenuEnabled={true} expandMode="rowClick" />
                <FilterPanel visible={true} />
                <Item name="exportButton" showText="always" />
                <Item name="columnChooserButton" showText="always" />
                <Item name="searchPanel" showText="always" />
                <LoadPanel enabled={true} />
                <Scrolling mode="infinite" />
                {Object.keys(columnHeads).map((x) => {
                    const key = x as keyof IDeviceInfor;

                    if (!columnHeads[key])
                        return <React.Fragment key={x}></React.Fragment>;

                    if (
                        [
                            "DateImport",
                            "StartGuarantee",
                            "EndGuarantee",
                        ].includes(key)
                    )
                        return (
                            <Column
                                key={key}
                                dataField={key}
                                caption={columnHeads[key]}
                                calculateCellValue={(row: any) => {
                                    return moment
                                        .unix(Number(row.DateCreate))
                                        .format("DD/MM/YYYY");
                                }}
                            />
                        );

                    return (
                        <Column
                            key={key}
                            dataField={key}
                            caption={columnHeads[key]}
                        />
                    );
                })}
            </DataGrid>
        </>
    );
};

const renderRow = (key: keyof IDeviceInfor) => {
    return (row: IDeviceInfor) => row[key] ?? "trống";
};

const columns: MRT_ColumnDef<IDeviceInfor>[] = [
    {
        accessorFn: renderRow("DeviceId"),
        accessorKey: "DeviceId",
        header: "Mã thiết bị",
    },
    {
        accessorFn: renderRow("DeviceInfoId"),
        accessorKey: "DeviceInfoId",
        header: "Mã định danh thiết bị",
    },
    {
        accessorFn: renderRow("DeviceName"),
        accessorKey: "DeviceName",
        header: "Tên tiếng Việt",
    },
    {
        accessorFn: renderRow("DeviceEnglishName"),
        accessorKey: "DeviceEnglishName",
        header: "Tên tiếng Anh",
    },
    {
        accessorFn: renderRow("Model"),
        accessorKey: "Model",
        header: "Số Model",
    },
    {
        accessorFn: renderRow("SerialNumber"),
        accessorKey: "SerialNumber",
        header: "Số Serial",
    },
    {
        accessorFn: renderRow("Specification"),
        accessorKey: "Specification",
        header: "Thông số kỹ thuật",
    },
    {
        accessorFn: renderRow("Manufacturer"),
        accessorKey: "Manufacturer",
        header: "Hãng sản xuất",
    },
    {
        accessorFn: renderRow("Origin"),
        accessorKey: "Origin",
        header: "Xuất xứ",
    },
    {
        accessorFn: renderRow("SupplierId"),
        accessorKey: "SupplierId",
        header: "Mã nhà cung cấp",
    },
    {
        accessorFn: renderRow("SupplierName"),
        accessorKey: "SupplierName",
        header: "Tên nhà cung cấp",
    },
    {
        accessorFn: renderRow("Unit"),
        accessorKey: "Unit",
        header: "Đơn vị tính",
    },
    {
        accessorFn: renderRow("QuantityImport"),
        accessorKey: "QuantityImport",
        header: "Số lượng nhập",
    },
    {
        accessorFn: (row) =>
            moment.unix(Number(row.DateImport)).format("DD/MM/YYYY"),
        accessorKey: "DateImport",
        header: "Ngày Nhập",
    },
    {
        accessorFn: renderRow("YearStartUsage"),
        accessorKey: "YearStartUsage",
        header: "Năm đưa vào sử dụng",
    },
    {
        accessorFn: (row) =>
            moment.unix(Number(row.StartGuarantee)).format("DD/MM/YYYY"),
        accessorKey: "StartGuarantee",
        header: "Thời gian bắt đầu bảo hành",
    },

    {
        accessorFn: (row) =>
            moment.unix(Number(row.EndGuarantee)).format("DD/MM/YYYY"),
        header: "Thời gian kết thúc bảo hành",
    },
    {
        accessorFn: renderRow("PeriodicMaintenance"),
        accessorKey: "PeriodicMaintenance",
        header: "Chu kỳ bảo trì/ hiệu chuẩn định kỳ",
    },
    {
        accessorFn: renderRow("Status"),
        accessorKey: "Status",
        header: "Tình trạng",
    },
    {
        accessorFn: renderRow("DepartmentMaintenanceName"),
        accessorKey: "DepartmentMaintenanceName",
        header: "Đơn vị phụ trách hiệu chuẩn – bảo trì/sửa chữa",
    },
];

const columnHeads: { [key in keyof IDeviceInfor]: string } = {
    DeviceId: "Mã thiết bị",
    DeviceInfoId: "Mã định danh thiết bị",
    DeviceName: "Tên tiếng Việt",
    DeviceEnglishName: "Tên tiếng Anh",
    Model: "Số Model",
    SerialNumber: "Số Serial",
    Specification: "Thông số kỹ thuật",
    Manufacturer: "Hãng sản xuất",
    Origin: "Xuất xứ",
    SupplierId: "Mã nhà cung cấp",
    SupplierName: "Tên nhà cung cấp",
    Unit: "Đơn vị tính",
    QuantityImport: "Số lượng nhập",
    DateImport: "Ngày Nhập",
    YearStartUsage: "Năm đưa vào sử dụng",
    StartGuarantee: "Thời gian bắt đầu bảo hành",
    EndGuarantee: "Thời gian kết thúc bảo hành",
    PeriodicMaintenance: "Chu kỳ bảo trì/ hiệu chuẩn định kỳ",
    Status: "Tình trạng",
    DepartmentMaintenanceName: "Đơn vị phụ trách hiệu chuẩn – bảo trì/sửa chữa",
    DepartmentImportId: "",
    DepartmentImportName: "",
    DepartmentMaintenanceId: "",
};

export default TableListDeviceInfo;
