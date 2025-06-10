export const apiConfig = {
  baseUrl: "http://localhost:3000/api_v1", 
  endpoints: {
    login: "/web-users/login",      
    register: "/web-users/register", 
    webUsers: {
      list: "/web-users",           
      create: "/web-users/admin/create", 
      assignRole: (id) => `/web-users/${id}/assign-role`,
      updateRole: (id) => `/web-users/${id}/role`,
      getUserRoles: (id) => `/web-users/${id}/roles`,
      me: "/web-users/me",         
    },
    roles: {
      create: "/roles/create",
      update: (id) => `/roles/${id}`,
      delete: (id) => `/roles/${id}`,
      findById: (id) => `/roles/${id}`,
    },
  },
};