export type ClaimStatus = "pending" | "approved" | "rejected";

export type Claim = {
  id: string;
  accountId: string;
  status: ClaimStatus;
  amount: number;
};
