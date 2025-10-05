import * as SecureStore from 'expo-secure-store';

// Configuration
const BASE_URL = 'http://192.168.100.10:8888'; // Update this to match your setup

// Types for our API responses
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Student {
  name: string;
  lrn: string;
  grade_level: string;
  program: string;
  age?: number;
  gender?: string;
  contact_number?: string;
  email_address?: string;
  enrollment_date?: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  birthdate?: string;
  place_of_birth?: string;
  current_address?: string;
  permanent_address?: string;
  father_name?: string;
  father_contact_number?: string;
  mother_name?: string;
  mother_contact_number?: string;
  guardian_name?: string;
  guardian_contact_number?: string;
}

export interface Enrollment {
  id?: number;
  status: string;
  term: string | null;
  confirmed_at: string | null;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  published_at: string;
  type: 'news' | 'announcement';
}

export interface Activity {
  type: string;
  message: string;
  date: string;
}

export interface DashboardData {
  user: {
    pin_enabled: boolean;
  };
  student: Student;
  enrollment: Enrollment;
  news: NewsItem[];
  announcements: NewsItem[];
  recent_activity: Activity[];
}

export interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  academic_term: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  created_at: string;
  items_count: number;
  payments_count: number;
}

export interface Payment {
  id: number;
  amount: number;
  method: string;
  type: string;
  reference_no: string;
  payment_date: string;
  invoice_number: string;
  academic_term: string | null;
  status: string;
}

export interface Notification {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    url?: string;
    shared_id?: string; // For matching with real-time notifications
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  total: number;
  current_page: number;
  last_page: number;
}

// API Service Class
class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text.slice(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return data;
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string; pin_required?: boolean; pin_setup_required?: boolean }> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text.slice(0, 300)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } finally {
      await SecureStore.deleteItemAsync('authToken');
    }
  }

  async getCurrentUser(): Promise<User> {
    const data = await this.makeRequest('/auth/user');
    return data;
  }

  async changePassword(passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
    pin: string;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    return data;
  }

  async changeEmail(emailData: {
    email: string;
    pin: string;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    return data;
  }

  async setupPin(pinData: {
    pin: string;
    pin_confirmation: string;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/setup-pin', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
    return data;
  }

  async verifyPin(pinData: {
    pin: string;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
    return data;
  }

  async changePin(pinData: {
    current_pin: string;
    pin: string;
    pin_confirmation: string;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
    return data;
  }

  async togglePin(pinData: {
    pin: string;
    enable: boolean;
  }): Promise<any> {
    const data = await this.makeRequest('/auth/toggle-pin', {
      method: 'POST',
      body: JSON.stringify(pinData),
    });
    return data;
  }

  // Dashboard
  async getDashboardData(): Promise<DashboardData> {
    const data = await this.makeRequest('/dashboard');
    return data.data;
  }

  // News & Announcements
  async getNewsAndAnnouncements(type: 'all' | 'news' | 'announcements' = 'all', limit: number = 20): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type, limit: limit.toString() });
    const data = await this.makeRequest(`/news-announcements?${params}`);
    return data.data;
  }

  async getNewsDetails(id: number): Promise<NewsItem> {
    const data = await this.makeRequest(`/news/${id}`);
    return data.data;
  }

  // Financial
  async getInvoices(): Promise<Invoice[]> {
    const data = await this.makeRequest('/invoices');
    return data.data;
  }

  async getInvoiceDetails(id: number): Promise<any> {
    const data = await this.makeRequest(`/invoices/${id}`);
    return data.data;
  }

  async getPayments(): Promise<Payment[]> {
    const data = await this.makeRequest('/payments');
    return data.data;
  }


  // Enrollment
  async getCurrentEnrollment(): Promise<any> {
    const data = await this.makeRequest('/enrollments/current');
    return data;
  }

  async confirmEnrollment(enrollmentId: number): Promise<any> {
    const data = await this.makeRequest(`/enrollments/${enrollmentId}/confirm`, { method: 'POST' });
    return data;
  }

  // Academic Data
  async getStudent(id: number): Promise<any> {
    const data = await this.makeRequest(`/students/${id}`);
    return data.data;
  }

  async getSection(id: number): Promise<any> {
    const data = await this.makeRequest(`/sections/${id}`);
    return data.data;
  }

  async getSubjects(): Promise<any[]> {
    const data = await this.makeRequest('/subjects');
    return data.data;
  }


  // Academic Information
  async getCurrentSection(): Promise<any> {
    const data = await this.makeRequest('/academic/section');
    return data.data;
  }

  async getCurrentSubjects(): Promise<any> {
    const data = await this.makeRequest('/academic/subjects');
    return data.data;
  }

  async getAcademicSummary(): Promise<any> {
    const data = await this.makeRequest('/academic/summary');
    return data.data;
  }

  // Financial Information
  async getCurrentInvoices(termId?: number): Promise<any> {
    const params = termId ? `?term_id=${termId}` : '';
    const data = await this.makeRequest(`/financial/invoices${params}`);
    return data.data;
  }

  async getCurrentPaymentHistory(termId?: number): Promise<any> {
    const params = termId ? `?term_id=${termId}` : '';
    const data = await this.makeRequest(`/financial/payments${params}`);
    return data.data;
  }

  async getFinancialSummary(): Promise<any> {
    const data = await this.makeRequest('/financial/summary');
    return data.data;
  }

  async getAvailableTerms(): Promise<any> {
    const data = await this.makeRequest('/financial/terms');
    return data.data;
  }

  async updatePersonalInfo(personalInfo: any): Promise<any> {
    const data = await this.makeRequest('/profile/personal-info', {
      method: 'PUT',
      body: JSON.stringify(personalInfo),
    });
    return data;
  }

  // Notification methods
  async getNotifications(page: number = 1): Promise<NotificationResponse> {
    const data = await this.makeRequest(`/notifications?page=${page}`);
    return data.data;
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean; unread_count: number }> {
    const data = await this.makeRequest(`/notifications/${id}/read`, {
      method: 'POST',
    });
    return data;
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; unread_count: number }> {
    const data = await this.makeRequest('/notifications/mark-all-read', {
      method: 'POST',
    });
    return data;
  }

  async getUnreadNotificationCount(): Promise<{ unread_count: number }> {
    const data = await this.makeRequest('/notifications/unread-count');
    return data.data;
  }

  // Payment Plan Selection
  async calculatePaymentPlan(planData: {
    total_amount: number;
    down_payment: number;
    installment_months?: number;
  }): Promise<any> {
    const data = await this.makeRequest('/financial/payment-plan/calculate', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
    return data;
  }

  async selectPaymentPlan(invoiceId: number, paymentMode: 'installment' | 'full'): Promise<any> {
    const data = await this.makeRequest(`/financial/invoice/${invoiceId}/payment-plan/select`, {
      method: 'POST',
      body: JSON.stringify({ payment_mode: paymentMode }),
    });
    return data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
