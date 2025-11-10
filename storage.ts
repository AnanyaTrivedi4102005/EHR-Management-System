import { User, Appointment, MedicalRecord } from '../types';
import { userAPI, appointmentAPI, medicalRecordAPI, doctorAvailabilityAPI } from './api';

const STORAGE_KEYS = {
  CURRENT_USER: 'curasync_current_user'
};

// Initialize storage (backend handles demo data initialization)
export const initializeStorage = async () => {
  // Backend automatically initializes demo data on first run
  // Nothing needed here for frontend
};

// ==================== USER OPERATIONS ====================

export const getUsers = async (): Promise<User[]> => {
  try {
    return await userAPI.getAll();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    await userAPI.create(user);
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    await userAPI.update(userId, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await userAPI.delete(userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    return await userAPI.login(email, password);
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Current user (stored in localStorage for session management)
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// ==================== APPOINTMENT OPERATIONS ====================

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    return await appointmentAPI.getAll();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

export const addAppointment = async (appointment: Appointment): Promise<void> => {
  try {
    await appointmentAPI.create(appointment);
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<void> => {
  try {
    await appointmentAPI.update(appointmentId, updates);
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await appointmentAPI.delete(appointmentId);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// ==================== MEDICAL RECORD OPERATIONS ====================

export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  try {
    return await medicalRecordAPI.getAll();
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return [];
  }
};

export const addMedicalRecord = async (record: MedicalRecord): Promise<void> => {
  try {
    await medicalRecordAPI.create(record);
  } catch (error) {
    console.error('Error adding medical record:', error);
    throw error;
  }
};

export const updateMedicalRecord = async (recordId: string, updates: Partial<MedicalRecord>): Promise<void> => {
  try {
    await medicalRecordAPI.update(recordId, updates);
  } catch (error) {
    console.error('Error updating medical record:', error);
    throw error;
  }
};

export const deleteMedicalRecord = async (recordId: string): Promise<void> => {
  try {
    await medicalRecordAPI.delete(recordId);
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
};

// ==================== DOCTOR AVAILABILITY OPERATIONS ====================

export const getDoctorAvailability = async (): Promise<Record<string, any>> => {
  try {
    return await doctorAvailabilityAPI.getAll();
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return {};
  }
};

export const updateDoctorAvailability = async (doctorId: string, availability: any): Promise<void> => {
  try {
    await doctorAvailabilityAPI.update(doctorId, availability);
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    throw error;
  }
};
