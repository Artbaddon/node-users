import { connect } from './config/db/connectMysql.js';

async function testRoleQuery() {
  try {
    const userId = 1; // apiuser ID
    
    const rolesQuery = `
      SELECT r.id as role_id, r.name as role_name, r.description as role_description,
             GROUP_CONCAT(DISTINCT p.name) as permissions
      FROM api_user_roles aur
      JOIN roles r ON aur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE aur.api_user_id = ? AND r.is_active = TRUE
      GROUP BY r.id, r.name, r.description
    `;
    
    console.log('Executing role query for user ID:', userId);
    const [roleRows] = await connect.query(rolesQuery, [userId]);
    console.log('Role query results:');
    console.log(roleRows);
    
    // Let's also check what api_user_roles contains
    const [userRoles] = await connect.query('SELECT * FROM api_user_roles WHERE api_user_id = ?', [userId]);
    console.log('\nAPI user roles:');
    console.log(userRoles);
    
    // Check role_permissions table
    const [rolePerms] = await connect.query('SELECT * FROM role_permissions');
    console.log('\nRole permissions:');
    console.log(rolePerms);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testRoleQuery();
