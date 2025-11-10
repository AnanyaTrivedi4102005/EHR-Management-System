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
import { Calendar, Users, FileText, Plus, Edit, Clock } from 'lucide-react';

interface DoctorDashboardProps {
  currentUser: User;
}

export function DoctorDashboard({ currentUser }: DoctorDashboardProps) {
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
    const [allUsers, allAppointments, allRecords, doctorAvail] = await Promise.all([
      getUsers(),
      getAppointments(),
      getMedicalRecords(),
      getDoctorAvailability()
    ]);

    setPatients(allUsers.filter(u => u.role === 'patient'));
    setAppointments(allAppointments.filter(a => a.doctorId === currentUser.id));
    setMedicalRecords(allRecords.filter(r => r.doctorId === currentUser.id));

    if (doctorAvail[currentUser.id]) {
      setAvailability(doctorAvail[currentUser.id]);
      setLeaveDates(doctorAvail[currentUser.id].leaveDates?.join(', ') || '');
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

  const handleUpdateLeave = async () => {
    const dates = leaveDates.split(',').map(d => d.trim()).filter(d => d);
    const updatedAvailability = {
      ...availability,
      leaveDates: dates
    };
    try {
      await updateDoctorAvailability(currentUser.id, updatedAvailability);
      toast.success('Leave dates updated successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to update leave dates');
    }
  };

  const myAppointments = appointments.filter(a => a.status === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2>Doctor Dashboard</h2>
        <p className="text-gray-600">Manage patient records and appointments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{patients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{medicalRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
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
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone || '-'}</TableCell>
                      <TableCell>{patient.bloodType || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAddRecord(patient)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="mr-1 h-3 w-3" />
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

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAppointments.map((apt) => {
                    const patient = patients.find(p => p.id === apt.patientId);
                    return (
                      <TableRow key={apt.id}>
                        <TableCell>{apt.date}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell>{patient ? `${patient.firstName} ${patient.lastName}` : '-'}</TableCell>
                        <TableCell>{apt.reason}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {apt.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
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
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalRecords.map((record) => {
                    const patient = patients.find(p => p.id === record.patientId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{patient ? `${patient.firstName} ${patient.lastName}` : '-'}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.prescription}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Dates (comma-separated, format: YYYY-MM-DD)</Label>
                <Textarea
                  value={leaveDates}
                  onChange={(e) => setLeaveDates(e.target.value)}
                  placeholder="2025-11-15, 2025-11-16"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateLeave} className="bg-teal-600 hover:bg-teal-700">
                Update Leave Dates
              </Button>

              {availability && availability.leaveDates && availability.leaveDates.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2">Current Leave Dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {availability.leaveDates.map((date: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="mb-2">Working Hours:</p>
                <p className="text-sm text-gray-600">
                  Your availability schedule is managed by the system administrator.
                  You can only update your leave dates here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit' : 'Add'} Medical Record
              {selectedPatient && ` - ${selectedPatient.firstName} ${selectedPatient.lastName}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRecord} className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({...recordForm, diagnosis: e.target.value})}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Prescription</Label>
              <Textarea
                value={recordForm.prescription}
                onChange={(e) => setRecordForm({...recordForm, prescription: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Lab Results</Label>
              <Textarea
                value={recordForm.labResults}
                onChange={(e) => setRecordForm({...recordForm, labResults: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={recordForm.notes}
                onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>PDF Report URL (Optional)</Label>
              <Input
                type="text"
                value={recordForm.pdfReport}
                onChange={(e) => setRecordForm({...recordForm, pdfReport: e.target.value})}
                placeholder="https://example.com/report.pdf"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingRecord ? 'Update' : 'Add'} Record
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsRecordDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
