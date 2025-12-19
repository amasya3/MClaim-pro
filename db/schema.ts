
import { pgTable, text, integer, timestamp, boolean, uuid, varchar, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- TABLES ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'Admin' | 'Verifikator' | 'Kepala Unit'
  email: varchar('email', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  mrn: varchar('mrn', { length: 20 }).notNull().unique(),
  bpjsNumber: varchar('bpjs_number', { length: 50 }),
  name: varchar('name', { length: 255 }).notNull(),
  gender: varchar('gender', { length: 20 }),
  dob: timestamp('dob'),
  status: varchar('status', { length: 50 }).default('Rawat Inap'),
  admissionDate: timestamp('admission_date').defaultNow(),
  roomNumber: varchar('room_number', { length: 50 }),
  billingAmount: decimal('billing_amount', { precision: 12, scale: 2 }).default('0'),
  inaCbgAmount: decimal('ina_cbg_amount', { precision: 12, scale: 2 }).default('0'),
  verifierNote: text('verifier_note'),
  lastVisit: timestamp('last_visit').defaultNow(),
});

export const diagnoses = pgTable('diagnoses', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 5 }).default('I'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const checklists = pgTable('checklists', {
  id: uuid('id').primaryKey().defaultRandom(),
  diagnosisId: uuid('diagnosis_id').references(() => diagnoses.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  isChecked: boolean('is_checked').default(false),
  required: boolean('required').default(true),
});

// --- RELATIONS ---

export const patientsRelations = relations(patients, ({ many }) => ({
  diagnoses: many(diagnoses),
}));

export const diagnosesRelations = relations(diagnoses, ({ one, many }) => ({
  patient: one(patients, {
    fields: [diagnoses.patientId],
    references: [patients.id],
  }),
  checklists: many(checklists),
}));

export const checklistsRelations = relations(checklists, ({ one }) => ({
  diagnosis: one(diagnoses, {
    fields: [checklists.diagnosisId],
    references: [diagnoses.id],
  }),
}));
