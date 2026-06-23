import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Droplet, Plus, Calendar, Dumbbell, Clock, Flame } from 'lucide-react-native';

interface WorkoutLog {
  id: string;
  type: string;
  duration: number;
  intensity: string;
  calories: number;
  timestamp: Date;
}

export default function TrackerScreen() {
  // Water logging states
  const [waterCount, setWaterCount] = useState(1200);
  const [waterGoal] = useState(3000);

  // Workout logging states
  const [workoutType, setWorkoutType] = useState('Run');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [loggedWorkouts, setLoggedWorkouts] = useState<WorkoutLog[]>([
    {
      id: '1',
      type: 'Running',
      duration: 30,
      intensity: 'High',
      calories: 320,
      timestamp: new Date(),
    },
  ]);

  const workoutTypes = ['Run', 'Walk', 'Cycle', 'Gym', 'Yoga'];
  const intensities = ['Low', 'Medium', 'High'];

  // Add water helper
  const addWater = (amount: number) => {
    setWaterCount((prev) => Math.min(prev + amount, 5000)); // cap at 5L
  };

  const resetWater = () => {
    setWaterCount(0);
  };

  // Add workout helper
  const handleLogWorkout = () => {
    const mins = parseInt(duration);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid workout duration in minutes.');
      return;
    }

    // Estimate calories burned based on intensity & duration
    let factor = 5;
    if (intensity === 'Medium') factor = 8;
    if (intensity === 'High') factor = 11;
    const caloriesBurned = mins * factor;

    const newWorkout: WorkoutLog = {
      id: Date.now().toString(),
      type: workoutType,
      duration: mins,
      intensity,
      calories: caloriesBurned,
      timestamp: new Date(),
    };

    setLoggedWorkouts([newWorkout, ...loggedWorkouts]);
    setDuration('');
    Alert.alert('Success', `${workoutType} workout logged!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Log Activity</Text>

          {/* Hydration Tracker Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleGroup}>
                <Droplet color="#06B6D4" size={24} />
                <Text style={styles.cardTitle}>Water Intake</Text>
              </View>
              <TouchableOpacity onPress={resetWater}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.waterStatusContainer}>
              <Text style={styles.waterVolume}>{waterCount} ml</Text>
              <Text style={styles.waterGoal}>Goal: {waterGoal} ml</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.waterBtn, { borderColor: '#06B6D4' }]} onPress={() => addWater(250)}>
                <Plus color="#06B6D4" size={18} />
                <Text style={[styles.waterBtnText, { color: '#06B6D4' }]}>+250ml Glass</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.waterBtn, { borderColor: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)' }]} onPress={() => addWater(500)}>
                <Plus color="#06B6D4" size={18} />
                <Text style={[styles.waterBtnText, { color: '#06B6D4' }]}>+500ml Bottle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Workout Tracker Card */}
          <View style={styles.card}>
            <View style={styles.titleGroup}>
              <Dumbbell color="#6366F1" size={24} />
              <Text style={styles.cardTitle}>Log Workout</Text>
            </View>

            {/* Workout Type Selector */}
            <Text style={styles.inputLabel}>Activity Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
              {workoutTypes.map((type) => {
                const isSelected = workoutType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.badge, isSelected && styles.activeBadge]}
                    onPress={() => setWorkoutType(type)}
                  >
                    <Text style={[styles.badgeText, isSelected && styles.activeBadgeText]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Duration Input */}
            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 45"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />

            {/* Intensity Selector */}
            <Text style={styles.inputLabel}>Intensity</Text>
            <View style={styles.intensityRow}>
              {intensities.map((item) => {
                const isSelected = intensity === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.intensityBtn, isSelected && styles.activeIntensityBtn]}
                    onPress={() => setIntensity(item)}
                  >
                    <Text style={[styles.intensityText, isSelected && styles.activeIntensityText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.logWorkoutBtn} onPress={handleLogWorkout}>
              <Text style={styles.logWorkoutBtnText}>Save Workout Log</Text>
            </TouchableOpacity>
          </View>

          {/* Workout History */}
          <Text style={styles.sectionTitle}>Workout History</Text>
          {loggedWorkouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts logged today yet.</Text>
            </View>
          ) : (
            loggedWorkouts.map((workout) => (
              <View key={workout.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>{workout.type}</Text>
                  <Text style={styles.historyTime}>
                    {workout.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.historyMetrics}>
                  <View style={styles.histMetricItem}>
                    <Clock color="#94A3B8" size={16} />
                    <Text style={styles.histMetricValue}>{workout.duration} mins</Text>
                  </View>
                  <View style={styles.histMetricItem}>
                    <Flame color="#EF4444" size={16} />
                    <Text style={styles.histMetricValue}>{workout.calories} kcal</Text>
                  </View>
                  <View style={styles.histMetricItem}>
                    <Calendar color="#8B5CF6" size={16} />
                    <Text style={styles.histMetricValue}>{workout.intensity}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  container: {
    padding: 20,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resetText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  waterStatusContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  waterVolume: {
    fontSize: 36,
    fontWeight: '900',
    color: '#06B6D4',
  },
  waterGoal: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  waterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    gap: 6,
  },
  waterBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  badgeRow: {
    gap: 8,
    paddingBottom: 8,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 4,
  },
  activeBadge: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  badgeText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 52,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 8,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  intensityBtn: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeIntensityBtn: {
    backgroundColor: '#8B5CF6', // Purple 500
    borderColor: '#8B5CF6',
  },
  intensityText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  activeIntensityText: {
    color: '#FFFFFF',
  },
  logWorkoutBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logWorkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    marginTop: 10,
  },
  emptyContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  historyTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  historyMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  histMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  histMetricValue: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
