import { PrismaClient, PermissionAction, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// [TH] สร้าง instance ของ PrismaClient
// [EN] Create an instance of PrismaClient
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- 1. Seed Permissions ---
  console.log('Seeding permissions...');
  const subjects = ['Product', 'Order', 'User'];
  const actions: PermissionAction[] = [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
  ];

  for (const subject of subjects) {
    for (const action of actions) {
      const permissionId = `${action}_${subject}`;
      await prisma.permission.upsert({
        where: { action_subject: { action, subject } },
        update: {},
        create: { action, subject },
      });
      console.log(`  Created/Verified permission: ${action} on ${subject}`);
    }
  }

  // --- 2. Seed Users ---
  console.log('\nSeeding users...');
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      password,
      firstName: 'Moderator',
      lastName: 'User',
      role: Role.MODERATOR,
      isVerified: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password,
      firstName: 'Regular',
      lastName: 'User',
      role: Role.USER,
      isVerified: true,
    },
  });
  console.log(`  Created users: Admin, Moderator, Regular User`);

  // --- 3. Seed PermissionOnUsers (Connect Users to Permissions) ---
  console.log('\nAssigning permissions to users...');

  // [TH] ดึง permissions ทั้งหมดมาเก็บใน Map เพื่อให้ค้นหาได้เร็ว
  // [EN] Fetch all permissions and store them in a Map for fast lookups.
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(
    allPermissions.map((p) => [`${p.action}:${p.subject}`, p.id]),
  );

  // [TH] กำหนดสิทธิ์สำหรับ User ปกติ
  // [EN] Define permissions for the regular user.
  const userPermissions = [
    'CREATE:Product',
    'READ:Product',
    'UPDATE:Product',
    'READ:Order', // User สามารถดู Order ของตัวเองได้
  ];

  const userPermissionLinks = userPermissions
    .map((perm) => ({
      userId: regularUser.id,
      permissionId: permissionMap.get(perm)!,
    }))
    .filter((link) => link.permissionId); // [TH] กรองอันที่หาไม่เจอออก / [EN] Filter out any not found.

  // [TH] กำหนดสิทธิ์สำหรับ Moderator (ได้ทุกอย่างยกเว้นจัดการ User)
  // [EN] Define permissions for the moderator (everything except user management).
  const moderatorPermissions = allPermissions
    .filter((p) => p.subject !== 'User')
    .map((p) => ({
      userId: moderator.id,
      permissionId: p.id,
    }));

  // [TH] กำหนดสิทธิ์สำหรับ Admin (ได้ทุกอย่าง)
  // [EN] Define permissions for the admin (gets everything).
  const adminPermissions = allPermissions.map((p) => ({
    userId: admin.id,
    permissionId: p.id,
  }));

  // [TH] ลบข้อมูลเก่าและสร้างใหม่ทั้งหมด
  // [EN] Delete old data and create all new assignments.
  await prisma.permissionOnUser.deleteMany({});
  await prisma.permissionOnUser.createMany({
    data: [
      ...userPermissionLinks,
      ...moderatorPermissions,
      ...adminPermissions,
    ],
  });

  console.log(`  Assigned ${userPermissionLinks.length} permissions to Regular User.`);
  console.log(`  Assigned ${moderatorPermissions.length} permissions to Moderator.`);
  console.log(`  Assigned ${adminPermissions.length} permissions to Admin.`);

  console.log(`\nSeeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // [TH] ปิดการเชื่อมต่อ Prisma Client
    // [EN] Close the Prisma Client connection
    await prisma.$disconnect();
  });
