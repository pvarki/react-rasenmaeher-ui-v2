export const EnrollmentState = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;
export type EnrollmentState =
  (typeof EnrollmentState)[keyof typeof EnrollmentState];
