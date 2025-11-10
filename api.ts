import { projectId, publicAnonKey } from '../utils/supabase/info';
import { User, Appointment, MedicalRecord } from '../types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7c63519c`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    console.error('API Error:', data.error || 'Unknown error');
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
}

// ==================== USER API ====================

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${BASE_URL}/users`, { headers });
    return handleResponse<User[]>(response);
  },

  getById: async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, { headers });
    return handleResponse<User>(response);
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password })
    });
    return handleResponse<User>(response);
  },

  create: async (user: Partial<User>): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    });
    return handleResponse<User>(response);
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    return handleResponse<User>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(response);
  }
};

// ==================== APPOINTMENT API ====================

export const appointmentAPI = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await fetch(`${BASE_URL}/appointments`, { headers });
    return handleResponse<Appointment[]>(response);
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, { headers });
    return handleResponse<Appointment>(response);
  },

  create: async (appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointment)
    });
    return handleResponse<Appointment>(response);
  },

  update: async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    return handleResponse<Appointment>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(response);
  }
};

// ==================== MEDICAL RECORD API ====================

export const medicalRecordAPI = {
  getAll: async (): Promise<MedicalRecord[]> => {
    const response = await fetch(`${BASE_URL}/medical-records`, { headers });
    return handleResponse<MedicalRecord[]>(response);
  },

  getById: async (id: string): Promise<MedicalRecord> => {
    const response = await fetch(`${BASE_URL}/medical-records/${id}`, { headers });
    return handleResponse<MedicalRecord>(response);
  },

  create: async (record: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await fetch(`${BASE_URL}/medical-records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(record)
    });
    return handleResponse<MedicalRecord>(response);
  },

  update: async (id: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await fetch(`${BASE_URL}/medical-records/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
    return handleResponse<MedicalRecord>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/medical-records/${id}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(response);
  }
};

// ==================== DOCTOR AVAILABILITY API ====================

export const doctorAvailabilityAPI = {
  getAll: async (): Promise<Record<string, any>> => {
    const response = await fetch(`${BASE_URL}/doctor-availability`, { headers });
    return handleResponse<Record<string, any>>(response);
  },

  getByDoctorId: async (doctorId: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/doctor-availability/${doctorId}`, { headers });
    return handleResponse<any>(response);
  },

  update: async (doctorId: string, availability: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}/doctor-availability/${doctorId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(availability)
    });
    return handleResponse<any>(response);
  }
};

// Health check
export const checkHealth = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await fetch(`${BASE_URL}/health`, { headers });
  return response.json();
};
