import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

// Abrir conexão com o banco de dados
const db = SQLite.openDatabase('financas.db');

// Inicializar o banco de dados
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Tabela de transações
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          amount_brl REAL NOT NULL,
          category TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          exchange_rate REAL NOT NULL
        );`,
        [],
        () => console.log('Tabela transactions criada'),
        (_, error) => {
          console.error('Erro ao criar tabela transactions:', error);
          return true;
        }
      );

      // Tabela de taxas de câmbio
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exchange_rates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          rate REAL NOT NULL
        );`,
        [],
        () => console.log('Tabela exchange_rates criada'),
        (_, error) => {
          console.error('Erro ao criar tabela exchange_rates:', error);
          return true;
        }
      );

      // Tabela de metas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL NOT NULL DEFAULT 0,
          target_date TEXT,
          created_at TEXT NOT NULL,
          description TEXT,
          icon TEXT
        );`,
        [],
        () => console.log('Tabela goals criada'),
        (_, error) => {
          console.error('Erro ao criar tabela goals:', error);
          return true;
        }
      );

      // Tabela de depósitos para metas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goal_deposits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          note TEXT,
          FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
        );`,
        [],
        () => console.log('Tabela goal_deposits criada'),
        (_, error) => {
          console.error('Erro ao criar tabela goal_deposits:', error);
          return true;
        }
      );

      // Tabela de poupança
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS savings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          amount_brl REAL NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          exchange_rate REAL NOT NULL,
          type TEXT NOT NULL
        );`,
        [],
        () => {
          console.log('Tabela savings criada');
          resolve();
        },
        (_, error) => {
          console.error('Erro ao criar tabela savings:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

// Limpar todos os dados do banco (para fins de desenvolvimento/teste)
export const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Apagar Tudo", 
          style: "destructive",
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql('DELETE FROM transactions;', []);
              tx.executeSql('DELETE FROM exchange_rates;', []);
              tx.executeSql('DELETE FROM goals;', []);
              tx.executeSql('DELETE FROM goal_deposits;', []);
              tx.executeSql('DELETE FROM savings;', []);
            }, (error) => {
              console.error('Erro ao limpar banco de dados:', error);
              reject(error);
            }, () => {
              console.log('Todos os dados foram apagados');
              resolve();
            });
          }
        }
      ]
    );
  });
};

// Exportar dados para backup
export const exportDatabaseToJSON = () => {
  return new Promise((resolve, reject) => {
    const data = {};
    
    // Função para executar uma consulta e armazenar os resultados
    const fetchData = (tableName) => {
      return new Promise((innerResolve, innerReject) => {
        db.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM ${tableName}`,
            [],
            (_, { rows }) => {
              data[tableName] = rows._array;
              innerResolve();
            },
            (_, error) => {
              console.error(`Erro ao exportar tabela ${tableName}:`, error);
              innerReject(error);
              return true;
            }
          );
        });
      });
    };
    
    // Executar todas as consultas
    Promise.all([
      fetchData('transactions'),
      fetchData('exchange_rates'),
      fetchData('goals'),
      fetchData('goal_deposits'),
      fetchData('savings')
    ])
    .then(() => resolve(data))
    .catch(error => reject(error));
  });
};

// Importar dados de backup
export const importDatabaseFromJSON = (data) => {
  return new Promise((resolve, reject) => {
    if (!data || typeof data !== 'object') {
      reject(new Error('Dados inválidos para importação'));
      return;
    }
    
    db.transaction(tx => {
      // Limpar tabelas existentes
      tx.executeSql('DELETE FROM transactions;', []);
      tx.executeSql('DELETE FROM exchange_rates;', []);
      tx.executeSql('DELETE FROM goals;', []);
      tx.executeSql('DELETE FROM goal_deposits;', []);
      tx.executeSql('DELETE FROM savings;', []);
      
      // Importar transações
      if (data.transactions && Array.isArray(data.transactions)) {
        data.transactions.forEach(item => {
          tx.executeSql(
            'INSERT INTO transactions (description, amount, amount_brl, category, payment_method, date, type, exchange_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [item.description, item.amount, item.amount_brl, item.category, item.payment_method, item.date, item.type, item.exchange_rate]
          );
        });
      }
      
      // Importar taxas de câmbio
      if (data.exchange_rates && Array.isArray(data.exchange_rates)) {
        data.exchange_rates.forEach(item => {
          tx.executeSql(
            'INSERT INTO exchange_rates (date, rate) VALUES (?, ?)',
            [item.date, item.rate]
          );
        });
      }
      
      // Importar metas
      if (data.goals && Array.isArray(data.goals)) {
        data.goals.forEach(item => {
          tx.executeSql(
            'INSERT INTO goals (name, target_amount, current_amount, target_date, created_at, description, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item.name, item.target_amount, item.current_amount, item.target_date, item.created_at, item.description, item.icon]
          );
        });
      }
      
      // Importar depósitos para metas
      if (data.goal_deposits && Array.isArray(data.goal_deposits)) {
        data.goal_deposits.forEach(item => {
          tx.executeSql(
            'INSERT INTO goal_deposits (goal_id, amount, date, note) VALUES (?, ?, ?, ?)',
            [item.goal_id, item.amount, item.date, item.note]
          );
        });
      }
      
      // Importar poupança
      if (data.savings && Array.isArray(data.savings)) {
        data.savings.forEach(item => {
          tx.executeSql(
            'INSERT INTO savings (amount, amount_brl, description, date, exchange_rate, type) VALUES (?, ?, ?, ?, ?, ?)',
            [item.amount, item.amount_brl, item.description, item.date, item.exchange_rate, item.type]
          );
        });
      }
    }, (error) => {
      console.error('Erro ao importar dados:', error);
      reject(error);
    }, () => {
      console.log('Dados importados com sucesso');
      resolve();
    });
  });
};
