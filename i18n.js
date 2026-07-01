(function (global) {
  const translations = {
    en: {
      title: 'Loan Calculator',
      badge: 'GitHub Pages',
      intro: 'Enter your loan details and calculate the repayment schedule directly in your browser.',
      principalLabel: 'Principal',
      annualRateLabel: 'Annual rate (%)',
      totalMonthsLabel: 'Total months',
      methodLabel: 'Repayment method',
      methodEqualInterest: 'Equal principal and interest',
      methodEqualPrincipal: 'Equal principal',
      calculateButton: 'Calculate',
      resetButton: 'Reset',
      monthlyPayment: 'Monthly payment',
      totalPayment: 'Total payment',
      totalInterest: 'Total interest',
      interestRate: 'Interest rate',
      periodHeader: 'Period',
      paymentHeader: 'Payment',
      principalHeader: 'Principal',
      interestHeader: 'Interest',
      balanceHeader: 'Balance',
      languageLabel: 'Language',
    },
    zh: {
      title: '贷款计算器',
      badge: 'GitHub Pages',
      intro: '输入贷款信息，在浏览器中直接计算还款计划。',
      principalLabel: '贷款本金',
      annualRateLabel: '年利率 (%)',
      totalMonthsLabel: '总期数',
      methodLabel: '还款方式',
      methodEqualInterest: '等额本息',
      methodEqualPrincipal: '等额本金',
      calculateButton: '计算',
      resetButton: '重置',
      monthlyPayment: '月供',
      totalPayment: '总还款额',
      totalInterest: '总利息',
      interestRate: '年利率',
      periodHeader: '期数',
      paymentHeader: '月供',
      principalHeader: '本金',
      interestHeader: '利息',
      balanceHeader: '余额',
      languageLabel: '语言',
    },
  };

  function getInitialLanguage() {
    const saved = window.localStorage.getItem('loan-calculator-language');
    if (saved && translations[saved]) {
      return saved;
    }
    return 'zh';
  }

  function applyLanguage(language) {
    const t = translations[language] || translations.en;
    document.documentElement.lang = language;
    document.title = t.title;

    document.getElementById('badge').textContent = t.badge;
    document.getElementById('page-title').textContent = t.title;
    document.getElementById('page-intro').textContent = t.intro;
    document.getElementById('principal-label').textContent = t.principalLabel;
    document.getElementById('annual-rate-label').textContent = t.annualRateLabel;
    document.getElementById('total-months-label').textContent = t.totalMonthsLabel;
    document.getElementById('method-label').textContent = t.methodLabel;
    document.getElementById('language-label').textContent = t.languageLabel;
    document.getElementById('calculate-button').textContent = t.calculateButton;
    document.getElementById('reset-button').textContent = t.resetButton;

    const methodSelect = document.getElementById('method');
    methodSelect.querySelector('[value="equal-interest"]').textContent = t.methodEqualInterest;
    methodSelect.querySelector('[value="equal-principal"]').textContent = t.methodEqualPrincipal;

    const summary = document.getElementById('summary');
    if (summary.dataset.rendered === 'true') {
      summary.dispatchEvent(new Event('rerender', { bubbles: true }));
    }
  }

  global.i18n = {
    translations,
    getInitialLanguage,
    applyLanguage,
  };
})(window);
