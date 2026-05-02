require('dotenv').config({ path: `${__dirname}/../../../backend/.env` });
const mongoose = require('mongoose');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Billing = require('../models/Billing');
const Bed = require('../models/Bed');
const Vitals = require('../models/Vitals');
const connectDB = require('../config/db');

const seedUsers = [
  { name: 'Arjun Sharma', email: 'patient@agg.com', password: 'password123', role: 'patient', phone: '+91 9876543210', patientInfo: { bloodGroup: 'B+', gender: 'Male', allergies: ['Penicillin'], chronicConditions: ['Hypertension', 'Type 2 Diabetes'], address: 'Lajpat Nagar, New Delhi', emergencyContact: '+91 9876543200', dateOfBirth: new Date('1992-05-15') } },
  { name: 'Riya Patel', email: 'riya@agg.com', password: 'password123', role: 'patient', phone: '+91 9876543218', patientInfo: { bloodGroup: 'A+', gender: 'Female', chronicConditions: ['Type 2 Diabetes'], dateOfBirth: new Date('1996-03-20') } },
  { name: 'Mohan Verma', email: 'mohan@agg.com', password: 'password123', role: 'patient', phone: '+91 9876543219', patientInfo: { bloodGroup: 'O-', gender: 'Male', chronicConditions: ['Arthritis', 'Hypertension'], allergies: ['Aspirin'], dateOfBirth: new Date('1969-11-08') } },
  { name: 'Anita Desai', email: 'anita@agg.com', password: 'password123', role: 'patient', phone: '+91 9876543220', patientInfo: { bloodGroup: 'AB+', gender: 'Female', chronicConditions: ['Asthma'], dateOfBirth: new Date('1979-07-22') } },
  { name: 'Dr. Priya Mehta', email: 'doctor@agg.com', password: 'password123', role: 'doctor', phone: '+91 9876543211', doctorInfo: { specialization: 'Cardiology', qualification: 'MBBS, MD (Cardiology)', experience: 12, licenseNumber: 'MCI-12345', consultationFee: 800, schedule: 'Mon-Fri 9AM-5PM', rating: 4.9, totalPatients: 48 } },
  { name: 'Dr. Aryan Singh', email: 'aryan@agg.com', password: 'password123', role: 'doctor', phone: '+91 9876543216', doctorInfo: { specialization: 'Endocrinology', qualification: 'MBBS, MD (Medicine)', experience: 8, licenseNumber: 'MCI-22345', consultationFee: 700, schedule: 'Mon-Wed 10AM-4PM', rating: 4.7, totalPatients: 35 } },
  { name: 'Dr. Kavita Joshi', email: 'kavita@agg.com', password: 'password123', role: 'doctor', phone: '+91 9876543217', doctorInfo: { specialization: 'Neurology', qualification: 'MBBS, DM (Neurology)', experience: 10, licenseNumber: 'MCI-33345', consultationFee: 900, schedule: 'Mon-Fri 11AM-6PM', rating: 4.6, totalPatients: 41 } },
  { name: 'Dr. Rahul Bose', email: 'rahul@agg.com', password: 'password123', role: 'doctor', phone: '+91 9876543221', doctorInfo: { specialization: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', experience: 15, licenseNumber: 'MCI-44445', consultationFee: 750, schedule: 'Tue-Sat 8AM-3PM', rating: 4.8, totalPatients: 52 } },
  { name: 'Gaurav Gupta', email: 'admin@agg.com', password: 'password123', role: 'admin', phone: '+91 9876543212', staffInfo: { department: 'Administration', employeeId: 'EMP-001' } },
  { name: 'Sunita Rao', email: 'nurse@agg.com', password: 'password123', role: 'nurse', phone: '+91 9876543213', nurseInfo: { ward: 'Ward B', shift: 'Morning', qualification: 'B.Sc Nursing' } },
  { name: 'Meera Pillai', email: 'meera@agg.com', password: 'password123', role: 'nurse', phone: '+91 9876543222', nurseInfo: { ward: 'ICU', shift: 'Night', qualification: 'M.Sc Nursing' } },
  { name: 'Kavya Nair', email: 'reception@agg.com', password: 'password123', role: 'receptionist', phone: '+91 9876543214', staffInfo: { department: 'Front Desk', employeeId: 'EMP-002' } },
  { name: 'Rohan Das', email: 'pharmacy@agg.com', password: 'password123', role: 'pharmacist', phone: '+91 9876543215', staffInfo: { department: 'Pharmacy', employeeId: 'EMP-003' } },
];

const seed = async () => {
  await connectDB();
  try {
    await Promise.all([User.deleteMany({}), Inventory.deleteMany({}), Appointment.deleteMany({}), MedicalRecord.deleteMany({}), Prescription.deleteMany({}), Billing.deleteMany({}), Bed.deleteMany({}), Vitals.deleteMany({})]);
    console.log('Cleared all collections');

    const users = await User.create(seedUsers);
    const patients = users.filter(u => u.role === 'patient');
    const doctors = users.filter(u => u.role === 'doctor');
    const nurse = users.find(u => u.role === 'nurse');
    const receptionist = users.find(u => u.role === 'receptionist');
    const pharmacist = users.find(u => u.role === 'pharmacist');
    console.log('Seeded ' + users.length + ' users');

    const invItems = [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', stock: 1250, unit: 'tablets', price: 2, expiryDate: new Date('2026-06-01'), minStockLevel: 200, batchNumber: 'BAT-001', manufacturer: 'Cipla', addedBy: pharmacist._id },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', stock: 340, unit: 'capsules', price: 8, expiryDate: new Date('2025-12-01'), minStockLevel: 100, batchNumber: 'BAT-002', manufacturer: 'Sun Pharma', addedBy: pharmacist._id },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', stock: 890, unit: 'tablets', price: 5, expiryDate: new Date('2026-03-01'), minStockLevel: 150, batchNumber: 'BAT-003', manufacturer: 'Lupin', addedBy: pharmacist._id },
      { name: 'Losartan 50mg', genericName: 'Losartan Potassium', category: 'Antihypertensive', stock: 680, unit: 'tablets', price: 7, expiryDate: new Date('2026-09-01'), minStockLevel: 100, batchNumber: 'BAT-004', manufacturer: 'Dr. Reddy', addedBy: pharmacist._id },
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', stock: 0, unit: 'tablets', price: 4, expiryDate: new Date('2026-03-01'), minStockLevel: 200, batchNumber: 'BAT-005', manufacturer: 'Cipla', addedBy: pharmacist._id },
      { name: 'Insulin Glargine 100U', genericName: 'Insulin Glargine', category: 'Hormone', stock: 18, unit: 'vials', price: 850, expiryDate: new Date('2025-08-15'), minStockLevel: 20, batchNumber: 'BAT-006', manufacturer: 'Sanofi', addedBy: pharmacist._id },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Antihistamine', stock: 520, unit: 'tablets', price: 3, expiryDate: new Date('2026-01-01'), minStockLevel: 100, batchNumber: 'BAT-007', manufacturer: 'Sun Pharma', addedBy: pharmacist._id },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', stock: 430, unit: 'capsules', price: 6, expiryDate: new Date('2025-11-01'), minStockLevel: 80, batchNumber: 'BAT-008', manufacturer: 'Cipla', addedBy: pharmacist._id },
      { name: 'Atorvastatin 20mg', genericName: 'Atorvastatin Calcium', category: 'Statin', stock: 15, unit: 'tablets', price: 12, expiryDate: new Date('2026-05-01'), minStockLevel: 100, batchNumber: 'BAT-009', manufacturer: 'Pfizer', addedBy: pharmacist._id },
      { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: 'Antiplatelet', stock: 760, unit: 'tablets', price: 2, expiryDate: new Date('2026-08-01'), minStockLevel: 150, batchNumber: 'BAT-010', manufacturer: 'Bayer', addedBy: pharmacist._id },
      { name: 'Glipizide 5mg', genericName: 'Glipizide', category: 'Antidiabetic', stock: 45, unit: 'tablets', price: 9, expiryDate: new Date('2026-02-01'), minStockLevel: 50, batchNumber: 'BAT-011', manufacturer: 'Cipla', addedBy: pharmacist._id },
      { name: 'Tramadol 50mg', genericName: 'Tramadol HCl', category: 'Analgesic', stock: 120, unit: 'tablets', price: 15, expiryDate: new Date('2025-07-01'), minStockLevel: 40, batchNumber: 'BAT-012', manufacturer: 'Cipla', addedBy: pharmacist._id },
      { name: 'Vitamin D3 60000IU', genericName: 'Cholecalciferol', category: 'Supplement', stock: 200, unit: 'sachets', price: 22, expiryDate: new Date('2026-04-01'), minStockLevel: 50, batchNumber: 'BAT-013', manufacturer: 'Sun Pharma', addedBy: pharmacist._id },
      { name: 'Dexamethasone 4mg', genericName: 'Dexamethasone', category: 'Corticosteroid', stock: 0, unit: 'vials', price: 45, expiryDate: new Date('2025-09-01'), minStockLevel: 20, batchNumber: 'BAT-014', manufacturer: 'Zydus', addedBy: pharmacist._id },
    ];
    await Inventory.create(invItems);
    console.log('Seeded ' + invItems.length + ' inventory items');

    const wardDefs = [{ name: 'Ward A', count: 10 }, { name: 'Ward B', count: 10 }, { name: 'Ward C', count: 8 }, { name: 'ICU', count: 6 }, { name: 'Pediatrics', count: 8 }, { name: 'Emergency', count: 4 }];
    const bedDocs = [];
    const statusOptions = ['available', 'available', 'occupied', 'available', 'maintenance', 'occupied'];
    wardDefs.forEach(w => {
      for (let i = 1; i <= w.count; i++) {
        bedDocs.push({ bedNumber: w.name.replace(' ', '').toUpperCase() + '-' + String(i).padStart(2, '0'), ward: w.name, type: w.name === 'ICU' ? 'ICU' : 'General', pricePerDay: w.name === 'ICU' ? 5000 : 800, status: statusOptions[(i + w.name.length) % statusOptions.length], floor: Math.ceil(i / 5) });
      }
    });
    await Bed.create(bedDocs);
    console.log('Seeded ' + bedDocs.length + ' beds');

    const now = new Date();
    const apptDocs = [];
    patients.forEach((patient, pi) => {
      doctors.slice(0, 2).forEach((doctor, di) => {
        for (let i = 0; i < 3; i++) {
          const d = new Date(now); d.setDate(d.getDate() + (pi * 4 + di * 2 + i - 6));
          apptDocs.push({ patient: patient._id, doctor: doctor._id, date: d, time: ['09:00 AM', '11:00 AM', '03:00 PM'][i], type: i === 0 ? 'New Visit' : 'Follow-up', department: doctor.doctorInfo.specialization, status: d < now ? 'completed' : ['confirmed', 'pending', 'confirmed'][i], fee: doctor.doctorInfo.consultationFee });
        }
      });
    });
    const appointments = await Appointment.create(apptDocs);
    console.log('Seeded ' + appointments.length + ' appointments');

    const recordDocs = [
      { patient: patients[0]._id, doctor: doctors[0]._id, diagnosis: 'Hypertension – Stage 1', symptoms: 'Headache, dizziness, elevated BP readings', medications: [{ name: 'Amlodipine', dose: '5mg', frequency: 'Once daily morning', duration: '30 days' }, { name: 'Losartan', dose: '50mg', frequency: 'Once daily evening', duration: '30 days' }], vitals: { bloodPressure: '148/92', pulse: '82', temperature: '98.6°F', weight: '78kg', spo2: '97%' }, notes: 'Sodium intake reduced. BP monitoring weekly. Return if BP > 160/95.', followUpDate: new Date(Date.now() + 30 * 86400000) },
      { patient: patients[0]._id, doctor: doctors[1]._id, diagnosis: 'Type 2 Diabetes – Controlled', symptoms: 'Fatigue, increased thirst, frequent urination', medications: [{ name: 'Metformin', dose: '500mg', frequency: 'Twice daily with meals', duration: '90 days' }, { name: 'Glipizide', dose: '5mg', frequency: 'Once daily before breakfast', duration: '90 days' }], vitals: { bloodPressure: '130/85', pulse: '76', temperature: '98.4°F', weight: '79kg', bloodSugar: '165 mg/dL' }, notes: 'HbA1c: 7.2%. Continue current regimen. Reduce carbohydrates.', followUpDate: new Date(Date.now() + 60 * 86400000) },
      { patient: patients[1]._id, doctor: doctors[1]._id, diagnosis: 'Type 2 Diabetes – New Diagnosis', symptoms: 'Excessive thirst, weight loss, blurred vision', medications: [{ name: 'Metformin', dose: '500mg', frequency: 'Once daily with dinner', duration: '30 days' }, { name: 'Vitamin D3', dose: '60000 IU', frequency: 'Once weekly', duration: '8 weeks' }], vitals: { bloodPressure: '125/80', pulse: '78', temperature: '98.2°F', weight: '65kg', bloodSugar: '238 mg/dL' }, notes: 'Patient educated on diabetes management. Follow-up in 1 month.', followUpDate: new Date(Date.now() + 30 * 86400000) },
      { patient: patients[2]._id, doctor: doctors[3]._id, diagnosis: 'Osteoarthritis – Bilateral Knee', symptoms: 'Bilateral knee pain, morning stiffness, crepitus', medications: [{ name: 'Tramadol', dose: '50mg', frequency: 'Twice daily as needed', duration: '14 days' }, { name: 'Omeprazole', dose: '20mg', frequency: 'Once daily before meals', duration: '14 days' }], vitals: { bloodPressure: '138/88', pulse: '80', temperature: '98.8°F', weight: '88kg' }, notes: 'Physiotherapy 3x/week recommended. Weight loss target: 5kg.', followUpDate: new Date(Date.now() + 14 * 86400000) },
      { patient: patients[3]._id, doctor: doctors[0]._id, diagnosis: 'Bronchial Asthma – Mild Persistent', symptoms: 'Wheezing, breathlessness on exertion, nocturnal cough', medications: [{ name: 'Salbutamol Inhaler', dose: '100mcg', frequency: '2 puffs as needed, max 4x daily', duration: '30 days' }, { name: 'Cetirizine', dose: '10mg', frequency: 'Once daily at night', duration: '14 days' }], vitals: { bloodPressure: '118/76', pulse: '84', temperature: '99.0°F', weight: '58kg', spo2: '95%' }, notes: 'Avoid triggers: dust, cold air, strong odors. Inhaler technique demonstrated.', followUpDate: new Date(Date.now() + 21 * 86400000) },
    ];
    const records = await MedicalRecord.create(recordDocs);
    console.log('Seeded ' + records.length + ' medical records');

    const rxDocs = records.map((r, i) => ({ patient: r.patient, doctor: r.doctor, medicalRecord: r._id, medications: r.medications, diagnosis: r.diagnosis, status: i % 2 === 0 ? 'dispensed' : 'pending', dispensedBy: i % 2 === 0 ? pharmacist._id : undefined, dispensedAt: i % 2 === 0 ? new Date() : undefined, validUntil: new Date(Date.now() + 30 * 86400000) }));
    await Prescription.create(rxDocs);
    console.log('Seeded ' + rxDocs.length + ' prescriptions');

    const vitalsDocs = patients.map(p => ({ patient: p._id, recordedBy: nurse._id, bloodPressure: (120 + Math.floor(Math.random() * 40)) + '/' + (70 + Math.floor(Math.random() * 20)), pulse: String(65 + Math.floor(Math.random() * 30)), temperature: '98.' + Math.floor(Math.random() * 9) + 'F', weight: (55 + Math.floor(Math.random() * 40)) + 'kg', spo2: (95 + Math.floor(Math.random() * 5)) + '%', ward: 'Ward B', notes: 'Routine vitals check' }));
    await Vitals.create(vitalsDocs);
    console.log('Seeded ' + vitalsDocs.length + ' vitals records');

    const billDocs = appointments.slice(0, 8).map((apt, i) => ({ patient: apt.patient, appointment: apt._id, createdBy: receptionist._id, items: [{ description: 'Consultation Fee', category: 'Consultation', amount: 500 + i * 100, quantity: 1 }, { description: 'Registration Charges', category: 'Other', amount: 100, quantity: 1 }], status: ['paid', 'pending', 'partial', 'paid', 'pending', 'paid', 'partial', 'pending'][i], paidAmount: [600, 0, 350, 700, 0, 600, 400, 0][i], paymentMethod: ['upi', '', 'cash', 'card', '', 'upi', 'cash', ''][i], dueDate: new Date(Date.now() + 7 * 86400000) }));
    await Billing.create(billDocs);
    console.log('Seeded ' + billDocs.length + ' billing records');

    console.log('\n  AGG Hospital Database Seeded Successfully!');
    console.log('\n  Patient:       patient@agg.com / password123');
    console.log('  Doctor:        doctor@agg.com  / password123');
    console.log('  Admin:         admin@agg.com   / password123');
    console.log('  Nurse:         nurse@agg.com   / password123');
    console.log('  Receptionist:  reception@agg.com / password123');
    console.log('  Pharmacist:    pharmacy@agg.com  / password123\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
