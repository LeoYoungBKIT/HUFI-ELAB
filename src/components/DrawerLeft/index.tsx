import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import { Collapse, Tooltip, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { CSSObject, Theme, styled, useTheme } from '@mui/material/styles'
import { memo, useEffect, useState } from 'react'
import HufiLogoExtended from '../../assets/img/logo-hufi-extended.png'
import Sidebar, { ISidebarItem } from '../../configs/sidebar'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setAppState, setIsOpenDrawer } from '../../pages/appSlice'
import { RootState } from '../../store'
import { useNavigate } from 'react-router-dom'

export const drawerWidth = 300

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
})

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	// overflowX: 'hidden',
	width: `0px`,
})

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	padding: theme.spacing(0, 1),
	position: 'sticky',
	top: 0,
	zIndex: 9999,
	background: 'white',
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: 'nowrap',
	boxSizing: 'border-box',
	...(open && {
		...openedMixin(theme),
		'& .MuiDrawer-paper': openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		'& .MuiDrawer-paper': closedMixin(theme),
	}),
}))

function PersistentDrawerLeft() {
	const dispatch = useAppDispatch()
	const theme = useTheme()
	const { isOpenDrawer } = useAppSelector((state: RootState) => state.app)
	const { owner } = useAppSelector((state: RootState) => state.userManager)
	const handleDrawerClose = () => {
		dispatch(setIsOpenDrawer(false))
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />

			<Drawer
				PaperProps={{
					sx: {
						overflow: 'overlay',
					},
				}}
				variant="permanent"
				open={isOpenDrawer}
			>
				<DrawerHeader>
					<img
						src={HufiLogoExtended}
						style={{ maxHeight: '50px', marginTop: '5px', minWidth: '150px' }}
						alt=""
					/>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</IconButton>
				</DrawerHeader>
				<Divider />
				{isOpenDrawer && (
					<List disablePadding>
						{Sidebar.get().map((route, index) => {
							if (route.permissions === undefined || route.permissions?.includes(owner.GroupName)) {
								if (route?.children?.length === 0) return null

								return route?.children ? (
									<SidebarItemCollapse item={route} key={index} indentLevel={0} />
								) : (
									<SidebarItem item={route} key={index} indentLevel={0} />
								)
							} else return null
						})}
					</List>
				)}
			</Drawer>
		</Box>
	)
}

type Props = {
	item: ISidebarItem
	indentLevel: number
}

const SidebarItemCollapse = ({ item, indentLevel }: Props) => {
	const [open, setOpen] = useState(false)

	const { appState } = useAppSelector((state: RootState) => state.app)
	const { isOpenDrawer } = useAppSelector((state: RootState) => state.app)
	const { owner } = useAppSelector((state: RootState) => state.userManager)

	useEffect(() => {
		if (appState.includes(item.id)) {
			setOpen(true)
		}
	}, [appState, item])

	return item.id ? (
		<>
			<Tooltip title={item.id} placement="right" arrow={true}>
				<ListItemButton
					onClick={() => setOpen(!open)}
					sx={{
						minHeight: 48,
						justifyContent: isOpenDrawer ? 'initial' : 'center',
						px: 2.5,
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: '24px',
							marginLeft: isOpenDrawer ? indentLevel * 20 + 'px' : 'auto',
							justifyContent: 'center',
						}}
					>
						{item.icon && item.icon}
					</ListItemIcon>
					<ListItemText
						disableTypography
						primary={<Typography whiteSpace="normal">{item.name}</Typography>}
					/>

					{open ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
				</ListItemButton>
			</Tooltip>
			<Collapse in={open} timeout="auto">
				<List>
					{item?.children?.map((route, index) => {
						if (route.permissions === undefined || route.permissions?.includes(owner.GroupName)) {
							if (route?.children?.length === 0) return null

							return route?.children ? (
								<SidebarItemCollapse item={route} key={index} indentLevel={indentLevel + 1} />
							) : (
								<SidebarItem item={route} key={index} indentLevel={indentLevel + 1} />
							)
						} else return null
					})}
				</List>
			</Collapse>
		</>
	) : null
}

const SidebarItem = ({ item, indentLevel }: Props) => {
	const { appState } = useAppSelector((state: RootState) => state.app)
	const { isOpenDrawer } = useAppSelector((state: RootState) => state.app)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	return item.id ? (
		<Tooltip title={item.id} placement="right" arrow={true}>
			<ListItemButton
				sx={{
					minHeight: 48,
					justifyContent: isOpenDrawer ? 'initial' : 'center',
					px: 2.5,
				}}
				onClick={() => {
					navigate('/')
					dispatch(setAppState(item.id))
				}}
				style={{
					backgroundColor: appState === item.id ? '#DEE1E6' : 'white',
				}}
			>
				<ListItemIcon
					sx={{
						minWidth: '24px',
						marginLeft: isOpenDrawer ? indentLevel * 20 + 'px' : 'auto',
						justifyContent: 'center',
					}}
				>
					{item.icon && item.icon}
				</ListItemIcon>
				{isOpenDrawer && (
					<ListItemText
						disableTypography
						primary={<Typography whiteSpace="normal">{item.name}</Typography>}
					/>
				)}
			</ListItemButton>
		</Tooltip>
	) : null
}

export default memo(PersistentDrawerLeft)
