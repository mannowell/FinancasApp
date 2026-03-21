import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
  // Helper to get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Mercado': 'cart-outline',
      'Transporte': 'car-outline',
      'Lazer': 'game-controller-outline',
      'Contas': 'document-text-outline',
      'Alimentação': 'restaurant-outline',
      'Saúde': 'medical-outline',
      'Educação': 'school-outline',
      'Compras': 'bag-outline',
      'Moradia': 'home-outline',
      'Salário': 'cash-outline',
      'Investimentos': 'trending-up-outline',
      'Outros': 'ellipsis-horizontal-outline'
    };
    
    return icons[category] || 'help-circle-outline';
  };

  // Helper to get payment method icon
  const getPaymentIcon = (method) => {
    const icons = {
      'Débito': 'card-outline',
      'Cartão físico': 'card-outline',
      'Cartão virtual': 'phone-portrait-outline',
      'Dinheiro': 'cash-outline',
      'Transferência': 'swap-horizontal-outline',
      'Wise': 'globe-outline',
      'Pix': 'flash-outline'
    };
    
    return icons[method] || 'help-circle-outline';
  };

  // Get appropriate color based on transaction type
  const getAmountColor = () => {
    return transaction.type === 'expense' ? '#ff6b6b' : '#4ecdc4';
  };

  // Format amount with correct sign
  const getFormattedAmount = () => {
    const sign = transaction.type === 'expense' ? '-' : '+';
    return `${sign}€ ${transaction.amount.toFixed(2)}`;
  };

  const getFormattedAmountBRL = () => {
    const sign = transaction.type === 'expense' ? '-' : '+';
    return `${sign}R$ ${(transaction.amount * transaction.exchange_rate).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[
          styles.categoryIcon, 
          { backgroundColor: transaction.type === 'expense' ? '#ffeeee' : '#efffee' }
        ]}>
          <Ionicons 
            name={getCategoryIcon(transaction.category)} 
            size={24} 
            color={transaction.type === 'expense' ? '#ff6b6b' : '#4ecdc4'} 
          />
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{transaction.description}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.paymentContainer}>
          <Ionicons 
            name={getPaymentIcon(transaction.payment_method)} 
            size={14} 
            color="#888" 
          />
          <Text style={styles.paymentMethod}>{transaction.payment_method}</Text>
        </View>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {getFormattedAmount()}
        </Text>
        <Text style={styles.amountBRL}>
          {getFormattedAmountBRL()}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit(transaction)}
        >
          <Ionicons name="pencil-outline" size={20} color="#4ecdc4" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDelete(transaction.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  amountContainer: {
    justifyContent: 'center',
    marginRight: 8,
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountBRL: {
    fontSize: 12,
    color: '#888',
  },
  actionsContainer: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 4,
    marginBottom: 4,
  }
});

export default TransactionItem;
