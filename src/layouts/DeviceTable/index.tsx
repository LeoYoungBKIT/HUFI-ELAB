import { FC } from 'react'
import { useAppSelector } from '../../hooks'
import DeviceOfDepartmentTable from './DeviceOfDepartmentTable'
import MaintenanceDeviceTable from '../MaintenanceDeviceTable'
import RepairDevice from '../RepairDevice'
import {
	ADMIN,
	BOARD_DIRECTORS,
	EQUIPMENT_MANAGEMENT_HEAD,
	EQUIPMENT_MANAGEMENT_SPECIALIST,
	EXPERIMENTAL_MANAGEMENT_HEAD,
	EXPERIMENTAL_MANAGEMENT_SPECIALIST,
	UNIT_UTILIZATION_HEAD,
	UNIT_UTILIZATION_SPECIALIST,
} from '../../configs/permissions'

const DeviceTable: FC = () => {
	const owner = useAppSelector(state => state.userManager.owner)

	return (
		<div
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
			}}
		>
			<DeviceOfDepartmentTable />
		</div>
	)
}

export default DeviceTable
