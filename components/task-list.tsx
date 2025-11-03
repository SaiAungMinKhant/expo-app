import { supabase } from '@/lib/supabase';
import type { TaskWithUsers } from '@/types/task';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import TaskItem from './task-item';

interface TaskListProps {
  filter?: 'all' | 'assigned' | 'created';
  currentProfileId?: number | null;
}

export default function TaskList({
  filter = 'all',
  currentProfileId,
}: TaskListProps) {
  const [tasks, setTasks] = useState<TaskWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch tasks
      let query = supabase.from('tasks').select('*');

      // Apply filters
      if (filter === 'assigned' && currentProfileId) {
        query = query.eq('assign_to_profile_id', currentProfileId);
      } else if (filter === 'created' && currentProfileId) {
        query = query.eq('created_by_profile_id', currentProfileId);
      }

      const { data: tasksData, error: tasksError } = await query.order(
        'created_at',
        {
          ascending: false,
        }
      );

      if (tasksError) {
        throw tasksError;
      }

      if (!tasksData || tasksData.length === 0) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Get unique profile IDs
      const profileIds = new Set<number>();
      tasksData.forEach((task) => {
        if (task.assign_to_profile_id) {
          profileIds.add(task.assign_to_profile_id);
        }
        if (task.created_by_profile_id) {
          profileIds.add(task.created_by_profile_id);
        }
      });

      // Fetch profiles
      let profilesMap: Map<
        number,
        {
          id: number;
          username: string;
          name?: string | null;
          email?: string | null;
        }
      > = new Map();
      if (profileIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, name, email')
          .in('id', Array.from(profileIds));

        if (!profilesError && profilesData) {
          profilesData.forEach((profile) => {
            profilesMap.set(profile.id, profile);
          });
        }
      }

      // Combine tasks with profile information
      const tasksWithUsers: TaskWithUsers[] = tasksData.map((task) => ({
        ...task,
        assign_to_profile: task.assign_to_profile_id
          ? profilesMap.get(task.assign_to_profile_id) || null
          : null,
        created_by_profile: task.created_by_profile_id
          ? profilesMap.get(task.created_by_profile_id) || null
          : null,
      }));

      setTasks(tasksWithUsers);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, currentProfileId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tasks found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <TaskItem task={item} onUpdate={fetchTasks} />}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
