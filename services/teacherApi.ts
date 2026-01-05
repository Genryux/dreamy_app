import { getCurrentConfig } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = getCurrentConfig().BASE_URL;

// Types
export interface TeacherDashboardData {
  teacher: {
    id: number;
    name: string;
    employee_id: string;
    email: string;
    specialization: string;
  };
  current_date: string;
  current_day: string;
  academic_term: string;
  statistics: {
    total_sections: number;
    total_subjects: number;
    total_students: number;
    classes_today: number;
  };
  today_schedule: ScheduleItem[];
}

export interface TeacherDashboardResponse {
  success: boolean;
  data: TeacherDashboardData;
}

export interface ScheduleItem {
  id: number;
  subject_id: number;
  subject_name: string;
  section_id: number;
  section_name: string;
  program: string;
  year_level: string;
  room: string;
  start_time: string | null;
  end_time: string | null;
  time_display: string;
  students_count: number;
}

export interface MyClassesData {
  schedule_by_day: {
    [key: string]: ScheduleItem[];
  };
  all_classes: ScheduleItem[];
}

export interface MyClassesResponse {
  success: boolean;
  data: MyClassesData;
}

export interface Student {
  id: number;
  student_subject_id: number;
  lrn: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  grade_level: string;
  program: string;
  evaluation_status: string;
  contact_number: string | null;
}

export interface ClassInfo {
  id: number;
  subject_name: string;
  section_name: string;
  program: string;
  year_level: string;
  room: string;
  days_of_week: string[];
  time_display: string;
}

export interface SectionStudentsData {
  class_info: ClassInfo;
  students_count: number;
  students: Student[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
}

export interface SectionStudentsResponse {
  success: boolean;
  data: SectionStudentsData;
}

export interface StudentDetailsData {
  student: {
    id: number;
    student_subject_id: number;
    lrn: string;
    name: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    gender: string;
    birthdate: string | null;
    age: number | null;
    contact_number: string | null;
    current_address: string | null;
    grade_level: string;
    program: string;
    section: string;
    status: string;
  };
  enrollment: {
    evaluation_status: string;
    subject_name: string;
  };
  guardian_info: {
    father_name: string | null;
    father_contact: string | null;
    mother_name: string | null;
    mother_contact: string | null;
    guardian_name: string | null;
    guardian_contact: string | null;
  };
}

export interface StudentDetailsResponse {
  success: boolean;
  data: StudentDetailsData;
}

export interface EvaluateStudentResponse {
  success: boolean;
  message: string;
  data: {
    student_id: number;
    status: 'passed' | 'failed';
    evaluated_at: string;
  };
}

export interface TeacherProfile {
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    pin_enabled: boolean;
  };
  teacher: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email_address: string | null;
    contact_number: string | null;
    specialization: string | null;
    status: string;
    program: string | null;
  };
}

export interface ProfileUpdateData {
  first_name?: string | null;
  last_name?: string | null;
  specialization?: string | null;
  contact_number?: string | null;
  email_address?: string | null;
}

class TeacherApiService {
  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await SecureStore.getItemAsync('authToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error ${response.status}`;
      throw new Error(message);
    }
    return response.json();
  }

  /**
   * Get teacher dashboard data
   * Shows today's schedule, current class, and statistics
   */
  async getDashboard(): Promise<TeacherDashboardData> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/dashboard`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<TeacherDashboardResponse>(response);
    return result.data;
  }

  /**
   * Get all classes assigned to the teacher
   */
  async getMyClasses(): Promise<MyClassesData> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/my-classes`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<MyClassesResponse>(response);
    return result.data;
  }

  /**
   * Get students enrolled in a specific section subject
   */
  async getSectionStudents(sectionSubjectId: number): Promise<SectionStudentsData> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/classes/${sectionSubjectId}/students`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<SectionStudentsResponse>(response);
    return result.data;
  }

  /**
   * Get detailed information about a student in a specific class
   */
  async getStudentDetails(sectionSubjectId: number, studentId: number): Promise<StudentDetailsData> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/classes/${sectionSubjectId}/students/${studentId}`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<StudentDetailsResponse>(response);
    return result.data;
  }

  /**
   * Evaluate a single student (mark as passed or failed)
   * This action cannot be undone
   */
  async evaluateStudent(
    sectionSubjectId: number,
    studentId: number,
    status: 'passed' | 'failed',
    remarks?: string
  ): Promise<EvaluateStudentResponse> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/classes/${sectionSubjectId}/students/${studentId}/evaluate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status, remarks }),
    });
    return this.handleResponse<EvaluateStudentResponse>(response);
  }

  /**
   * Bulk evaluate multiple students at once
   */
  async bulkEvaluateStudents(
    sectionSubjectId: number,
    evaluations: { student_id: number; status: 'passed' | 'failed'; remarks?: string }[]
  ): Promise<{ success: boolean; message: string; data: { evaluated_count: number } }> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/classes/${sectionSubjectId}/evaluate-bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ evaluations }),
    });
    return this.handleResponse(response);
  }

  /**
   * Get teacher profile
   */
  async getProfile(): Promise<TeacherProfile> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/profile`, {
      method: 'GET',
      headers,
    });
    const result = await this.handleResponse<{ success: boolean; data: TeacherProfile }>(response);
    return result.data;
  }

  /**
   * Update teacher profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<TeacherProfile> {
    const headers = await this.getAuthHeader();
    const response = await fetch(`${BASE_URL}/api/teacher/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse<{ success: boolean; data: TeacherProfile; message: string }>(response);
    return result.data;
  }
}

export const teacherApiService = new TeacherApiService();
