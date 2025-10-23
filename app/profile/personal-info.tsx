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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading personal information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
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

  // Format birthdate for display
  const formatBirthdate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  };

  // Format address for display
  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    
    // If it's already a string, clean it up
    if (typeof address === 'string') {
      const cleaned = address.trim();
      // Check if it's just commas, spaces, or empty
      if (!cleaned || cleaned.match(/^[,,\s]*$/)) {
        return 'Not provided';
      }
      return cleaned;
    }
    
    // If it's an array, join with proper formatting
    if (Array.isArray(address)) {
      const filteredAddress = address.filter(item => item && item.trim());
      return filteredAddress.length > 0 ? filteredAddress.join(', ') : 'Not provided';
    }
    
    // If it's an object, try to extract meaningful values
    if (typeof address === 'object') {
      const values = Object.values(address).filter(value => value && String(value).trim());
      return values.length > 0 ? values.join(', ') : 'Not provided';
    }
    
    return 'Not provided';
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }]}>
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#1A3165' : Colors[colorScheme ?? 'light'].background }}>
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
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.name || 'Not available'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>LRN (Learner Reference Number)</Text>
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.lrn || 'Not assigned'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Enter your age"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.age || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Gender</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.gender}
                  onChangeText={(value) => handleInputChange('gender', value)}
                  placeholder="Enter your gender"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.gender || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Contact Number</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.contact_number}
                  onChangeText={(value) => handleInputChange('contact_number', value)}
                  placeholder="Enter your contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Email Address</Text>
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.email_address || 'Not provided'}</Text>
              <Text style={[styles.fieldNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Email can be changed in Account Settings</Text>
            </View>
          </View>

          {/* Additional Personal Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.middle_name}
                  onChangeText={(value) => handleInputChange('middle_name', value)}
                  placeholder="Enter your middle name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.middle_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Birthdate</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.birthdate}
                  onChangeText={(value) => handleInputChange('birthdate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{formatBirthdate(student?.birthdate || '')}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Place of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.place_of_birth}
                  onChangeText={(value) => handleInputChange('place_of_birth', value)}
                  placeholder="Enter your place of birth"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.place_of_birth || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Current Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.multilineInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
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
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{formatAddress(student?.current_address)}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Permanent Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.multilineInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
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
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{formatAddress(student?.permanent_address)}</Text>
              )}
            </View>
          </View>

          {/* Family Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.father_name}
                  onChangeText={(value) => handleInputChange('father_name', value)}
                  placeholder="Enter father's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.father_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Father's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.father_contact_number}
                  onChangeText={(value) => handleInputChange('father_contact_number', value)}
                  placeholder="Enter father's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.father_contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Mother's Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.mother_name}
                  onChangeText={(value) => handleInputChange('mother_name', value)}
                  placeholder="Enter mother's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.mother_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Mother's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.mother_contact_number}
                  onChangeText={(value) => handleInputChange('mother_contact_number', value)}
                  placeholder="Enter mother's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.mother_contact_number || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Guardian's Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.guardian_name}
                  onChangeText={(value) => handleInputChange('guardian_name', value)}
                  placeholder="Enter guardian's name"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.guardian_name || 'Not provided'}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Guardian's Contact</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, { 
                    backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
                    borderColor: '#199BCF',
                    color: Colors[colorScheme ?? 'light'].textValue 
                  }]}
                  value={editedData.guardian_contact_number}
                  onChangeText={(value) => handleInputChange('guardian_contact_number', value)}
                  placeholder="Enter guardian's contact number"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.fieldValue, { 
                  color: Colors[colorScheme ?? 'light'].textValue,
                  backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                  borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
                }]}>{student?.guardian_contact_number || 'Not provided'}</Text>
              )}
            </View>
          </View>

          {/* Academic Information Card */}
          <View style={[styles.infoCard, { 
            backgroundColor: colorScheme === 'dark' ? '#2A3F6B' : Colors[colorScheme ?? 'light'].cardBackground,
            borderColor: colorScheme === 'dark' ? '#3A4F7B' : Colors[colorScheme ?? 'light'].cardBorder 
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
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.program || 'Not specified'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Grade Level</Text>
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.grade_level || 'Not specified'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Enrollment Date</Text>
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.enrollment_date || 'Not available'}</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[colorScheme ?? 'light'].textLabel }]}>Status</Text>
              <Text style={[styles.fieldValue, { 
                color: Colors[colorScheme ?? 'light'].textValue,
                backgroundColor: colorScheme === 'dark' ? '#3A4F7B' : '#F9FAFB',
                borderColor: colorScheme === 'dark' ? '#4A5F8B' : '#F3F4F6'
              }]}>{student?.status || 'Not specified'}</Text>
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
    paddingTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardIconText: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#199BCF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '400',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  fieldInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontWeight: '400',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
