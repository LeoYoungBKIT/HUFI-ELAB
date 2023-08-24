import { FC } from 'react'
import { Button, Paper, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useMemo, useRef, useState } from 'react'
import { useAppSelector } from '../../../hooks'

import DataGrid, {
    Column,
    ColumnChooser,
    ColumnFixing,
    Button as DevButtonGrid,
    FilterPanel,
    FilterRow,
    Grouping,
    HeaderFilter,
    Item,
    LoadPanel,
    Pager,
    Paging,
    Toolbar,
} from 'devextreme-react/data-grid'
import ArrayStore from 'devextreme/data/array_store'
import DataSource from 'devextreme/data/data_source'
import { uniqueId } from 'lodash'
import moment from 'moment'
import { IExportToOtherDepartmentManagementFormType } from '../../../types/exportManagementType'
import DialogCreate from './Dialog/DialogCreate'
import RowExportToOtherDepartmentManagementFormType from './DetailExportToOtherDepartmentManagementForm'


const ALLOWED = [
    'Admin',
    'Ban giám hiệu',
    'Trưởng phòng QTTB',
    'Chuyên viên phòng QTTB',
    'Trưởng phòng TT TNTH',
    'Chuyên viên TT TNTH',
    'Trưởng đơn vị sử dụng',
    'Chuyên viên đơn vị sử dụng',
]

type ExportToOtherDepartmentManagementFormTypeColumnType = {
    id: string
    header: String
    type?: string
    data?: any
    size?: number
    renderValue?: (...args: any[]) => String
    hide?: boolean
}

export function removeAccents(str: string) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
}

export const renderHeader = (data: any, isRequired: boolean = false) => {
    return (
        <b style={{ color: 'black' }}>
            {data.column.caption} {isRequired && <span style={{ color: 'red' }}>*</span>}
        </b>
    );
};


const ExportToOtherDepartmentTable: FC = () => {
    const owner = useAppSelector(state => state.userManager.owner)
    const exportManagementForms = useAppSelector(state => state.exportManagement.listOfExportToOtherDepartmentManagementForms)

    const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false)
    const [selectedExportToOtherDepartmentManagementForm, setSelectedExportToOtherDepartmentManagementForm] = useState<IExportToOtherDepartmentManagementFormType>()

    const handleOpenCreate = () => {
        setIsOpenCreateModal(true)
    }

    const columns = useRef<ExportToOtherDepartmentManagementFormTypeColumnType[]>([
        { id: 'ExportOutId', header: 'Mã phiếu' },
        { id: 'DepartmentCreateName', header: 'Đơn vị đề xuất' },
        { id: 'Title', header: 'Tiêu đề' },
        { id: 'Content', header: 'Nội dung' },
        { id: 'DateCreate', header: 'Ngày đề nghị', type: 'date' },
        { id: 'Status', header: 'Trạng thái' },
    ])

    const dataGridRef = useRef<DataGrid<any, any> | null>(null)

    const dataSource = useMemo(() => {
        return new DataSource({
            store: new ArrayStore({
                data: exportManagementForms.length > 0 ?
                    exportManagementForms.map((x: any) => ({ ...x, Id: uniqueId('ExportToOtherDepartmentManagementForm_') })) : [],
                key: 'Id',
            }),
        })
    }, [exportManagementForms])

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {ALLOWED.includes(owner.GroupName) && (
                <>
                    <Box
                        component="div"
                        boxShadow="none"
                        border="none"
                        justifyContent="space-between"
                        display="flex"
                        flexWrap="wrap"
                        m={2}
                    >
                        <Typography fontWeight="bold" variant="h6" whiteSpace="nowrap">
                            Xuất ngoài đơn vị quản lý
                        </Typography>

                        {['Chuyên viên TT TNTH', 'Chuyên viên đơn vị sử dụng'].includes(owner.GroupName) &&
                            <Tooltip arrow placement="left" title="Tạo mới">
                                <Button variant="contained" onClick={handleOpenCreate} sx={{ marginLeft: '24px' }}>
                                    Tạo mới
                                </Button>
                            </Tooltip>}
                    </Box>
                    <Paper
                        sx={{
                            marginBottom: '24px',
                            overflow: 'overlay',
                            flex: '1',
                            padding: '16px',
                            boxShadow: 'none',
                            border: 'none',
                        }}
                    >
                        <DataGrid
                            dataSource={dataSource}
                            ref={dataGridRef}
                            id="gridContainer"
                            showBorders={true}
                            columnAutoWidth={true}
                            allowColumnResizing={true}
                            columnResizingMode="widget"
                            columnMinWidth={100}
                            searchPanel={{
                                visible: true,
                                width: 240,
                                placeholder: 'Tìm kiếm',
                            }}
                            editing={{
                                confirmDelete: true,
                                allowDeleting: true,
                                allowAdding: true,
                                allowUpdating: true,
                            }}
                            elementAttr={{ style: 'height: 100%; padding-bottom: 20px; width: 100%; min-width: 600px' }}
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
                            <Paging defaultPageSize={30} />
                            {columns.current.map(col => (
                                <Column
                                    key={col.id}
                                    dataField={col.id}
                                    dataType="string"
                                    headerCellRender={data => renderHeader(data)}
                                    caption={col.header}
                                    cellRender={data => (
                                        <span>
                                            {Number(data.text) && col?.type === 'date'
                                                ? moment.unix(Number(data.text)).format('DD/MM/YYYY')
                                                : data.text}
                                        </span>
                                    )}
                                />
                            ))}

                            <Column type="buttons">
                                <DevButtonGrid
                                    icon="chevrondown"
                                    onClick={(e: any) => {
                                        setSelectedExportToOtherDepartmentManagementForm(e.row.data)
                                    }}
                                />
                            </Column>
                            <Toolbar>
                                <Item name="columnChooserButton" />
                                <Item name="searchPanel" showText="always" />
                            </Toolbar>
                        </DataGrid>
                    </Paper>


                    <DialogCreate isOpen={isOpenCreateModal} onClose={() => setIsOpenCreateModal(false)} />

                    {selectedExportToOtherDepartmentManagementForm && (
                        <RowExportToOtherDepartmentManagementFormType
                            exportManagementForm={selectedExportToOtherDepartmentManagementForm}
                            isOpen={!!selectedExportToOtherDepartmentManagementForm}
                            handleClose={() => setSelectedExportToOtherDepartmentManagementForm(undefined)}
                        />
                    )}
                </>
            )}

        </div>
    )
}

export default ExportToOtherDepartmentTable
