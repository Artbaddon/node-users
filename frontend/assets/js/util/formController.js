const objForm = document.getElementById("documentTypeForm");
document.addEventListener("DOMContentLoaded", function () {
  objForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formInstance = new Form("documentTypeForm", "notEditable");
    if (formInstance.validateForm()) {
      alert("Form is valid. Submitting...");
    } else {
      alert("Form is invalid. Please correct the errors.");
    }
  });
  objForm.addEventListener("reset", function () {
    const formInstance = new Form("documentTypeForm", "notEditable");
    formInstance.resetForm();
  });
});
