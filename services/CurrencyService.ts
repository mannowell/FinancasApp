import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('financas.db');

// API para obter cotação do Euro para Real
// Usando a Exchange Rates API (você pode substituir por outra API de sua preferência)
const API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';
// Nota: Use uma API key real ou substitua por outra API como Open Exchange Rates ou Exchange Rate API

// Função para obter a taxa de câmbio atual do Euro para Real
export const getCurrencyRate = async () => {
  try {
    // Primeiro, tenta buscar a taxa da API
    const response = await axios.get(API_URL);
    const rate = response.data.rates.BRL;
    
    // Salva a taxa no banco de dados para uso offline
    saveRateToDb(rate);
    
    return rate;
  } catch (error) {
    console.error('Erro ao obter taxa de câmbio:', error);
    
    // Se falhar, tenta obter a última taxa salva no banco de dados
    const lastRate = await getLastSavedRate();
    
    if (lastRate) {
      return lastRate;
    }
    
    throw new Error('Não foi possível obter a taxa de câmbio');
  }
};

// Função para salvar a taxa de câmbio no banco de dados
const saveRateToDb = (rate) => {
  const date = new Date().toISOString().split('T')[0]; // Formato: YYYY-MM-DD
  
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO exchange_rates (date, rate) VALUES (?, ?)',
      [date, rate],
      (_, result) => {
        console.log('Taxa de câmbio salva com sucesso');
      },
      (_, error) => {
        console.error('Erro ao salvar taxa de câmbio:', error);
        return true;
      }
    );
  });
};

// Função para obter a última taxa de câmbio salva no banco de dados
const getLastSavedRate = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rate FROM exchange_rates ORDER BY date DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0).rate);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Erro ao obter última taxa de câmbio:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

// Função para obter o histórico de taxas de câmbio
export const getRateHistory = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT date, rate FROM exchange_rates';
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY date ASC';
    
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error('Erro ao obter histórico de taxas:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};
