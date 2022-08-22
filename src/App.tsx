import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Dashboard } from './pages/Dashboard';
import DrawerLeft from './components/DrawerLeft';
import AppBar from "../src/components/Appbar";
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import { Avatar, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from './hooks';
import { RootState } from './store';
import { setIsOpenDrawer } from './pages/appSlice';
import { Box } from '@mui/system';

const settings = ['Tài khoản', 'Đăng xuất'];

function App() {
  const isOpenDrawer: boolean = useAppSelector((state: RootState) => state.app.isOpenDrawer)
  const dispatch = useAppDispatch()

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    dispatch(setIsOpenDrawer(true));
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <div className="App">
      <Router>
      <AppBar position="fixed" open={isOpenDrawer}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(isOpenDrawer && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            HUFI E-LAB
          </Typography>

          <Box sx={{ flexGrow: 0, position: "absolute", right: "3%"}}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <div className="container">
      <DrawerLeft/>
      <Routes>
     
          <Route element={<Dashboard/>} path="/" />
       
          
        </Routes>
        </div>
       </Router>
    </div>
  );
}

export default App;
