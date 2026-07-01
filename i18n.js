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
      prepaymentTitle: 'One-time repayment',
      prepaymentIntro: 'Choose a repayment month and the amount to apply a one-time repayment.',
      prepaymentPeriodLabel: 'Repayment month',
      prepaymentAmountLabel: 'Repayment amount',
      prepaymentStrategyLabel: 'Strategy',
      prepaymentButton: 'Confirm repayment',
      prepaymentShortenTerm: 'Shorten term',
      prepaymentReducePayment: 'Reduce payment',
      prepaymentSummary: 'Prepayment summary',
      prepaymentAmountApplied: 'Amount applied',
      prepaymentRemainingBalance: 'Remaining balance after repayment',
      prepaymentFinalMonths: 'Final months',
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
      prepaymentTitle: '一次性提前还款',
      prepaymentIntro: '选择还款期数，并输入一次性提前还款金额。',
      prepaymentPeriodLabel: '提前还款期数',
      prepaymentAmountLabel: '提前还款金额',
      prepaymentStrategyLabel: '策略',
      prepaymentButton: '确认提前还款',
      prepaymentShortenTerm: '缩短期限',
      prepaymentReducePayment: '降低月供',
      prepaymentSummary: '提前还款结果',
      prepaymentAmountApplied: '已申请金额',
      prepaymentRemainingBalance: '还款后余额',
      prepaymentFinalMonths: '最终期数',
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
    document.getElementById('prepayment-title').textContent = t.prepaymentTitle;
    document.getElementById('prepayment-intro').textContent = t.prepaymentIntro;
    document.getElementById('prepayment-period-label').textContent = t.prepaymentPeriodLabel;
    document.getElementById('prepayment-amount-label').textContent = t.prepaymentAmountLabel;
    document.getElementById('prepayment-strategy-label').textContent = t.prepaymentStrategyLabel;
    document.getElementById('prepayment-button').textContent = t.prepaymentButton;
    const prepaymentStrategy = document.getElementById('prepayment-strategy');
    prepaymentStrategy.querySelector('[value="shorten-term"]').textContent = t.prepaymentShortenTerm;
    prepaymentStrategy.querySelector('[value="reduce-payment"]').textContent = t.prepaymentReducePayment;

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
