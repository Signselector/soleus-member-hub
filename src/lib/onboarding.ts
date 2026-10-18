export type OnboardingData = {
  planId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  street: string;
  zip: string;
  city: string;
  state: string;
  hasHealthIssues: "yes" | "no" | "";
  healthDetails: string;
  takesMedication: "yes" | "no" | "";
  medicationDetails: string;
  goals: string[];
  otherGoals: string;
  addons: string[];
  signature: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptLiability: boolean;
};

export const emptyOnboarding = (planId: string): OnboardingData => ({
  planId,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  street: "",
  zip: "",
  city: "",
  state: "",
  hasHealthIssues: "",
  healthDetails: "",
  takesMedication: "",
  medicationDetails: "",
  goals: [],
  otherGoals: "",
  addons: [],
  signature: "",
  acceptTerms: false,
  acceptPrivacy: false,
  acceptLiability: false,
});

export const eur = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/**
 * Placeholder for the GoCardless integration (API connection follows).
 * Later: create a billing request / redirect flow on the server and return its hosted URL.
 */
export async function startGoCardlessCheckout(_order: OnboardingData): Promise<{ redirectUrl: string | null }> {
  return { redirectUrl: null };
}
