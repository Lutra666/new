const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter('products', { createMessage: '商品创建成功' });
