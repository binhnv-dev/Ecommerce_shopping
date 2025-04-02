const filterMonth = (history, currentMonth) => {
  let total = 0;
  const month = history.filter((payment) => {
    return payment.updatedAt.getMonth() + 1 == currentMonth;
  });

  if (month) {
    total = month.reduce((a, b) => a + b["total"], 0);
  }

  return total;
};

module.exports = { filterMonth };
