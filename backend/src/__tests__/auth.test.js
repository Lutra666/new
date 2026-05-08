const path = require('path');
const fs = require('fs');
const os = require('os');

const TEST_DATA_DIR = path.join(os.tmpdir(), `finance-test-${Date.now()}`);

process.env.NODE_ENV = 'development';
process.env.MOCK_DATA_DIR = TEST_DATA_DIR;
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.AUTO_BACKUP_ENABLED = 'false';
process.env.DEFAULT_ADMIN_PASSWORD = 'test123';

const request = require('supertest');
const app = require('../server');

afterAll(() => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/login', () => {
  it('rejects empty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: '' });
    expect(res.status).toBe(400);
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('用户名或密码错误');
  });

  it('logs in with default admin account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'test123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.role).toBe('admin');
  });
});

describe('GET /api/auth/profile', () => {
  it('rejects without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'test123' });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin');
  });
});

describe('POST /api/auth/login — lockout', () => {
  it('locks account after too many failed attempts', async () => {
    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts - 1; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' });
    }
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(423);
    expect(res.body.error).toContain('锁定');
  });
});
