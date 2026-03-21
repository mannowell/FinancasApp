import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DatabaseService from '../services/DatabaseService';
import * as CurrencyService from '../services/CurrencyService';

const AddSavingScreen = ({ navigation, route }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [amountBRL, setAmountBRL] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  
  useEffect(() => {
    loadExchangeRate();
  }, []);

  useEffect(() => {
    if (amount && exchangeRate) {
      const eurValue = parseFloat(amount.replace(',', '.'));
      if (!isNaN(eurValue)) {
        setAmountBRL((eurValue * exchangeRate).toFixed(2));
      }
    } else {
      setAmountBRL('');
    }
  }, [amount, exchangeRate]);

  const loadExchangeRate = async () => {
    try {
      const rate = await CurrencyService.getExchangeRate();
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      Alert.alert('Erro', 'Não foi possível carregar a taxa de câmbio.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const saveSaving = async () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição.');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Erro', 'Por favor, insira um valor.');
      return;
    }

    const amountValue = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }

    try {
      const savingData = {
        description: description.trim(),
        amount: amountValue,
        date: date.toISOString(),
        exchangeRate: exchangeRate
      };

      await DatabaseService.addSaving(savingData);
      
      if (route.params?.onSavingAdded) {
        route.params.onSavingAdded();
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving deposit:', error);
      Alert.alert('Erro', 'Não foi possível salvar o depósito.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Novo Depósito</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Depósito mensal"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor (EUR)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {amount && exchangeRate > 0 && (
            <View style={styles.conversionContainer}>
              <Text style={styles.conversionLabel}>Equivalente em BRL:</Text>
              <Text style={styles.conversionValue}>R$ {amountBRL}</Text>
              <Text style={styles.exchangeRateText}>Taxa: R$ {exchangeRate.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {date.toLocaleDateString('pt-BR')}
              </Text>
              <Ionicons name="calendar-outline" size={22} color="#555" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveSaving}
        >
          <Ionicons name="save-outline" size={22} color="#fff" />
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  conversionContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  conversionLabel: {
    fontSize: 14,
    color: '#888',
  },
  conversionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginVertical: 4,
  },
  exchangeRateText: {
    fontSize: 12,
    color: '#888',
  },
  saveButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddSavingScreen;
