const express = require('express');
const store = require('../data/mockStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    ...store.getReportSummary(),
  });
});

router.get('/mobile-summary', (req, res) => {
  const finance = store.getFinanceSummary();
  const sales = store.list('sales');
  const purchases = store.list('purchases');
  const products = store.list('products');
  const accounts = store.list('accounts');

  const recentFromFinance = (finance.transactions || []).slice(0, 5).map((t) => ({
    id: `fin-${t.id}`,
    title: t.title,
    type: t.type,
    counterparty: t.counterparty,
    amount: t.amount,
    date: t.date,
  }));

  const salesAsTx = sales.slice(0, 3).map((s) => ({
    id: `sale-${s.id}`,
    orderNo: s.orderNo,
    title: `销售 - ${s.customer}`,
    type: '销售',
    counterparty: s.customer,
    amount: s.amount,
    date: s.date,
  }));

  const purchasesAsTx = purchases.slice(0, 3).map((p) => ({
    id: `pur-${p.id}`,
    orderNo: p.orderNo,
    title: `采购 - ${p.supplier}`,
    type: '采购',
    counterparty: p.supplier,
    amount: p.amount,
    date: p.date,
  }));

  const allTx = [...recentFromFinance, ...salesAsTx, ...purchasesAsTx]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  res.json({
    success: true,
    totalSales: sales.reduce((s, o) => s + Number(o.amount || 0), 0),
    totalPurchases: purchases.reduce((s, o) => s + Number(o.amount || 0), 0),
    receivable: finance.receivable || 0,
    payable: finance.payable || 0,
    accounts: (accounts || []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: a.balance,
    })),
    recentTransactions: allTx,
    topProducts: (products || [])
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        sold: p.sold || 0,
      })),
  });
});

module.exports = router;
