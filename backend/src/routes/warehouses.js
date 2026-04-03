const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter('warehouses', { createMessage: '仓库创建成功' });
