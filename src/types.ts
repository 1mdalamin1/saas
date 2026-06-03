export type StudentStatus = 'Active' | 'Passed' | 'Cancelled';
export type LessonStatus = 'Booked' | 'Completed' | 'No-show';
export type PaymentStatus = 'Paid' | 'Due';

export interface Instructor {
  id: string;
  full_name: string;
  email: string;
  hourly_rate: number;
  avatar?: string;
}

export interface Student {
  id: string;
  instructor_id: string;
  name: string;
  phone: string;
  theory_passed: boolean;
  status: StudentStatus;
  created_at: string;
}

export interface Lesson {
  id: string;
  student_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  status: LessonStatus;
  notes: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface ProgressSkill {
  name: string;
  rating: number; // 1-5
}

export interface StudentProgress {
  student_id: string;
  skills: ProgressSkill[];
  last_updated: string;
}

export interface Resource {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  description: string;
}

export type ActiveModule =
  | 'dashboard'
  | 'diary'
  | 'students'
  | 'progress'
  | 'payments'
  | 'resources'
  | 'import-export'
  | 'profile';
