import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import { User, LogOut, Shield, Settings, Users, Flame, Award, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || '');
      setUsername(user.user_metadata?.username || user.email?.split('@')[0] || 'User');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummaryGrid}>
          <View style={styles.statBox}>
            <Calendar color="#6366F1" size={20} />
            <Text style={styles.statValue}>12 Days</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Flame color="#EF4444" size={20} />
            <Text style={styles.statValue}>4,560 kcal</Text>
            <Text style={styles.statLabel}>Total Burned</Text>
          </View>
          <View style={styles.statBox}>
            <Award color="#F59E0B" size={20} />
            <Text style={styles.statValue}>Rank 3</Text>
            <Text style={styles.statLabel}>Among Friends</Text>
          </View>
        </View>

        {/* Friends & Sharing (Requested Feature Concept) */}
        <Text style={styles.sectionTitle}>Friends & Leaderboard</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleGroup}>
              <Users color="#10B981" size={22} />
              <Text style={styles.cardTitle}>Close Friends</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Invite Friend', 'Friend invitation system integration planned for next phase!')}>
              <Text style={styles.actionText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.cardDescription}>
            Share your APK with friends, configure Supabase Realtime, and see their daily progress here!
          </Text>

          {/* Friends List Placeholders */}
          <View style={styles.friendsList}>
            <View style={styles.friendRow}>
              <View style={styles.friendLeft}>
                <View style={[styles.friendAvatar, { backgroundColor: '#8B5CF6' }]}>
                  <Text style={styles.friendInitial}>A</Text>
                </View>
                <Text style={styles.friendName}>Aarav Sharma</Text>
              </View>
              <View style={styles.friendRight}>
                <Text style={styles.friendSteps}>8,420 steps</Text>
                <Text style={styles.friendActiveText}>Active</Text>
              </View>
            </View>

            <View style={styles.friendRow}>
              <View style={styles.friendLeft}>
                <View style={[styles.friendAvatar, { backgroundColor: '#EC4899' }]}>
                  <Text style={styles.friendInitial}>R</Text>
                </View>
                <Text style={styles.friendName}>Riya Patel</Text>
              </View>
              <View style={styles.friendRight}>
                <Text style={styles.friendSteps}>11,200 steps</Text>
                <Text style={styles.friendActiveText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Menu */}
        <Text style={styles.sectionTitle}>Account settings</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Settings', 'Security settings placeholder.')}>
            <View style={styles.menuItemLeft}>
              <Shield color="#94A3B8" size={20} />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Settings', 'App preferences placeholder.')}>
            <View style={styles.menuItemLeft}>
              <Settings color="#94A3B8" size={20} />
              <Text style={styles.menuItemText}>Preferences</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut color="#EF4444" size={20} style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 24,
  },
  profileHeaderCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1', // Indigo 500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.25)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  actionText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  friendsList: {
    gap: 12,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  friendName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  friendRight: {
    alignItems: 'flex-end',
  },
  friendSteps: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  friendActiveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    marginBottom: 28,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 14,
    height: 52,
    gap: 8,
  },
  signOutIcon: {
    marginRight: 2,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
