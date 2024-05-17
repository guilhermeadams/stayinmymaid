document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ultrasoundForm');
  const pacienteInput = document.getElementById('paciente');
  const veterinarioInput = document.getElementById('veterinario');
  const pacienteError = document.getElementById('pacienteError');
  const veterinarioError = document.getElementById('veterinarioError');
  const submissionMessage = document.getElementById('submission-message');
  const printButton = document.getElementById('printButton');
  const findingsSection = document.getElementById('findingsSection');

  let findingsData = [];
  let selectedCodes = {};

  // Load findings data from JSON URL
  fetch('https://gist.githubusercontent.com/guilhermeadams/6b74b912449ca3b340ef891d37cb3aaf/raw/fe29765d28800a23bc1973602fb4f019db1e0512/code.json')
      .then(response => response.json())
      .then(data => {
          findingsData = data;
          initializeForm();
      })
      .catch(error => {
          console.error('Error loading findings data:', error);
          submissionMessage.textContent = 'Erro ao carregar os dados. Por favor, tente novamente mais tarde.';
      });

  function initializeForm() {
      const findingsTableBody = findingsSection.querySelector('tbody');

      // Create dropdowns and table rows for each organ
      const organs = [...new Set(findingsData.map(item => item.orgao))]; // Get unique organ names
      organs.forEach(organName => {
          const codes = findingsData.filter(item => item.orgao === organName);

          const row = findingsTableBody.insertRow();
          row.id = `row-${organName}`;

          // Organ cell
          const organCell = row.insertCell();
          organCell.textContent = organName;

          // Dropdown cell
          const dropdownCell = row.insertCell();
          const dropdown = document.createElement('select');
          dropdown.name = organName;
          dropdown.id = organName;
          dropdown.innerHTML = `
              <option value="">Not Assessed</option>
              ${codes.map(code => `<option value="${code.codigo}">${code.codigo}</option>`).join('')}
          `;
          dropdownCell.appendChild(dropdown);

          // Checkbox cells (Normal, Anormal, Não visibilizada)
          for (let i = 0; i < 3; i++) {
              const checkboxCell = row.insertCell();
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.name = `${organName}_${['normal', 'anormal', 'nao_visibilizada'][i]}`;
              checkbox.classList.add(i === 0 ? 'normal' : i === 1 ? 'anormal' : 'nao_visibilizada');
              checkbox.disabled = true; // Disable checkboxes initially
              checkboxCell.appendChild(checkbox);
          }

          // Comments cell
          const commentsCell = row.insertCell();
          const textarea = document.createElement('textarea');
          textarea.name = `${organName}_comentarios`;
          textarea.disabled = true; // Disable textarea initially
          commentsCell.appendChild(textarea);

          // Event listener for dropdown changes
          dropdown.addEventListener('change', () => {
              const selectedCode = codes.find(c => c.codigo === dropdown.value);
              selectedCodes[organName] = selectedCode;
              updateTableRow(organName, selectedCode);
              updateDiagnosticImpression();
          });
      });
  }

  function updateTableRow(organName, selectedCode) {
      const row = document.getElementById(`row-${organName}`);
      const checkboxes = row.querySelectorAll('input[type="checkbox"][name*="' + organName + '"]');
      const textarea = row.querySelector('textarea[name*="' + organName + '_comentarios"]');

      checkboxes.forEach(checkbox => {
          checkbox.checked = false;
          checkbox.disabled = !selectedCode; // Enable/disable checkboxes based on selection
      });

      textarea.value = selectedCode ? selectedCode.comentario : '';
      textarea.disabled = !selectedCode; // Enable/disable textarea based on selection

      if (selectedCode) {
          row.querySelector('input[type="checkbox"][name*="' + organName + '"][value="' + selectedCode.status.toLowerCase() + '"]').checked = true;
      }
  }

  function updateDiagnosticImpression() {
      const impressionTextarea = document.getElementById('impressao_diagnostica');
      const impressionText = Object.values(selectedCodes)
          .filter(code => code && code.impressao_diagnostica)
          .map(code => code.impressao_diagnostica)
          .join('\n');
      impressionTextarea.value = impressionText;
  }

  // Form validation
  form.addEventListener('submit', (event) => {
      event.preventDefault();

      // Reset error messages
      pacienteError.textContent = '';
      veterinarioError.textContent = '';
      pacienteInput.classList.remove('error');
      veterinarioInput.classList.remove('error');
      submissionMessage.textContent = ''; // Clear any previous submission messages

      let isValid = true;

      if (pacienteInput.value.trim() === '') {
          pacienteError.classList.add('show');

          pacienteInput.classList.add('error');
          isValid = false;
      }
      if (veterinarioInput.value.trim() === '') {
          veterinarioError.classList.add('show');

          veterinarioInput.classList.add('error');
          isValid = false;
      }
              if (!Object.values(selectedCodes).every(code => code)) {
                  submissionMessage.textContent = 'Por favor, preencha todos os campos.';
                  isValid = false;
              }
              if (isValid) {
                  submissionMessage.textContent = 'Formulário enviado com sucesso!';
                  printButton.classList.remove('hidden');
              }
          },
