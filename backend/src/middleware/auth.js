const jwt = require('jsonwebtoken');

const jwtIssuer = process.env.JWT_ISSUER || 'finance-system';
const jwtAudience = process.env.JWT_AUDIENCE || 'finance-desktop';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: ['HS256'], issuer: jwtIssuer, audience: jwtAudience },
    (error, user) => {
      if (error) {
        return res.status(403).json({ error: '令牌无效或已过期' });
      }
      req.user = user;
      next();
    }
  );
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '仅管理员可访问该功能' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
