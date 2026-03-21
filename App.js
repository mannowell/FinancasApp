import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// Importação das telas
import DashboardScreen from './screens/DashboardScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import SavingsScreen from './screens/SavingsScreen';
import AddSavingScreen from './screens/AddSavingScreen';
import GoalsScreen from './screens/GoalsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Inicialização dos navegadores
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Manter a tela de splash visível enquanto carregamos recursos
SplashScreen.preventAutoHideAsync();

// Definição do tema personalizado
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E88E5',
    accent: '#4CAF50',
    background: '#F5F5F5',
    text: '#212121',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
};

// Navegação da seção de transações
function TransactionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Transações" component={TransactionsScreen} />
      <Stack.Screen name="Adicionar Transação" component={AddTransactionScreen} />
    </Stack.Navigator>
  );
}

// Navegação da seção de poupança
function SavingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Poupança" component={SavingsScreen} />
      <Stack.Screen name="Adicionar Poupança" component={AddSavingScreen} />
    </Stack.Navigator>
  );
}

// Navegação da seção de metas
function GoalsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="Metas Financeiras" component={GoalsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    // Verificar se é o primeiro lançamento do app
    async function prepare() {
      try {
        const firstLaunch = await AsyncStorage.getItem('firstLaunch');
        
        if (firstLaunch === null) {
          // É a primeira vez que o app está sendo executado
          // Inicializar dados padrão
          await AsyncStorage.setItem('firstLaunch', 'false');
          await AsyncStorage.setItem('transactions', JSON.stringify([]));
          await AsyncStorage.setItem('savings', JSON.stringify([]));
          await AsyncStorage.setItem('goals', JSON.stringify([]));
          await AsyncStorage.setItem('settings', JSON.stringify({
            currency: 'BRL',
            darkMode: false,
            notifications: true
          }));
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (e) {
        console.warn('Erro ao carregar dados iniciais:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = 'home';
              } else if (route.name === 'Transações') {
                iconName = 'exchange-alt';
              } else if (route.name === 'Poupança') {
                iconName = 'piggy-bank';
              } else if (route.name === 'Metas') {
                iconName = 'bullseye';
              } else if (route.name === 'Configurações') {
                iconName = 'cog';
              }

              return <FontAwesome5 name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen 
            name="Transações" 
            component={TransactionsStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="Poupança" 
            component={SavingsStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen 
            name="Metas" 
            component={GoalsStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen name="Configurações" component={SettingsScreen} />
        </Tab.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </PaperProvider>
  );
}
