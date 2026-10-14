import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing demo data...');
  // Delete child records first to respect foreign keys
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.complaintAttachment.deleteMany({});
  await prisma.complaintComment.deleteMany({});
  await prisma.complaintStatusHistory.deleteMany({});
  await prisma.complaintAssignment.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.serviceLevelPolicy.deleteMany({});
  await prisma.institutionSettings.deleteMany({});
  await prisma.complaintCategory.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.institutionJoinRequest.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('[Seed] Hashing passwords...');
  const salt = await bcrypt.genSalt(10);
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin@123', salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const staffPasswordHash = await bcrypt.hash('Staff@123', salt);
  const studentPasswordHash = await bcrypt.hash('Student@123', salt);

  console.log('[Seed] Creating Platform Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@campusfix.io',
      passwordHash: superAdminPasswordHash,
      name: 'CampusFix Platform Super Admin',
      phone: '+91 99000 00000',
      isSuperAdmin: true,
      isActive: true,
    },
  });

  console.log('[Seed] Creating Institutions...');
  // 1. Northstar Engineering College (Active College)
  const northstar = await prisma.institution.create({
    data: {
      slug: 'northstar-engineering-college',
      code: 'NSTAR',
      name: 'Northstar Engineering College',
      type: 'COLLEGE',
      state: 'Maharashtra',
      city: 'Pune',
      address: 'Plot 42, Knowledge Park, Hinjewadi Phase 2',
      contactEmail: 'contact@northstar.edu',
      contactPhone: '+91 20 2293 4000',
      website: 'https://northstar.edu.demo',
      status: 'ACTIVE',
      isDemo: true,
    },
  });

  // 2. Greenfield University (Active University)
  const greenfield = await prisma.institution.create({
    data: {
      slug: 'greenfield-university',
      code: 'GREEN',
      name: 'Greenfield University',
      type: 'UNIVERSITY',
      state: 'Karnataka',
      city: 'Bengaluru',
      address: 'Academic Ridge, Electronic City Phase 1',
      contactEmail: 'info@greenfield.ac.demo',
      contactPhone: '+91 80 4122 8000',
      website: 'https://greenfield.ac.demo',
      status: 'ACTIVE',
      isDemo: true,
    },
  });

  // 3. Sunrise Public School (Active School)
  const sunrise = await prisma.institution.create({
    data: {
      slug: 'sunrise-public-school',
      code: 'SUN',
      name: 'Sunrise Public School',
      type: 'SCHOOL',
      state: 'Delhi',
      city: 'New Delhi',
      address: 'Sector 14, Rohini Educational Enclave',
      contactEmail: 'principal@sunriseschool.demo',
      contactPhone: '+91 11 2786 5000',
      website: 'https://sunriseschool.demo',
      status: 'ACTIVE',
      isDemo: true,
    },
  });

  // 4. Apex Institute of Technology (Pending Approval for Super Admin Demo)
  const apex = await prisma.institution.create({
    data: {
      slug: 'apex-institute-of-technology',
      code: 'APEX',
      name: 'Apex Institute of Technology',
      type: 'COLLEGE',
      state: 'Telangana',
      city: 'Hyderabad',
      address: 'Gachibowli Tech Corridor',
      contactEmail: 'registrar@apextech.demo',
      contactPhone: '+91 40 6688 9000',
      website: 'https://apextech.demo',
      status: 'PENDING',
      isDemo: true,
    },
  });

  // 5. Heritage Valley Academy (Suspended for Testing)
  const heritage = await prisma.institution.create({
    data: {
      slug: 'heritage-valley-academy',
      code: 'HVA',
      name: 'Heritage Valley Academy',
      type: 'SCHOOL',
      state: 'Uttarakhand',
      city: 'Dehradun',
      address: 'Mussoorie Bypass Road',
      contactEmail: 'admin@heritagevalley.demo',
      status: 'SUSPENDED',
      rejectionReason: 'Annual compliance and fire safety audit pending verification.',
      isDemo: true,
    },
  });

  console.log('[Seed] Configuring Institution Settings & SLAs...');
  for (const inst of [northstar, greenfield, sunrise, apex, heritage]) {
    await prisma.institutionSettings.create({
      data: {
        institutionId: inst.id,
        allowSelfRegistration: true,
        requireEmailDomain: false,
        defaultSlaHours: 48,
        slaEscalationEnabled: true,
      },
    });

    await prisma.serviceLevelPolicy.createMany({
      data: [
        { institutionId: inst.id, priority: 'LOW', targetResponseHours: 48, targetResolutionHours: 120 },
        { institutionId: inst.id, priority: 'MEDIUM', targetResponseHours: 24, targetResolutionHours: 72 },
        { institutionId: inst.id, priority: 'HIGH', targetResponseHours: 8, targetResolutionHours: 36 },
        { institutionId: inst.id, priority: 'URGENT', targetResponseHours: 2, targetResolutionHours: 12 },
      ],
    });
  }

  console.log('[Seed] Creating Departments...');
  // Northstar Departments
  const deptNorthstarCS = await prisma.department.create({
    data: { institutionId: northstar.id, name: 'Computer Science & Engineering', code: 'CSE' },
  });
  const deptNorthstarEE = await prisma.department.create({
    data: { institutionId: northstar.id, name: 'Electrical & Electronics', code: 'EEE' },
  });
  const deptNorthstarCivil = await prisma.department.create({
    data: { institutionId: northstar.id, name: 'Civil & Campus Infrastructure', code: 'CIVIL' },
  });

  // Greenfield Departments
  const deptGreenfieldIT = await prisma.department.create({
    data: { institutionId: greenfield.id, name: 'Information Technology Services', code: 'ITS' },
  });
  const deptGreenfieldEstate = await prisma.department.create({
    data: { institutionId: greenfield.id, name: 'Campus Estate & Hostels', code: 'ESTATE' },
  });

  console.log('[Seed] Creating Complaint Categories...');
  // Northstar Categories
  const catNorthstarWifi = await prisma.complaintCategory.create({
    data: {
      institutionId: northstar.id,
      name: 'Wi-Fi & Internet Connectivity',
      description: 'Hostel, classroom, and campus Wi-Fi access points, router faults, slow speeds',
      slaHours: 24,
    },
  });
  const catNorthstarElectric = await prisma.complaintCategory.create({
    data: {
      institutionId: northstar.id,
      name: 'Electricity & Power Supply',
      description: 'Power cut, sparking switchboards, lab equipment power supply, street lighting',
      slaHours: 24,
    },
  });
  const catNorthstarWater = await prisma.complaintCategory.create({
    data: {
      institutionId: northstar.id,
      name: 'Water Supply & Sanitation',
      description: 'Water cooler purification, washroom leakage, pipeline issues, drainage',
      slaHours: 48,
    },
  });
  const catNorthstarLab = await prisma.complaintCategory.create({
    data: {
      institutionId: northstar.id,
      name: 'Classroom & Laboratory Infrastructure',
      description: 'Projector failures, AC cooling, lab bench damage, broken desks',
      slaHours: 72,
    },
  });

  // Greenfield Categories
  const catGreenfieldWifi = await prisma.complaintCategory.create({
    data: {
      institutionId: greenfield.id,
      name: 'Campus Fiber & Wireless Network',
      description: 'Dormitory and library Gigabit optical network connections',
      slaHours: 24,
    },
  });
  const catGreenfieldHostel = await prisma.complaintCategory.create({
    data: {
      institutionId: greenfield.id,
      name: 'Hostel Maintenance & Security',
      description: 'Room furnishings, geyser repairs, door locks, corridor lighting',
      slaHours: 48,
    },
  });

  // Sunrise Categories
  const catSunriseClass = await prisma.complaintCategory.create({
    data: {
      institutionId: sunrise.id,
      name: 'Smart Classroom & Whiteboards',
      description: 'Digital display panels, sound systems, classroom seating',
      slaHours: 24,
    },
  });

  console.log('[Seed] Creating Users & Memberships...');

  // User 1: Dr. Vikram Malhotra (Northstar Admin)
  const userAdminNorthstar = await prisma.user.create({
    data: {
      email: 'admin@campusfix.edu',
      passwordHash: adminPasswordHash,
      name: 'Dr. Vikram Malhotra',
      phone: '+91 98000 11111',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userAdminNorthstar.id,
      institutionId: northstar.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      staffTitle: 'Dean of Student Affairs & Administration',
    },
  });

  // User 2: Anita Deshmukh (Northstar Staff - IT)
  const userStaffAnita = await prisma.user.create({
    data: {
      email: 'anita.network@campusfix.edu',
      passwordHash: staffPasswordHash,
      name: 'Anita Deshmukh',
      phone: '+91 98000 44444',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStaffAnita.id,
      institutionId: northstar.id,
      role: 'STAFF',
      status: 'ACTIVE',
      departmentId: deptNorthstarCS.id,
      staffTitle: 'Lead Network Engineer',
    },
  });

  // User 3: Suresh Patil (Northstar Staff - Water/Plumbing)
  const userStaffSuresh = await prisma.user.create({
    data: {
      email: 'suresh.plumb@campusfix.edu',
      passwordHash: staffPasswordHash,
      name: 'Suresh Patil',
      phone: '+91 98000 33333',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStaffSuresh.id,
      institutionId: northstar.id,
      role: 'STAFF',
      status: 'ACTIVE',
      departmentId: deptNorthstarCivil.id,
      staffTitle: 'Head Sanitation Supervisor',
    },
  });

  // User 4: Rahul Sharma (Student at Northstar AND Student at Greenfield - Multi-Tenant Demonstration!)
  const userStudentRahul = await prisma.user.create({
    data: {
      email: 'rahul.sharma@campusfix.edu',
      passwordHash: studentPasswordHash,
      name: 'Rahul Sharma',
      phone: '+91 98000 66666',
      isActive: true,
    },
  });
  // Primary membership: Northstar College
  await prisma.membership.create({
    data: {
      userId: userStudentRahul.id,
      institutionId: northstar.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      departmentId: deptNorthstarCS.id,
      studentId: 'NSTAR-2023-CS-041',
    },
  });
  // Secondary membership: Greenfield University (Allows testing Institution Switcher!)
  await prisma.membership.create({
    data: {
      userId: userStudentRahul.id,
      institutionId: greenfield.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      departmentId: deptGreenfieldIT.id,
      studentId: 'GU-EXT-2024-912',
    },
  });

  // User 5: Priya Patel (Student at Northstar)
  const userStudentPriya = await prisma.user.create({
    data: {
      email: 'priya.patel@campusfix.edu',
      passwordHash: studentPasswordHash,
      name: 'Priya Patel',
      phone: '+91 98000 77777',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStudentPriya.id,
      institutionId: northstar.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: 'NSTAR-2023-ME-019',
    },
  });

  // User 6: Prof. S. Narayanan (Greenfield Admin)
  const userAdminGreenfield = await prisma.user.create({
    data: {
      email: 'admin.greenfield@campusfix.io',
      passwordHash: adminPasswordHash,
      name: 'Prof. S. Narayanan',
      phone: '+91 98111 22222',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userAdminGreenfield.id,
      institutionId: greenfield.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      staffTitle: 'Registrar & Chief Administrator',
    },
  });

  // User 7: David Kim (Greenfield Staff)
  const userStaffGreenfield = await prisma.user.create({
    data: {
      email: 'staff.greenfield@campusfix.io',
      passwordHash: staffPasswordHash,
      name: 'David Kim',
      phone: '+91 98111 33333',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStaffGreenfield.id,
      institutionId: greenfield.id,
      role: 'STAFF',
      status: 'ACTIVE',
      departmentId: deptGreenfieldIT.id,
      staffTitle: 'Senior Infrastructure Technician',
    },
  });

  // User 8: Aarav Mehta (Greenfield Student)
  const userStudentAarav = await prisma.user.create({
    data: {
      email: 'student.greenfield@campusfix.io',
      passwordHash: studentPasswordHash,
      name: 'Aarav Mehta',
      phone: '+91 98111 44444',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStudentAarav.id,
      institutionId: greenfield.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: 'GU-2022-DS-108',
    },
  });

  // User 9: Mrs. Shobha Roy (Sunrise Principal)
  const userAdminSunrise = await prisma.user.create({
    data: {
      email: 'principal.sunrise@campusfix.io',
      passwordHash: adminPasswordHash,
      name: 'Mrs. Shobha Roy',
      phone: '+91 98222 11111',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userAdminSunrise.id,
      institutionId: sunrise.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      staffTitle: 'Principal',
    },
  });

  // User 10: Kavya Sharma (Sunrise Student)
  const userStudentKavya = await prisma.user.create({
    data: {
      email: 'student.sunrise@campusfix.io',
      passwordHash: studentPasswordHash,
      name: 'Kavya Sharma',
      phone: '+91 98222 22222',
      isActive: true,
    },
  });
  await prisma.membership.create({
    data: {
      userId: userStudentKavya.id,
      institutionId: sunrise.id,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: 'SPS-XII-A-14',
    },
  });

  // User 11: Prospective Applicant with Pending Join Request
  const userApplicant = await prisma.user.create({
    data: {
      email: 'applicant.dev@campusfix.io',
      passwordHash: studentPasswordHash,
      name: 'Karan Malhotra',
      phone: '+91 98333 44444',
      isActive: true,
    },
  });
  await prisma.institutionJoinRequest.create({
    data: {
      institutionId: northstar.id,
      userId: userApplicant.id,
      requestedRole: 'STUDENT',
      studentId: 'NSTAR-2024-ADMIT-99',
      notes: 'First-year B.Tech CSE applicant requesting campus maintenance portal access.',
      status: 'PENDING',
    },
  });

  console.log('[Seed] Creating Complaints & Tenant Histories...');

  // Northstar Complaint 1: In Progress Wi-Fi (Reported by Rahul, Assigned to Anita)
  const cNorthstar1 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CF-NSTAR-2026-0001',
      institutionId: northstar.id,
      title: 'Hostel Block B 3rd Floor Wi-Fi Router Red Light Fault',
      description:
        'The main Cisco router in the corridor shows a flashing red optical warning indicator. No devices can connect.',
      categoryId: catNorthstarWifi.id,
      departmentId: deptNorthstarCS.id,
      location: 'Hostel Block B',
      roomNumber: 'Corridor 3B',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      studentId: userStudentRahul.id,
      assignedStaffId: userStaffAnita.id,
    },
  });
  await prisma.complaintAssignment.create({
    data: {
      complaintId: cNorthstar1.id,
      staffId: userStaffAnita.id,
      assignedById: userAdminNorthstar.id,
      notes: 'Priority dispatch: optical terminal unit requires replacement.',
    },
  });
  await prisma.complaintStatusHistory.createMany({
    data: [
      {
        complaintId: cNorthstar1.id,
        institutionId: northstar.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNDER_REVIEW',
        changedById: userAdminNorthstar.id,
        notes: 'Triaged by Dean of Student Affairs.',
      },
      {
        complaintId: cNorthstar1.id,
        institutionId: northstar.id,
        oldStatus: 'UNDER_REVIEW',
        newStatus: 'IN_PROGRESS',
        changedById: userStaffAnita.id,
        notes: 'On-site inspection initiated; optical patch cord checked.',
      },
    ],
  });
  await prisma.complaintComment.create({
    data: {
      complaintId: cNorthstar1.id,
      institutionId: northstar.id,
      userId: userStaffAnita.id,
      content: 'Replacement Cisco AP requested from inventory. Estimated restoration by 4:00 PM.',
      isInternal: false,
    },
  });

  // Northstar Complaint 2: Resolved Water Issue (Reported by Priya, Assigned to Suresh)
  const cNorthstar2 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CF-NSTAR-2026-0002',
      institutionId: northstar.id,
      title: 'Ground Floor RO Water Cooler Dispenser Tap Broken',
      description:
        'The push tap on the chilled water outlet snapped off, causing continuous water wastage on the cafeteria floor.',
      categoryId: catNorthstarWater.id,
      departmentId: deptNorthstarCivil.id,
      location: 'Central Cafeteria Block',
      roomNumber: 'Dining Hall A',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      studentId: userStudentPriya.id,
      assignedStaffId: userStaffSuresh.id,
      resolutionSummary: 'Fitted heavy-duty brass push valve and sanitized the drainage drip tray.',
      resolvedAt: new Date(Date.now() - 3600000 * 5),
    },
  });
  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: cNorthstar2.id,
      institutionId: northstar.id,
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedById: userStaffSuresh.id,
      notes: 'Replacement brass push valve installed and tested. Zero leakage.',
    },
  });

  // Greenfield Complaint 1: Submitted Network Issue (Reported by Aarav)
  const cGreenfield1 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CF-GREEN-2026-0001',
      institutionId: greenfield.id,
      title: 'Research Library 2nd Floor Gigabit Port Dead',
      description: 'Wall RJ-45 jack port 204 does not negotiate ethernet link with researcher laptops.',
      categoryId: catGreenfieldWifi.id,
      departmentId: deptGreenfieldIT.id,
      location: 'Central Library',
      roomNumber: 'Study Carrel 204',
      priority: 'LOW',
      status: 'SUBMITTED',
      studentId: userStudentAarav.id,
    },
  });

  // Greenfield Complaint 2: In Progress Hostel Issue (Reported by Rahul using his Greenfield membership!)
  const cGreenfield2 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CF-GREEN-2026-0002',
      institutionId: greenfield.id,
      title: 'Graduate Hostel Room 412 Study Lamp Flickering',
      description: 'The overhead fluorescent ballast hums loudly and shuts off after 10 minutes.',
      categoryId: catGreenfieldHostel.id,
      departmentId: deptGreenfieldEstate.id,
      location: 'Graduate Tower West',
      roomNumber: 'Room 412',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      studentId: userStudentRahul.id,
      assignedStaffId: userStaffGreenfield.id,
    },
  });

  // Sunrise Complaint 1: Submitted Smartboard Issue (Reported by Kavya)
  const cSunrise1 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CF-SUN-2026-0001',
      institutionId: sunrise.id,
      title: 'Grade 12 Science Lab Smart Interactive Display Calibration Drift',
      description: 'Stylus touches register 3 inches to the right of cursor on the interactive panel.',
      categoryId: catSunriseClass.id,
      location: 'Senior Wing Block',
      roomNumber: 'Physics Lab 1',
      priority: 'HIGH',
      status: 'SUBMITTED',
      studentId: userStudentKavya.id,
    },
  });

  console.log('[Seed] Generating Audit Logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        institutionId: northstar.id,
        userId: userAdminNorthstar.id,
        action: 'TENANT_INITIALIZED',
        entityType: 'Institution',
        entityId: northstar.id,
        details: 'Northstar Engineering College configured with 3 departments and default SLA policies.',
      },
      {
        institutionId: greenfield.id,
        userId: userAdminGreenfield.id,
        action: 'TENANT_INITIALIZED',
        entityType: 'Institution',
        entityId: greenfield.id,
        details: 'Greenfield University enrolled with optical network categories.',
      },
      {
        institutionId: null,
        userId: superAdmin.id,
        action: 'PLATFORM_SUPER_ADMIN_LOGIN',
        entityType: 'System',
        entityId: superAdmin.id,
        details: 'Platform Super Admin reviewed new institution registration applications.',
      },
    ],
  });

  console.log('[Seed] CampusFix Multi-Institution SaaS Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
