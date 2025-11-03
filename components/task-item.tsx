import type { TaskWithUsers } from '@/types/task';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TaskItemProps {
  task: TaskWithUsers;
  onUpdate?: () => void;
}

export default function TaskItem({ task, onUpdate }: TaskItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <View
        style={[
          styles.container,
          task.is_complete && styles.completedContainer,
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[styles.title, task.is_complete && styles.completedText]}
          >
            {task.title}
          </Text>
          {task.is_complete && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Complete</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text
            style={[
              styles.description,
              task.is_complete && styles.completedText,
            ]}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.meta}>
          <Text style={styles.metaText}>Due: {formatDate(task.due_date)}</Text>
        </View>

        <View style={styles.userInfo}>
          {task.assign_to_profile && (
            <View>
              <Text style={styles.userText}>
                Assigned to: {task.assign_to_profile.username}
              </Text>
              {task.assign_to_profile.name && (
                <Text style={styles.userDetailText}>
                  Name: {task.assign_to_profile.name}
                </Text>
              )}
              {task.assign_to_profile.email && (
                <Text style={styles.userDetailText}>
                  Email: {task.assign_to_profile.email}
                </Text>
              )}
            </View>
          )}
          {task.created_by_profile && (
            <View>
              <Text style={styles.userText}>
                Created by: {task.created_by_profile.username}
              </Text>
              {task.created_by_profile.name && (
                <Text style={styles.userDetailText}>
                  Name: {task.created_by_profile.name}
                </Text>
              )}
              {task.created_by_profile.email && (
                <Text style={styles.userDetailText}>
                  Email: {task.created_by_profile.email}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  statusBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  meta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  userInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  userDetailText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
    marginLeft: 8,
  },
});
