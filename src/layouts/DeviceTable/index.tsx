import { FC } from 'react'
import { useAppSelector } from '../../hooks'
import DeviceOfDepartmentTable from './DeviceOfDepartmentTable'

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
