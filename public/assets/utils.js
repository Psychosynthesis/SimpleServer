const generateLinkHTML = href => {
  return `<a href="${href}" target="_blank">${href}</a>`
}

const objectToHTML = (json, level = 0) => {
    let html = '';

    if (typeof json === 'object' && json !== null) {
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
              let value = json[key];
              let valueHTML = '';

              if (typeof value === 'object' && value !== null) {
                valueHTML = objectToHTML(value, level + 1);
              } else {
                valueHTML = String(value);
              }
                html += `<div style="margin-left: ${level * 20}px;"><strong>${key}:</strong> ${key.toLowerCase() === 'link' ? generateLinkHTML(valueHTML) : valueHTML}</div>`;
            }
        }
    } else {
       html += String(json);
    }

    return html;
}

const clearError = () => {
  if (timerId) { clearTimeout(timerId); }
  var errorBlock = document.getElementById('error-block');
  var errorCode = document.getElementById('errors-code');
  errorBlock.style.display = 'none';
  errorCode.innerHTML = '';
}

const renderError = (err) => {
  var errorBlock = document.getElementById('error-block');
  var errorCode = document.getElementById('errors-code');
  errorBlock.style.display = 'block';
  errorCode.innerHTML = (typeof(err) === 'object') ? objectToHTML(err) : err;
}

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
