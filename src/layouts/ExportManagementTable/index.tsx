import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { FC, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../hooks';
import ExportToOtherDepartmentTable from './ExportToOtherDepartment';
import ExportToLiquidateTable from './ExportToLiquidate';

type TabItem = {
    id: string;
    header: string;
    comp: React.ComponentType<any>;
};

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ExportManagementTable: FC = () => {
    const [value, setValue] = useState(0);
    const owner = useAppSelector(state => state.userManager.owner);
    const [tabData, setTabData] = useState<TabItem[]>([
        {
            id: 'exportToOtherDepartment',
            header: 'Xuất ngoài đơn vị quản lý',
            comp: ExportToOtherDepartmentTable,
        },
        {
            id: 'exportToLiquidate',
            header: 'Xuất thanh lý',
            comp: ExportToLiquidateTable,
        },
    ]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    {tabData.map((x, index) => {
                        return <Tab key={index} label={x.header} {...a11yProps(index)} />;
                    })}
                </Tabs>
            </Box>
            {tabData.map((x, index) => {
                const Comp = x.comp;
                return (
                    <Box
                        role="tabpanel"
                        hidden={value !== index}
                        id={`tabpanel-${index}`}
                        aria-labelledby={`tab-${index}`}
                        key={`content_${index}`}
                        sx={{ height: "100%" }}
                    >
                        {value === index && <Comp />}
                    </Box>
                );
            })}
        </>
    );
};

export default ExportManagementTable;
