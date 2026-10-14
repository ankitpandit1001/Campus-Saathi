import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/utils/prisma.js';

describe('CampusFix SaaS Multi-Tenant Isolation Test Suite', () => {
  let superAdminToken = '';
  let northstarAdminToken = '';
  let greenfieldAdminToken = '';
  let northstarStaffToken = '';
  let rahulToken = ''; // Multi-membership (Northstar + Greenfield)
  let priyaToken = ''; // Northstar only

  let northstar = null;
  let greenfield = null;
  let heritage = null;

  let northstarComplaint = null;
  let greenfieldComplaint = null;
  let greenfieldCategory = null;

  beforeAll(async () => {
    // 1. Fetch seeded institutions
    northstar = await prisma.institution.findUnique({ where: { code: 'NSTAR' } });
    greenfield = await prisma.institution.findUnique({ where: { code: 'GREEN' } });
    heritage = await prisma.institution.findUnique({ where: { code: 'HVA' } });

    expect(northstar).toBeDefined();
    expect(greenfield).toBeDefined();
    expect(heritage).toBeDefined();

    // 2. Fetch seeded complaints
    northstarComplaint = await prisma.complaint.findFirst({
      where: { institutionId: northstar.id },
    });
    greenfieldComplaint = await prisma.complaint.findFirst({
      where: { institutionId: greenfield.id },
    });
    greenfieldCategory = await prisma.complaintCategory.findFirst({
      where: { institutionId: greenfield.id },
    });

    expect(northstarComplaint).toBeDefined();
    expect(greenfieldComplaint).toBeDefined();

    // 3. Login Super Admin
    const saRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@campusfix.io', password: 'SuperAdmin@123' });
    expect(saRes.status).toBe(200);
    superAdminToken = saRes.body.data.token;

    // 4. Login Northstar Admin
    const naRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@campusfix.edu', password: 'Admin@123', institutionId: northstar.id });
    expect(naRes.status).toBe(200);
    northstarAdminToken = naRes.body.data.token;

    // 5. Login Greenfield Admin
    const gaRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.greenfield@campusfix.io', password: 'Admin@123', institutionId: greenfield.id });
    expect(gaRes.status).toBe(200);
    greenfieldAdminToken = gaRes.body.data.token;

    // 6. Login Northstar Staff (Anita)
    const nsRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anita.network@campusfix.edu', password: 'Staff@123', institutionId: northstar.id });
    expect(nsRes.status).toBe(200);
    northstarStaffToken = nsRes.body.data.token;

    // 7. Login Rahul (Multi-membership)
    const rahulRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.sharma@campusfix.edu', password: 'Student@123', institutionId: northstar.id });
    expect(rahulRes.status).toBe(200);
    rahulToken = rahulRes.body.data.token;

    // 8. Login Priya (Northstar Student only)
    const priyaRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.patel@campusfix.edu', password: 'Student@123', institutionId: northstar.id });
    expect(priyaRes.status).toBe(200);
    priyaToken = priyaRes.body.data.token;
  });

  // TEST 1: User from Institution A cannot retrieve Institution B's complaint
  it('Rule 1: User from Institution A cannot retrieve Institution B complaint', async () => {
    // Priya from Northstar tries to fetch Greenfield complaint with Northstar context -> 404 (not found in Northstar)
    const res1 = await request(app)
      .get(`/api/complaints/${greenfieldComplaint.id}`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', northstar.id);

    expect(res1.status).toBe(404);

    // Priya tries to claim Greenfield context -> 403 (no membership in Greenfield)
    const res2 = await request(app)
      .get(`/api/complaints/${greenfieldComplaint.id}`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', greenfield.id);

    expect(res2.status).toBe(403);
  });

  // TEST 2: User from Institution A cannot update or delete Institution B's complaint
  it('Rule 2: User from Institution A cannot update or change status of Institution B complaint', async () => {
    const res = await request(app)
      .patch(`/api/complaints/${greenfieldComplaint.id}/status`)
      .set('Authorization', `Bearer ${northstarAdminToken}`)
      .set('X-Institution-Id', northstar.id)
      .send({ status: 'RESOLVED', notes: 'Unauthorized cross-tenant attempt' });

    expect([403, 404]).toContain(res.status);
  });

  // TEST 3: User cannot add comment or attachment to another institution's complaint
  it('Rule 3: User cannot add comments to another institution complaint', async () => {
    const res = await request(app)
      .post(`/api/complaints/${greenfieldComplaint.id}/comments`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', northstar.id)
      .send({ content: 'Cross-tenant malicious comment' });

    expect([403, 404]).toContain(res.status);
  });

  // TEST 4: Staff member cannot access complaints outside permitted institution
  it('Rule 4: Staff member cannot access complaints outside their institution', async () => {
    const res = await request(app)
      .get('/api/staff/complaints')
      .set('Authorization', `Bearer ${northstarStaffToken}`)
      .set('X-Institution-Id', greenfield.id);

    expect(res.status).toBe(403);
  });

  // TEST 5: Institution Admin cannot manage members or settings in another institution
  it('Rule 5: Institution Admin cannot access or manage another institution members or settings', async () => {
    // Northstar Admin attempts to list Greenfield members
    const res1 = await request(app)
      .get(`/api/institutions/${greenfield.id}/members`)
      .set('Authorization', `Bearer ${northstarAdminToken}`)
      .set('X-Institution-Id', greenfield.id);

    expect(res1.status).toBe(403);

    // Northstar Admin attempts to update Greenfield settings
    const res2 = await request(app)
      .patch(`/api/institutions/${greenfield.id}/settings`)
      .set('Authorization', `Bearer ${northstarAdminToken}`)
      .set('X-Institution-Id', greenfield.id)
      .send({ allowSelfRegistration: false });

    expect(res2.status).toBe(403);
  });

  // TEST 6: Suspended institution cannot continue normal institution operations
  it('Rule 6: Suspended institution blocks complaint creation and operational actions', async () => {
    // Heritage Valley Academy is SUSPENDED in seed
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', heritage.id);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('SUSPENDED');
  });

  // TEST 7: Changing an institution ID in the URL or request body does not bypass authorization
  it('Rule 7: Changing institution ID in header or URL cannot bypass tenant validation', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', fakeId);

    expect(res.status).toBe(404);
  });

  // TEST 8: A user with multiple memberships accesses only permitted resources per active institution
  it('Rule 8: Multi-membership user accesses resources matching their active institution', async () => {
    // 8A. Rahul operates in Northstar context -> can view Northstar complaint
    const resNorthstar = await request(app)
      .get(`/api/complaints/${northstarComplaint.id}`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .set('X-Institution-Id', northstar.id);

    expect(resNorthstar.status).toBe(200);
    expect(resNorthstar.body.data.complaint.institutionId).toBe(northstar.id);

    // 8B. Rahul switches to Greenfield context via switch-institution endpoint
    const switchRes = await request(app)
      .post('/api/auth/switch-institution')
      .set('Authorization', `Bearer ${rahulToken}`)
      .send({ institutionId: greenfield.id });

    expect(switchRes.status).toBe(200);
    expect(switchRes.body.data.activeInstitution.id).toBe(greenfield.id);

    // 8C. In Greenfield context, Northstar complaint is no longer in scope (404)
    const resCross = await request(app)
      .get(`/api/complaints/${northstarComplaint.id}`)
      .set('Authorization', `Bearer ${rahulToken}`)
      .set('X-Institution-Id', greenfield.id);

    expect(resCross.status).toBe(404);
  });

  // TEST 9: Revoked membership blocks subsequent access
  it('Rule 9: Revoked membership immediately terminates tenant access', async () => {
    // Create temporary student user & active membership in Northstar
    const tempEmail = `revoked.test.${Date.now()}@campusfix.edu`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: tempEmail,
        password: 'Password@123',
        name: 'Revoke Test Student',
        institutionId: northstar.id,
      });

    expect(regRes.status).toBe(201);
    const tempToken = regRes.body.data.token;
    const tempUserId = regRes.body.data.user.id;

    // Verify access works while ACTIVE
    const check1 = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${tempToken}`)
      .set('X-Institution-Id', northstar.id);

    expect(check1.status).toBe(200);

    // Now Northstar Admin revokes the membership
    const membership = await prisma.membership.findFirst({
      where: { userId: tempUserId, institutionId: northstar.id },
    });

    await request(app)
      .patch(`/api/institutions/${northstar.id}/members/${membership.id}/status`)
      .set('Authorization', `Bearer ${northstarAdminToken}`)
      .set('X-Institution-Id', northstar.id)
      .send({ status: 'REVOKED' });

    // Verify subsequent access is BLOCKED (403)
    const check2 = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${tempToken}`)
      .set('X-Institution-Id', northstar.id);

    expect(check2.status).toBe(403);
    expect(check2.body.message).toContain('Access denied');
  });

  // TEST 10: Cross-tenant references cannot be forged by ID tampering
  it('Rule 10: Cross-tenant foreign keys (category from Inst B in Inst A) are rejected', async () => {
    // Attempt to lodge complaint in Northstar using Greenfield Category ID
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${priyaToken}`)
      .set('X-Institution-Id', northstar.id)
      .send({
        title: 'Tampered Foreign Key Test',
        description: 'Trying to inject categoryId from Greenfield into Northstar complaint',
        categoryId: greenfieldCategory.id,
        location: 'Lab 1',
        priority: 'MEDIUM',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Selected category does not exist in this institution');
  });

  // TEST 11: Platform Super Admin functionality
  it('Platform Super Admin can inspect metrics and manage institution status', async () => {
    // Metrics
    const metricsRes = await request(app)
      .get('/api/platform/metrics')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.data.metrics.totalInstitutions).toBeGreaterThanOrEqual(3);

    // Register a new institution (created in PENDING state)
    const newInstRes = await request(app)
      .post('/api/institutions/register')
      .send({
        name: `Test Academy ${Date.now()}`,
        code: `TAC${Math.floor(Math.random() * 899 + 100)}`,
        type: 'COLLEGE',
        state: 'Karnataka',
        city: 'Mysuru',
        contactEmail: `admin.tac.${Date.now()}@campusfix.io`,
        adminName: 'TAC Admin',
        adminEmail: `tac.dean.${Date.now()}@campusfix.io`,
        adminPassword: 'Password@123',
      });

    expect(newInstRes.status).toBe(201);
    const createdInst = newInstRes.body.data.institution;
    expect(createdInst.status).toBe('PENDING');

    // List pending institutions
    const instRes = await request(app)
      .get('/api/platform/institutions?status=PENDING')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(instRes.status).toBe(200);
    const foundPending = instRes.body.data.institutions.find((i) => i.id === createdInst.id);
    expect(foundPending).toBeDefined();

    // Approve the new institution
    const approveRes = await request(app)
      .patch(`/api/platform/institutions/${createdInst.id}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'ACTIVE' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.institution.status).toBe('ACTIVE');
  });
});
