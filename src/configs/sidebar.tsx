import BiotechIcon from '@mui/icons-material/Biotech'
import { ReactNode } from 'react'
import ChemicalWarehouseTable from '../layouts/ChemicalWarehouseTable'
import ClassSubjectTable from '../layouts/ClassSubjectTable'
import DepartmentTable from '../layouts/DepartmentTable'
import DeviceTable from '../layouts/DeviceTable'
import DeviceTransfer from '../layouts/DeviceTransfer'
import EmployeeTable from '../layouts/EmployeeTable'
import ExportManagementTable from '../layouts/ExportManagementTable'
import LaboratoryTable from '../layouts/LaboratoryTable'
import MaintenanceDeviceTable from '../layouts/MaintenanceDeviceTable'
import ManufacturersTable from '../layouts/ManufacturerTable'
import PlanSubjectTable from '../layouts/PlanSubjectTable'
import { PurchaseOrderTable } from '../layouts/PurchaseOrderTable'
import RegisterGeneralsTable from '../layouts/RegisterGeneralTable'
import RepairDevice from '../layouts/RepairDevice'
import ResearchTeamTable from '../layouts/ResearchTeamTable'
import ResearchersTable from '../layouts/ResearchTeamTable/ResearcherTable'
import FacultyViewScheduleTable from '../layouts/ScheduleTable/FacultyViewIndex'
import TeacherViewScheduleTable from '../layouts/ScheduleTable/TeacherViewIndex'
import SubjectTable from '../layouts/SubjectTable'
import SuggestNewDevicesTable from '../layouts/SuggestNewDevicesTable'
import SupplierTable from '../layouts/SupplierTable'
import TrainSchedule from '../layouts/TrainSchedule'
import {
	ADMIN,
	BOARD_DIRECTORS,
	EQUIPMENT_MANAGEMENT_HEAD,
	EQUIPMENT_MANAGEMENT_SPECIALIST,
	EXPERIMENTAL_MANAGEMENT_HEAD,
	EXPERIMENTAL_MANAGEMENT_SPECIALIST,
	UNIT_UTILIZATION_HEAD,
	UNIT_UTILIZATION_SPECIALIST,
} from './permissions'
import DeviceCategory from '../layouts/DeviceTable/DeviceCategory'

export interface ISidebarItem {
	id: string
	name: string
	icon: ReactNode
	children?: ISidebarItem[]
	comp: ReactNode
	permissions?: string[]
}

const Sidebar = {
	role: 1,
	get(): ISidebarItem[] {
		return [
			{
				id: 'Phòng lab',
				name: 'Phòng lab',
				icon: <BiotechIcon />,
				comp: <LaboratoryTable />,
			},
			{
				id: 'Phòng ban',
				name: 'Phòng ban',
				icon: <BiotechIcon />,
				comp: <DepartmentTable />,
			},
			{
				id: 'Nhân viên',
				name: 'Nhân viên',
				icon: <BiotechIcon />,
				comp: <EmployeeTable />,
			},
			{
				id: 'Nhà nghiên cứu',
				name: 'Nhà nghiên cứu',
				icon: <BiotechIcon />,
				comp: <ResearchersTable />,
			},
			{
				id: 'Nhóm nghiên cứu',
				name: 'nhóm nghiên cứu',
				icon: <BiotechIcon />,
				comp: <ResearchTeamTable />,
			},
			{
				id: 'Hoá chất',
				name: 'Hoá chất',
				icon: <BiotechIcon />,
				comp: <ChemicalWarehouseTable role={this.role} />,
			},
			{
				id: 'Thiết bị',
				name: 'Thiết bị',
				icon: <BiotechIcon />,
				comp: null,
				children: [
					{
						id: 'TB - Quản lý thiết bị',
						name: 'Quản lý thiết bị',
						icon: null,
						comp: <DeviceTable />,
						permissions: [
							ADMIN,
							BOARD_DIRECTORS,
							EQUIPMENT_MANAGEMENT_HEAD,
							EQUIPMENT_MANAGEMENT_SPECIALIST,
							EXPERIMENTAL_MANAGEMENT_HEAD,
							EXPERIMENTAL_MANAGEMENT_SPECIALIST,
							UNIT_UTILIZATION_HEAD,
							UNIT_UTILIZATION_SPECIALIST,
						],
					},
					{
						id: 'TB - Quản lý nhập kho - phân phối',
						name: 'Quản lý nhập kho - phân phối',
						icon: null,
						comp: null,
					},
					{
						id: 'TB - Quản lý sửa chữa - Hiệu chuẩn/bảo trì',
						name: 'Quản lý sửa chữa - Hiệu chuẩn/bảo trì',
						icon: null,
						children: [
							{
								id: 'TB - Sửa chữa',
								name: 'Sửa chữa',
								icon: null,
								comp: <RepairDevice />,
								permissions: [
									ADMIN,
									EQUIPMENT_MANAGEMENT_HEAD,
									EQUIPMENT_MANAGEMENT_SPECIALIST,
									EXPERIMENTAL_MANAGEMENT_HEAD,
									EXPERIMENTAL_MANAGEMENT_SPECIALIST,
									UNIT_UTILIZATION_HEAD,
									UNIT_UTILIZATION_SPECIALIST,
								],
							},
							{
								id: 'TB - Hiệu chuẩn/bảo trì',
								name: 'Hiệu chuẩn/bảo trì',
								icon: null,
								comp: <MaintenanceDeviceTable />,
								permissions: [
									ADMIN,
									EXPERIMENTAL_MANAGEMENT_HEAD,
									EXPERIMENTAL_MANAGEMENT_SPECIALIST,
									UNIT_UTILIZATION_HEAD,
									UNIT_UTILIZATION_SPECIALIST,
								],
							},
						],
						comp: null,
					},
					{
						id: 'TB - Quản lý xuất',
						name: 'Quản lý xuất',
						icon: null,
						comp: null,
					},
					{
						id: 'TB - Hướng dẫn sử dụng thiết bị',
						name: 'Hướng dẫn sử dụng thiết bị',
						icon: null,
						comp: null,
					},
					{
						id: 'TB - Báo cáo thống kê',
						name: 'Báo cáo thống kê',
						icon: null,
						comp: null,
					},
					{
						id: 'TB - Cập nhật vị trí Thiết bị',
						name: 'Cập nhật vị trí Thiết bị',
						icon: null,
						comp: <DeviceTransfer />,
						permissions: [ADMIN, UNIT_UTILIZATION_SPECIALIST],
					},
					{
						id: 'TB - Danh mục thiết bị',
						name: 'Danh mục thiết bị',
						icon: null,
						comp: <DeviceCategory />,
						permissions: [ADMIN, EQUIPMENT_MANAGEMENT_HEAD],
					},
				],
			},
			{
				id: 'Nhà sản xuất',
				name: 'Nhà sản xuất',
				icon: <BiotechIcon />,
				comp: <ManufacturersTable />,
			},
			{
				id: 'Nhà cung cấp',
				name: 'Nhà cung cấp',
				icon: <BiotechIcon />,
				comp: <SupplierTable />,
			},
			{
				id: 'Thời khóa biểu',
				name: 'Thời khóa biểu',
				icon: <BiotechIcon />,
				comp: this.role === 1 ? <FacultyViewScheduleTable /> : <TeacherViewScheduleTable />,
			},
			{
				id: 'Môn học',
				name: 'Môn học',
				icon: <BiotechIcon />,
				comp: <SubjectTable />,
			},
			{
				id: 'Lớp học phần',
				name: 'Lớp học phần',
				icon: <BiotechIcon />,
				comp: <ClassSubjectTable />,
			},
			{
				id: 'Nhập',
				name: 'Nhập',
				icon: <BiotechIcon />,
				comp: <PurchaseOrderTable />,
			},
			{
				id: 'Phiếu dự trù',
				name: 'Phiếu dự trù',
				icon: <BiotechIcon />,
				comp: <PlanSubjectTable />,
			},
			{
				id: 'Phiếu đăng ký',
				name: 'Phiếu đăng ký',
				icon: <BiotechIcon />,
				comp: <RegisterGeneralsTable />,
			},
			{
				id: 'Phiếu đề nghị',
				name: 'Phiếu đề nghị',
				icon: <BiotechIcon />,
				comp: <SuggestNewDevicesTable />,
			},
			{
				id: 'Lịch tập huấn',
				name: 'Lịch tập huấn',
				icon: <BiotechIcon />,
				comp: <TrainSchedule />,
			},
			{
				id: 'Quản lý xuất',
				name: 'Quản lý xuất',
				icon: <BiotechIcon />,
				comp: <ExportManagementTable />,
			},
		]
	},

	getActive(active: string) {
		return this.flattenArrayOfObjects().find(item => item.id === active)
	},
	flattenArrayOfObjects() {
		const result: ISidebarItem[] = []

		function flatten(item: ISidebarItem) {
			result.push(item)
			if (item.children) {
				item.children.forEach(child => flatten(child))
			}
		}

		this.get().forEach(item => flatten(item))
		return result
	},

	findPath(active: string) {
		const paths = this.handleFindPath(this.get(), active)
		return paths ? paths.join(' / ') : ''
	},

	handleFindPath(data: ISidebarItem[], active: string, currentPath: string[] = []): string[] | null {
		for (const item of data) {
			if (item.id === active) {
				return [...currentPath, item.name]
			}

			if (item.children) {
				const newPath = [...currentPath, item.name]
				const childPath = this.handleFindPath(item?.children, active, newPath)
				if (childPath) {
					return childPath
				}
			}
		}

		return null
	},
}

export default Sidebar
