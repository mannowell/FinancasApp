import React from 'react';
import { View, StyleSheet } from 'react-native';

const GoalProgressBar = ({ progress }) => {
  // Ensure progress is a valid value between 0 and 1
  const validProgress = Math.min(Math.max(0, progress || 0), 1);
  
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.progressBar, 
          { width: `${validProgress * 100}%` },
          // Change color based on progress
          validProgress >= 1 ? styles.completed : {}
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#e6e6e6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 4,
  },
  completed: {
    backgroundColor: '#3db489', // Darker green when completed
  }
});

export default GoalProgressBar;
