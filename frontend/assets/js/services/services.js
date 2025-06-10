async function getDataServices(data, method, url) {
  let parameters;
  parameters = {
    method: method,
    node: "cors",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    }
  }
  if (data != "") {
    
    parameters.body = JSON.stringify(data);
  }
  return await fetch(url, parameters);
}
