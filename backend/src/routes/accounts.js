const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter('accounts', { createMessage: '账户创建成功' });
