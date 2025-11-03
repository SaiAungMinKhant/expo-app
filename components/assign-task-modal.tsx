import { supabase } from '@/lib/supabase';
import type { Profile, Task } from '@/types/task';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import UserList from './user-list';

interface AssignTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onAssign: () => void;
}

export default function AssignTaskModal({
  visible,
  task,
  onClose,
  onAssign,
}: AssignTaskModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    task?.assign_to_profile_id || null
  );

  // Update selected user when task changes
  useEffect(() => {
    if (task?.assign_to_profile_id) {
      setSelectedUserId(task.assign_to_profile_id);
    }
  }, [task]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!task || !selectedUserId) return;

    try {
      setIsAssigning(true);

      const { error } = await supabase
        .from('tasks')
        .update({ assign_to_profile_id: selectedUserId })
        .eq('id', task.id);

      if (error) {
        console.error('Error assigning task:', error);
        alert('Failed to assign task. Please try again.');
        return;
      }

      onAssign();
      onClose();
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Failed to assign task. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };


  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Assign Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          <View style={styles.userListContainer}>
            <Text style={styles.sectionTitle}>Select User:</Text>
            <UserList
              onSelectUser={(profile) => setSelectedUserId(profile.id)}
              selectedUserId={selectedUserId}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.assignButton]}
              onPress={handleAssign}
              disabled={isAssigning || !selectedUserId}
            >
              {isAssigning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Assign</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  userListContainer: {
    flex: 1,
    maxHeight: 400,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

