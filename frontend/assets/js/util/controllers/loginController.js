const URL = "http://localhost:3000/api_v1/";
const URL_LOGIN = "web-users/login";

const objForm = document.getElementById("loginForm");
document.addEventListener("DOMContentLoaded", function () {  // Check if user is already logged in
  if (Auth && Auth.isLoggedIn()) {
    window.location.href = "../../views/dashboard/index.html"; // Redirect to dashboard
    return;
  }

  objForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formInstance = new Form("loginForm", "notEditable");

    if (formInstance.validateForm()) {
      const formData = formInstance.getFormData();
      // Show loading state
      const submitBtn = objForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Signing in...";
      submitBtn.disabled = true;

      setDataServices(formData).finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    } else {
      alert("Form is invalid. Please correct the errors.");
    }
  });

  objForm.addEventListener("reset", function () {
    const formInstance = new Form("loginForm", "notEditable");
    formInstance.resetForm();
  });
});

function setDataServices(data) {
  const method = "POST";
  const url = URL + URL_LOGIN;
  const resultFetch = getDataServices(data, method, url);

  return resultFetch
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.token && data.user) {
        // Use Auth class methods to properly store token and user data
        Auth.setToken(data.token);
        Auth.setUser(data.user);
        
        // Display detailed success message
        const userFullName = data.user.profile?.fullName || data.user.username;
        const userRoles = data.user.roles?.map(r => r.name).join(', ') || 'No roles assigned';
        
        console.log('✅ Login successful!');
        console.log(`Welcome ${userFullName}!`);
        console.log(`User ID: ${data.user.id}`);
        console.log(`Email: ${data.user.email}`);
        console.log(`Status: ${data.user.status?.name || 'Unknown'}`);
        console.log(`Roles: ${userRoles}`);
        console.log(`Permissions: ${data.user.permissions?.length || 0} permissions assigned`);
          // Show success message with user info
        alert(`Welcome ${userFullName}! Login successful.\nRoles: ${userRoles}`);
        
        // Redirect to dashboard
        window.location.href = "../../views/dashboard/index.html";
      } else {
        // Handle login failure
        handleLoginError(data.error || "Invalid credentials");
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      handleLoginError("Network error occurred. Please try again.");
    })
    .finally(() => {
      console.log("Login request completed");
    });
}

function handleLoginError(errorMessage) {
  const formInstance = new Form("loginForm", "notEditable");
  
  const usernameElement = document.getElementById("username");
  const passwordElement = document.getElementById("password");

  // Show field errors
  formInstance.showFieldError(usernameElement);
  formInstance.showFieldError(passwordElement);

  // Set error messages
  formInstance.setFieldMessage(usernameElement, errorMessage);
  formInstance.setFieldMessage(passwordElement, errorMessage);
  
  // Clear any stored auth data
  if (Auth) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  // Show user-friendly error message
  alert("Login failed: " + errorMessage);
}
