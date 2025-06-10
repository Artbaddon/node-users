const URL = "http://localhost:3000/api_v1/";
const URL_LOGIN = "web-users/login";

const objForm = document.getElementById("loginForm");
document.addEventListener("DOMContentLoaded", function () {
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
  let loginData = {
    username: data.username,
    password: data.password,
  };
  const method = "POST";
  const url = URL + URL_LOGIN;
  const resultFetch = getDataServices(loginData, method, url);

  return resultFetch
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Login successful!");
        window.location.href = "dashboard.html";
      } else {
        const formInstance = new Form("loginForm", "notEditable");

        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");

        formInstance.showFieldError(usernameElement);
        formInstance.showFieldError(passwordElement);

        formInstance.setFieldMessage(usernameElement, "Invalid credentials");
        formInstance.setFieldMessage(passwordElement, "Invalid credentials");
        alert("Login failed: " + (data.error || "Invalid credentials"));
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error: " + error);
    })
    .finally(() => {
      console.log("Request completed");
    });
}
