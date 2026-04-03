const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter('customers', { createMessage: '客户创建成功' });
