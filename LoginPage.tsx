import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, UserRole } from '../types';
import { loginUser, addUser, setCurrentUser } from '../lib/storage';
import { toast } from 'sonner';
import logoImage from 'figma:asset/f1e9ee0d1b078f476b4ea645a53b4faddfa8a512.png';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('patient');
  const [regBloodType, setRegBloodType] = useState('');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [regDOB, setRegDOB] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = await loginUser(loginEmail, loginPassword);
      setCurrentUser(user);
      onLogin(user);
      toast.success(`Welcome back, ${user.firstName}!`);
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regEmail || !regPassword || !regFirstName || !regLastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Only staff (admin, doctor, nurse) require @curasync.com email
    if (regRole !== 'patient' && !regEmail.endsWith('@curasync.com')) {
      toast.error('Staff members must use @curasync.com email domain');
      return;
    }

    if (regRole === 'patient' && (!regBloodType || !regEmergencyContact || !regDOB)) {
      toast.error('Please fill in all patient information');
      return;
    }

    if (regRole === 'doctor' && !regSpecialization) {
      toast.error('Please specify your specialization');
      return;
    }

    if (regRole === 'nurse' && !regDepartment) {
      toast.error('Please specify your department');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: regEmail,
      password: regPassword,
      role: regRole,
      firstName: regFirstName,
      lastName: regLastName,
      phone: regPhone,
      ...(regRole === 'patient' && {
        bloodType: regBloodType,
        emergencyContact: regEmergencyContact,
        dateOfBirth: regDOB
      }),
      ...(regRole === 'doctor' && { specialization: regSpecialization }),
      ...(regRole === 'nurse' && { department: regDepartment })
    };

    try {
      await addUser(newUser);
      toast.success('Registration successful! Please login.');
      
      // Reset form
      setRegEmail('');
      setRegPassword('');
      setRegFirstName('');
      setRegLastName('');
      setRegPhone('');
      setRegBloodType('');
      setRegEmergencyContact('');
      setRegDOB('');
      setRegSpecialization('');
      setRegDepartment('');
    } catch (error) {
      toast.error('Registration failed. Email may already be registered.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImage} alt="CuraSync Logo" className="h-auto w-96 max-w-full mx-auto mb-4" />
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Login to access your CuraSync account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="user@curasync.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <p className="mb-1">Demo Accounts:</p>
                    <p>Admin: admin@curasync.com / admin123</p>
                    <p>Doctor: dr.smith@curasync.com / doctor123</p>
                    <p>Nurse: nurse.davis@curasync.com / nurse123</p>
                    <p>Patient: robert.brown@gmail.com / patient123</p>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Register for a new CuraSync account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-firstname">First Name</Label>
                      <Input
                        id="reg-firstname"
                        placeholder="John"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-lastname">Last Name</Label>
                      <Input
                        id="reg-lastname"
                        placeholder="Doe"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder={regRole === 'patient' ? 'your.email@example.com' : 'user@curasync.com'}
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                    {regRole !== 'patient' && (
                      <p className="text-xs text-gray-500">Staff members must use @curasync.com email</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone</Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+1-555-0000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-role">Role</Label>
                    <Select value={regRole} onValueChange={(value) => setRegRole(value as UserRole)}>
                      <SelectTrigger id="reg-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {regRole === 'patient' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="reg-bloodtype">Blood Type</Label>
                        <Select value={regBloodType} onValueChange={setRegBloodType}>
                          <SelectTrigger id="reg-bloodtype">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-dob">Date of Birth</Label>
                        <Input
                          id="reg-dob"
                          type="date"
                          value={regDOB}
                          onChange={(e) => setRegDOB(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-emergency">Emergency Contact</Label>
                        <Input
                          id="reg-emergency"
                          type="tel"
                          placeholder="+1-555-0000"
                          value={regEmergencyContact}
                          onChange={(e) => setRegEmergencyContact(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {regRole === 'doctor' && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-specialization">Specialization</Label>
                      <Input
                        id="reg-specialization"
                        placeholder="e.g., Cardiology"
                        value={regSpecialization}
                        onChange={(e) => setRegSpecialization(e.target.value)}
                      />
                    </div>
                  )}

                  {regRole === 'nurse' && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-department">Department</Label>
                      <Input
                        id="reg-department"
                        placeholder="e.g., Emergency"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Register
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
