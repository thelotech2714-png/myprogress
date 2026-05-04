import { firebaseService } from '../../services/firebaseService';
import { useProfileStore } from '../../store/useStore';

/**
 * Use Case: Completing a Workout
 * Handles business logic, point calculation, and rewards validation.
 */
export const workoutUseCase = {
  completeSession: async (studentId: string, sessionData: { exercisesCount: number, durationMinutes: number }) => {
    // 1. Business Logic: Validate session integrity
    if (sessionData.exercisesCount <= 0) throw new Error('Treino inválido: Nenhum exercício realizado.');
    
    // 2. Point Calculation (Centralized - Not on every UI component)
    // Anti-cheat: Maximum of 1500 points per session
    const baseReward = 100;
    const exerciseBonus = Math.min(sessionData.exercisesCount * 25, 900);
    const totalPoints = baseReward + exerciseBonus;

    try {
      // 3. Infrastructure Call
      await firebaseService.completeWorkoutSession(studentId, {
        ...sessionData,
        rewardPoints: totalPoints
      });

      // 4. Update Global Store immediately for snappy UX
      const profile = useProfileStore.getState().profile;
      if (profile) {
        useProfileStore.getState().setProfile({
          ...profile,
          points: (profile.points || 0) + totalPoints
        });
      }

      return { success: true, pointsEarned: totalPoints };
    } catch (error) {
      console.error('Domain Error [completeSession]:', error);
      throw error;
    }
  }
};
