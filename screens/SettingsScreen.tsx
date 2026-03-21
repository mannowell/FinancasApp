import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  List, 
  Switch, 
  Divider, 
  Button, 
  Text, 
  RadioButton, 
  Dialog, 
  Portal,
  Title
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('BRL');
  const [currencyDialogVisible, setCurrencyDialogVisible] = useState(false);
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false);

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await AsyncStorage.getItem('settings');
        if (settingsData) {
          const settings = JSON.parse(settingsData);
          setDarkMode(settings.darkMode || false);
          setNotifications(settings.notifications || true);
          setCurrency(settings.currency || 'BRL');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();
  }, []);

  // Salvar configurações quando alteradas
  const saveSettings = async (key, value) => {
    try {
      const settingsData = await AsyncStorage.getItem('settings');
      let settings = settingsData ? JSON.parse(settingsData) : {};
      settings[key] = value;
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    saveSettings('darkMode', newValue);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    saveSettings('notifications', newValue);
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    saveSettings('currency', newCurrency);
    setCurrencyDialogVisible(false);
  };

  const clearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Tem certeza que deseja apagar todos os dados do aplicativo? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar Tudo', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Reinicializar configurações padrão
              await AsyncStorage.setItem('firstLaunch', 'false');
              await AsyncStorage.setItem('transactions', JSON.stringify([]));
              await AsyncStorage.setItem('savings', JSON.stringify([]));
              await AsyncStorage.setItem('goals', JSON.stringify([]));
              await AsyncStorage.setItem('settings', JSON.stringify({
                currency: 'BRL',
                darkMode: false,
                notifications: true
              }));
              
              // Resetar os estados
              setDarkMode(false);
              setNotifications(true);
              setCurrency('BRL');
              
              Alert.alert('Sucesso', 'Todos os dados foram apagados.');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível apagar os dados.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Aparência</List.Subheader>
        <List.Item
          title="Modo Escuro"
          description="Alterar tema do aplicativo"
          left={() => <List.Icon icon={props => <FontAwesome5 name="moon" {...props} />} />}
          right={() => <Switch value={darkMode} onValueChange={handleDarkModeToggle} />}
        />
        
        <Divider />
        
        <List.Subheader>Notificações</List.Subheader>
        <List.Item
          title="Notificações"
          description="Ativar alertas e lembretes"
          left={() => <List.Icon icon={props => <FontAwesome5 name="bell" {...props} />} />}
          right={() => <Switch value={notifications} onValueChange={handleNotificationsToggle} />}
        />
        
        <Divider />
        
        <List.Subheader>Preferências Financeiras</List.Subheader>
        <List.Item
          title="Moeda"
          description={`Moeda atual: ${currency}`}
          left={() => <List.Icon icon={props => <FontAwesome5 name="dollar-sign" {...props} />} />}
          onPress={() => setCurrencyDialogVisible(true)}
        />
        
        <Divider />
        
        <List.Subheader>Dados</List.Subheader>
        <List.Item
          title="Limpar Todos os Dados"
          description="Apagar todas as transações, poupanças e metas"
          left={() => <List.Icon color="#F44336" icon={props => <FontAwesome5 name="trash" {...props} color="#F44336" />} />}
          onPress={clearAllData}
        />
        
        <Divider />
        
        <List.Subheader>Sobre</List.Subheader>
        <List.Item
          title="Sobre o Aplicativo"
          description="Informações sobre o aplicativo"
          left={() => <List.Icon icon={props => <FontAwesome5 name="info-circle" {...props} />} />}
          onPress={() => setAboutDialogVisible(true)}
        />
      </List.Section>
      
      {/* Diálogo para seleção de moeda */}
      <Portal>
        <Dialog
          visible={currencyDialogVisible}
          onDismiss={() => setCurrencyDialogVisible(false)}
        >
          <Dialog.Title>Selecionar Moeda</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => handleCurrencyChange(value)} value={currency}>
              <RadioButton.Item label="Real Brasileiro (R$)" value="BRL" />
              <RadioButton.Item label="Dólar Americano ($)" value="USD" />
              <RadioButton.Item label="Euro (€)" value="EUR" />
              <RadioButton.Item label="Libra Esterlina (£)" value="GBP" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCurrencyDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Diálogo sobre o aplicativo */}
      <Portal>
        <Dialog
          visible={aboutDialogVisible}
          onDismiss={() => setAboutDialogVisible(false)}
        >
          <Dialog.Title>Sobre o Aplicativo</Dialog.Title>
          <Dialog.Content>
            <Title style={styles.appTitle}>Finanças App</Title>
            <Text style={styles.versionText}>Versão 1.0.0</Text>
            <Text style={styles.aboutText}>
              Um aplicativo completo para gerenciamento de finanças pessoais, 
              controle de gastos, poupança e metas financeiras.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAboutDialogVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  aboutText: {
    textAlign: 'center',
    marginBottom: 8,
  }
});

export default SettingsScreen;
