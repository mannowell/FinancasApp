// Format currency values
export const formatCurrency = (value, currency = 'EUR') => {
  let symbol = currency === 'EUR' ? '€' : 'R$';
  return `${symbol} ${value.toFixed(2)}`;
};

// Get first and last day of month
export const getMonthDateRange = (year, month) => {
  // Month is 1-indexed (January is 1, February is 2, etc)
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  return { firstDay, lastDay };
};

// Get categories for expenses and income
export const getCategories = (type) => {
  if (type === 'expense') {
    return [
      'Mercado',
      'Transporte',
      'Lazer',
      'Contas',
      'Alimentação',
      'Saúde',
      'Educação',
      'Compras',
      'Moradia',
      'Outros'
    ];
  } else {
    return [
      'Salário',
      'Investimentos',
      'Presente',
      'Reembolso',
      'Outros'
    ];
  }
};

// Get payment methods
export const getPaymentMethods = () => {
  return [
    'Débito',
    'Cartão físico',
    'Cartão virtual',
    'Dinheiro',
    'Transferência',
    'Wise',
    'Pix'
  ];
};

// Get current month and year
export const getCurrentMonthYear = () => {
  const date = new Date();
  return {
    month: date.getMonth() + 1, // JavaScript months are 0-indexed
    year: date.getFullYear()
  };
};

// Get month name
export const getMonthName = (month) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto', 
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return months[month - 1];
};

// Calculate summary statistics
export const calculateSummary = (transactions) => {
  const summary = {
    income: 0,
    expenses: 0,
    balance: 0,
    categories: {}
  };
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      summary.income += transaction.amount;
    } else {
      summary.expenses += transaction.amount;
      
      // Add to category summary
      if (!summary.categories[transaction.category]) {
        summary.categories[transaction.category] = 0;
      }
      summary.categories[transaction.category] += transaction.amount;
    }
  });
  
  summary.balance = summary.income - summary.expenses;
  
  return summary;
};
