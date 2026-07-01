document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loan-form');
  const prepaymentForm = document.getElementById('prepayment-form');
  const resultContainer = document.getElementById('result');
  const summary = document.getElementById('summary');
  const languageSelect = document.getElementById('language');
  const resetButton = document.getElementById('reset-button');
  const prepaymentMessage = document.getElementById('prepayment-message');

  if (!form || !prepaymentForm || !resultContainer || !summary || !languageSelect || !resetButton) {
    return;
  }

  let lastResult = null;
  let lastPrepaymentResult = null;

  function setMessage(message, isError = false) {
    if (!prepaymentMessage) {
      return;
    }
    prepaymentMessage.textContent = message;
    prepaymentMessage.className = `form-message${isError ? ' error' : ''}`;
  }

  function resetView() {
    lastResult = null;
    lastPrepaymentResult = null;
    summary.replaceChildren();
    summary.dataset.rendered = 'false';
    resultContainer.replaceChildren();
    setMessage('');
    form.reset();
    form.principal.value = '650000';
    form.annualRate.value = '3.91';
    form.totalMonths.value = '324';
    form.method.value = 'equal-interest';
    prepaymentForm.reset();
    prepaymentForm.prepaymentStrategy.value = 'shorten-term';
  }

  function renderTable(records, t, title, isOpen = true) {
    const section = document.createElement('details');
    section.className = 'schedule-section';
    section.open = isOpen;

    const sectionSummary = document.createElement('summary');
    sectionSummary.textContent = title;
    section.appendChild(sectionSummary);

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-scroll-wrapper';

    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>${t.periodHeader}</th>
          <th>${t.paymentHeader}</th>
          <th>${t.principalHeader}</th>
          <th>${t.interestHeader}</th>
          <th>${t.balanceHeader}</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const rows = table.querySelector('tbody');
    records.forEach((record) => {
      const row = document.createElement('tr');
      row.className = record.isPrepayment ? 'highlight-row' : '';
      row.innerHTML = `
        <td>${record.period}</td>
        <td>${window.loanCalculator.formatCurrency(record.monthlyPayment)}</td>
        <td>${window.loanCalculator.formatCurrency(record.principalPaid)}</td>
        <td>${window.loanCalculator.formatCurrency(record.interestPaid)}</td>
        <td>${window.loanCalculator.formatCurrency(record.remainingAfterPayment)}</td>
      `;
      rows.appendChild(row);
    });

    tableWrapper.appendChild(table);
    section.appendChild(tableWrapper);
    return section;
  }

  function renderResult(result) {
    const lang = window.i18n.getInitialLanguage();
    const t = window.i18n.translations[lang] || window.i18n.translations.en;

    summary.innerHTML = `
      <p><strong>${t.monthlyPayment}:</strong> ${window.loanCalculator.formatCurrency(result.monthlyPayment)}</p>
      <p><strong>${t.totalPayment}:</strong> ${window.loanCalculator.formatCurrency(result.totalPayment)}</p>
      <p><strong>${t.totalInterest}:</strong> ${window.loanCalculator.formatCurrency(result.totalInterest)}</p>
      <p><strong>${t.interestRate}:</strong> ${window.loanCalculator.formatPercent(result.annualRatePercent)}</p>
    `;
    summary.dataset.rendered = 'true';

    resultContainer.replaceChildren();

    if (result.mode === 'prepayment') {
      const wrapper = document.createElement('div');
      wrapper.className = 'schedule-groups';

      if (Array.isArray(result.timelineSections) && result.timelineSections.length > 0) {
        result.timelineSections.forEach((section) => {
          wrapper.appendChild(renderTable(section.records, t, section.title, false));
        });
      } else if (result.sections) {
        wrapper.appendChild(renderTable(result.sections.before, t, t.beforeScheduleSection, true));
        wrapper.appendChild(renderTable(result.sections.after, t, t.afterScheduleSection, true));
      }

      resultContainer.appendChild(wrapper);

      const prepaySummary = document.createElement('div');
      prepaySummary.className = 'summary';
      prepaySummary.innerHTML = `
        <p><strong>${t.prepaymentSummary}:</strong></p>
        <p>${t.prepaymentAmountApplied}: ${window.loanCalculator.formatCurrency(result.prepayDetails.amount)}</p>
        <p>${t.prepaymentRemainingBalance}: ${window.loanCalculator.formatCurrency(result.prepayDetails.remainingPrincipalAfterPrepayment)}</p>
        <p>${t.prepaymentFinalMonths}: ${result.prepayDetails.finalMonths}</p>
      `;
      summary.appendChild(prepaySummary);
    } else {
      const table = document.createElement('table');
      table.className = 'results-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>${t.periodHeader}</th>
            <th>${t.paymentHeader}</th>
            <th>${t.principalHeader}</th>
            <th>${t.interestHeader}</th>
            <th>${t.balanceHeader}</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const rows = table.querySelector('tbody');
      result.records.forEach((record) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${record.period}</td>
          <td>${window.loanCalculator.formatCurrency(record.monthlyPayment)}</td>
          <td>${window.loanCalculator.formatCurrency(record.principalPaid)}</td>
          <td>${window.loanCalculator.formatCurrency(record.interestPaid)}</td>
          <td>${window.loanCalculator.formatCurrency(record.remainingAfterPayment)}</td>
        `;
        rows.appendChild(row);
      });
      resultContainer.appendChild(table);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const principal = form.principal.value;
    const annualRatePercent = form.annualRate.value;
    const totalMonths = form.totalMonths.value;
    const method = form.method.value;

    const result = window.loanCalculator.calculateLoanSchedule({
      principal,
      annualRatePercent,
      totalMonths,
      method,
    });

    lastResult = result;
    lastPrepaymentResult = null;
    renderResult(result);
  });

  prepaymentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!lastResult) {
      setMessage('Please calculate the loan plan first.', true);
      return;
    }

    const activeResult = lastPrepaymentResult || lastResult;
    const period = Math.round(Number(prepaymentForm.prepaymentPeriod.value));
    const amount = Math.round(Number(prepaymentForm.prepaymentAmount.value));
    const balanceAtPeriod = activeResult.records[period - 1]?.remainingAfterPayment;

    if (!Number.isInteger(period) || period < 1 || period >= activeResult.totalMonths) {
      setMessage('Please select a valid repayment period.', true);
      return;
    }

    if (!Number.isInteger(amount) || amount < 1) {
      setMessage('The prepayment amount must be an integer greater than zero.', true);
      return;
    }

    if (balanceAtPeriod === undefined || amount > balanceAtPeriod) {
      setMessage('The prepayment amount cannot exceed the outstanding balance at the selected period.', true);
      return;
    }

    try {
      const prepaymentResult = window.loanCalculator.calculateSinglePrepayment(activeResult, {
        period: prepaymentForm.prepaymentPeriod.value,
        amount: prepaymentForm.prepaymentAmount.value,
        strategy: prepaymentForm.prepaymentStrategy.value,
      });

      lastPrepaymentResult = prepaymentResult;
      prepaymentForm.prepaymentPeriod.value = '';
      prepaymentForm.prepaymentAmount.value = '';
      renderResult(prepaymentResult);
      setMessage('');
    } catch (error) {
      setMessage(error.message, true);
    }
  });

  resetButton.addEventListener('click', () => {
    resetView();
  });

  languageSelect.addEventListener('change', (event) => {
    const language = event.target.value;
    window.localStorage.setItem('loan-calculator-language', language);
    window.i18n.applyLanguage(language);
    if (lastPrepaymentResult) {
      renderResult(lastPrepaymentResult);
    } else if (lastResult) {
      renderResult(lastResult);
    }
  });

  const initialLanguage = window.i18n.getInitialLanguage();
  languageSelect.value = initialLanguage;
  window.i18n.applyLanguage(initialLanguage);
  resetView();
});
