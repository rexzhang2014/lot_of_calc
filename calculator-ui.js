document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loan-form');
  const prepaymentForm = document.getElementById('prepayment-form');
  const resultContainer = document.getElementById('result');
  const summary = document.getElementById('summary');
  const languageSelect = document.getElementById('language');
  const resetButton = document.getElementById('reset-button');

  if (!form || !prepaymentForm || !resultContainer || !summary || !languageSelect || !resetButton) {
    return;
  }

  let lastResult = null;
  let lastPrepaymentResult = null;

  function resetView() {
    lastResult = null;
    lastPrepaymentResult = null;
    summary.replaceChildren();
    summary.dataset.rendered = 'false';
    resultContainer.replaceChildren();
    form.reset();
    form.principal.value = '650000';
    form.annualRate.value = '3.91';
    form.totalMonths.value = '324';
    form.method.value = 'equal-interest';
    prepaymentForm.prepaymentPeriod.value = '';
    prepaymentForm.prepaymentAmount.value = '';
    prepaymentForm.prepaymentStrategy.value = 'shorten-term';
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

    resultContainer.innerHTML = '';
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
    renderResult(result);
  });

  prepaymentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!lastResult) {
      return;
    }

    const prepaymentResult = window.loanCalculator.calculateSinglePrepayment(lastResult, {
      period: prepaymentForm.prepaymentPeriod.value,
      amount: prepaymentForm.prepaymentAmount.value,
      strategy: prepaymentForm.prepaymentStrategy.value,
    });

    lastPrepaymentResult = prepaymentResult;
    renderResult(prepaymentResult);

    const lang = window.i18n.getInitialLanguage();
    const t = window.i18n.translations[lang] || window.i18n.translations.en;
    const prepaySummary = document.createElement('div');
    prepaySummary.className = 'summary';
    prepaySummary.innerHTML = `
      <p><strong>${t.prepaymentSummary}:</strong></p>
      <p>${t.prepaymentAmountApplied}: ${window.loanCalculator.formatCurrency(prepaymentResult.prepayDetails.amount)}</p>
      <p>${t.prepaymentRemainingBalance}: ${window.loanCalculator.formatCurrency(prepaymentResult.prepayDetails.remainingPrincipalAfterPrepayment)}</p>
      <p>${t.prepaymentFinalMonths}: ${prepaymentResult.prepayDetails.finalMonths}</p>
    `;
    summary.appendChild(prepaySummary);
  });

  resetButton.addEventListener('click', () => {
    resetView();
  });

  languageSelect.addEventListener('change', (event) => {
    const language = event.target.value;
    window.localStorage.setItem('loan-calculator-language', language);
    window.i18n.applyLanguage(language);
    if (lastResult) {
      renderResult(lastResult);
    }
  });

  const initialLanguage = window.i18n.getInitialLanguage();
  languageSelect.value = initialLanguage;
  window.i18n.applyLanguage(initialLanguage);
  resetView();
});
