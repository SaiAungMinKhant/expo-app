export interface Profile {
  id: number;
  username: string;
  expo_push_token: string | null;
  created_at: string;
  name?: string | null;
  email?: string | null;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  is_complete: boolean;
  created_at: string;
  assign_to_profile_id: number;
  created_by_profile_id: number;
}

export interface TaskWithUsers extends Task {
  assign_to_profile?: Profile | null;
  created_by_profile?: Profile | null;
}
