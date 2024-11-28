// services/firestore.ts
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    Timestamp,
    DocumentReference,
    updateDoc,
    deleteDoc,
    addDoc,
    DocumentData
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { 
    UserProfile, 
    TrackedMeal, 
    DailyLog, 
    FirestoreUserProfile,
    FirestoreMeal,
    FirestoreDailyLog,
    MealType
  } from '../types/nutrition';
  
  const COLLECTIONS = {
    USERS: 'users',
    DAILY_LOGS: 'dailyLogs',
    MEALS: 'meals'
  } as const;
  
  export const firestoreService = {
    // User Profile Methods
    async saveProfile(userId: string, profile: UserProfile): Promise<void> {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const profileData: FirestoreUserProfile = {
        ...profile,
        userId,
        updatedAt: Date.now()
      };
      await setDoc(userRef, profileData);
    },
  
    async getProfile(userId: string): Promise<UserProfile | null> {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data() as FirestoreUserProfile;
      const { userId: _, updatedAt: __, ...profile } = data;
      return profile;
    },
  
    // Meal Tracking Methods
    async trackMeal(
      userId: string, 
      date: string, 
      meal: Omit<TrackedMeal, 'id'>,
    ): Promise<string> {
      // Create meal document
      const mealsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.MEALS);
      const mealData: FirestoreMeal = {
        ...meal,
        userId
      };
      
      const mealDoc = await addDoc(mealsRef, mealData);
      const mealId = mealDoc.id;
  
      // Update or create daily log
      const logRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.DAILY_LOGS, date);
      const logSnapshot = await getDoc(logRef);
  
      if (!logSnapshot.exists()) {
        // Create new log
        const newLog: FirestoreDailyLog = {
          userId,
          date,
          meals: [mealId],
          totals: {
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
          },
          updatedAt: Date.now()
        };
        await setDoc(logRef, newLog);
      } else {
        // Update existing log
        const currentLog = logSnapshot.data() as FirestoreDailyLog;
        await updateDoc(logRef, {
          meals: [...currentLog.meals, mealId],
          totals: {
            calories: currentLog.totals.calories + meal.calories,
            protein: currentLog.totals.protein + meal.protein,
            carbs: currentLog.totals.carbs + meal.carbs,
            fat: currentLog.totals.fat + meal.fat
          },
          updatedAt: Date.now()
        });
      }
  
      return mealId;
    },
  
    async getDailyLog(userId: string, date: string): Promise<DailyLog | null> {
      const logRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.DAILY_LOGS, date);
      const logSnapshot = await getDoc(logRef);
      
      if (!logSnapshot.exists()) return null;
  
      const logData = logSnapshot.data() as FirestoreDailyLog;
      const meals: TrackedMeal[] = [];
  
      // Fetch all meals
      for (const mealId of logData.meals) {
        const mealRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.MEALS, mealId);
        const mealSnapshot = await getDoc(mealRef);
        
        if (mealSnapshot.exists()) {
          const mealData = mealSnapshot.data() as FirestoreMeal;
          meals.push({
            ...mealData,
            id: mealSnapshot.id
          });
        }
      }
  
      return {
        date: logData.date,
        meals,
        totals: logData.totals
      };
    },
  
    async deleteMeal(userId: string, date: string, mealId: string): Promise<void> {
      // Get meal data
      const mealRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.MEALS, mealId);
      const mealSnapshot = await getDoc(mealRef);
      
      if (!mealSnapshot.exists()) {
        throw new Error('Meal not found');
      }
  
      const mealData = mealSnapshot.data() as FirestoreMeal;
  
      // Update daily log
      const logRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.DAILY_LOGS, date);
      const logSnapshot = await getDoc(logRef);
  
      if (logSnapshot.exists()) {
        const currentLog = logSnapshot.data() as FirestoreDailyLog;
        await updateDoc(logRef, {
          meals: currentLog.meals.filter(id => id !== mealId),
          totals: {
            calories: currentLog.totals.calories - mealData.calories,
            protein: currentLog.totals.protein - mealData.protein,
            carbs: currentLog.totals.carbs - mealData.carbs,
            fat: currentLog.totals.fat - mealData.fat
          },
          updatedAt: Date.now()
        });
      }
  
      // Delete meal document
      await deleteDoc(mealRef);
    }
  };