import { get } from './request';

export const fetchFinanceSummary = () => get('/finance');
export const fetchReports = () => get('/reports');
export const fetchMobileSummary = () => get('/reports/mobile-summary');
