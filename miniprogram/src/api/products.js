import { get, post, put, del } from './request';

export const fetchProducts = () => get('/products');
export const createProduct = (data) => post('/products', data);
export const updateProduct = (id, data) => put(`/products/${id}`, data);
export const deleteProduct = (id) => del(`/products/${id}`);
