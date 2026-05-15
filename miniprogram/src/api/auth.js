import { get, post } from './request';

export const login = (payload) => post('/auth/login', payload);
export const getProfile = () => get('/auth/profile');
export const changePassword = (payload) => post('/auth/change-password', payload);
