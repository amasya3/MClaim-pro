
export enum PatientStatus {
  ADMITTED = 'Rawat Inap',
  OUTPATIENT = 'Rawat Jalan',
  DISCHARGED = 'Pulang',
}

export enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan',
}

export interface DocumentItem {
  id: string;
  name: string;
  isChecked: boolean;
  required: boolean;
}

export interface Diagnosis {
  id: string;
  description: string;
  code: string; // INA-CBG / ICD-10 Code
  severity: 'I' | 'II' | 'III';
  timestamp: string;
  checklist: DocumentItem[];
  notes?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  bpjsNumber: string;
  name: string;
  gender: Gender;
  dob: string;
  status: PatientStatus;
  diagnoses: Diagnosis[];
  lastVisit: string;
  admissionDate?: string;
  roomNumber?: string;
  billingAmount?: number;
  inaCbgAmount?: number;
}

export interface INACBGResponse {
  code: string;
  description: string;
  severity: 'I' | 'II' | 'III';
  requiredDocuments: string[];
}

export interface INACBGTemplate {
  id: string;
  code: string;
  description: string;
  severity: 'I' | 'II' | 'III';
  requiredDocuments: string[];
  tariff?: number; // Standard tariff for Class D Hospital
}

export type ViewState = 'DASHBOARD' | 'PATIENTS' | 'PATIENT_DETAIL' | 'CBG_DATABASE';
