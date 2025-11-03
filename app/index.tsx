import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CreateTaskModal from '@/components/create-task-modal';
import SignOutButton from '@/components/social-auth-buttons/sign-out-button';
import TaskList from '@/components/task-list';
import { useAuthContext } from '@/hooks/use-auth-context';

type FilterType = 'all' | 'assigned' | 'created';

export default function Index() {
  const { isLoggedIn, profile } = useAuthContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Please login to view tasks</Text>
        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>Login</Text>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <SignOutButton />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'assigned' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('assigned')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'assigned' && styles.filterTextActive,
            ]}
          >
            Assigned to Me
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'created' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('created')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'created' && styles.filterTextActive,
            ]}
          >
            Created by Me
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create Task</Text>
        </TouchableOpacity>
      </View>

      <TaskList
        key={refreshKey}
        filter={filter}
        currentProfileId={profile?.id || null}
      />

      <CreateTaskModal
        visible={createModalVisible}
        profileId={profile?.id || null}
        onClose={() => setCreateModalVisible(false)}
        onCreate={() => setRefreshKey((prev) => prev + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  actionBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
