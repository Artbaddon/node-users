import { connect } from "../config/db/connectMysql.js";

// Let's check the database for real admin users
export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId; // ✅ Use req.user.userId

    console.log("Checking if user", userId, "has admin role in database");

    const query = `
      SELECT r.name as role_name 
      FROM web_users u
      JOIN web_user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ? AND r.name = 'Admin'
    `;

    const [result] = await connect.query(query, [userId]);

    if (result.length > 0) {
      console.log("✅ User has admin role, allowing access");
      next();
    } else {
      console.log("❌ User does not have admin role, blocking access");
      res.status(403).json({ error: "Admin access required" });
    }
  } catch (error) {
    console.log("❌ Database error:", error.message);
    res.status(500).json({ error: "Permission check failed" });
  }
};

// Check for any specific permission
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId; // ✅ Use req.user.userId
      
      console.log(`Checking if user ${userId} has permission: ${requiredPermission}`);
      
      const query = `
        SELECT p.name as permission_name
        FROM web_users wu
        JOIN web_user_roles wur ON wu.id = wur.user_id
        JOIN roles r ON wur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE wu.id = ? AND p.name = ? AND r.is_active = TRUE AND p.is_active = TRUE
      `;
      
      const [result] = await connect.query(query, [userId, requiredPermission]);
      
      if (result.length > 0) {
        next();
      } else {
        console.log(`❌ User lacks permission: ${requiredPermission}`);
        res.status(403).json({ error: `Permission required: ${requiredPermission}` });
      }
    } catch (error) {
      console.log("❌ Permission check error:", error.message);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};

