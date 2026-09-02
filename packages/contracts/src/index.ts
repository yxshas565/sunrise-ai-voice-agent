export type ProjectType =
  | "full_home"
  | "kitchen"
  | "living_room"
  | "bedroom"
  | "renovation"
  | "other"
  | "unknown";

export type ProjectTimeline =
  | "immediately"
  | "within_1_month"
  | "within_3_months"
  | "within_6_months"
  | "later"
  | "unknown";

export type PreferredLanguage =
  | "english"
  | "hindi"
  | "hinglish"
  | "unknown";

export type CallOutcome =
  | "qualified"
  | "meeting_requested"
  | "meeting_confirmed"
  | "callback_requested"
  | "not_interested"
  | "no_answer"
  | "failed"
  | "unknown";

export interface Lead {
  id: string;
  phoneNumber: string;

  projectType: ProjectType;
  timeline: ProjectTimeline;
  preferredLanguage: PreferredLanguage;

  meetingRequested: boolean;
  meetingConfirmed: boolean;

  callOutcome: CallOutcome;

  transcript?: string;
  summary?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  phoneNumber: string;
}

export interface CreateLeadResponse {
  leadId: string;
  status: "queued" | "calling" | "completed" | "failed";
}
