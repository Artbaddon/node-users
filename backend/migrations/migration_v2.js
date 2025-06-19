import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { connect } from "../config/db/connectMysql.js";
import { encryptPassword } from "../library/appBcrypt.js";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "crud_node",
  port: process.env.DB_PORT,
  multipleStatements: true,
};

const sqlStatements = [
  `DROP DATABASE IF EXISTS ${dbConfig.database};`,
  `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  `USE ${dbConfig.database};`,

  `CREATE TABLE user_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE document_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'CC, TI, P',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'users, profiles, roles, api, system',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Admin, user',
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,
  `CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT 'create, read, update, delete',
    name VARCHAR(100) NOT NULL COMMENT 'Auto-generated: module_name:action',
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE KEY uk_module_action (module_id, action),
    INDEX idx_permission_action (action),
    INDEX idx_permission_module (module_id)
  ) ENGINE=InnoDB;`,

  `CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_permission_role (role_id),
    INDEX idx_role_permission_permission (permission_id)
  ) ENGINE=InnoDB;`,

  `CREATE TABLE web_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status_id INT NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES user_status(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_web_user_username (username),
    INDEX idx_web_user_email (email)
  ) ENGINE=InnoDB;`,
  `CREATE TABLE api_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    description TEXT,
    status_id INT NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES user_status(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_api_user_username (username),
    INDEX idx_api_user_email (email)
  ) ENGINE=InnoDB;`,

  `CREATE TABLE api_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (api_user_id) REFERENCES api_users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES web_users(id) ON DELETE SET NULL,
  INDEX idx_token (token),
  INDEX idx_token_expires (expires_at),
  INDEX idx_token_active (is_active)
) ENGINE=InnoDB;`,

  `CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    web_user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    document_type_id INT NOT NULL,
    document_number VARCHAR(50) UNIQUE NOT NULL,
    photo_url VARCHAR(255),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (web_user_id) REFERENCES web_users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_type(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB;`,

  `CREATE TABLE web_user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NOT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES web_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_web_user_role (user_id, role_id)
  ) ENGINE=InnoDB;`,

  `CREATE TABLE api_user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NOT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_user_id) REFERENCES api_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES web_users(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_api_user_role (api_user_id, role_id)
  ) ENGINE=InnoDB;`,

  //Creating Stored procedures
  `DROP PROCEDURE IF EXISTS sp_update_profile;`,
  `DROP PROCEDURE IF EXISTS sp_get_rol_permissions;`,
  `DROP PROCEDURE IF EXISTS p_get_all_web_users;`,
  `DROP PROCEDURE IF EXISTS p_get_all_api_users;`,
  `DROP PROCEDURE IF EXISTS p_get_api_users;`,

  `CREATE PROCEDURE sp_update_profile(
    IN p_id INT,
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_address VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_document_type_id INT,
    IN p_document_number VARCHAR(50),
    IN p_photo_url VARCHAR(255),
    IN p_birth_date DATE
  )
  BEGIN
    UPDATE profiles 
    SET first_name = p_first_name,
        last_name = p_last_name,
        address = p_address,
        phone = p_phone,
        document_type_id = p_document_type_id,
        document_number = p_document_number,
        photo_url = p_photo_url,
        birth_date = p_birth_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
  END;`,

  `CREATE PROCEDURE sp_get_role_permissions()
  BEGIN
    SELECT 
    rp.id as role_permission_id,
    r.id as role_id,
    r.name as role_name,
    r.description as role_description,
    p.id as permission_id,
    p.name as permission_name,
    p.action as permission_action,
    rp.created_at as assigned_date
  FROM role_permissions rp
  INNER JOIN roles r ON r.id = rp.role_id
  INNER JOIN permissions p ON p.id = rp.permission_id
  WHERE r.is_active = TRUE AND p.is_active = TRUE
  ORDER BY r.name, p.action;
  END;`,
  `CREATE PROCEDURE sp_get_all_web_users()
  BEGIN 
  SELECT
    wu.id,
    wu.username,
    wu.email,
    wu.last_login,
    wu.created_at,
    us.name as status_name,
    us.description as status_description,
    p.first_name,
    p.last_name,
    p.address,
    p.phone,
    p.document_number,
    p.photo_url,
    dt.name as document_type_name
  FROM web_users wu
  INNER JOIN user_status us ON us.id = wu.status_id
  LEFT JOIN web_user_roles wur ON wu.id = wur.user_id
  LEFT JOIN profiles p ON p.web_user_id = wu.id
  LEFT JOIN document_type dt ON dt.id = p.document_type_id
  ORDER BY wu.created_at DESC;
  END;`,

  `CREATE PROCEDURE sp_get_all_api_users()
    BEGIN 
  SELECT
    au.id,
    au.username,
    au.email,
    au.last_login,
    au.created_at,
    us.name as status_name,
    us.description as status_description
  FROM api_users au
  INNER JOIN user_status us ON us.id = au.status_id
  LEFT JOIN api_user_roles aur ON au.id = aur.api_user_id
  ORDER BY au.created_at DESC;
  END;`,
];

export async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    for (const sql of sqlStatements) {
      try {
        await connection.query(sql);
        console.log("Executed SQL statement successfully");
      } catch (error) {
        console.error("Error executing SQL statement:", error.message);

        throw error;
      }
    }    console.log("✅ Migration completed successfully");

    // Create test data after successful migration
    console.log("🔄 Creating test data...");
    const testDataResult = await createTestData(connection);
    
    if (testDataResult.success) {
      console.log("✅ Test data created successfully");
    } else {
      console.warn("⚠️ Migration completed but test data creation failed:", testDataResult.error);
    }

    return { success: true, testDataCreated: testDataResult.success };
  } catch (error) {
    console.error("Error during migration:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Test data creation function
async function createTestData(connection) {
  try {
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

      // Permissions (will be created based on modules)
      permissionActions: ["create", "read", "update", "delete"]
    };

    // Insert user statuses
    console.log("Creating user statuses...");
    for (const status of testData.userStatuses) {
      await connection.query(
        'INSERT INTO user_status (name, description) VALUES (?, ?)',
        [status.name, status.description]
      );
    }

    // Insert document types
    console.log("Creating document types...");
    for (const docType of testData.documentTypes) {
      await connection.query(
        'INSERT INTO document_type (name, description) VALUES (?, ?)',
        [docType.name, docType.description]
      );
    }

    // Insert modules
    console.log("Creating modules...");
    const moduleIds = {};
    for (const module of testData.modules) {
      const [result] = await connection.query(
        'INSERT INTO modules (name, description) VALUES (?, ?)',
        [module.name, module.description]
      );
      moduleIds[module.name] = result.insertId;
    }

    // Insert roles
    console.log("Creating roles...");
    const roleIds = {};
    for (const role of testData.roles) {
      const [result] = await connection.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
      roleIds[role.name] = result.insertId;
    }

    // Insert permissions for each module-action combination
    console.log("Creating permissions...");
    const permissionIds = {};
    for (const moduleName of Object.keys(moduleIds)) {
      for (const action of testData.permissionActions) {
        const permissionName = `${moduleName}:${action}`;
        const description = `${action.charAt(0).toUpperCase() + action.slice(1)} permission for ${moduleName} module`;
        
        const [result] = await connection.query(
          'INSERT INTO permissions (module_id, action, name, description) VALUES (?, ?, ?, ?)',
          [moduleIds[moduleName], action, permissionName, description]
        );
        permissionIds[permissionName] = result.insertId;
      }
    }

    // Assign all permissions to Admin role
    console.log("Assigning permissions to Admin role...");
    for (const permissionId of Object.values(permissionIds)) {
      await connection.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleIds.Admin, permissionId]
      );
    }

    // Assign basic read permissions to User role
    console.log("Assigning basic permissions to User role...");
    const userPermissions = ['users:read', 'profiles:read', 'profiles:update'];
    for (const permName of userPermissions) {
      if (permissionIds[permName]) {
        await connection.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleIds.User, permissionIds[permName]]
        );
      }
    }

    // Create sample users
    console.log("Creating sample users...");
    
    // Create admin web user
    const adminPasswordHash = await encryptPassword('admin123');
    const [adminUserResult] = await connection.query(
      'INSERT INTO web_users (username, email, password_hash, status_id) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', adminPasswordHash, 1]
    );
    
    // Create admin profile
    await connection.query(
      'INSERT INTO profiles (web_user_id, first_name, last_name, document_type_id, document_number) VALUES (?, ?, ?, ?, ?)',
      [adminUserResult.insertId, 'System', 'Administrator', 1, '00000000']
    );
    
    // Assign admin role to admin user
    await connection.query(
      'INSERT INTO web_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
      [adminUserResult.insertId, roleIds.Admin, adminUserResult.insertId]
    );

    // Create sample API user
    const apiPasswordHash = await encryptPassword('apiuser123');
    const [apiUserResult] = await connection.query(
      'INSERT INTO api_users (username, email, password_hash, description, status_id) VALUES (?, ?, ?, ?, ?)',
      ['apiuser', 'apiuser@example.com', apiPasswordHash, 'Sample API user for testing', 1]
    );
    
    // Assign user role to API user
    await connection.query(
      'INSERT INTO api_user_roles (api_user_id, role_id, assigned_by) VALUES (?, ?, ?)',
      [apiUserResult.insertId, roleIds.User, adminUserResult.insertId]
    );

    console.log("📋 Test data creation summary:");
    console.log(`   - User statuses: ${testData.userStatuses.length}`);
    console.log(`   - Document types: ${testData.documentTypes.length}`);
    console.log(`   - Modules: ${testData.modules.length}`);
    console.log(`   - Roles: ${testData.roles.length}`);
    console.log(`   - Permissions: ${Object.keys(permissionIds).length}`);
    console.log(`   - Sample users: 2 (1 web admin, 1 API user)`);
    console.log("");
    console.log("🔑 Default login credentials:");
    console.log("   Web Admin: admin / admin123");
    console.log("   API User: apiuser / apiuser123");

    return { success: true };
  } catch (error) {
    console.error("Error creating test data:", error);
    return { success: false, error: error.message };
  }
}

// Execute migration if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then((result) => {
      if (result.success) {
        console.log("🎉 Migration and test data setup completed successfully!");
        process.exit(0);
      } else {
        console.error("❌ Migration failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Migration error:", error);
      process.exit(1);
    });
}
