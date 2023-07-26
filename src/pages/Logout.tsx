import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { clearFromLocalStorage } from '../configs/apiHelper';
import { useAppDispatch } from '../hooks';
import { logout, setIsLogined, setOwner } from '../layouts/UserManager/userManagerSlice';
import { dummyUserOwner } from '../types/userManagerType';

const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(logout());
        clearFromLocalStorage('user');
        dispatch(setOwner(dummyUserOwner));
        dispatch(setIsLogined(false));

        navigate('/login');
    }, [])

    return null
}

export default Logout