const documentTypeConfig = {
  tableId: "data-table",
  apiUrl: "http://localhost:3000/api_v1/documentType",
  entityName: "Document Type",
  modalId: "modal-form",
  requiredPermissions: ["document_type:read"],
  permissionPattern: "document_type",
  columns: [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "text-center",
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      },
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      },
    },
    {
      key: "first_name",
      label: "First Name",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      },
    },
    {
      key: "last_name",
      label: "Last Name",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      },
    },

    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${
          data === 1 ? "Active" : data === 2 ? "Inactive" : "Suspended"
        }</strong>`;
      },
    },
  ],
  actions: ["view", "edit", "delete"],
};
