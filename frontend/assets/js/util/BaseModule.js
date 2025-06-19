class BaseModule {
  constructor(config) {
    this.config = this.validateConfig(config);
    this.dataTable = null;
    this.modalForm = null;
    this.currentMode = "create";
    this.currentItem = null;
    this.isInitialized = false;
  }
  validateConfig(config) {
    const required = ['tableId', 'apiUrl', 'entityName', 'columns'];
    const missing = required.filter(prop => !config[prop]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required config properties: ${missing.join(', ')}`);
    }

    // Validate columns is an array
    if (!Array.isArray(config.columns)) {
      throw new Error('Config.columns must be an array');
    }

    return {
      modalId: 'modal-form',
      formId: `${config.entityName.toLowerCase().replace(/\s+/g, '')}Form`,
      actions: ['view', 'edit', 'delete'],
      requiredPermissions: [],
      permissionPattern: config.entityName.toLowerCase().replace(/\s+/g, '_'),
      ...config
    };
  }

  async init() {
    if (this.isInitialized) {
      console.log(`⚠️ ${this.config.entityName} module already initialized`);
      return;
    }

    console.log(`🚀 Initializing ${this.config.entityName} module...`);

    try {
      await Auth.requireAuth();
      await this.initializeComponents();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log(`✅ ${this.config.entityName} module initialized`);
    } catch (error) {
      console.error(`❌ Error initializing ${this.config.entityName}:`, error);
    }
  }

  async initializeComponents() {
    // Navigation
    if (typeof Navigation !== 'undefined') {
      Navigation.init();
    }

    // Role-based UI
    if (typeof RoleBasedUI !== 'undefined') {
      RoleBasedUI.initializeRoleBasedUI();
    }

    // Load dropdown data if configured
    await this.loadDropdownData();

    // Data table
    this.dataTable = new DataTableComponent(this.config);

    // Form
    this.initializeForm();
  }

  initializeForm() {
    const formElement = document.getElementById(this.config.formId);
    if (formElement && typeof Form !== 'undefined') {
      this.modalForm = new Form(this.config.formId, "notEditable");
    }
  }

  setupEventListeners() {
    // Table events
    document.addEventListener("table:create", (e) => this.handleCreate(e));
    document.addEventListener("table:view", (e) => this.handleView(e));
    document.addEventListener("table:edit", (e) => this.handleEdit(e));

    // Form submission
    const formElement = document.getElementById(this.config.formId);
    if (formElement) {
      formElement.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }    // Modal events
    const modal = document.getElementById(this.config.modalId);
    if (modal) {
      modal.addEventListener("hidden.bs.modal", () => {
        this.resetForm();
        this.cleanupModalBackdrops();
      });
      
      // Additional cleanup on show/hide
      modal.addEventListener("show.bs.modal", () => {
        this.cleanupModalBackdrops();
      });
    }

    // Logout
    this.setupLogout();
  }

  setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener-added')) {
      logoutBtn.setAttribute('data-listener-added', 'true');
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to logout?")) {
          Auth.logout();
        }
      });
    }
  }  // Event Handlers
  async handleCreate(event) {
    console.log('🆕 HandleCreate called:', event.detail);
    if (event.detail.entityName !== this.config.entityName) return;
    this.currentMode = "create";
    this.currentItem = null;
    await this.setupModal("Add New " + this.config.entityName, "create");
  }

  async handleView(event) {
    console.log('👁️ HandleView called:', event.detail);
    if (event.detail.entityName !== this.config.entityName) return;
    this.currentMode = "view";
    this.currentItem = event.detail.item;
    await this.setupModal("View " + this.config.entityName, "view");
  }

  async handleEdit(event) {
    console.log('✏️ HandleEdit called:', event.detail);
    if (event.detail.entityName !== this.config.entityName) return;
    this.currentMode = "edit";
    this.currentItem = event.detail.item;
    await this.setupModal("Edit " + this.config.entityName, "edit");
  }async setupModal(title, mode) {
    console.log(`🎭 Setting up modal: "${title}" in ${mode} mode`);
    this.updateModalTitle(title);
    
    if (mode === "create") {
      this.resetForm();
    } else {
      // For edit mode, ensure dropdowns are loaded before populating form
      console.log('🔄 Ensuring dropdowns are loaded before populating form...');
      await this.loadDropdownData();
      this.populateForm(this.currentItem);
    }
    
    this.setFormMode(mode);
    
    // Show the modal
    const modal = document.getElementById(this.config.modalId);
    if (modal) {
      // Clean up any existing backdrops first
      this.cleanupModalBackdrops();
      
      const bootstrapModal = new bootstrap.Modal(modal, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
      
      // Store reference for proper cleanup
      this.currentModal = bootstrapModal;
      
      // Add event listener for proper cleanup
      modal.addEventListener('hidden.bs.modal', () => {
        this.cleanupModalBackdrops();
        this.currentModal = null;
      }, { once: true });
      
      bootstrapModal.show();
      console.log('✅ Modal shown');
    } else {
      console.error('❌ Modal element not found:', this.config.modalId);
    }
  }

  cleanupModalBackdrops() {
    // Remove any leftover modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🧹 Removing modal backdrop');
      backdrop.remove();
    });
    
    // Reset body classes and styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  updateModalTitle(title) {
    const modalTitle = document.querySelector(`#${this.config.modalId} .modal-title`);
    if (modalTitle) {
      modalTitle.textContent = title;
    }
  }  populateForm(data) {
    if (!data) return;

    console.log('📝 Populating form with data:', data);

    // Auto-populate based on config form fields or data keys
    Object.keys(data).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        // Don't populate password fields in edit mode
        if (field.type === 'password' && this.currentMode === 'edit') {
          field.value = "";
          field.placeholder = "Leave blank to keep current password";
        } else {
          let value = data[key] || "";
          
          // For dropdowns, convert to string to match option values
          if (field.tagName === 'SELECT' && value !== "") {
            value = String(value);
          }
          
          field.value = value;
          
          // For dropdowns, add extra logging and validation
          if (field.tagName === 'SELECT') {
            console.log(`🔽 Setting dropdown ${key} to value: ${value} (type: ${typeof value})`);
            if (field.value !== value && value !== "") {
              console.warn(`⚠️ Could not set dropdown ${key} to ${value} - value may not exist in options`);
              console.log(`Available options for ${key}:`, Array.from(field.options).map(opt => `${opt.value}="${opt.text}"`));
            } else {
              console.log(`✅ Successfully set dropdown ${key} to: ${value}`);
            }
          }
        }
      }
    });
  }

  setFormMode(mode) {
    const formElement = document.getElementById(this.config.formId);
    const submitBtn = formElement?.querySelector('button[type="submit"]');
    const resetBtn = formElement?.querySelector('button[type="reset"]');
    const saveBtn = formElement?.closest('.modal')?.querySelector('.btn-primary');

    const isReadOnly = mode === "view";

    // Enable/disable form fields
    formElement?.querySelectorAll("input, textarea, select").forEach(field => {
      field.disabled = isReadOnly;
      
      // Handle password field requirements
      if (field.type === 'password') {
        if (mode === 'edit') {
          field.required = false;
          field.placeholder = "Leave blank to keep current password";
        } else if (mode === 'create') {
          field.required = true;
          field.placeholder = "Password";
        }
      }
    });

    // Show/hide buttons
    [submitBtn, resetBtn, saveBtn].forEach(btn => {
      if (btn) {
        btn.style.display = isReadOnly ? "none" : "inline-block";
        if (btn === submitBtn || btn === saveBtn) {
          btn.innerHTML = mode === "edit" 
            ? '<i class="bi bi-save"></i> Update' 
            : '<i class="bi bi-save2"></i> Save';
        }
      }
    });
  }

  resetForm() {
    if (this.modalForm) {
      this.modalForm.resetForm();
    } else {
      const formElement = document.getElementById(this.config.formId);
      if (formElement) {
        formElement.reset();
      }
    }

    // Re-enable all fields and reset password requirements
    const formElement = document.getElementById(this.config.formId);
    formElement?.querySelectorAll("input, textarea, select").forEach(field => {
      field.disabled = false;
      
      // Reset password field to required for create mode
      if (field.type === 'password') {
        field.required = true;
        field.placeholder = "Password";
      }
    });
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    // Validate form
    if (this.modalForm && !this.modalForm.validateForm()) {
      alert("Please correct the form errors.");
      return;
    }    // Get form data
    const formData = this.modalForm 
      ? this.modalForm.getFormData() 
      : this.getFormDataFromDOM();

    try {
      let url = this.config.apiUrl;
      let method = "POST";

      if (this.currentMode === "edit" && this.currentItem) {
        url += `/${this.currentItem.id}`;
        method = "PUT";
      } else if (this.currentMode === "create" && this.config.createUrl) {
        // Use specific create URL if configured
        url = this.config.createUrl;
      }

      const token = Auth.getToken();
      
      // Check if we have file uploads
      const hasFiles = this.hasFileUploads();
      
      const requestOptions = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };      if (hasFiles) {
        // For file uploads, send FormData directly (don't set Content-Type)
        const formElement = document.getElementById(this.config.formId);
        const formDataToSend = new FormData(formElement);
        
        // Debug: Log FormData contents
        console.log('📤 Sending FormData with files:');
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`  ${key}:`, value);
        }
        
        requestOptions.body = formDataToSend;
      } else {
        // For regular form data, send JSON
        console.log('📤 Sending JSON data:', formData);
        requestOptions.headers["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(formData);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }      // Close modal
      if (this.currentModal) {
        this.currentModal.hide();
      } else {
        const modal = bootstrap.Modal.getInstance(document.getElementById(this.config.modalId));
        modal?.hide();
      }
      
      // Ensure cleanup happens
      setTimeout(() => {
        this.cleanupModalBackdrops();
      }, 300);

      // Refresh table
      await this.dataTable.refresh();

      // Show success message
      const action = this.currentMode === "edit" ? "updated" : "created";
      this.dataTable.showSuccess(`${this.config.entityName} ${action} successfully!`);

    } catch (error) {
      console.error("Error submitting form:", error);
      this.dataTable.showError("Failed to save: " + error.message);
    }
  }

  getFormDataFromDOM() {
    const formElement = document.getElementById(this.config.formId);
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    
    // Special handling for password field in edit mode
    if (this.currentMode === 'edit') {
      const passwordField = formElement.querySelector('input[type="password"]');
      if (passwordField && !passwordField.value.trim()) {
        // Remove empty password from data to keep current password
        delete data.password;
      }
    }
    
    return data;
  }  async loadDropdownData() {
    if (!this.config.dropdowns) return;

    // Check if user is authenticated
    if (!Auth.isLoggedIn()) {
      console.error('❌ User not authenticated, cannot load dropdown data');
      for (const fieldId of Object.keys(this.config.dropdowns)) {
        this.showDropdownError(fieldId, 'Authentication required');
      }
      return;
    }

    console.log('📥 Loading dropdown data for:', Object.keys(this.config.dropdowns));

    for (const [fieldId, dropdownConfig] of Object.entries(this.config.dropdowns)) {
      let success = false;
      
      // Try different URL variations
      const urlVariations = [
        dropdownConfig.url,
        dropdownConfig.url.replace('//', '/'), // remove double slashes
        dropdownConfig.url.replace('user_status', 'userStatus'), // camelCase
        dropdownConfig.url.replace('user_status', 'user-status'), // kebab-case
      ];
      
      for (const url of urlVariations) {
        try {
          console.log(`🔽 Trying URL for ${fieldId}: ${url}`);
          
          const token = Auth.getToken();
          console.log(`🔑 Token for ${fieldId}:`, token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 Response for ${fieldId} (${url}):`, response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error for ${fieldId} (${url}):`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            
            if (response.status === 404) {
              console.log(`⚠️ 404 for ${url}, trying next variation...`);
              continue; // Try next URL variation
            }
            
            if (response.status === 401) {
              console.error(`🔒 Authentication failed for ${fieldId}`);
              throw new Error('Authentication failed');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          console.log(`📄 Raw response for ${fieldId}:`, result);
            // Handle different response formats
          let data = [];
          if (result.data && Array.isArray(result.data)) {
            data = result.data;
          } else if (Array.isArray(result)) {
            data = result;
          } else if (result.users && Array.isArray(result.users)) {
            data = result.users;
          } else if (result.roles && Array.isArray(result.roles)) {
            data = result.roles;
          } else if (result.statuses && Array.isArray(result.statuses)) {
            data = result.statuses;
          } else if (result.documentTypes && Array.isArray(result.documentTypes)) {
            data = result.documentTypes; // For userStatus endpoint
          }
          
          console.log(`📋 Processed data for ${fieldId}:`, data);
          
          if (!Array.isArray(data)) {
            throw new Error(`Expected array but got ${typeof data}. Response: ${JSON.stringify(result)}`);
          }
          
          if (data.length === 0) {
            console.warn(`⚠️ No data returned for ${fieldId} from ${url}`);
          }
          
          console.log(`✅ Loaded ${data.length} items for ${fieldId} from ${url}`);
          
          this.populateDropdown(fieldId, data, dropdownConfig);
          success = true;
          break; // Success, exit the URL variations loop
          
        } catch (error) {
          console.error(`❌ Error with ${url} for ${fieldId}:`, error.message);
          continue; // Try next URL variation
        }
      }
        if (!success) {
        console.error(`❌ All URL variations failed for ${fieldId}`);
        
        // Try fallback data if available
        if (dropdownConfig.fallbackData && Array.isArray(dropdownConfig.fallbackData)) {
          console.log(`🔄 Using fallback data for ${fieldId}:`, dropdownConfig.fallbackData);
          this.populateDropdown(fieldId, dropdownConfig.fallbackData, dropdownConfig);
        } else {
          this.showDropdownError(fieldId, 'Failed to load data');
        }
      }
    }
  }
  populateDropdown(fieldId, data, config) {
    const selectElement = document.getElementById(fieldId);
    if (!selectElement) {
      console.warn(`⚠️ Select element not found: ${fieldId}`);
      return;
    }

    // Store current value to preserve selection
    const currentValue = selectElement.value;

    // Clear existing options except placeholder
    selectElement.innerHTML = `<option value="">${config.placeholder}</option>`;

    // Add options from data
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item[config.valueField];
      option.textContent = item[config.textField];
      selectElement.appendChild(option);
    });

    // Restore the selected value if it exists in the new options
    if (currentValue) {
      selectElement.value = currentValue;
      console.log(`🔄 Restored selected value for ${fieldId}: ${currentValue}`);
    }

    // Store the mapping for table rendering
    if (fieldId === 'role_id') {
      window.roleMapping = {};
      data.forEach(item => {
        window.roleMapping[item[config.valueField]] = item[config.textField];
      });
      console.log('💾 Stored role mapping:', window.roleMapping);
    }
    
    if (fieldId === 'status_id') {
      window.statusMapping = {};
      data.forEach(item => {
        window.statusMapping[item[config.valueField]] = item[config.textField];
      });
      console.log('💾 Stored status mapping:', window.statusMapping);
    }

    console.log(`✅ Populated dropdown ${fieldId} with ${data.length} options`);
  }
  showDropdownError(fieldId, message) {
    const selectElement = document.getElementById(fieldId);
    if (selectElement) {
      selectElement.innerHTML = `<option value="">${message}</option>`;
      selectElement.style.borderColor = '#dc3545'; // Red border to indicate error
      console.log(`❌ Dropdown error for ${fieldId}: ${message}`);
    }
  }
  hasFileUploads() {
    const formElement = document.getElementById(this.config.formId);
    const fileInputs = formElement.querySelectorAll('input[type="file"]');
    // Only return true if there are file inputs AND at least one has a file selected
    return Array.from(fileInputs).some(input => input.files && input.files.length > 0);
  }

  // Public API
  refresh() {
    return this.dataTable?.refresh();
  }

  refreshDropdowns() {
    console.log('🔄 Manually refreshing dropdowns...');
    return this.loadDropdownData();
  }

  getData() {
    return this.dataTable?.getData() || [];
  }
}