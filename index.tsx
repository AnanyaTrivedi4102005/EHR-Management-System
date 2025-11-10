import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/middleware';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize demo data on first run
const initializeDemoData = async () => {
  const usersExist = await kv.get('initialized');
  if (!usersExist) {
    // Demo users
    const demoUsers = [
      {
        id: '1',
        email: 'admin@curasync.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Sarah',
        lastName: 'Administrator',
        phone: '+1-555-0100'
      },
      {
        id: '2',
        email: 'dr.smith@curasync.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1-555-0101',
        specialization: 'Cardiology'
      },
      {
        id: '3',
        email: 'dr.johnson@curasync.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Emily',
        lastName: 'Johnson',
        phone: '+1-555-0102',
        specialization: 'Pediatrics'
      },
      {
        id: '4',
        email: 'dr.williams@curasync.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Michael',
        lastName: 'Williams',
        phone: '+1-555-0103',
        specialization: 'Neurology'
      },
      {
        id: '5',
        email: 'nurse.davis@curasync.com',
        password: 'nurse123',
        role: 'nurse',
        firstName: 'Jennifer',
        lastName: 'Davis',
        phone: '+1-555-0104',
        department: 'Emergency'
      },
      {
        id: '6',
        email: 'robert.brown@gmail.com',
        password: 'patient123',
        role: 'patient',
        firstName: 'Robert',
        lastName: 'Brown',
        phone: '+1-555-0105',
        bloodType: 'O+',
        emergencyContact: '+1-555-0999',
        dateOfBirth: '1985-06-15'
      },
      {
        id: '7',
        email: 'maria.garcia@yahoo.com',
        password: 'patient123',
        role: 'patient',
        firstName: 'Maria',
        lastName: 'Garcia',
        phone: '+1-555-0106',
        bloodType: 'A+',
        emergencyContact: '+1-555-0998',
        dateOfBirth: '1992-03-22'
      }
    ];

    // Save users
    for (const user of demoUsers) {
      await kv.set(`user:${user.id}`, user);
      await kv.set(`user:email:${user.email}`, user.id);
    }

    // Demo appointments
    const demoAppointments = [
      {
        id: 'apt1',
        patientId: '6',
        doctorId: '2',
        date: '2025-11-05',
        time: '10:00',
        status: 'scheduled',
        reason: 'Regular checkup'
      },
      {
        id: 'apt2',
        patientId: '7',
        doctorId: '3',
        date: '2025-11-06',
        time: '14:00',
        status: 'scheduled',
        reason: 'Follow-up consultation'
      },
      {
        id: 'apt3',
        patientId: '6',
        doctorId: '2',
        date: '2025-10-15',
        time: '09:00',
        status: 'completed',
        reason: 'Annual physical'
      }
    ];

    for (const appointment of demoAppointments) {
      await kv.set(`appointment:${appointment.id}`, appointment);
    }

    // Demo medical records
    const demoRecords = [
      {
        id: 'rec1',
        patientId: '6',
        doctorId: '2',
        date: '2025-10-15',
        diagnosis: 'Hypertension - Stage 1',
        prescription: 'Lisinopril 10mg once daily, Monitor blood pressure regularly',
        labResults: 'BP: 142/88, Cholesterol: 195 mg/dL, Glucose: 98 mg/dL',
        notes: 'Patient advised to reduce salt intake and increase physical activity'
      },
      {
        id: 'rec2',
        patientId: '7',
        doctorId: '3',
        date: '2025-10-20',
        diagnosis: 'Acute Bronchitis',
        prescription: 'Amoxicillin 500mg three times daily for 7 days, Rest and hydration',
        labResults: 'Chest X-ray: Clear, No signs of pneumonia',
        notes: 'Patient should return if symptoms persist beyond 7 days'
      }
    ];

    for (const record of demoRecords) {
      await kv.set(`medical_record:${record.id}`, record);
    }

    // Demo doctor availability
    const demoAvailability = {
      '2': {
        leaveDates: ['2025-11-15', '2025-11-16'],
        slots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' }
        ]
      },
      '3': {
        leaveDates: [],
        slots: [
          { dayOfWeek: 2, startTime: '10:00', endTime: '13:00' },
          { dayOfWeek: 2, startTime: '14:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '13:00' },
          { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' }
        ]
      },
      '4': {
        leaveDates: ['2025-11-10'],
        slots: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '11:00' },
          { dayOfWeek: 2, startTime: '08:00', endTime: '11:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '11:00' },
          { dayOfWeek: 5, startTime: '13:00', endTime: '16:00' }
        ]
      }
    };

    for (const [doctorId, availability] of Object.entries(demoAvailability)) {
      await kv.set(`doctor_availability:${doctorId}`, availability);
    }

    await kv.set('initialized', 'true');
    console.log('Demo data initialized successfully');
  }
};

// Initialize on startup
initializeDemoData().catch(err => console.error('Error initializing demo data:', err));

// ==================== USER ROUTES ====================

// Get all users
app.get('/make-server-7c63519c/users', async (c) => {
  try {
    const userKeys = await kv.getByPrefix('user:');
    const users = userKeys
      .filter(item => !item.key.includes('email:'))
      .map(item => item.value);
    return c.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// Get user by ID
app.get('/make-server-7c63519c/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await kv.get(`user:${id}`);
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// Login
app.post('/make-server-7c63519c/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const userId = await kv.get(`user:email:${email}`);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    const user = await kv.get(`user:${userId}`);
    if (!user || user.password !== password) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

// Add user
app.post('/make-server-7c63519c/users', async (c) => {
  try {
    const userData = await c.req.json();
    
    // Check if email already exists
    const existingUserId = await kv.get(`user:email:${userData.email}`);
    if (existingUserId) {
      return c.json({ success: false, error: 'Email already exists' }, 400);
    }
    
    const userId = userData.id || Date.now().toString();
    const user = { ...userData, id: userId };
    
    await kv.set(`user:${userId}`, user);
    await kv.set(`user:email:${user.email}`, userId);
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error('Error adding user:', error);
    return c.json({ success: false, error: 'Failed to add user' }, 500);
  }
});

// Update user
app.put('/make-server-7c63519c/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingUser = await kv.get(`user:${id}`);
    if (!existingUser) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    // If email is being changed, update the email index
    if (updates.email && updates.email !== existingUser.email) {
      await kv.del(`user:email:${existingUser.email}`);
      await kv.set(`user:email:${updates.email}`, id);
    }
    
    const updatedUser = { ...existingUser, ...updates };
    await kv.set(`user:${id}`, updatedUser);
    
    return c.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ success: false, error: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete('/make-server-7c63519c/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const user = await kv.get(`user:${id}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    await kv.del(`user:${id}`);
    await kv.del(`user:email:${user.email}`);
    
    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ success: false, error: 'Failed to delete user' }, 500);
  }
});

// ==================== APPOINTMENT ROUTES ====================

// Get all appointments
app.get('/make-server-7c63519c/appointments', async (c) => {
  try {
    const appointmentKeys = await kv.getByPrefix('appointment:');
    const appointments = appointmentKeys.map(item => item.value);
    return c.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return c.json({ success: false, error: 'Failed to fetch appointments' }, 500);
  }
});

// Get appointment by ID
app.get('/make-server-7c63519c/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const appointment = await kv.get(`appointment:${id}`);
    
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    return c.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return c.json({ success: false, error: 'Failed to fetch appointment' }, 500);
  }
});

// Add appointment
app.post('/make-server-7c63519c/appointments', async (c) => {
  try {
    const appointmentData = await c.req.json();
    const appointmentId = appointmentData.id || `apt${Date.now()}`;
    const appointment = { ...appointmentData, id: appointmentId };
    
    await kv.set(`appointment:${appointmentId}`, appointment);
    
    return c.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error adding appointment:', error);
    return c.json({ success: false, error: 'Failed to add appointment' }, 500);
  }
});

// Update appointment
app.put('/make-server-7c63519c/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingAppointment = await kv.get(`appointment:${id}`);
    if (!existingAppointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    const updatedAppointment = { ...existingAppointment, ...updates };
    await kv.set(`appointment:${id}`, updatedAppointment);
    
    return c.json({ success: true, data: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return c.json({ success: false, error: 'Failed to update appointment' }, 500);
  }
});

// Delete appointment
app.delete('/make-server-7c63519c/appointments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const appointment = await kv.get(`appointment:${id}`);
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    await kv.del(`appointment:${id}`);
    
    return c.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return c.json({ success: false, error: 'Failed to delete appointment' }, 500);
  }
});

// ==================== MEDICAL RECORD ROUTES ====================

// Get all medical records
app.get('/make-server-7c63519c/medical-records', async (c) => {
  try {
    const recordKeys = await kv.getByPrefix('medical_record:');
    const records = recordKeys.map(item => item.value);
    return c.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return c.json({ success: false, error: 'Failed to fetch medical records' }, 500);
  }
});

// Get medical record by ID
app.get('/make-server-7c63519c/medical-records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const record = await kv.get(`medical_record:${id}`);
    
    if (!record) {
      return c.json({ success: false, error: 'Medical record not found' }, 404);
    }
    
    return c.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return c.json({ success: false, error: 'Failed to fetch medical record' }, 500);
  }
});

// Add medical record
app.post('/make-server-7c63519c/medical-records', async (c) => {
  try {
    const recordData = await c.req.json();
    const recordId = recordData.id || `rec${Date.now()}`;
    const record = { ...recordData, id: recordId };
    
    await kv.set(`medical_record:${recordId}`, record);
    
    return c.json({ success: true, data: record });
  } catch (error) {
    console.error('Error adding medical record:', error);
    return c.json({ success: false, error: 'Failed to add medical record' }, 500);
  }
});

// Update medical record
app.put('/make-server-7c63519c/medical-records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existingRecord = await kv.get(`medical_record:${id}`);
    if (!existingRecord) {
      return c.json({ success: false, error: 'Medical record not found' }, 404);
    }
    
    const updatedRecord = { ...existingRecord, ...updates };
    await kv.set(`medical_record:${id}`, updatedRecord);
    
    return c.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return c.json({ success: false, error: 'Failed to update medical record' }, 500);
  }
});

// Delete medical record
app.delete('/make-server-7c63519c/medical-records/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const record = await kv.get(`medical_record:${id}`);
    if (!record) {
      return c.json({ success: false, error: 'Medical record not found' }, 404);
    }
    
    await kv.del(`medical_record:${id}`);
    
    return c.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return c.json({ success: false, error: 'Failed to delete medical record' }, 500);
  }
});

// ==================== DOCTOR AVAILABILITY ROUTES ====================

// Get all doctor availability
app.get('/make-server-7c63519c/doctor-availability', async (c) => {
  try {
    const availabilityKeys = await kv.getByPrefix('doctor_availability:');
    const availability = {};
    for (const item of availabilityKeys) {
      const doctorId = item.key.split(':')[1];
      availability[doctorId] = item.value;
    }
    return c.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return c.json({ success: false, error: 'Failed to fetch doctor availability' }, 500);
  }
});

// Get availability for specific doctor
app.get('/make-server-7c63519c/doctor-availability/:doctorId', async (c) => {
  try {
    const doctorId = c.req.param('doctorId');
    const availability = await kv.get(`doctor_availability:${doctorId}`);
    
    if (!availability) {
      return c.json({ success: false, error: 'Availability not found' }, 404);
    }
    
    return c.json({ success: true, data: availability });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return c.json({ success: false, error: 'Failed to fetch doctor availability' }, 500);
  }
});

// Update doctor availability
app.put('/make-server-7c63519c/doctor-availability/:doctorId', async (c) => {
  try {
    const doctorId = c.req.param('doctorId');
    const availabilityData = await c.req.json();
    
    await kv.set(`doctor_availability:${doctorId}`, availabilityData);
    
    return c.json({ success: true, data: availabilityData });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    return c.json({ success: false, error: 'Failed to update doctor availability' }, 500);
  }
});

// Health check
app.get('/make-server-7c63519c/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// For Supabase Edge Functions, use the default export
export default app;
