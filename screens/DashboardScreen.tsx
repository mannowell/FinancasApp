import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const db = SQLite.openDatabase('financas.db');
const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    balanceEUR: 0,
    balanceBRL: 0,
    incomeEUR: 0,
    expenseEUR: 0,
    incomeBRL: 0,
    expenseBRL: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Cores para categorias no gráfico de pizza
  const categoryColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#8AC24A', '#EA80FC', '#00E676', '#FFA726'
  ];

  // Carregar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentMonth])
  );

  // Função para carregar todos os dados
  const loadData = async () => {
    setLoading(true);
    setRefreshing(true);
    
    try {
      await Promise.all([
        loadSummary(),
        loadMonthlyData