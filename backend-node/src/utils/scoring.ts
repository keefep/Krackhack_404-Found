import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { Types } from 'mongoose';

interface UserStats {
  completedTransactions: number;
  cancelledTransactions: number;
  averageRating: number;
  averageResponseTime: number;
  disputeRate: number;
  totalTransactions: number;
}

interface CredibilityScore {
  score: number;
  breakdown: {
    transactionScore: number;
    ratingScore: number;
    responseScore: number;
    reliabilityScore: number;
  };
}

export async function calculateUserStats(userId: Types.ObjectId): Promise<UserStats> {
  const transactions = await Transaction.find({
    $or: [{ seller: userId }, { buyer: userId }]
  });

  let completedCount = 0;
  let cancelledCount = 0;
  let disputedCount = 0;
  let totalRating = 0;
  let ratingCount = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;

  transactions.forEach(transaction => {
    switch (transaction.status) {
      case 'completed':
        completedCount++;
        if (transaction.completionTime) {
          totalResponseTime += transaction.completionTime;
          responseTimeCount++;
        }
        // Add rating based on user's role in transaction
        if (transaction.seller.equals(userId) && transaction.sellerRating) {
          totalRating += transaction.sellerRating;
          ratingCount++;
        } else if (transaction.buyer.equals(userId) && transaction.buyerRating) {
          totalRating += transaction.buyerRating;
          ratingCount++;
        }
        break;
      case 'cancelled':
        cancelledCount++;
        break;
      case 'disputed':
        disputedCount++;
        break;
    }
  });

  return {
    completedTransactions: completedCount,
    cancelledTransactions: cancelledCount,
    averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
    disputeRate: transactions.length > 0 ? disputedCount / transactions.length : 0,
    totalTransactions: transactions.length
  };
}

export async function calculateCredibilityScore(userId: Types.ObjectId): Promise<CredibilityScore> {
  const stats = await calculateUserStats(userId);

  // Transaction score (30% weight)
  const transactionScore = Math.min(
    ((stats.completedTransactions * 10) / (stats.totalTransactions || 1)) * 3,
    30
  );

  // Rating score (30% weight)
  const ratingScore = (stats.averageRating / 5) * 30;

  // Response time score (20% weight)
  // Ideal response time is within 24 hours (1440 minutes)
  const responseScore = Math.min(
    ((1440 / (stats.averageResponseTime || 1440)) * 20),
    20
  );

  // Reliability score based on disputes and cancellations (20% weight)
  const reliabilityScore = Math.max(
    20 - ((stats.disputeRate * 100 + (stats.cancelledTransactions / stats.totalTransactions) * 50)),
    0
  );

  const totalScore = Math.min(
    transactionScore + ratingScore + responseScore + reliabilityScore,
    100
  );

  return {
    score: Math.round(totalScore * 10) / 10,
    breakdown: {
      transactionScore: Math.round(transactionScore * 10) / 10,
      ratingScore: Math.round(ratingScore * 10) / 10,
      responseScore: Math.round(responseScore * 10) / 10,
      reliabilityScore: Math.round(reliabilityScore * 10) / 10
    }
  };
}

export async function updateUserCredibilityScore(userId: Types.ObjectId): Promise<void> {
  const credibilityScore = await calculateCredibilityScore(userId);
  
  await User.findByIdAndUpdate(userId, {
    $set: {
      credibilityScore: credibilityScore.score,
      lastScoreUpdate: new Date()
    }
  });
}

// Function to determine user badge based on score
export function determineUserBadge(score: number): string {
  if (score >= 90) return 'Trusted Elite';
  if (score >= 80) return 'Trusted Pro';
  if (score >= 70) return 'Trusted';
  if (score >= 50) return 'Rising';
  return 'New Member';
}

// Function to check if user meets minimum score requirement
export function meetsScoreRequirement(score: number, minimumRequired: number = 50): boolean {
  return score >= minimumRequired;
}
