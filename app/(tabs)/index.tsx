import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import { Activity, Flame, Droplet, Moon, Footprints, Trophy } from 'lucide-react-native';

export default function DashboardScreen() {
  const [username, setUsername] = useState('Explorer');
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock health metrics state (future-proofed to pull from Supabase database)
  const [steps, setSteps] = useState(6420);
  const [stepGoal] = useState(10000);
  const [calories, setCalories] = useState(380);
  const [activeMinutes, setActiveMinutes] = useState(25);
  const [waterIntake, setWaterIntake] = useState(1200); // in ml
  const [waterGoal] = useState(3000); // in ml

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      setUsername(name);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    // Simulate updating metrics from database
    setSteps(Math.min(steps + 500, stepGoal));
    setCalories(calories + 40);
    setActiveMinutes(activeMinutes + 5);
    setRefreshing(false);
  };

  const stepPercentage = Math.min((steps / stepGoal) * 100, 100);
  const waterPercentage = Math.min((waterIntake / waterGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>{username} 👋</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Highlight Card: Steps Circular/Ring Goal */}
        <View style={styles.mainRingCard}>
          <View style={styles.ringDetails}>
            <Footprints color="#6366F1" size={32} />
            <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
            <Text style={styles.stepsLabel}>of {stepGoal.toLocaleString()} steps</Text>
          </View>
          
          {/* Progress Bar (Expo/Native styling equivalent to a ring) */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${stepPercentage}%` }]} />
            </View>
            <Text style={styles.percentageText}>{Math.round(stepPercentage)}% of Daily Goal Completed</Text>
          </View>
        </View>

        {/* Motivational Card */}
        {steps >= stepGoal && (
          <View style={styles.goalAchievementCard}>
            <Trophy color="#F59E0B" size={24} style={styles.trophyIcon} />
            <Text style={styles.achievementText}>Daily step goal achieved! Keep it up!</Text>
          </View>
        )}

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>Daily Metrics</Text>
        <View style={styles.grid}>
          {/* Active Calories */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Flame color="#EF4444" size={20} />
            </View>
            <Text style={styles.metricValue}>{calories} kcal</Text>
            <Text style={styles.metricLabel}>Active Calories</Text>
          </View>

          {/* Active Time */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Activity color="#10B981" size={20} />
            </View>
            <Text style={styles.metricValue}>{activeMinutes} mins</Text>
            <Text style={styles.metricLabel}>Exercise Time</Text>
          </View>
        </View>

        {/* Hydration Progress */}
        <View style={styles.hydrationCard}>
          <View style={styles.hydrationHeader}>
            <View style={styles.hydrationTitleGroup}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <Droplet color="#06B6D4" size={20} />
              </View>
              <Text style={styles.hydrationTitle}>Hydration</Text>
            </View>
            <Text style={styles.hydrationStats}>{waterIntake} ml / {waterGoal} ml</Text>
          </View>

          <View style={styles.waterProgressBarBg}>
            <View style={[styles.waterProgressBarFill, { width: `${waterPercentage}%` }]} />
          </View>
        </View>

        {/* Sleep Summary */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <View style={styles.sleepTitleGroup}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Moon color="#8B5CF6" size={20} />
              </View>
              <Text style={styles.sleepTitle}>Sleep Analysis</Text>
            </View>
            <Text style={styles.sleepStats}>7h 15m</Text>
          </View>
          <Text style={styles.sleepStatus}>Quality: Deep Sleep (82%)</Text>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  mainRingCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  ringDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepsCount: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 12,
  },
  stepsLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  progressBarWrapper: {
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1', // Indigo 500
    borderRadius: 4,
  },
  percentageText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  goalAchievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  trophyIcon: {
    marginRight: 12,
  },
  achievementText: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  hydrationCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    marginBottom: 20,
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hydrationTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hydrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  hydrationStats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06B6D4',
  },
  waterProgressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  waterProgressBarFill: {
    height: '100%',
    backgroundColor: '#06B6D4', // Cyan 500
    borderRadius: 3,
  },
  sleepCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sleepStats: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  sleepStatus: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 52, // Align with the title text
  },
});
