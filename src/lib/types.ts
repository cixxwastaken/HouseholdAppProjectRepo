export type HouseholdRole = 'admin' | 'adult' | 'child';
export type DashboardWidget = 'chores' | 'events' | 'shopping';
export type RecurrenceRule = { weekdays: number[] } | { intervalDays: number };
export type Membership = { household_id: string; role: HouseholdRole; display_name: string | null };
export type Profile = { id: string; display_name: string | null; bio: string | null; avatar_path: string | null; dashboard_widgets: DashboardWidget[] };
export type HouseholdMember = { id: string; user_id: string; role: HouseholdRole; display_name: string | null };
export type ChoreOccurrence = { id: string; title: string; due_at: string; assignee_id: string | null; status: 'open' | 'complete' };
export type DashboardData = { chores: ChoreOccurrence[]; events: { id: string; title: string; starts_at: string }[]; shopping: { id: string; title: string; quantity: string | null; checked_at: string | null }[] };
