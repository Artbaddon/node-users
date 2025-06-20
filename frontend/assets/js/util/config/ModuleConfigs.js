const ModuleConfigs = {
  documentType: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/documentType",
    formId: "documentTypeForm",
    entityName: "Document Type",
    formFields: [
      { id: "name", required: true },
      { id: "description", required: true },
      { 
        id: "is_active", 
        type: "checkbox",
        required: false,
        defaultValue: 1
      }
    ],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description", sortable: true },
      {
        key: "is_active",
        label: "Status",
        sortable: true,
        render: (data) => {
          const badgeClass = data ? "success" : "secondary";
          const text = data ? "Active" : "Inactive";
          return `<span class="badge bg-${badgeClass}">${text}</span>`;
        },
      },
    ],
    actions: ["view", "edit", "delete"],
  },  webUsers: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/web-users",
    createUrl: "http://localhost:3000/api_v1/web-users/admin/create",
    entityName: "Web User",
    formId: "webUserForm",
    formFields: [
      { id: "username", required: true },
      { id: "email", required: true },
      { id: "password", required: true }, // Required for create mode
      { id: "status_id", required: true },
      { id: "role_id", required: true },
    ],
    // Dynamic dropdowns configuration
    dropdowns: {
      status_id: {
        url: "http://localhost:3000/api_v1/user_status/",
        valueField: "id",
        textField: "name",
        placeholder: "Select Status",
        fallbackData: [
          { id: 1, name: "Active" },
          { id: 2, name: "Inactive" },
          { id: 3, name: "Suspended" },
        ],
      },
      role_id: {
        url: "http://localhost:3000/api_v1/roles/",
        valueField: "id",
        textField: "name",
        placeholder: "Select Role",
        fallbackData: [
          { id: 1, name: "Admin" },
          { id: 2, name: "User" },
          { id: 3, name: "Guest" },
        ],
      },
      document_type_id: {
        url: "http://localhost:3000/api_v1/documentType/",
        valueField: "id",
        textField: "name",
        placeholder: "Select Document Type",
        fallbackData: [
          { id: 1, name: "CC" },
          { id: 2, name: "TI" },
          { id: 3, name: "P" },
        ],
      },
    },    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "username", label: "Username", sortable: true },
      { key: "email", label: "Email", sortable: true },
      {
        key: "role_id",
        label: "Role",
        sortable: true,
        render: (data, type, row) => {
          // Try to get role name, fallback to mapping role IDs
          let roleName =
            row.role_name || row.role || row.role_description || row.roleName;

          // If no role name found, map role_id to role names
          if (!roleName || typeof roleName === "number") {
            const roleId = data || row.role_id || row.role || roleName;

            // Use dynamic mapping from dropdown data if available
            if (window.roleMapping && window.roleMapping[roleId]) {
              roleName = window.roleMapping[roleId];
            } else {
              // Fallback static mapping
              const roleMap = {
                1: "Admin",
                2: "User",
                3: "Guest",
                4: "Manager",
                5: "Supervisor",
              };
              roleName = roleMap[roleId] || `Role ${roleId}`;
            }
          }

          return `<span class="badge bg-info">${roleName}</span>`;
        },
      },
      {
        key: "status_id",
        label: "Status",
        sortable: true,
        render: (data, type, row) => {
          // Try to get status name, fallback to mapping status IDs
          let statusName =
            row.status_name ||
            row.status ||
            row.status_description ||
            row.statusName;
          let statusId = data || row.status_id || row.statusId;

          // If no status name found, map status_id to status names
          if (!statusName || typeof statusName === "number") {
            statusId = statusName || statusId;

            // Use dynamic mapping from dropdown data if available
            if (window.statusMapping && window.statusMapping[statusId]) {
              statusName = window.statusMapping[statusId];
            } else {
              // Fallback static mapping
              const statusMap = {
                1: "Active",
                2: "Inactive",
                3: "Suspended",
              };
              statusName = statusMap[statusId] || `Status ${statusId}`;
            }
          }

          let badgeClass = "secondary";

          // Determine badge class based on status
          if (statusId == 1 || statusName.toLowerCase() === "active") {
            badgeClass = "success";
          } else if (statusId == 2 || statusName.toLowerCase() === "inactive") {
            badgeClass = "secondary";
          } else if (
            statusId == 3 ||
            statusName.toLowerCase() === "suspended"
          ) {
            badgeClass = "warning";
          } else if (statusName.toLowerCase().includes("active")) {
            badgeClass = "success";
          } else if (statusName.toLowerCase().includes("suspend")) {
            badgeClass = "warning";
          }          return `<span class="badge bg-${badgeClass}">${statusName}</span>`;
        },
      },
    ],
    requiredPermissions: ["web_users:read"],
    permissionPattern: "web_users",
    actions: ["view", "edit", "delete"],
  },
  roles: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/roles",
    entityName: "Role",
    formId: "roleForm",
    formFields: [
      { id: "name", required: true },
      { id: "description", required: true },
      { 
        id: "is_active", 
        type: "checkbox",
        required: false,
        defaultValue: 1
      }
    ],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "name", label: "Role Name", sortable: true },
      { key: "description", label: "Description", sortable: true },
      {
        key: "is_active",
        label: "Status",
        sortable: true,
        render: (data) => {
          const badgeClass = data ? "success" : "secondary";
          const text = data ? "Active" : "Inactive";
          return `<span class="badge bg-${badgeClass}">${text}</span>`;
        },
      },
      {
        key: "created_at",
        label: "Created",
        sortable: true,
        render: (data) => new Date(data).toLocaleDateString(),
      },
    ],
    actions: ["view", "edit", "delete"],
  },
  userStatus: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/user_status",
    entityName: "User Status",
    formId: "userStatusForm", // This form ID exists in the HTML
    formFields: [
      { id: "name", required: true },
      { id: "description", required: true },
    ],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "name", label: "Name", sortable: true },      { key: "description", label: "Description", sortable: true },    ],
    actions: ["view", "edit", "delete"],
  },  modules: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/modules",
    entityName: "Module",
    formId: "moduleForm",
    formFields: [
      { id: "name", required: true },
      { id: "description", required: true }
    ],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description", sortable: true }
    ],
    actions: ["view", "edit", "delete"]
  },
  profiles: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/profile",
    entityName: "Profile",
    formId: "profileForm",    formFields: [
      { id: "web_user_id", required: true },
      { id: "first_name", required: true },
      { id: "last_name", required: true },
      { id: "address", required: false },
      { id: "phone", required: false },
      { id: "document_type_id", required: false },
      { id: "document_number", required: false },
      { id: "profile_photo", required: false },
      { id: "birth_date", required: false }
    ],
    dropdowns: {
      web_user_id: {
        url: "http://localhost:3000/api_v1/web-users",
        valueField: "id",
        textField: "username",
        placeholder: "Select User",
        fallbackData: []
      },
      document_type_id: {
        url: "http://localhost:3000/api_v1/documentType/",
        valueField: "id",
        textField: "name",
        placeholder: "Select Document Type",
        fallbackData: [
          { id: 1, name: "CC" },
          { id: 2, name: "TI" },
          { id: 3, name: "P" },
        ],
      },
    },
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { 
        key: "web_user_id", 
        label: "User", 
        sortable: true,
        render: (data, type, row) => {
          const username = row.username || row.user_username || `User ${data}`;
          return `<span class="badge bg-primary">${username}</span>`;
        }
      },
      { 
        key: "first_name", 
        label: "Full Name", 
        sortable: true,
        render: (data, type, row) => {
          const firstName = row.first_name || '';
          const lastName = row.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'N/A';
        }
      },
      { key: "phone", label: "Phone", sortable: true },
      { 
        key: "document_number", 
        label: "Document", 
        sortable: true,
        render: (data, type, row) => {
          if (!data) return 'N/A';
          const docType = row.document_type_name || row.document_type || '';
          return docType ? `${docType}: ${data}` : data;
        }
      },
      { 
        key: "photo_url", 
        label: "Photo", 
        sortable: false,
        render: (data) => {
          if (data) {
            return `<img src="${data}" alt="Profile" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">`;
          }
          return '<i class="bi bi-person-circle text-muted" style="font-size: 40px;"></i>';
        }
      }
    ],
    actions: ["view", "edit", "delete"]
  },  permissions: {
    tableId: "data-table",
    apiUrl: "http://localhost:3000/api_v1/permissions",
    entityName: "Permission",
    formId: "permissionForm",
    formFields: [
      { id: "name", required: true },
      { id: "description", required: true },
      { id: "action", required: true }
    ],
    columns: [
      { key: "id", label: "ID", sortable: true, className: "text-center" },
      { key: "name", label: "Name", sortable: true },
      { key: "description", label: "Description", sortable: true },
      { key: "action", label: "Action", sortable: true, 
        render: (data) => `<span class="badge bg-info">${data}</span>` }
    ],
    actions: ["view", "edit", "delete"]
  }
};

// Debug: Log all available configs
console.log('📋 Available ModuleConfigs:', Object.keys(ModuleConfigs));
