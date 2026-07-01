(function (global) {
  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    return `${value.toFixed(2)}%`;
  }

  function calculateLoanSchedule({ principal, annualRatePercent, totalMonths, method }) {
    const principalValue = Math.max(0, toNumber(principal));
    const annualRate = Math.max(0, toNumber(annualRatePercent)) / 100;
    const months = Math.max(1, Math.round(toNumber(totalMonths)));
    const monthlyRate = annualRate / 12;

    let monthlyPayment = 0;
    const records = [];
    let remainingPrincipal = principalValue;

    if (method === 'equal-principal') {
      const monthlyPrincipal = principalValue / months;

      for (let index = 0; index < months; index += 1) {
        const prevRemaining = remainingPrincipal;
        const interestPaid = remainingPrincipal * monthlyRate;
        const principalPaid = monthlyPrincipal;
        monthlyPayment = principalPaid + interestPaid;
        remainingPrincipal = Math.max(0, remainingPrincipal - principalPaid);

        records.push({
          period: index + 1,
          monthlyPayment: Number(monthlyPayment.toFixed(2)),
          principalPaid: Number(principalPaid.toFixed(2)),
          interestPaid: Number(interestPaid.toFixed(2)),
          remainingPrincipal: Number(prevRemaining.toFixed(2)),
          remainingAfterPayment: Number(remainingPrincipal.toFixed(2)),
        });
      }
    } else {
      if (monthlyRate === 0) {
        monthlyPayment = principalValue / months;
      } else {
        monthlyPayment =
          (principalValue * monthlyRate * (1 + monthlyRate) ** months) /
          ((1 + monthlyRate) ** months - 1);
      }

      for (let index = 0; index < months; index += 1) {
        const prevRemaining = remainingPrincipal;
        const interestPaid = remainingPrincipal * monthlyRate;
        const principalPaid = monthlyPayment - interestPaid;
        remainingPrincipal = Math.max(0, remainingPrincipal - principalPaid);

        records.push({
          period: index + 1,
          monthlyPayment: Number(monthlyPayment.toFixed(2)),
          principalPaid: Number(principalPaid.toFixed(2)),
          interestPaid: Number(interestPaid.toFixed(2)),
          remainingPrincipal: Number(prevRemaining.toFixed(2)),
          remainingAfterPayment: Number(remainingPrincipal.toFixed(2)),
        });
      }
    }

    const totalPayment = records.reduce((sum, record) => sum + record.monthlyPayment, 0);
    const totalInterest = totalPayment - principalValue;

    return {
      principal: principalValue,
      annualRatePercent: annualRate * 100,
      totalMonths: months,
      method,
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      records,
    };
  }

  global.loanCalculator = {
    calculateLoanSchedule,
    formatCurrency,
    formatPercent,
  };
})(window);
