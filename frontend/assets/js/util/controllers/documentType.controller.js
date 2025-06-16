class DocumentTypeController {  constructor() {
    this.dataTable = null;
    this.modalForm = null;
    this.currentMode = "create"; // 'create', 'edit', 'view'
    this.currentItem = null;
    this.isInitialized = false;

    this.init();
  }
  async init() {
    if (this.isInitialized) {
      console.log("⚠️ DocumentTypeController already initialized, skipping...");
      return;
    }
    
    console.log("🚀 DocumentTypeController initializing...");

    // Check authentication
    await Auth.requireAuth();
    console.log("✅ Authentication check passed");

    // Initialize navigation AFTER auth is ready
    if (typeof Navigation !== 'undefined') {
      console.log("🧭 Initializing Navigation...");
      Navigation.init();
    }

    // Initialize role-based UI
    if (typeof RoleBasedUI !== "undefined") {
      console.log("🎨 Initializing RoleBasedUI...");
      RoleBasedUI.initializeRoleBasedUI();
    }

    // Initialize data table
    console.log("📊 Initializing DataTable...");
    this.dataTable = new DataTableComponent(documentTypeConfig);

    // Initialize form
    this.initializeForm();
    
    // Setup event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log("✅ DocumentTypeController initialized successfully");
  }

  initializeForm() {
    const formElement = document.getElementById("documentTypeForm");
    if (formElement) {
      this.modalForm = new Form("documentTypeForm", "notEditable");
    }
  }

  setupEventListeners() {
    // Listen for table events
    document.addEventListener("table:create", (e) => this.handleCreateEvent(e));
    document.addEventListener("table:view", (e) => this.handleViewEvent(e));
    document.addEventListener("table:edit", (e) => this.handleEditEvent(e));

    // Form submission
    const formElement = document.getElementById("documentTypeForm");
    if (formElement) {
      formElement.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    // Modal events
    const modal = document.getElementById("modal-form");
    if (modal) {
      modal.addEventListener("hidden.bs.modal", () => this.resetForm());
    }
  }

  handleCreateEvent(event) {
    this.currentMode = "create";
    this.currentItem = null;
    this.setupModalForCreate();
  }

  handleViewEvent(event) {
    this.currentMode = "view";
    this.currentItem = event.detail.item;
    this.setupModalForView();
  }

  handleEditEvent(event) {
    this.currentMode = "edit";
    this.currentItem = event.detail.item;
    this.setupModalForEdit();
  }

  setupModalForCreate() {
    this.updateModalTitle("Add New Document Type");
    this.resetForm();
    this.setFormMode("create");
  }

  setupModalForView() {
    this.updateModalTitle("View Document Type");
    this.populateForm(this.currentItem);
    this.setFormMode("view");
  }

  setupModalForEdit() {
    this.updateModalTitle("Edit Document Type");
    this.populateForm(this.currentItem);
    this.setFormMode("edit");
  }

  updateModalTitle(title) {
    const modalTitle = document.querySelector("#modal-form .modal-title");
    if (modalTitle) {
      modalTitle.textContent = title;
    }
  }

  populateForm(data) {
    if (!data) return;

    const nameField = document.getElementById("name");
    const descriptionField = document.getElementById("description");

    if (nameField) nameField.value = data.name || "";
    if (descriptionField) descriptionField.value = data.description || "";
  }

  setFormMode(mode) {
    const formElement = document.getElementById("documentTypeForm");
    const submitBtn = formElement?.querySelector('button[type="submit"]');
    const resetBtn = formElement?.querySelector('button[type="reset"]');

    if (mode === "view") {
      // Disable all form fields
      formElement
        ?.querySelectorAll("input, textarea, select")
        .forEach((field) => {
          field.disabled = true;
        });

      // Hide submit and reset buttons
      if (submitBtn) submitBtn.style.display = "none";
      if (resetBtn) resetBtn.style.display = "none";
    } else {
      // Enable all form fields
      formElement
        ?.querySelectorAll("input, textarea, select")
        .forEach((field) => {
          field.disabled = false;
        });

      // Show submit and reset buttons
      if (submitBtn) {
        submitBtn.style.display = "inline-block";
        submitBtn.innerHTML =
          mode === "edit"
            ? '<i class="bi bi-save"></i> Update'
            : '<i class="bi bi-save2"></i> Save';
      }
      if (resetBtn) resetBtn.style.display = "inline-block";
    }
  }

  resetForm() {
    if (this.modalForm) {
      this.modalForm.resetForm();
    }

    // Re-enable all fields (in case they were disabled in view mode)
    const formElement = document.getElementById("documentTypeForm");
    formElement
      ?.querySelectorAll("input, textarea, select")
      .forEach((field) => {
        field.disabled = false;
      });
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    if (!this.modalForm.validateForm()) {
      alert("Please correct the form errors.");
      return;
    }

    const formData = this.modalForm.getFormData();

    try {
      let url = documentTypeConfig.apiUrl;
      let method = "POST";

      if (this.currentMode === "edit" && this.currentItem) {
        url += `/${this.currentItem.id}`;
        method = "PUT";
      }

      const token = Auth.getToken();
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("modal-form")
      );
      modal?.hide();

      // Refresh table
      await this.dataTable.refresh();

      // Show success message
      const action = this.currentMode === "edit" ? "updated" : "created";
      this.dataTable.showSuccess(`Document Type ${action} successfully!`);
    } catch (error) {
      console.error("Error submitting form:", error);
      this.dataTable.showError("Failed to save: " + error.message);
    }
  }
}
// Initialize the controller when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new DocumentTypeController();

  // Add logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        Auth.logout();
      }
    });
  }
});
