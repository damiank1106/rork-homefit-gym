import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/src/types/profile';

/**
 * PROFILE STORAGE
 * 
 * This file handles saving and loading the user's profile data locally on the device.
 * The profile includes:
 * - Birthday (used to calculate age), height, and weight
 * - Selected equipment (used to filter exercises the user can do)
 *
 * Data is stored using AsyncStorage, which persists between app sessions.
 * 
 * Note: Workout history is stored separately in historyStorage.ts.
 */

const PROFILE_STORAGE_KEY = 'homefit_user_profile';

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    console.log('Loading user profile from storage...');
    const storedData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    
    if (!storedData || storedData === 'null' || storedData === 'undefined') {
      console.log('No profile found in storage');
      return null;
    }
    
    // Validate that stored data looks like JSON before parsing
    // [object Object] starts with [ but is not valid JSON
    if (storedData === '[object Object]' || (!storedData.startsWith('{') && !storedData.startsWith('['))) {
      console.error('Invalid JSON format in storage:', storedData.substring(0, 50));
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      return null;
    }
    
    const profile = JSON.parse(storedData) as UserProfile;
    console.log('Profile loaded successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    // Clear corrupted data
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      console.log('Cleared corrupted profile data');
    } catch (clearError) {
      console.error('Error clearing corrupted profile:', clearError);
    }
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    console.log('Saving user profile to storage:', profile);
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    console.log('Profile saved successfully');
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    console.log('Clearing user profile from storage...');
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    console.log('Profile cleared successfully');
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
}
