import { supabase } from '@/lib/supabase';
import type { Profile, Task } from '@/types/task';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CreateTaskModalProps {
  visible: boolean;
  profileId: number | null;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateTaskModal({
  visible,
  profileId,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignToId, setSelectedAssignToId] = useState<number | null>(
    null
  );
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Get default date in MM/DD/YYYY format (today's date)
  const getDefaultDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    if (visible) {
      fetchProfiles();
      // Set default date when modal opens
      setDueDate(getDefaultDate());
    }
  }, [visible]);

  const fetchProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const parseDate = (dateString: string): string | null => {
    // Parse mm/dd/yyyy format
    const parts = dateString.trim().split('/');
    if (parts.length !== 3) return null;

    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < 1000 || year > 9999) return null;

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date.toISOString();
  };

  const handleCreate = async () => {
    console.log('handleCreate called', {
      title,
      profileId,
      selectedAssignToId,
      dueDate,
    });

    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!profileId) {
      alert('User not authenticated');
      return;
    }

    if (!selectedAssignToId) {
      alert('Please select a user to assign the task to');
      return;
    }

    try {
      setIsCreating(true);

      const parsedDueDate = dueDate ? parseDate(dueDate) : null;
      console.log('Parsed date:', { dueDate, parsedDueDate });

      if (dueDate && !parsedDueDate) {
        alert('Invalid date format. Please use MM/DD/YYYY (e.g., 12/31/2024)');
        setIsCreating(false);
        return;
      }

      const taskData: Partial<Task> = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: parsedDueDate,
        is_complete: false,
        created_by_profile_id: profileId,
        assign_to_profile_id: selectedAssignToId,
      };

      console.log('Inserting task:', taskData);
      const { data, error } = await supabase.from('tasks').insert(taskData);

      if (error) {
        console.error('Error creating task:', error);
        alert(`Failed to create task: ${error.message}`);
        setIsCreating(false);
        return;
      }

      console.log('Task created successfully:', data);

      // Reset form
      setTitle('');
      setDescription('');
      setDueDate(getDefaultDate());
      setSelectedAssignToId(null);

      onCreate();
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle('');
      setDescription('');
      setDueDate(getDefaultDate());
      setSelectedAssignToId(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Task</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} nestedScrollEnabled={true}>
            <View style={styles.form}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
                editable={!isCreating}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter task description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isCreating}
              />

              <Text style={styles.label}>Assign To *</Text>
              {isLoadingProfiles ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingText}>Loading users...</Text>
                </View>
              ) : (
                <View style={styles.profileListContainer}>
                  {profiles.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.profileOption,
                        selectedAssignToId === item.id &&
                          styles.profileOptionSelected,
                      ]}
                      onPress={() => setSelectedAssignToId(item.id)}
                      disabled={isCreating}
                    >
                      <Text
                        style={[
                          styles.profileOptionText,
                          selectedAssignToId === item.id &&
                            styles.profileOptionTextSelected,
                        ]}
                      >
                        {item.username}
                        {item.name && ` (${item.name})`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY (optional)"
                value={dueDate}
                onChangeText={setDueDate}
                editable={!isCreating}
              />
              <Text style={styles.helperText}>
                Format: MM/DD/YYYY (e.g., 12/31/2024)
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isCreating}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                (isCreating || !title.trim() || !selectedAssignToId) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={isCreating || !title.trim() || !selectedAssignToId}
              activeOpacity={0.7}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create</Text>
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
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  formScroll: {
    maxHeight: 400,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: -12,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  profileListContainer: {
    maxHeight: 150,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  profileOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  profileOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  profileOptionText: {
    fontSize: 14,
    color: '#333',
  },
  profileOptionTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
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
  createButton: {
    backgroundColor: '#2196f3',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
});
