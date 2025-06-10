class Form {
  constructor(formId, notEditable) {
    this.objForm = document.getElementById(formId);
    this.notEditableInputs = notEditable;
    this.validators = {
      text: /^[a-zA-Z0-9\s]+$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      number: /^[0-9]+$/,
      password: /^[^\s]{8,}$/,
      textarea: /^[a-zA-Z0-9\s]+$/,
      username: /^[a-zA-Z0-9_]{3,}$/,
      select: /^.+$/, // ← Add this: any non-empty value for selects
    };

    // Better validation messages
    this.errorMessages = {
      text: "Please enter only letters, numbers, and spaces (minimum 2 characters)",
      email: "Please enter a valid email address (example@domain.com)",
      number: "Please enter only numbers",
      password: "Password must be at least 8 characters (no spaces allowed)",
      textarea:
        "Please enter only letters, numbers, and spaces (minimum 5 characters)",
      username:
        "Username must be at least 3 characters (letters, numbers, underscore only)",
      required: "This field is required",
      select: "Please select an option",
    };

    if (!this.objForm) {
      throw new Error(`Form with ID ${formId} not found.`);
    }
  }

  getForm() {
    return this.objForm;
  }

  validateForm() {
    const inputs = this.objForm.querySelectorAll("input, textarea");
    let isValid = true;

    Array.from(inputs).forEach((input) => {
      if (!this.validateElement(input)) {
        this.showFieldError(input);
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  }

  // Enhanced validation with specific error messages
  validateElement(element) {
    const value = element.value?.trim();

    // Better type detection
    let type;
    if (element.tagName.toLowerCase() === "select") {
      type = "select";
    } else if (element.tagName.toLowerCase() === "textarea") {
      type = "textarea";
    } else {
      type = element.type || "text"; // Default to 'text' for inputs
    }

    // Check if value exists
    if (!value || value.length === 0) {
      this.setFieldMessage(element, this.errorMessages.required);
      return false;
    }

    // Check minimum length
    const minLength = this.getMinLength(type);
    if (value.length < minLength) {
      this.setFieldMessage(
        element,
        this.errorMessages[type] || `Minimum ${minLength} characters required`
      );
      return false;
    }

    // Validate against regex pattern
    const regex = this.validators[type];
    if (regex && !regex.test(value)) {
      this.setFieldMessage(
        element,
        this.errorMessages[type] || "Invalid format"
      );
      return false;
    }

    this.clearFieldMessage(element);
    return true;
  }

  // Set custom error message for field
  setFieldMessage(element, message) {
    const feedbackElement = this.getOrCreateFeedback(element);
    feedbackElement.textContent = message;
  }

  // Clear error message for field
  clearFieldMessage(element) {
    const feedbackElement = this.getOrCreateFeedback(element);
    feedbackElement.textContent = this.getDefaultMessage(element);
  }

  // Get or create feedback element
  getOrCreateFeedback(element) {
    const fieldContainer = element.parentElement;
    let feedbackElement = fieldContainer.querySelector(".invalid-feedback");

    if (!feedbackElement) {
      feedbackElement = document.createElement("div");
      feedbackElement.className = "invalid-feedback";
      fieldContainer.appendChild(feedbackElement);
    }

    return feedbackElement;
  }

  // Get default message for field
  getDefaultMessage(element) {
    const type = element.type || element.tagName.toLowerCase();
    const placeholder = element.placeholder || `Please enter a valid ${type}`;
    return `Please enter a valid ${placeholder
      .toLowerCase()
      .replace("enter your ", "")
      .replace("enter ", "")}`;
  }

  getMinLength(type) {
    const minLengths = {
      text: 2,
      textarea: 5,
      password: 8,
      username: 3,
      select: 1, // ← Add this: select must have a value
    };
    return minLengths[type] || 1; // Default minimum 1 character
  }

  getFormData(asFormData) {
    const elements = this.objForm.querySelectorAll("input, select, textarea");
    const data = asFormData ? new FormData() : {};

    Array.from(elements).forEach((element) => {
      if (!element.id) return;

      const value =
        element.type === "checkbox" ? element.checked : element.value?.trim();

      if (asFormData) {
        data.append(element.id, value);
      } else {
        data[element.id] = value;
      }
    });

    return data;
  }

  getDataForm() {
    return this.getFormData(false);
  }

  setDataFormJson(json) {
    const elements = this.objForm.querySelectorAll("input, select, textarea");

    Array.from(elements).forEach((element) => {
      if (!element.id || !(element.id in json)) return;

      if (element.type === "checkbox") {
        element.checked = Boolean(json[element.id]);
      } else {
        element.value = json[element.id];
        if (element.tagName === "SELECT") {
          element.selected = true;
        }
      }
    });
  }

  // Consolidated element manipulation methods
  manipulateElements(action, selector = "input, select, textarea, button") {
    const elements = this.objForm.querySelectorAll(selector);

    Array.from(elements).forEach((element) => {
      switch (action) {
        case "disable":
          element.disabled = true;
          break;
        case "enable":
          element.disabled = false;
          break;
        case "hide":
          element.style.display = "none";
          break;
        case "show":
          element.style.display = "block";
          break;
        case "reset":
          if (element.tagName !== "BUTTON") {
            element.value = "";
          }
          break;
      }
    });
  }

  resetForm() {
    this.objForm.reset();
    this.clearAllErrors();
    // Remove any alerts
    const alerts = this.objForm.querySelectorAll(".alert");
    alerts.forEach((alert) => alert.remove());
    console.log("Form has been reset.");
  }

  disableForm() {
    this.manipulateElements("disable");
  }

  enableForm() {
    this.manipulateElements("enable");
  }

  enableEditForm() {
    const elements = this.objForm.querySelectorAll("input, select, textarea");

    Array.from(elements).forEach((element) => {
      element.disabled = element.classList.contains("notEditable");
    });

    this.objForm.reset();
  }

  // Button-specific methods using the consolidated approach
  disableButtons() {
    this.manipulateElements("disable", "button");
  }

  enableButtons() {
    this.manipulateElements("enable", "button");
  }

  hiddenButtons() {
    this.manipulateElements("hide", "button");
  }

  showButtons() {
    this.manipulateElements("show", "button");
  }

  // Add Bootstrap error styling
  showFieldError(element) {
    // Remove valid classes
    element.classList.remove("is-valid");
    // Add invalid class
    element.classList.add("is-invalid");
  }

  // Add Bootstrap success styling
  clearFieldError(element) {
    // Remove invalid classes
    element.classList.remove("is-invalid");
    // Add valid class (optional)
    element.classList.add("is-valid");
  }

  // Clear all Bootstrap validation classes
  clearAllErrors() {
    const inputs = this.objForm.querySelectorAll("input, textarea");
    Array.from(inputs).forEach((input) => {
      input.classList.remove("is-invalid", "is-valid");
    });
  }


}
