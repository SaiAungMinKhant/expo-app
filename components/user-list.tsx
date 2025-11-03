import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/task';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserListProps {
  onSelectUser?: (profile: Profile) => void;
  selectedUserId?: number | null;
}

export default function UserList({
  onSelectUser,
  selectedUserId,
}: UserListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('username', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setProfiles(data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch users';
        setError(errorMessage);
        console.error('Error fetching profiles:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading users...</Text>
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

  if (profiles.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No users found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={profiles}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.userItem,
            selectedUserId === item.id && styles.userItemSelected,
          ]}
          onPress={() => onSelectUser?.(item)}
        >
          <Text
            style={[
              styles.username,
              selectedUserId === item.id && styles.usernameSelected,
            ]}
          >
            {item.username}
          </Text>
          {item.name && <Text style={styles.userInfo}>Name: {item.name}</Text>}
          {item.email && (
            <Text style={styles.userInfo}>Email: {item.email}</Text>
          )}
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
      nestedScrollEnabled={true}
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
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  username: {
    fontSize: 16,
    color: '#333',
  },
  usernameSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
