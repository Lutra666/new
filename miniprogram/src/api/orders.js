import { get, post, put, del } from './request';

export const fetchSales = () => get('/sales');
export const fetchPurchases = () => get('/purchases');

export const createSalesOrder = (data) => post('/sales', data);
export const updateSalesOrder = (id, data) => put(`/sales/${id}`, data);
export const deleteSalesOrder = (id) => del(`/sales/${id}`);

export const createPurchaseOrder = (data) => post('/purchases', data);
export const updatePurchaseOrder = (id, data) => put(`/purchases/${id}`, data);
export const deletePurchaseOrder = (id) => del(`/purchases/${id}`);
