import { datePattern, enumPipe, maskPattern } from '@vanrot/formatters';
import { ClaimStatus } from './claim-status.js';

export const invoice = datePattern('dd/MM/yyyy');
export const malaysiaPhone = maskPattern('###-#######');

export const claimStatus = enumPipe('claimStatus', ClaimStatus, {
  [ClaimStatus.Approved]: 'Approved',
  [ClaimStatus.Rejected]: 'Rejected',
  [ClaimStatus.PendingReview]: 'Pending review',
  fallback: 'Unknown',
});
