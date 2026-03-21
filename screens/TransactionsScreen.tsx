// screens/TransactionsScreen.js
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar componentes e serviços
import { getTransactions } from '../db';
import AddTransactionScreen from './AddTransactionScreen';
import TransactionDetailsScreen from './TransactionDetailsScreen';

const Stack = createStackNavigator();

// Componente principal de listagem de transações
const TransactionListScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('month'); // 'day', 'week', 'month', 'year'

  const loadTransactions = async () => {
    setRefreshing(true);
    try {
      const data = await getTransactions(filter);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  // Recarregar quando a tela for focada
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    return unsubscribe;
  }, [navigation, filter]);

  const formatCurrency = (value, currency) => {
    return currency === 'EUR' 
      ? `€${value.toFixed(2)}`
      : `R$${value.toFixed(2)}`;
  };

  // Agrupar transações por data
  const groupTransactionsByDate = () => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = transaction.transaction_date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    return Object.keys(grouped).map(date => ({
      date,
      data: grouped[date]
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetails', { id: item.id })}
    >
      <View style={styles.transactionLeftContent}>
        <View 
          style={[
            styles.categoryIndicator, 
            {backgroundColor: item.category_color || '#CCCCCC'}
          ]} 
        />
        <View>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDetails}>
            {item.category_name} • {item.payment_method}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionRightContent}>
        <Text 
          style={[
            styles.transactionAmountEuro,
            item.transaction_type === 'expense' ? styles.expenseText : styles.incomeText
          ]}
        >
          {item.transaction_type === 'expense' ? '- ' : '+ '}
          {formatCurrency(item.amount_euro, 'EUR')}
        </Text>
        <Text style={styles.transactionAmountBrl}>
          {formatCurrency(item.amount_brl, 'BRL')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
    
    // Calcular totais do dia
    const dailyTotal = item.data.reduce(
      (acc, transaction) => {
        if (transaction.transaction_type === 'income') {
          acc.income += transaction.amount_euro;
        } else {
          acc.expense += transaction.amount_euro;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    
    return (
      <View style={styles.dateGroup}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <View style={styles.dateTotals}>
            <Text style={styles.incomeText}>+{formatCurrency(dailyTotal.income, 'EUR')}</Text>
            <Text style={styles.expenseText}>-{formatCurrency(dailyTotal.expense, 'EUR')}</Text>
          </View>
        </View>
        
        {item.data.map(transaction => renderTransactionItem({ item: transaction }))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'day' && styles.activeFilter]}
          onPress={() => setFilter('day')}
        >
          <Text style={[styles.filterText, filter === 'day' && styles.activeFilterText]}>Hoje</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'week' && styles.activeFilter]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.activeFilterText]}>Semana</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'month' && styles.activeFilter]}
          onPress={() => setFilter('month')}
        >
          <Text style={[styles.filterText, filter === 'month' && styles.activeFilterText]}>Mês</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'year' && styles.activeFilter]}
          onPress={() => setFilter('year')}
        >
          <Text style={[styles.filterText, filter === 'year' && styles.activeFilterText]}>Ano</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de transações */}
      <FlatList
        data={groupTransactionsByDate()}
        renderItem={renderDateGroup}
        keyExtractor={item => item.date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadTransactions}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            <Text style={styles.emptySubtext}>Adicione uma nova transação usando o botão abaixo</Text>
          </View>
        }
      />

      {/* Botão para adicionar transação */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// Navegação de Transações
const TransactionsScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TransactionList" 
        component={TransactionListScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen} 
        options={{ title: 'Nova Transação' }}
      />
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen} 
        options={{ title: 'Detalhes da Transação' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeFilter: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    color: '#757575',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateGroup: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dateText: {
    fontWeight: '500',
    color: '#212121',
    textTransform: 'capitalize',
  },
  dateTotals: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  transactionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  transactionDetails: {
    fontSize: 12,
    color: '#757575',
  },
  transactionRightContent: {
    alignItems: 'flex-end',
  },
  transactionAmountEuro: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionAmountBrl: {
    fontSize: 12,
    color: '#757575',
  },
  incomeText: {
    color: '#4CAF50',
    marginRight: 10,
  },
  expenseText: {
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#0066CC',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default TransactionsScreen;
