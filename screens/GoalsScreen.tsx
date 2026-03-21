import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DatabaseService from '../services/DatabaseService';
import * as CurrencyService from '../services/CurrencyService';
import GoalProgressBar from '../components/GoalProgressBar';

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetAmountBRL, setTargetAmountBRL] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    loadGoals();
    loadExchangeRate();
    loadTotalSaved();
  }, []);

  useEffect(() => {
    if (targetAmount && exchangeRate) {
      const eurValue = parseFloat(targetAmount.replace(',', '.'));
      if (!isNaN(eurValue)) {
        setTargetAmountBRL((eurValue * exchangeRate).toFixed(2));
      }
    } else {
      setTargetAmountBRL('');
    }
  }, [targetAmount, exchangeRate]);

  const loadExchangeRate = async () => {
    try {
      const rate = await CurrencyService.getExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      Alert.alert('Erro', 'Não foi possível carregar a taxa de câmbio.');
    }
  };

  const loadTotalSaved = async () => {
    try {
      const savingsData = await DatabaseService.getAllSavings();
      const total = savingsData.reduce((sum, item) => sum + item.amount, 0);
      setTotalSaved(total);
    } catch (error) {
      console.error('Error loading total saved:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const goalsData = await DatabaseService.getAllGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Erro', 'Não foi possível carregar as metas.');
    }
  };

  const openAddModal = () => {
    setEditingGoalId(null);
    setGoalName('');
    setTargetAmount('');
    setTargetAmountBRL('');
    setModalVisible(true);
  };

  const openEditModal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setTargetAmountBRL((goal.target_amount * exchangeRate).toFixed(2));
    setModalVisible(true);
  };

  const saveGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a meta.');
      return;
    }

    if (!targetAmount.trim()) {
      Alert.alert('Erro', 'Por favor, insira um valor para a meta.');
      return;
    }

    const amountValue = parseFloat(targetAmount.replace(',', '.'));
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    try {
      const goalData = {
        name: goalName.trim(),
        target_amount: amountValue,
        exchange_rate: exchangeRate
      };

      if (editingGoalId) {
        await DatabaseService.updateGoal(editingGoalId, goalData);
      } else {
        await DatabaseService.addGoal(goalData);
      }
      
      setModalVisible(false);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Erro', 'Não foi possível salvar a meta.');
    }
  };

  const deleteGoal = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteGoal(id);
              loadGoals();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Erro', 'Não foi possível excluir a meta.');
            }
          } 
        }
      ]
    );
  };

  const renderGoalItem = ({ item }) => {
    const progress = Math.min(totalSaved / item.target_amount, 1);
    const amountBRL = item.target_amount * exchangeRate;
    
    return (
      <View style={styles.goalItem}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalName}>{item.name}</Text>
          <View style={styles.goalActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil-outline" size={20} color="#4ecdc4" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteGoal(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>

        <GoalProgressBar progress={progress} />
        
        <View style={styles.goalDetails}>
          <Text style={styles.progressText}>
            {(progress * 100).toFixed(1)}% concluído
          </Text>
          <Text style={styles.goalAmount}>
            € {totalSaved.toFixed(2)} / € {item.target_amount.toFixed(2)}
          </Text>
          <Text style={styles.goalAmountBRL}>
            R$ {(totalSaved * exchangeRate).toFixed(2)} / R$ {amountBRL.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Metas Financeiras</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Ionicons name="add-circle" size={28} color="#4ecdc4" />
          <Text style={styles.addButtonText}>Nova Meta</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma meta registrada</Text>
            <Text style={styles.emptySubtext}>Toque em "Nova Meta" para começar</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGoalId ? 'Editar Meta' : 'Nova Meta'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Meta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Casa própria, Viagem, etc."
                value={goalName}
                onChangeText={setGoalName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor da Meta (EUR)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            {targetAmount && exchangeRate > 0 && (
              <View style={styles.conversionContainer}>
                <Text style={styles.conversionLabel}>Equivalente em BRL:</Text>
                <Text style={styles.conversionValue}>R$ {targetAmountBRL}</Text>
                <Text style={styles.exchangeRateText}>Taxa: R$ {exchangeRate.toFixed(2)}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveGoal}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listContainer: {
    paddingBottom: 16,
  },
  goalItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  goalActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  goalDetails: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecdc4',
  },
  goalAmountBRL: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 