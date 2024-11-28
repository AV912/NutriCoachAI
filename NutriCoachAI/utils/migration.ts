// utils/migration.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestoreService } from '../services/firestore';
import type { UserProfile, DailyLog } from '../types/nutrition';

interface MigrationStatus {
  lastMigrated?: string;
  completed: boolean;
}

const MIGRATION_STATUS_KEY = '@migration_status';

export async function checkMigrationStatus(userId: string): Promise<boolean> {
  try {
    const status = await AsyncStorage.getItem(MIGRATION_STATUS_KEY);
    if (status) {
      const migrationStatus: MigrationStatus = JSON.parse(status);
      return migrationStatus.completed;
    }
    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

export async function migrateToFirestore(userId: string): Promise<void> {
  try {
    // Check if already migrated
    const isMigrated = await checkMigrationStatus(userId);
    if (isMigrated) {
      console.log('Data already migrated');
      return;
    }

    // Migrate user profile
    const profileJson = await AsyncStorage.getItem('user-profile');
    if (profileJson) {
      const profile: UserProfile = JSON.parse(profileJson);
      await firestoreService.saveProfile(userId, profile);
    }

    // Migrate meal logs
    const logsJson = await AsyncStorage.getItem('daily-logs');
    if (logsJson) {
      const logs: Record<string, DailyLog> = JSON.parse(logsJson);
      
      for (const [date, log] of Object.entries(logs)) {
        // Migrate each meal in the log
        for (const meal of log.meals) {
          await firestoreService.trackMeal(userId, date, {
            ...meal,
            timestamp: meal.timestamp || Date.now()
          });
        }
      }
    }

    // Mark migration as complete
    await AsyncStorage.setItem(
      MIGRATION_STATUS_KEY,
      JSON.stringify({
        lastMigrated: new Date().toISOString(),
        completed: true
      })
    );

    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration error:', error);
    throw new Error('Failed to migrate data to Firestore');
  }
}