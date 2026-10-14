import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/utils/prisma.js';

describe('CampusFix Comprehensive API Test Suite', () => {
  let adminToken = '';
  let staffToken = '';
  let unassignedStaffToken = '';
  let student1Token = '';
  let student2Token = '';
  let student1Id = '';
  let student2Id = '';
  let staffId = '';
  let categoryId = '';
  let testComplaintId = '';

  beforeAll(async () => {
    // 1. Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@campusfix.edu', password: 'Admin@123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // 2. Login as Assigned Staff (Anita Deshmukh)
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'anita.network@campusfix.edu', password: 'Staff@123' });
    expect(staffRes.status).toBe(200);
    staffToken = staffRes.body.data.token;
    staffId = staffRes.body.data.user.id;

    // 3. Login as Unassigned Staff (Suresh Patil)
    const unassignedRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'suresh.plumb@campusfix.edu', password: 'Staff@123' });
    expect(unassignedRes.status).toBe(200);
    unassignedStaffToken = unassignedRes.body.data.token;

    // 4. Login as Student 1 (Rahul)
    const s1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.sharma@campusfix.edu', password: 'Student@123' });
    expect(s1Res.status).toBe(200);
    student1Token = s1Res.body.data.token;
    student1Id = s1Res.body.data.user.id;

    // 5. Login as Student 2 (Priya)
    const s2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'priya.patel@campusfix.edu', password: 'Student@123' });
    expect(s2Res.status).toBe(200);
    student2Token = s2Res.body.data.token;
    student2Id = s2Res.body.data.user.id;

    // Get an active category ID
    const catRes = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(catRes.status).toBe(200);
    categoryId = catRes.body.data.categories[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication & Registration', () => {
    it('should register a new student account successfully', async () => {
      const uniqueEmail = `test.student.${Date.now()}@campusfix.edu`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'Password@123',
          name: 'Test Student',
          studentId: 'TS2026999',
          department: 'Civil Engineering',
          phone: '+91 99999 88888',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@campusfix.edu', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Role-Based Access Control (RBAC)', () => {
    it('should block a student from accessing the admin dashboard (403)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to access the dashboard metrics (200)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.charts).toBeDefined();
    });
  });

  describe('3. Complaint Creation & Validation', () => {
    it('should validate required fields and reject empty title/description', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Hi', // too short (<5 chars)
          description: 'Short',
          categoryId,
          location: 'Block A',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully create a complaint with CF-YYYY-XXXX number', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Ceiling fan regulator broken in Library Study Room 4',
          description: 'Regulator knob is completely spinning without controlling speed, stays at max speed.',
          categoryId,
          location: 'Central Library, 3rd Floor',
          roomNumber: 'Study Room 4',
          priority: 'MEDIUM',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.complaintNumber).toMatch(/^CF-[A-Z0-9]+-\d{4}-\d{4}$/);
      expect(res.body.data.complaint.status).toBe('SUBMITTED');
      testComplaintId = res.body.data.complaint.id;
    });
  });

  describe('4. Student Data Isolation', () => {
    it('student 2 should NOT be able to view student 1 complaint (403)', async () => {
      const res = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('student 1 CAN view their own complaint (200)', async () => {
      const res = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.id).toBe(testComplaintId);
    });
  });

  describe('5. Administrator Assignment & Status History', () => {
    it('admin assigns complaint to staff member', async () => {
      const res = await request(app)
        .patch(`/api/admin/complaints/${testComplaintId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          staffId,
          notes: 'Please inspect the rotary regulator switch.',
          priority: 'HIGH',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.status).toBe('ASSIGNED');
      expect(res.body.data.complaint.priority).toBe('HIGH');
    });

    it('should maintain immutable status history entries', async () => {
      const historyRes = await request(app)
        .get(`/api/complaints/${testComplaintId}/history`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.history.length).toBeGreaterThanOrEqual(2);
      const statuses = historyRes.body.data.history.map((h) => h.newStatus);
      expect(statuses).toContain('SUBMITTED');
      expect(statuses).toContain('ASSIGNED');
    });
  });

  describe('6. Staff Member Permissions & Workflows', () => {
    it('unassigned staff CANNOT update the complaint status (403)', async () => {
      const res = await request(app)
        .patch(`/api/staff/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${unassignedStaffToken}`)
        .send({
          status: 'IN_PROGRESS',
          notes: 'Trying unauthorized update',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('assigned staff CAN update status to IN_PROGRESS (200)', async () => {
      const res = await request(app)
        .patch(`/api/staff/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'IN_PROGRESS',
          notes: 'Parts collected from electrical store, working on regulator replacement.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.status).toBe('IN_PROGRESS');
    });

    it('assigned staff marks complaint as RESOLVED with resolution summary', async () => {
      const res = await request(app)
        .patch(`/api/staff/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'RESOLVED',
          resolutionSummary: 'Replaced faulty modular rotary regulator with new Anchor Roma 100W unit. Tested smooth 5-step control.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.status).toBe('RESOLVED');
      expect(res.body.data.complaint.resolutionSummary).toBeDefined();
    });
  });

  describe('7. Reopening Complaints Rules', () => {
    it('student CAN reopen a resolved complaint with a reason', async () => {
      const res = await request(app)
        .post(`/api/complaints/${testComplaintId}/reopen`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          reopenReason: 'The knob turns but step 1 and step 2 do not power the fan, only step 3-5 work.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint.status).toBe('REOPENED');
    });
  });

  describe('8. Notifications', () => {
    it('student should receive notification for status updates', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
    });
  });

  describe('9. CSV Export Authorization', () => {
    it('student is denied CSV report export (403)', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
    });

    it('admin is allowed CSV report export (200, text/csv)', async () => {
      const res = await request(app)
        .get('/api/admin/reports/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Complaint ID');
    });
  });
});
