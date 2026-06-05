import { ClaimStatus } from './claim-status.js';

export class SummaryPage {
  customerName = '';
  claimStatus = ClaimStatus.PendingReview;
  createdAt = new Date('2026-06-05T10:30:00.000Z');
  amount = 1234.5;
  phone = '0123456789';
  description = 'Long enterprise claim description';
}
