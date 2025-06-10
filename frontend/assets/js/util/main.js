const URL = "http://localhost:3000/api_v1/";
const URL_SALARY = "classify";
let info = null;

const objForm = document.getElementById("salaryForm");

const getElements = objForm.querySelectorAll("input");

objForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Always hide results before processing
  document.getElementById("resultsSection").style.display = "none";

  for (let i = 0; i < getElements.length; i++) {
    let element = getElements[i];
    if (element.type === "text" || element.type === "number") {
      if (getValidatedInput(element)) {
        setDataServices(element.value);
      } else {
        alert("Please enter a valid input.");
        break;
      }
    }
  }
});

function getValidatedInput(objInput) {
  let objInputValue = objInput.value;
  let classError = "input-error";
  let myRegex = /^\d{5,}$/;
  let validation = myRegex.test(objInputValue);
  let validations = true;
  if (
    objInputValue == "" ||
    objInputValue == null ||
    objInputValue.length <= 0
  ) {
    objInput.classList.add("input-error");
    validations = false;
  } else if (!validation) {
    objInput.classList.add("input-error");
    validations = false;
  } else {
    objInput.classList.remove(classError);
  }
  return validations;
}

function setDataServices(data) {
  let getData = {
    salary: data,
  };
  const method = "POST";
  const url = URL + URL_SALARY;
  resultFetch = getDataServices(getData, method, url);
  resultFetch
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      info = data;
      console.log("Response data:", info);

      // Show the results section
      document.getElementById("resultsSection").style.display = "";
      // Update the UI with the response data

      changeClassificationCard(info.data.class);
      generateYourSalaryCard(info.data.class);
      generateComparasionSalaryCards(info.data.comparative);
      showComparasionCards(info.data);

      document.getElementById("resultsSection").style.display = "block";
      alert("Success: ok");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error: " + error);
    })
    .finally(() => {
      console.log("Request completed");
    });
}
