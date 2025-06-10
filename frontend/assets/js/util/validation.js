document.addEventListener("DOMContentLoaded", function () {
  const objForm = document.getElementById("documentTypeForm");

  objForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (validateForm(objForm)) {
      console.log("Form is valid. Submitting...");
    } else {
      console.log("Form is invalid. Please correct the errors.");
    }
  });
});

function validateForm(objForm) {
  let elementInput = objForm.querySelectorAll("input");
  let elementTextArea = objForm.querySelectorAll("textarea");
  let validate = true;

  for (let i = 0; i < elementInput.length; i++) {
    if (!validateInputs(elementInput[i])) {
      validate = false;
      break;
    }
  }
  for (let j = 0; j < elementTextArea.length; j++) {
    if (!validateTextArea(elementTextArea[j])) {
      validate = false;
      break;
    }
  }
  return validate;
}

function validateInputs(objInput) {
  let validateInput = true;
  switch (objInput.type) {
    case "text":
      return validateText(objInput);
    case "email":
      return validateEmail(objInput);
    case "number":
      return validateNumber(objInput);
    case "password":
      return validatePassword(objInput);
  }
  return validateInput;
}

function validateText(objInput) {
  let value = objInput.value;
  let regex = /^[a-zA-Z0-9\s]+$/;
  let validateText = true;
  if (value === null || value.trim === "" || value.length < 2) {
    validateText = false;
  }
  if (!regex.test(value)) {
    validateText = false;
  }
  return validateText;
}

function validateTextArea(objInput) {
  let value = objInput.value;
  let regex = /^[a-zA-Z0-9\s]+$/;
  let validateTextArea = true;
  if (value === null || value.trim === "" || value.length < 5) {
    validateTextArea = false;
  }
  if (!regex.test(value)) {
    validateTextArea = false;
  }
  return validateTextArea;
}

function validateEmail(objInput) {
  let value = objInput.value;
  let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}
function validateNumber(objInput) {
  let value = objInput.value;
  let regex = /^[0-9]+$/;
  return regex.test(value);
}
function validatePassword(objInput) {
  let value = objInput.value;
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(value);
}

function getFormData() {
  const formElements = objForm;
  let objData = new FormData();

  formElements.forEach((element) => {
    if (element.id) {
      if (element.tagName === "INPUT") {
        if (element.type === "checkbox") {
          objData.append(element.id, element.checked);
        } else {
          objData.append(element.id, element.value.trim());
        }
      } else if (element.tagName === "SELECT") {
        objData.append(element.id, element.value.trim());
      } else if (element.tagName === "TEXTAREA") {
        objData.append(element.id, element.value.trim());
      }
    }
  });
  return;
}

function setDataFormJson(json) {
  let elements = objForm.querySelectorAll("input,select");
  let jsonKeys = Object.keys(json);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].type == "checkbox") {
      if (jsonKeys.includes(elements[i].id)) {
        elements[i].checked = json[elements[i].id] == 0 ? false : true;
      }
    } else if (elements[i].tagName === "SELECT") {
      if (jsonKeys.includes(elements[i].id)) {
        elements[i].value = json[elements[i].id];
        elements[i].selected = true;
      }
    } else {
      if (jsonKeys.includes(elements[i].id)) {
        elements[i].value = json[elements[i].id];
      }
    }
  }
}

function getDataForm() {
  var elementsForm = objForm.querySelectorAll("input, select, textarea");
  let getJson = {};
  elementsForm.forEach(function (element) {
    if (element.id) {
      if (element.tagName === "INPUT") {
        if (element.type === "checkbox") {
          getJson[element.id] = element.checked;
        } else {
          getJson[element.id] = element.value.trim();
        }
      } else if (element.tagName === "SELECT") {
        getJson[element.id] = element.value.trim();
      } else if (element.tagName === "TEXTAREA") {
        getJson[element.id] = element.value.trim();
      }
    }
  });
  return getJson;
}
function resetForm() {
  let elementInput = objForm.querySelectorAll("input");
  let elementTextArea = objForm.querySelectorAll("textarea");

  for (let i = 0; i < elementInput.length; i++) {
    elementInput[i].value = "";
  }
  for (let j = 0; j < elementTextArea.length; j++) {
    elementTextArea[j].value = "";
  }

  objForm.reset();
  console.log("Form has been reset.");
}

function disableForm() {
  let elementInput = objForm.querySelectorAll("input");
  let elementTextArea = objForm.querySelectorAll("textarea");
  let elementSelect = objForm.querySelectorAll("select");

  for (let i = 0; i < elementInput.length; i++) {
    elementInput[i].disabled = true;
  }
  for (let j = 0; j < elementTextArea.length; j++) {
    elementTextArea[j].disabled = true;
  }
  for (let k = 0; k < elementSelect.length; k++) {
    elementSelect[k].disabled = true;
  }

  objForm.querySelector("button[type='submit']").disabled = true;
  console.log("Form has been blocked");
}

function enableForm() {
  let elementInput = objForm.querySelectorAll("input");
  let elementTextArea = objForm.querySelectorAll("textarea");
  let elementSelect = objForm.querySelectorAll("select");

  for (let i = 0; i < elementInput.length; i++) {
    elementInput[i].disabled = false;
  }
  for (let j = 0; j < elementTextArea.length; j++) {
    elementTextArea[j].disabled = false;
  }
  for (let k = 0; k < elementSelect.length; k++) {
    elementSelect[k].disabled = false;
  }
}

function enableEditForm() {
  let elementInput = objForm.querySelectorAll("input");
  let elementTextarea = objForm.querySelectorAll("textarea");

  for (let i = 0; i < elementInput.length; i++) {
    if (elementInput[i].classList.contains(classEdit)) {
      elementInput[i].disabled = true;
    } else {
      elementInput[i].disabled = false;
    }
  }
  for (let j = 0; j < elementTextarea.length; j++) {
    elementTextarea[j].disabled = false;
    if (elementTextarea[j].classList.contains(classEdit)) {
      elementTextarea[j].disabled = true;
    } else {
      elementTextarea[j].disabled = false;
    }
  }
  objForm.reset();
}

function disableButtons() {
  let elementButton = objForm.querySelectorAll("button");
  for (let i = 0; i < elementButton.length; i++) {
    elementButton[i].disabled = true;
  }
}

function enableButtons() {
  let elementButton = objForm.querySelectorAll("button");
  for (let i = 0; i < elementButton.length; i++) {
    elementButton[i].disabled = false;
  }
}
function hiddenButtons() {
  let elementButton = objForm.querySelectorAll("button");
  for (let i = 0; i < elementButton.length; i++) {
    elementButton[i].style.display = "none";
  }
}
function showButtons() {
  let elementButton = objForm.querySelectorAll("button");
  for (let i = 0; i < elementButton.length; i++) {
    elementButton[i].style.display = "block";
  }
}
//Class for input validation
//Class for showing table
//Class for modals
