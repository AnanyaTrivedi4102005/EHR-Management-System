export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization?: string; // for doctors
  department?: string; // for nurses
  bloodType?: string; // for patients
  emergencyContact?: string; // for patients
  dateOfBirth?: string; // for patients
}

export interface Patient extends User {
  role: 'patient';
  bloodType: string;
  emergencyContact: string;
  dateOfBirth: string;
  medicalHistory: MedicalRecord[];
  appointments: Appointment[];
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  availability: AvailabilitySlot[];
  leaveDates: string[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  labResults?: string;
  pdfReport?: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
}
