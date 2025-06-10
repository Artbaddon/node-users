import { connect } from "../config/db/connectMysql.js";
import { encryptPassword } from "../library/appBcrypt.js";
import dotenv from "dotenv";

dotenv.config();

const testData = {
  // User status data
  userStatuses: [
    { name: "active", description: "Active user account" },
    { name: "inactive", description: "Inactive user account" },
    { name: "suspended", description: "Suspended user account" },
  ],

  // Document types
  documentTypes: [
    { name: "CC", description: "Cédula de Ciudadanía" },
    { name: "TI", description: "Tarjeta de Identidad" },
    { name: "P", description: "Pasaporte" },
  ],

  // Modules
  modules: [
    { name: "users", description: "User management module" },
    { name: "profiles", description: "Profile management module" },
    { name: "roles", description: "Role management module" },
    { name: "api", description: "API management module" },
    { name: "system", description: "System administration module" },
  ],

  // Roles
  roles: [
    { name: "Admin", description: "System administrator with full access" },
    { name: "User", description: "Regular user with limited access" },
    { name: "Moderator", description: "Moderator with intermediate access" },
  ],

  // Permissions
  permissions: [
    { name: "users:create", description: "Create users", action: "create" },
    { name: "users:read", description: "Read users", action: "read" },
    { name: "users:update", description: "Update users", action: "update" },
    { name: "users:delete", description: "Delete users", action: "delete" },
    {
      name: "profiles:create",
      description: "Create profiles",
      action: "create",
    },
    { name: "profiles:read", description: "Read profiles", action: "read" },
    {
      name: "profiles:update",
      description: "Update profiles",
      action: "update",
    },
    {
      name: "profiles:delete",
      description: "Delete profiles",
      action: "delete",
    },
    { name: "roles:create", description: "Create roles", action: "create" },
    { name: "roles:read", description: "Read roles", action: "read" },
    { name: "roles:update", description: "Update roles", action: "update" },
    { name: "roles:delete", description: "Delete roles", action: "delete" },
  ],

  // Web users
  webUsers: [
    {
      username: "admin_web",
      email: "admin@example.com",
      password: "admin123456",
      status_id: 1,
    },
    {
      username: "user_web",
      email: "user@example.com",
      password: "user123456",
      status_id: 1,
    },
    {
      username: "moderator_web",
      email: "moderator@example.com",
      password: "moderator123456",
      status_id: 1,
    },
  ],

  // API users
  apiUsers: [
    {
      username: "admin_api",
      email: "admin.api@example.com",
      password: "adminapi123456",
      description: "Admin API user for system management",
      status_id: 1,
    },
    {
      username: "client_api",
      email: "client.api@example.com",
      password: "clientapi123456",
      description: "Client API user for external integrations",
      status_id: 1,
    },
    {
      username: "service_api",
      email: "service.api@example.com",
      password: "serviceapi123456",
      description: "Service API user for microservices",
      status_id: 1,
    },
  ],

  // Profiles (will be created after web users)
  profiles: [
    {
      first_name: "Admin",
      last_name: "User",
      address: "123 Admin Street, Admin City",
      phone: "+57 300 123 4567",
      document_type_id: 1,
      document_number: "12345678",
      birth_date: "1990-01-01",
    },
    {
      first_name: "Regular",
      last_name: "User",
      address: "456 User Avenue, User Town",
      phone: "+57 300 987 6543",
      document_type_id: 1,
      document_number: "87654321",
      birth_date: "1995-06-15",
    },
    {
      first_name: "Moderator",
      last_name: "User",
      address: "789 Mod Boulevard, Mod City",
      phone: "+57 300 555 1234",
      document_type_id: 2,
      document_number: "TI98765432",
      birth_date: "1992-12-25",
    },
  ],
};

async function createTestData() {
  try {
    console.log("🚀 Starting test data creation...");

    // 1. Create user statuses
    console.log("📝 Creating user statuses...");
    for (const status of testData.userStatuses) {
      const [result] = await connect.query(
        "INSERT INTO user_status (name, description) VALUES (?, ?)",
        [status.name, status.description]
      );
      console.log(
        `✅ Created user status: ${status.name} (ID: ${result.insertId})`
      );
    }

    // 2. Create document types
    console.log("📝 Creating document types...");
    for (const docType of testData.documentTypes) {
      const [result] = await connect.query(
        "INSERT INTO document_type (name, description) VALUES (?, ?)",
        [docType.name, docType.description]
      );
      console.log(
        `✅ Created document type: ${docType.name} (ID: ${result.insertId})`
      );
    }

    // 3. Create modules
    console.log("📝 Creating modules...");
    for (const module of testData.modules) {
      const [result] = await connect.query(
        "INSERT INTO modules (name, description) VALUES (?, ?)",
        [module.name, module.description]
      );
      console.log(`✅ Created module: ${module.name} (ID: ${result.insertId})`);
    }

    // 4. Create roles
    console.log("📝 Creating roles...");
    for (const role of testData.roles) {
      const [result] = await connect.query(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [role.name, role.description]
      );
      console.log(`✅ Created role: ${role.name} (ID: ${result.insertId})`);
    }

    // 5. Create permissions
    console.log("📝 Creating permissions...");
    for (const permission of testData.permissions) {
      const [result] = await connect.query(
        "INSERT INTO permissions (name, description, action) VALUES (?, ?, ?)",
        [permission.name, permission.description, permission.action]
      );
      console.log(
        `✅ Created permission: ${permission.name} (ID: ${result.insertId})`
      );
    }

    // 6. Create role-permission relationships (Admin gets all permissions)
    console.log("📝 Creating role-permission relationships...");
    // Admin role (ID: 1) gets all permissions
    const [permissions] = await connect.query("SELECT id FROM permissions");
    for (const permission of permissions) {
      await connect.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [1, permission.id]
      );
    }
    console.log(`✅ Assigned all permissions to Admin role`);

    // User role (ID: 2) gets read permissions
    const [readPermissions] = await connect.query(
      'SELECT id FROM permissions WHERE action = "read"'
    );
    for (const permission of readPermissions) {
      await connect.query(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [2, permission.id]
      );
    }
    console.log(`✅ Assigned read permissions to User role`);

    // 7. Create web users
    console.log("📝 Creating web users...");
    const webUserIds = [];
    for (const user of testData.webUsers) {
      const hashedPassword = await encryptPassword(user.password);
      const [result] = await connect.query(
        "INSERT INTO web_users (username, email, password_hash, status_id) VALUES (?, ?, ?, ?)",
        [user.username, user.email, hashedPassword, user.status_id]
      );
      webUserIds.push(result.insertId);
      console.log(
        `✅ Created web user: ${user.username} (ID: ${result.insertId})`
      );
    }

    // 8. Create profiles for web users
    console.log("📝 Creating profiles...");
    for (let i = 0; i < testData.profiles.length; i++) {
      const profile = testData.profiles[i];
      const [result] = await connect.query(
        "INSERT INTO profiles (web_user_id, first_name, last_name, address, phone, document_type_id, document_number, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          webUserIds[i],
          profile.first_name,
          profile.last_name,
          profile.address,
          profile.phone,
          profile.document_type_id,
          profile.document_number,
          profile.birth_date,
        ]
      );
      console.log(
        `✅ Created profile for ${profile.first_name} ${profile.last_name} (ID: ${result.insertId})`
      );
    }

    // 9. Assign roles to web users
    console.log("📝 Assigning roles to web users...");
    // Admin user gets Admin role
    await connect.query(
      "INSERT INTO web_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [webUserIds[0], 1, webUserIds[0]]
    );
    console.log(`✅ Assigned Admin role to admin_web user`);

    // Regular user gets User role
    await connect.query(
      "INSERT INTO web_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [webUserIds[1], 2, webUserIds[0]]
    );
    console.log(`✅ Assigned User role to user_web user`);

    // Moderator gets Moderator role
    await connect.query(
      "INSERT INTO web_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [webUserIds[2], 3, webUserIds[0]]
    );
    console.log(`✅ Assigned Moderator role to moderator_web user`);

    // 10. Create API users
    console.log("📝 Creating API users...");
    const apiUserIds = [];
    for (const user of testData.apiUsers) {
      const hashedPassword = await encryptPassword(user.password);
      const [result] = await connect.query(
        "INSERT INTO api_users (username, email, password_hash, description, status_id) VALUES (?, ?, ?, ?, ?)",
        [
          user.username,
          user.email,
          hashedPassword,
          user.description,
          user.status_id,
        ]
      );
      apiUserIds.push(result.insertId);
      console.log(
        `✅ Created API user: ${user.username} (ID: ${result.insertId})`
      );
    }

    // 11. Assign roles to API users
    console.log("📝 Assigning roles to API users...");
    // Admin API user gets Admin role
    await connect.query(
      "INSERT INTO api_user_roles (api_user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [apiUserIds[0], 1, webUserIds[0]]
    );
    console.log(`✅ Assigned Admin role to admin_api user`);

    // Client API user gets User role
    await connect.query(
      "INSERT INTO api_user_roles (api_user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [apiUserIds[1], 2, webUserIds[0]]
    );
    console.log(`✅ Assigned User role to client_api user`);

    // Service API user gets User role
    await connect.query(
      "INSERT INTO api_user_roles (api_user_id, role_id, assigned_by) VALUES (?, ?, ?)",
      [apiUserIds[2], 2, webUserIds[0]]
    );
    console.log(`✅ Assigned User role to service_api user`);

    console.log("");
    console.log("🎉 Test data creation completed successfully!");
    console.log("");
    console.log("📋 Summary of created test data:");
    console.log(`   • ${testData.userStatuses.length} user statuses`);
    console.log(`   • ${testData.documentTypes.length} document types`);
    console.log(`   • ${testData.modules.length} modules`);
    console.log(`   • ${testData.roles.length} roles`);
    console.log(`   • ${testData.permissions.length} permissions`);
    console.log(`   • ${testData.webUsers.length} web users with profiles`);
    console.log(`   • ${testData.apiUsers.length} API users`);
    console.log("");
    console.log("🔐 Test Credentials:");
    console.log("Web Users:");
    testData.webUsers.forEach((user) => {
      console.log(`   • ${user.username} / ${user.password} (${user.email})`);
    });
    console.log("API Users:");
    testData.apiUsers.forEach((user) => {
      console.log(`   • ${user.username} / ${user.password} (${user.email})`);
    });
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestData()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { createTestData };
