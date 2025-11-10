import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { getUsers, getAppointments, getMedicalRecords, addAppointment, deleteAppointment, getDoctorAvailability } from '../lib/storage';
import { User, Appointment, MedicalRecord } from '../types';
import { toast } from 'sonner';
import { Calendar, FileText, Activity, Clock, User as UserIcon, Phone, Droplet } from 'lucide-react';

interface PatientDashboardProps {
  currentUser: User;
}

export function PatientDashboard({ currentUser }: PatientDashboardProps) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [doctorAvailability, setDoctorAvailability] = useState<any>({});
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isDoctorInfoOpen, setIsDoctorInfoOpen] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const [allUsers, allAppointments, allRecords, availability] = await Promise.all([
      getUsers(),
      getAppointments(),
      getMedicalRecords(),
      getDoctorAvailability()
    ]);

    setDoctors(allUsers.filter(u => u.role === 'doctor'));
    setAppointments(allAppointments.filter(a => a.patientId === currentUser.id));
    setMedicalRecords(allRecords.filter(r => r.patientId === currentUser.id));
    setDoctorAvailability(availability);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    const appointment: Appointment = {
      id: Date.now().toString(),
      patientId: currentUser.id,
      doctorId: bookingForm.doctorId,
      date: bookingForm.date,
      time: bookingForm.time,
      status: 'scheduled',
      reason: bookingForm.reason
    };

    try {
      await addAppointment(appointment);
      toast.success('Appointment booked successfully');
      setIsBookingDialogOpen(false);
      setBookingForm({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      });
      await loadData();
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('Appointment cancelled successfully');
        await loadData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleViewDoctorInfo = (doctor: User) => {
    setSelectedDoctor(doctor);
    setIsDoctorInfoOpen(true);
  };

  const getDoctorAvailabilityInfo = (doctorId: string) => {
    return doctorAvailability[doctorId] || { leaveDates: [], slots: [] };
  };

  const getDayName = (dayNum: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const pastAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage your health records and appointments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Type</CardTitle>
            <Droplet className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentUser.bloodType || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{medicalRecords.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
            <Phone className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{currentUser.emergencyContact || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-teal-50 to-blue-50">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p>{currentUser.firstName} {currentUser.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p>{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p>{currentUser.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p>{currentUser.dateOfBirth || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Type</p>
              <p>{currentUser.bloodType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Emergency Contact</p>
              <p>{currentUser.emergencyContact || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>My Appointments</h3>
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Doctor</Label>
                    <Select value={bookingForm.doctorId} onValueChange={(value: string) => setBookingForm({...bookingForm, doctorId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Visit</Label>
                    <Textarea
                      value={bookingForm.reason}
                      onChange={(e) => setBookingForm({...bookingForm, reason: e.target.value})}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                      Book Appointment
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No upcoming appointments
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingAppointments.map((apt) => {
                      const doctor = doctors.find(d => d.id === apt.doctorId);
                      return (
                        <TableRow key={apt.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{apt.date}</TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>{apt.reason}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                              {apt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {pastAppointments.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastAppointments.map((apt) => {
                      const doctor = doctors.find(d => d.id === apt.doctorId);
                      return (
                        <TableRow key={apt.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{apt.date}</TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>{apt.reason}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Available Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => {
                  const availability = getDoctorAvailabilityInfo(doctor.id);
                  return (
                    <Card key={doctor.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-teal-500">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-teal-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </CardTitle>
                            <p className="text-sm text-gray-600 font-medium">{doctor.specialization}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <p className="text-gray-600 mb-1 font-medium">Contact:</p>
                          <p>{doctor.email}</p>
                          <p>{doctor.phone || 'N/A'}</p>
                        </div>
                        <Button
                          onClick={() => handleViewDoctorInfo(doctor)}
                          variant="outline"
                          className="w-full hover:bg-teal-50 hover:border-teal-300"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          View Availability
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              {medicalRecords.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-lg">No medical records available</p>
              ) : (
                <div className="space-y-6">
                  {medicalRecords.map((record) => {
                    const doctor = doctors.find(d => d.id === record.doctorId);
                    return (
                      <Card key={record.id} className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg text-blue-900">
                                {record.diagnosis}
                              </CardTitle>
                              <p className="text-sm text-gray-600 font-medium">
                                Date: {record.date} | Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-700 font-medium mb-1">Prescription:</p>
                            <p className="text-gray-800">{record.prescription}</p>
                          </div>
                          {record.labResults && (
                            <div>
                              <p className="text-sm text-gray-700 font-medium mb-1">Lab Results:</p>
                              <p className="text-gray-800">{record.labResults}</p>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <p className="text-sm text-gray-700 font-medium mb-1">Notes:</p>
                              <p className="text-gray-800">{record.notes}</p>
                            </div>
                          )}
                          {record.pdfReport && (
                            <div>
                              <a
                                href={record.pdfReport}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-700 hover:underline text-sm font-medium inline-flex items-center"
                              >
                                View PDF Report →
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDoctorInfoOpen} onOpenChange={setIsDoctorInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedDoctor && `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
            </DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Specialization:</p>
                <p className="text-gray-800">{selectedDoctor.specialization}</p>
              </div>

              {getDoctorAvailabilityInfo(selectedDoctor.id).slots?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Available Days & Times:</p>
                  <div className="space-y-2">
                    {getDoctorAvailabilityInfo(selectedDoctor.id).slots.map((slot: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                        <span className="font-medium">{getDayName(slot.dayOfWeek)}</span>
                        <span className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getDoctorAvailabilityInfo(selectedDoctor.id).leaveDates?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">Leave Dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {getDoctorAvailabilityInfo(selectedDoctor.id).leaveDates.map((date: string, idx: number) => (
                      <Badge key={idx} className="bg-red-100 text-red-700 hover:bg-red-200">
                        {date}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
