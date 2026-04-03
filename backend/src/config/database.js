const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Sequelize } = require('sequelize');

const hasRequiredDbEnv =
  Boolean(process.env.DB_NAME) &&
  Boolean(process.env.DB_USER) &&
  Boolean(process.env.DB_PASSWORD);

const useRealDb = process.env.USE_REAL_DB === 'true' && hasRequiredDbEnv;

let sequelize = null;

if (useRealDb) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      timezone: '+08:00',
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        connectTimeout: 60000,
      },
      pool: {
        max: Number(process.env.DB_POOL_MAX || 20),
        min: Number(process.env.DB_POOL_MIN || 5),
        acquire: Number(process.env.DB_POOL_ACQUIRE || 60000),
        idle: Number(process.env.DB_POOL_IDLE || 30000),
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );

  sequelize
    .authenticate()
    .then(() => console.log('数据库连接成功，当前使用真实数据库模式'))
    .catch((error) => {
      console.error('数据库连接失败，请检查 backend/.env 或改用本地持久化模式:', error.message);
    });
} else {
  console.log('当前使用本地持久化模式，可通过 USE_REAL_DB=true 切换到 MySQL');
}

module.exports = {
  sequelize,
  Sequelize,
  useRealDb,
};
