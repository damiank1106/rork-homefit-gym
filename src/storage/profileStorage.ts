import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/src/types/profile';

/**
 * PROFILE STORAGE
 * 
 * This file handles saving and loading the user's profile data locally on the device.
 * The profile includes:
 * - Age, height, and weight (used for calorie calculations)
 * - Selected equipment (used to filter exercises the user can do)
 * 
 * Data is stored using AsyncStorage, which persists between app sessions.
 * 
 * FUTURE PHASE: We will add workout history storage here to track completed exercises,
 * which will power the calendar and statistics screens.
 */

const PROFILE_STORAGE_KEY = 'homefit_user_profile';

export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    console.log('Loading user profile from storage...');
    const storedData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    
    if (!storedData) {
      console.log('No profile found in storage');
      return null;
    }
    
    const profile = JSON.parse(storedData) as UserProfile;
    console.log('Profile loaded successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error loading user profile:', error);
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
