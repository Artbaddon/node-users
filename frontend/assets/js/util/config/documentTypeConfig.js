const documentTypeConfig = {
  tableId: 'data-table',
  apiUrl: 'http://localhost:3000/api_v1/documentType',
  entityName: 'Document Type',
  modalId: 'modal-form',
  requiredPermissions: ['document_type:read'],
  permissionPattern: 'document_type',
  columns: [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'text-center'
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (data, type, row) => {
        return `<strong>${data}</strong>`;
      }
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (data, type, row) => {
        return data ? (data.length > 100 ? data.substring(0, 100) + '...' : data) : '<em>No description</em>';
      }
    },
   
  ],
  actions: ['view', 'edit', 'delete']
};