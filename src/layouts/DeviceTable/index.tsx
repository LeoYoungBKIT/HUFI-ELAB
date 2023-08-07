import { FC } from 'react'
import { useAppSelector } from '../../hooks'
import { DeviceTable as DeviceTableWrap } from './context/DeviceOfDepartmentTableContext'
import DeviceOfDepartmentTable from './DeviceOfDepartmentTable'
import ALLOWED from '../../configs/allowed'
import MaintenanceDeviceTable from '../MaintenanceDeviceTable'
import RepairDevice from '../RepairDevice'

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
			{/* <MaintenanceDeviceTable /> */}

			<RepairDevice/>
			{/* {[
				ALLOWED.ADMIN,
				ALLOWED.BOARD_DIRECTORS,
				ALLOWED.MANAGER_DEVICE_ROOM,
				ALLOWED.SPECIALIST_DEVICE_ROOM,
				ALLOWED.MANAGER_EXPERIMENTAL,
				ALLOWED.SPECIALIST_EXPERIMENTAL,
				ALLOWED.MANAGER_USE_UNIT,
				ALLOWED.SPECIALIST_USE_UNIT,
			].includes(owner.GroupName) && (
				<DeviceTableWrap id={owner.DepartmentId}>
					<DeviceOfDepartmentTable />
				</DeviceTableWrap>
			)} */}
		</div>
	)
}

export default DeviceTable
