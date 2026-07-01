document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loan-form');
  const resultContainer = document.getElementById('result');
  const summary = document.getElementById('summary');

  if (!form || !resultContainer || !summary) {
    return;
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

    summary.innerHTML = `
      <p><strong>Monthly payment:</strong> ${window.loanCalculator.formatCurrency(result.monthlyPayment)}</p>
      <p><strong>Total payment:</strong> ${window.loanCalculator.formatCurrency(result.totalPayment)}</p>
      <p><strong>Total interest:</strong> ${window.loanCalculator.formatCurrency(result.totalInterest)}</p>
      <p><strong>Interest rate:</strong> ${window.loanCalculator.formatPercent(result.annualRatePercent)}</p>
    `;

    resultContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Period</th>
          <th>Payment</th>
          <th>Principal</th>
          <th>Interest</th>
          <th>Balance</th>
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
  });
});
