(function (global) {
  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function buildSchedule({ principal, annualRatePercent, totalMonths, method }) {
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

    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      records,
      totalInterest: Number(
        records.reduce((sum, record) => sum + record.interestPaid, 0).toFixed(2)
      ),
      totalPayment: Number(
        records.reduce((sum, record) => sum + record.monthlyPayment, 0).toFixed(2)
      ),
    };
  }

  function calculateSinglePrepayment(originalResult, prepayment) {
    const prepayPeriod = Math.round(toNumber(prepayment.period));
    const prepayAmount = Math.max(0, toNumber(prepayment.amount));
    const strategy = prepayment.strategy || 'shorten-term';

    if (!originalResult || !Array.isArray(originalResult.records)) {
      throw new Error('Original loan result is missing');
    }
    if (prepayPeriod < 1 || prepayPeriod >= originalResult.totalMonths) {
      throw new Error('The prepayment period must be between 1 and the total months minus one.');
    }
    if (prepayAmount <= 0) {
      throw new Error('The prepayment amount must be greater than zero.');
    }

    const prepayRecord = originalResult.records[prepayPeriod - 1];
    if (!prepayRecord) {
      throw new Error('The selected prepayment period is invalid.');
    }

    const balanceAfterScheduledPayment = prepayRecord.remainingAfterPayment;
    const remainingPrincipal = balanceAfterScheduledPayment - prepayAmount;
    if (remainingPrincipal <= 0) {
      throw new Error('The prepayment amount is greater than the remaining balance.');
    }

    const remainingMonths = originalResult.totalMonths - prepayPeriod;
    const monthlyRate = originalResult.monthlyRate;
    let newMonths = remainingMonths;
    let newMonthlyPayment = 0;

    if (strategy === 'shorten-term') {
      if (originalResult.method === 'equal-principal') {
        const originalMonthlyPrincipal = originalResult.principal / originalResult.totalMonths;
        newMonths = Math.max(1, Math.ceil(remainingPrincipal / originalMonthlyPrincipal));
      } else {
        const originalMonthlyPayment = originalResult.records[0].monthlyPayment;
        if (monthlyRate === 0) {
          newMonths = Math.max(1, Math.ceil(remainingPrincipal / originalMonthlyPayment));
        } else {
          const denominator = originalMonthlyPayment - remainingPrincipal * monthlyRate;
          if (denominator <= 0) {
            newMonths = 1;
          } else {
            const n = Math.log(originalMonthlyPayment / denominator) / Math.log(1 + monthlyRate);
            newMonths = Math.max(1, Math.ceil(n));
          }
        }
      }
    }

    if (originalResult.method === 'equal-principal') {
      const principalPerMonth = remainingPrincipal / newMonths;
      newMonthlyPayment = principalPerMonth + remainingPrincipal * monthlyRate;
    } else {
      if (monthlyRate === 0) {
        newMonthlyPayment = remainingPrincipal / newMonths;
      } else {
        newMonthlyPayment =
          (remainingPrincipal * monthlyRate * (1 + monthlyRate) ** newMonths) /
          ((1 + monthlyRate) ** newMonths - 1);
      }
    }

    if (strategy === 'reduce-payment') {
      newMonths = remainingMonths;
      if (originalResult.method === 'equal-principal') {
        const principalPerMonth = remainingPrincipal / newMonths;
        newMonthlyPayment = principalPerMonth + remainingPrincipal * monthlyRate;
      } else if (monthlyRate === 0) {
        newMonthlyPayment = remainingPrincipal / newMonths;
      } else {
        newMonthlyPayment =
          (remainingPrincipal * monthlyRate * (1 + monthlyRate) ** newMonths) /
          ((1 + monthlyRate) ** newMonths - 1);
      }
    }

    const remainingRecords = [];
    let remainingBalance = remainingPrincipal;

    if (originalResult.method === 'equal-principal') {
      const monthlyPrincipal = remainingPrincipal / newMonths;
      for (let index = 0; index < newMonths; index += 1) {
        const prevRemaining = remainingBalance;
        const interestPaid = remainingBalance * monthlyRate;
        const principalPaid = monthlyPrincipal;
        const monthlyPaymentValue = principalPaid + interestPaid;
        remainingBalance = Math.max(0, remainingBalance - principalPaid);

        remainingRecords.push({
          period: prepayPeriod + index + 1,
          monthlyPayment: Number(monthlyPaymentValue.toFixed(2)),
          principalPaid: Number(principalPaid.toFixed(2)),
          interestPaid: Number(interestPaid.toFixed(2)),
          remainingPrincipal: Number(prevRemaining.toFixed(2)),
          remainingAfterPayment: Number(remainingBalance.toFixed(2)),
          isPrepayment: index === 0,
        });
      }
    } else {
      for (let index = 0; index < newMonths; index += 1) {
        const prevRemaining = remainingBalance;
        const interestPaid = remainingBalance * monthlyRate;
        const principalPaid = newMonthlyPayment - interestPaid;
        remainingBalance = Math.max(0, remainingBalance - principalPaid);

        remainingRecords.push({
          period: prepayPeriod + index + 1,
          monthlyPayment: Number(newMonthlyPayment.toFixed(2)),
          principalPaid: Number(principalPaid.toFixed(2)),
          interestPaid: Number(interestPaid.toFixed(2)),
          remainingPrincipal: Number(prevRemaining.toFixed(2)),
          remainingAfterPayment: Number(remainingBalance.toFixed(2)),
          isPrepayment: index === 0,
        });
      }
    }

    const remainingInterest = remainingRecords.reduce((sum, record) => sum + record.interestPaid, 0);
    const remainingPayment = remainingRecords.reduce((sum, record) => sum + record.monthlyPayment, 0);
    const originalRemainingInterest = originalResult.records
      .slice(prepayPeriod)
      .reduce((sum, record) => sum + record.interestPaid, 0);

    const scheduleRows = [
      {
        type: 'prepayment',
        period: prepayPeriod,
        monthlyPayment: Number(prepayAmount.toFixed(2)),
        principalPaid: Number(prepayAmount.toFixed(2)),
        interestPaid: 0,
        remainingPrincipal: Number(balanceAfterScheduledPayment.toFixed(2)),
        remainingAfterPayment: Number(remainingPrincipal.toFixed(2)),
        isPrepayment: true,
        note: 'One-time repayment applied',
      },
      ...remainingRecords,
    ];

    return {
      principal: originalResult.principal,
      annualRatePercent: originalResult.annualRatePercent,
      annualRate: originalResult.annualRate,
      totalMonths: prepayPeriod + newMonths,
      method: originalResult.method,
      monthlyRate: originalResult.monthlyRate,
      monthlyPayment: Number(newMonthlyPayment.toFixed(2)),
      totalPayment: Number((remainingPayment + prepayAmount).toFixed(2)),
      totalInterest: Number((remainingInterest).toFixed(2)),
      interestSaved: Number((originalRemainingInterest - remainingInterest).toFixed(2)),
      records: scheduleRows,
      prepayDetails: {
        period: prepayPeriod,
        amount: Number(prepayAmount.toFixed(2)),
        strategy,
        remainingPrincipalBeforePrepayment: Number(balanceAfterScheduledPayment.toFixed(2)),
        remainingPrincipalAfterPrepayment: Number(remainingPrincipal.toFixed(2)),
        finalMonths: prepayPeriod + newMonths,
      },
      mode: 'prepayment',
    };
  }

  global.loanCalculator = global.loanCalculator || {};
  global.loanCalculator.calculateSinglePrepayment = calculateSinglePrepayment;
})(window);
