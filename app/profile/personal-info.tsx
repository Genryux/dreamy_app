import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDashboard } from '@/hooks/useDashboard';
import { apiService } from '@/services/api';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalInfoScreen() {
  const { data: dashboardData, loading, error, refresh } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const colorScheme = useColorScheme();
  const [editedData, setEditedData] = useState({
    age: '',
    gender: '',
    contact_number: '',
    middle_name: '',
    birthdate: '',
    place_of_birth: '',
    current_address: '',
    permanent_address: '',
    father_name: '',
    father_contact_number: '',
    mother_name: '',
    mother_contact_number: '',
    guardian_name: '',
    guardian_contact_number: '',
  });

  const student = dashboardData?.student;

  // Initialize edited data when component mounts or when student data changes
  React.useEffect(() => {
    if (student) {
      setEditedData({
        age: String(student.age || ''),
        gender: student.gender || '',
        contact_number: student.contact_number || '',
        middle_name: student.middle_name || '',
        birthdate: student.birthdate || '',
        place_of_birth: student.place_of_birth || '',
        current_address: student.current_address || '',
        permanent_address: student.permanent_address || '',
        father_name: student.father_name || '',
        father_contact_number: student.father_contact_number || '',
        mother_name: student.mother_name || '',
        mother_contact_number: student.mother_contact_number || '',
        guardian_name: student.guardian_name || '',
        guardian_contact_number: student.guardian_contact_number || '',
      });
    }
  }, [student]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading personal information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Error loading personal information: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Filter out empty strings and convert to null, also convert age to integer
      const dataToSend = Object.fromEntries(
        Object.entries(editedData).map(([key, value]) => {
          if (value === '') return [key, null];
          if (key === 'age' && value !== null) return [key, parseInt(value.toString())];
          return [key, value];
        })
      );
      
      // Call the API to update personal information
      const response = await apiService.updatePersonalInfo(dataToSend);
      
      if (response.success) {
        Alert.alert('Success', 'Personal information updated successfully!');
        setIsEditing(false);
        // Refresh the dashboard data to show updated information
        refresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to update personal information');
      }
    } catch (error: any) {
      console.error('Error updating personal info:', error);
      
      // Check if it's a validation error (422)
      if (error.status === 422 && error.data?.messages) {
        const validationErrors = Object.values(error.data.messages).flat();
        Alert.alert('Validation Error', validationErrors.join('\n'));
      } else {
        Alert.alert('Error', error.message || 'Failed to update personal information');
      }
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (student) {
      setEditedData({
        age: String(student.age || ''),
        gender: student.gender || '',
        contact_number: student.contact_number || '',
        middle_name: student.middle_name || '',
        birthdate: student.birthdate || '',
        place_of_birth: student.place_of_birth || '',
        current_address: student.current_address || '',
        permanent_address: student.permanent_address || '',
        father_name: student.father_name || '',
        father_contact_number: student.father_contact_number || '',
        mother_name: student.mother_name || '',
        mother_contact_number: student.mother_contact_number || '',
        guardian_name: student.guardian_name || '',
        guardian_contact_number: student.guardian_contact_number || '',
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Personal Information',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].textPrimary,
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].textPrimary,
          },
        }}
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Personal Information</Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>View and edit your personal details</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIcon}>
                  <IconSymbol name="person" size={20} color="#199BCF" />
                </View>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Basic Information</Text>
              </View>
              {!isEditing ? (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <View style={styles.buttonContent}>
                    <IconSymbol name="pencil" size={14} color="#FFFFFF" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <View style={styles.buttonContent}>
                      <IconSymbol name="xmark" size={14} color="#6B7280" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <View style={styles.buttonContent}>
                      <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Full Name</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.name || 'Not available'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>LRN (Learner Reference Number)</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.lrn || 'Not assigned'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Enter your age"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.age || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Gender</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.gender}
                  onChangeText={(value) => handleInputChange('gender', value)}
                  placeholder="Enter your gender"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.gender || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Contact Number</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.contact_number}
                  onChangeText={(value) => handleInputChange('contact_number', value)}
                  placeholder="Enter your contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Email Address</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.email_address || 'Not provided'}</Text>
              <Text style={[styles.fieldNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Email can be changed in Account Settings</Text>
            </View>
          </View>

          {/* Additional Personal Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIcon}>
                  <IconSymbol name="location" size={20} color="#199BCF" />
                </View>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Additional Information</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Middle Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.middle_name}
                  onChangeText={(value) => handleInputChange('middle_name', value)}
                  placeholder="Enter your middle name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.middle_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Birthdate</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.birthdate}
                  onChangeText={(value) => handleInputChange('birthdate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.birthdate || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Place of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.place_of_birth}
                  onChangeText={(value) => handleInputChange('place_of_birth', value)}
                  placeholder="Enter your place of birth"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.place_of_birth || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Current Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.multilineInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.current_address}
                  onChangeText={(value) => handleInputChange('current_address', value)}
                  placeholder="Enter your current address"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  multiline={true}
                  numberOfLines={3}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.current_address || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Permanent Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.multilineInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.permanent_address}
                  onChangeText={(value) => handleInputChange('permanent_address', value)}
                  placeholder="Enter your permanent address"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  multiline={true}
                  numberOfLines={3}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.permanent_address || 'Not provided'}</Text>
              )}
            </View>
          </View>

          {/* Family Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIcon}>
                  <IconSymbol name="person.2" size={20} color="#199BCF" />
                </View>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Family Information</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Father's Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.father_name}
                  onChangeText={(value) => handleInputChange('father_name', value)}
                  placeholder="Enter father's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.father_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Father's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.father_contact_number}
                  onChangeText={(value) => handleInputChange('father_contact_number', value)}
                  placeholder="Enter father's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.father_contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Mother's Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.mother_name}
                  onChangeText={(value) => handleInputChange('mother_name', value)}
                  placeholder="Enter mother's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.mother_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Mother's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.mother_contact_number}
                  onChangeText={(value) => handleInputChange('mother_contact_number', value)}
                  placeholder="Enter mother's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.mother_contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Guardian's Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.guardian_name}
                  onChangeText={(value) => handleInputChange('guardian_name', value)}
                  placeholder="Enter guardian's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.guardian_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Guardian's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: Colors[colorScheme ?? 'light'].cardBorder,
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.guardian_contact_number}
                  onChangeText={(value) => handleInputChange('guardian_contact_number', value)}
                  placeholder="Enter guardian's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.guardian_contact_number || 'Not provided'}</Text>
              )}
            </View>
          </View>

          {/* Academic Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: Colors[colorScheme ?? 'light'].cardBorder 
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.cardIcon}>
                  <IconSymbol name="graduationcap" size={20} color="#199BCF" />
                </View>
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].textPrimary }]}>Academic Information</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Program</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.program || 'Not specified'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Grade Level</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.grade_level || 'Not specified'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enrollment Date</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.enrollment_date || 'Not available'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Status</Text>
              <Text style={[styles.fieldValue, { color: Colors[colorScheme ?? 'light'].textValue }]}>{student?.status || 'Not specified'}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for floating tab bar
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A3165',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3165',
  },
  editButton: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1A3165',
    fontWeight: '400',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fieldInput: {
    fontSize: 16,
    color: '#1A3165',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#199BCF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '400',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldNote: {
    fontSize: 12,
    color: '#199BCF',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
