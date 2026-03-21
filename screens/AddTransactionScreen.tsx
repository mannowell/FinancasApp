import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SQLite from 'expo-sqlite';
import { getCurrencyRate } from '../services/CurrencyService';
import { format } from 'date-fns';

const db = SQLite.openDatabase('financas.db');

export default function AddTransactionScreen({ navigation, route }) {
  // Estado para verificar se é edição ou criação
  const editingItem = route.params?.transaction;
  
  // Estados para os campos do formulário
  const [description, setDescription] = useState(editingItem?.description || '');
  const [amount, setAmount] = useState(editingItem?.amount ? editingItem.amount.toString() : '');
  const [category, setCategory] = useState(editingItem?.category || 'Outros');
  const [paymentMethod, setPaymentMethod] = useState(editingItem?.payment_method || 'Débito');
  const [date, setDate] = useState(editingItem?.date ? new Date(editingItem.date) : new Date());
  const [isExpense, setIsExpense] = useState(editingItem?.type === 'expense' || true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(editingItem?.exchange_rate || 0);
  
  // Categorias disponíveis
  const categories = [
    'Mercado', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 
    'Educação', 'Compras Online', 'Contas Fixas', 'Outros'
  ];
  
  // Métodos de pagamento disponíveis
  const paymentMethods = [
    'Débito', 'Cartão Virtual', 'Cartão Físico', 'Transferência Wise', 'Dinheiro', 'Outros'
  ];

  // Carregar taxa de câmbio ao iniciar a tela
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const rate = await getCurrencyRate();
        setExchangeRate(rate);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível obter a taxa de câmbio. Usando última taxa conhecida.');
        // Usar uma taxa padrão ou a última taxa conhecida
        setExchangeRate(5.5); // Valor padrão caso não consiga obter a taxa atual
      }
    };
    
    if (!editingItem?.exchange_rate) {
      loadExchangeRate();
    }
  }, []);

  // Função para lidar com mudança de data
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // Função para salvar a transação
  const saveTransaction = () => {
    // Validação dos campos
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    const transactionData = {
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      payment_method: paymentMethod,
      date: format(date, 'yyyy-MM-dd'),
      type: isExpense ? 'expense' : 'income',
      exchange_rate: exchangeRate,
      amount_brl: parseFloat(amount) * exchangeRate
    };

    if (editingItem) {
      // Atualizar transação existente
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE transactions SET description = ?, amount = ?, category = ?, payment_method = ?, date = ?, type = ?, exchange_rate = ?, amount_brl = ? WHERE id = ?',
          [
            transactionData.description,
            transactionData.amount,
            transactionData.category,
            transactionData.payment_method,
            transactionData.date,
            transactionData.type,
            transactionData.exchange_rate,
            transactionData.amount_brl,
            editingItem.id
          ],
          (_, result) => {
            Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
            navigation.goBack();
          },
          (_, error) => {
            console.error('Erro ao atualizar transação:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar a transação.');
            return true;
          }
        );
      });
    } else {
      // Inserir nova transação
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO transactions (description, amount, category, payment_method, date, type, exchange_rate, amount_brl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            transactionData.description,
            transactionData.amount,
            transactionData.category,
            transactionData.payment_method,
            transactionData.date,
            transactionData.type,
            transactionData.exchange_rate,
            transactionData.amount_brl
          ],
          (_, result) => {
            Alert.alert('Sucesso', 'Transação adicionada com sucesso!');
            navigation.goBack();
          },
          (_, error) => {
            console.error('Erro ao adicionar transação:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao adicionar a transação.');
            return true;
          }
        );
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {editingItem ? 'Editar Transação' : 'Nova Transação'}
      </Text>
      
      {/* Tipo de transação (Despesa/Receita) */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Despesa</Text>
        <Switch
          value={!isExpense}
          onValueChange={(value) => setIsExpense(!value)}
          trackColor={{ false: '#FF6B6B', true: '#4CAF50' }}
          thumbColor={isExpense ? '#d32f2f' : '#388E3C'}
        />
        <Text style={styles.switchLabel}>Receita</Text>
      </View>
      
      {/* Descrição */}
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Insira uma descrição"
      />
      
      {/* Valor em Euro */}
      <Text style={styles.label}>Valor (€)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="numeric"
      />
      
      {/* Valor convertido em Real (somente exibição) */}
      {amount && !isNaN(parseFloat(amount)) && (
        <View style={styles.conversionContainer}>
          <Text style={styles.conversionLabel}>
            Valor em R$: {(parseFloat(amount) * exchangeRate).toFixed(2)}
          </Text>
          <Text style={styles.rateLabel}>
            Taxa: €1 = R${exchangeRate.toFixed(2)}
          </Text>
        </View>
      )}
      
      {/* Categoria */}
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      
      {/* Método de pagamento */}
      <Text style={styles.label}>Método de Pagamento</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue) => setPaymentMethod(itemValue)}
          style={styles.picker}
        >
          {paymentMethods.map((method, index) => (
            <Picker.Item key={index} label={method} value={method} />
          ))}
        </Picker>
      </View>
      
      {/* Data */}
      <Text style={styles.label}>Data</Text>
      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>{format(date, 'dd/MM/yyyy')}</Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      
      {/* Botões */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={saveTransaction}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2c3e50',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#607D8B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: '600',
  },
  conversionContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  conversionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  rateLabel: {
    fontSize: 14,
    color: '#546E7A',
    marginTop: 4,
  },
});
