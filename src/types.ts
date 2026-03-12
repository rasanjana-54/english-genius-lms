export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  grade?: string;
  photoURL?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'Grammar' | 'Vocabulary' | 'Literature' | 'Writing' | 'Speaking';
  videoUrl?: string;
  createdAt: any;
}

export interface Paper {
  id: string;
  title: string;
  year: string;
  type: 'Past Paper' | 'Model Paper' | 'Term Test';
  fileUrl: string;
  createdAt: any;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  paperId: string;
  paperTitle: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: any;
}
