import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DatabaseService from '../services/DatabaseService';
import * as CurrencyService from '../services/CurrencyService';

const SavingsScreen = ({ navigation }) => {
  const [savings, setSavings] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalSavedBRL, setTotalSavedBRL] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    loadSavings();
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    try {
      const rate = await CurrencyService.getExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      Alert.alert('Erro', 'Não foi possível carregar a taxa de câmbio.');
    }
  };

  const loadSavings = async () => {
    try {
      const savingsData = await DatabaseService.getAllSavings();
      setSavings(savingsData);
      
      // Calculate total saved
      const total = savingsData.reduce((sum, item) => sum + item.amount, 0);
      setTotalSaved(total);
      
      // Convert to BRL
      const rate = await CurrencyService.getExchangeRate();
      setTotalSavedBRL(total * rate);
    } catch (error) {
      console.error('Error loading savings:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de poupança.');
    }
  };

  const deleteSaving = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este depósito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteSaving(id);
              loadSavings();
            } catch (error) {
              console.error('Error deleting saving:', error);
              Alert.alert('Erro', 'Não foi possível excluir o depósito.');
            }
          } 
        }
      ]
    );
  };

  const renderSavingItem = ({ item }) => {
    const amountBRL = item.amount * exchangeRate;
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountEUR}>€ {item.amount.toFixed(2)}</Text>
          <Text style={styles.amountBRL}>R$ {amountBRL.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteSaving(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Poupança</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSaving', { onSavingAdded: loadSavings })}
        >
          <Ionicons name="add-circle" size={28} color="#4ecdc4" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Poupado:</Text>
        <Text style={styles.summaryAmountEUR}>€ {totalSaved.toFixed(2)}</Text>
        <Text style={styles.summaryAmountBRL}>R$ {totalSavedBRL.toFixed(2)}</Text>
      </View>

      <FlatList
        data={savings}
        renderItem={renderSavingItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum depósito registrado</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#effcfa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#4ecdc4',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  summaryAmountEUR: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ecdc4',
  },
  summaryAmountBRL: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  amountContainer: {
    marginHorizontal: 12,
  },
  amountEUR: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecdc4',
    textAlign: 'right',
  },
  amountBRL: {
    fontSize: 14,
    color: '#888',
    textAlign: 'right',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default SavingsScreen;
