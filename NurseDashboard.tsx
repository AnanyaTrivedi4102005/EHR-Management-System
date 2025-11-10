import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getUsers, getAppointments, getMedicalRecords, addMedicalRecord, updateMedicalRecord, getDoctorAvailability, updateDoctorAvailability } from '../lib/storage';
import { User, MedicalRecord, Appointment } from '../types';
import { toast } from 'sonner';
import { Calendar, Users, FileText, Plus, Edit, Clock, Stethoscope } from 'lucide-react';

interface NurseDashboardProps {
  currentUser: User;
}

export function NurseDashboard({ currentUser }: NurseDashboardProps) {
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [leaveDates, setLeaveDates] = useState<string>('');

  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: '',
    labResults: '',
    notes: '',
    pdfReport: ''
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const [allUsers, allAppointments, allRecords, nurseAvail] = await Promise.all([
      getUsers(),
      getAppointments(),
      getMedicalRecords(),
      getDoctorAvailability()
    ]);

    setPatients(allUsers.filter(u => u.role === 'patient'));
    // Nurses can see all appointments
    setAppointments(allAppointments);
    // Nurses can see all medical records
    setMedicalRecords(allRecords);

    if (nurseAvail[currentUser.id]) {
      setAvailability(nurseAvail[currentUser.id]);
      setLeaveDates(nurseAvail[currentUser.id].leaveDates?.join(', ') || '');
    }
  };

  const handleAddRecord = (patient: User) => {
    setSelectedPatient(patient);
    setEditingRecord(null);
    setRecordForm({
      diagnosis: '',
      prescription: '',
      labResults: '',
      notes: '',
      pdfReport: ''
    });
    setIsRecordDialogOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    const patient = patients.find(p => p.id === record.patientId);
    setSelectedPatient(patient || null);
    setEditingRecord(record);
    setRecordForm({
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      labResults: record.labResults || '',
      notes: record.notes,
      pdfReport: record.pdfReport || ''
    });
    setIsRecordDialogOpen(true);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const record: MedicalRecord = {
      id: editingRecord?.id || Date.now().toString(),
      patientId: selectedPatient.id,
      doctorId: currentUser.id,
      date: new Date().toISOString().split('T')[0],
      diagnosis: recordForm.diagnosis,
      prescription: recordForm.prescription,
      labResults: recordForm.labResults,
      notes: recordForm.notes,
      pdfReport: recordForm.pdfReport
    };

    try {
      if (editingRecord) {
        await updateMedicalRecord(editingRecord.id, record);
        toast.success('Medical record updated successfully');
      } else {
        await addMedicalRecord(record);
        toast.success('Medical record added successfully');
      }

      setIsRecordDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to save medical record');
    }
  };

  const handleUpdateAvailability = async () => {
    const dates = leaveDates.split(',').map(d => d.trim()).filter(d => d);
    try {
      await updateDoctorAvailability(currentUser.id, {
        isAvailable: availability?.isAvailable ?? true,
        leaveDates: dates
      });
      toast.success('Availability updated successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
  };

  const getDoctorName = (doctorId: string) => {
    const allUsers = getUsers();
    const doctor = allUsers.find(u => u.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown';
  };

  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-teal-600">Nurse Dashboard</h1>
          <p className="text-gray-600">Welcome, Nurse {currentUser.firstName} {currentUser.lastName}</p>
        </div>
        <div className="flex items-center gap-2 text-teal-600">
          <Stethoscope className="h-8 w-8" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-teal-600">{todayAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-teal-600">{patients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-teal-600">{medicalRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="availability">My Availability</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{getPatientName(appointment.patientId)}</TableCell>
                      <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {appointment.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map(patient => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.bloodType || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAddRecord(patient)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Record
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{getPatientName(record.patientId)}</TableCell>
                      <TableCell>{getDoctorName(record.doctorId)}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell>{record.prescription}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRecord(record)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Manage My Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leave-dates">Leave Dates (comma-separated, e.g., 2025-11-01, 2025-11-05)</Label>
                <Input
                  id="leave-dates"
                  placeholder="2025-11-01, 2025-11-05"
                  value={leaveDates}
                  onChange={(e) => setLeaveDates(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleUpdateAvailability}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                Update Availability
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Record Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}
              {selectedPatient && ` - ${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRecord} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({...recordForm, diagnosis: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea
                id="prescription"
                value={recordForm.prescription}
                onChange={(e) => setRecordForm({...recordForm, prescription: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labResults">Lab Results</Label>
              <Textarea
                id="labResults"
                value={recordForm.labResults}
                onChange={(e) => setRecordForm({...recordForm, labResults: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={recordForm.notes}
                onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfReport">PDF Report URL</Label>
              <Input
                id="pdfReport"
                type="url"
                placeholder="https://example.com/report.pdf"
                value={recordForm.pdfReport}
                onChange={(e) => setRecordForm({...recordForm, pdfReport: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingRecord ? 'Update Record' : 'Add Record'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
