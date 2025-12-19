
import { Patient, INACBGTemplate, User, PatientStatus, Gender } from '../types';

// Initial INA-CBG Data from the User's CSV (Overwritten)
const INA_CBG_DATA: INACBGTemplate[] = [
  { id: '1', code: 'A01.0', description: 'Typhoid fever', tariff: 2268800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TUBEX', 'JUMLAH ANTIBIOTIK'] },
  { id: '2', code: 'A09.0', description: 'Other and unspecified gastroenteritis and colitis of infectious origin', tariff: 1264200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '3', code: 'A09.9', description: 'Gastroenteritis and colitis of unspecified origin', tariff: 1264200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '4', code: 'A15.0', description: 'Tb lung confirm sputum microscopy with or without culture', tariff: 4119700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TCM', 'GRAM', 'OKSIGEN', 'BACAAN THORAKS'] },
  { id: '5', code: 'A41.9', description: 'Septicaemia, unspecified', tariff: 1915000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'LEMBAR ANTIBIOTIK', 'HASIL KULTUR DARAH'] },
  { id: '6', code: 'A49.9', description: 'Bacterial infection, unspecified', tariff: 2268800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'DEMAM', 'LEUKOSITOSIS', 'UL NEGATIF', 'JUMLAH ANTIBIOTIK'] },
  { id: '7', code: 'A90', description: 'Dengue fever [classical dengue]', tariff: 1677600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TROMBOSIT <100.000', 'NS-1'] },
  { id: '8', code: 'A91', description: 'Dengue haemorrhagic fever', tariff: 1677601, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TROMBOSIT <100.000', 'NS-2'] },
  { id: '9', code: 'B16.9', description: 'Acute hepatitis b without delta-agent and without hepatatitis coma', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HBSAG (+)', 'JUMLAH ANTIVIRAL'] },
  { id: '10', code: 'D12.9', description: 'Benign neoplasm, anus and anal canal', tariff: 5018700, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '11', code: 'D21.0', description: 'Benign neoplasm, connective and other soft tissue of head, face and neck', tariff: 3995799, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '12', code: 'D21.1', description: 'Benign neoplasm, connective and other soft tis of upper limb, inc shoulder', tariff: 3995800, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '13', code: 'D21.2', description: 'Benign neoplasm, connective and other soft tissue of lower limb, inc hip', tariff: 3995801, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '14', code: 'D21.3', description: 'Benign neoplasm, connective and other soft tissue of thorax', tariff: 3995802, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '15', code: 'D21.4', description: 'Benign neoplasm, connective and other soft tissue of abdomen', tariff: 3995803, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '16', code: 'D21.5', description: 'Benign neoplasm, connective and other soft tissue of pelvis', tariff: 3995804, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '17', code: 'D21.8', description: 'Benign neoplasm, connective and other soft tissue of trunk, unspecified', tariff: 3995807, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '18', code: 'D21.9', description: 'Benign neoplasm, connective and other soft tissue, unspecified', tariff: 3995808, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '19', code: 'D25.9', description: 'Leiomyoma of uterus, unspecified', tariff: 5804800, severity: 'I', requiredDocuments: ['SEP', 'PA', 'LAPORAN OPERASI'] },
  { id: '20', code: 'D64.9', description: 'Anaemia, unspecified', tariff: 2098100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HB < 8', 'LEMBAR TRANSFUSI', 'TINDAKAN TRANSFUSI'] },
  { id: '21', code: 'E11.0', description: 'Non-insulin-dependent diabetes mellitus with coma', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'GCS < 9', 'TERAPI INSULIN'] },
  { id: '22', code: 'E11.1', description: 'Non-insulin-dependent diabetes mellitus with ketoacidosis', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'GDA > 300', 'TERAPI INSULIN', 'JUMLAH CAIRAN'] },
  { id: '23', code: 'E11.2', description: 'Non-insulin-dependent diabetes mellitus with renal complications', tariff: 2636700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'RIWAYAT DM', 'KREATININ > 1,5'] },
  { id: '24', code: 'E11.3', description: 'Non-insulin-dependent diabetes mellitus with ophthalmic complications', tariff: 2440500, severity: 'I', requiredDocuments: ['SEP', 'TRAIGE', 'KOMPLIKASI MATA'] },
  { id: '25', code: 'E11.4', description: 'Non-insulin-dependent diabetes mellitus with neurological complications', tariff: 3159100, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'KELUHAN NEURO', 'TERAPI INSULIN'] },
  { id: '26', code: 'E11.5', description: 'Non-insulin-dependent diabetes mellitus with peripheral circulatory complications', tariff: 4389900, severity: 'I', requiredDocuments: ['SEP', 'RIWAYAT DM', 'LAPORAN OPERASI', 'TERAPI INSULIN'] },
  { id: '27', code: 'E11.6', description: 'Non-insulin-dependent diabetes mellitus with other specified complications', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'TERAPI INSULIN', 'KOMPLIKASI LAIN SPESIFIK'] },
  { id: '28', code: 'E11.7', description: 'Non-insulin-dependent diabetes mellitus with multiple complications', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'TERAPI INSULIN', 'MULTIPEL KOMPLIKASI'] },
  { id: '29', code: 'E11.8', description: 'Non-insulin-dependent diabetes mellitus with unspecified complications', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GDA > 300', 'KELUHAN NEURO', 'KOMPLIKASI TIDAK SPESIFIK'] },
  { id: '30', code: 'E11.9', description: 'Non-insulin-dependent diabetes mellitus without complications', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'GDA > 300', 'TERAPI INSULIN'] },
  { id: '31', code: 'E16.2', description: 'Hypoglycaemia, unspecified', tariff: 3430900, severity: 'I', requiredDocuments: ['SEP', 'GCS < 9', 'GDA < 60', 'TERAPI D40'] },
  { id: '32', code: 'E87.6', description: 'Hypokalaemia', tariff: 2728300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KELUHAN LEMAS', 'KALIUM < 2,5', 'KOREKSI KALIUM'] },
  { id: '33', code: 'G41.9', description: 'Status epilepticus, unspecified', tariff: 2601200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KEJANG > 30 mnt', 'TIDAK SADAR > 30 mnt.'] },
  { id: '34', code: 'H81.1', description: 'Benign paroxysmal vertigo', tariff: 1240800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '35', code: 'I10', description: 'Essential (primary) hypertension', tariff: 1992500, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TERAPI ANTIHIPERTENSI'] },
  { id: '36', code: 'I11.0', description: 'Hypertensive heart disease with (congestive) heart failure', tariff: 1992500, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL THORAKS HHD', 'TERAPI ANTIDIURETIK', 'TERAPI ANTIHIPERTENSI'] },
  { id: '37', code: 'I11.9', description: 'Hypertensive heart disease without (congestive) heart failure', tariff: 2436300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL THORAKS HHD', 'TERAPI ANTIDIURETIK', 'TERAPI ANTIHIPERTENSI', 'ECHO JANTUNG'] },
  { id: '38', code: 'I20.0', description: 'Unstable angina', tariff: 3149700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'NYERI DADA', 'HASIL EKG', 'TERAPI ANGINA', 'TINDAKAN KATETER URIN'] },
  { id: '39', code: 'I20.9', description: 'Angina pectoris, unspecified', tariff: 3149700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'NYERI DADA', 'HASIL EKG', 'TERAPI ANGINA', 'TINDAKAN KATETER URIN'] },
  { id: '40', code: 'I21.9', description: 'Acute myocardial infarction, unspecified', tariff: 3030000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'NYERI DADA', 'HASIL EKG', 'TERAPI DIVITI/FONDAPARINUX', 'TINDAKAN KATETER URIN'] },
  { id: '41', code: 'I44.0', description: 'Atrioventricular block, first degree', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TINDAKAN KATETER URIN'] },
  { id: '42', code: 'I44.1', description: 'Atrioventricular block, second degree', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TINDAKAN KATETER URIN'] },
  { id: '43', code: 'I44.2', description: 'Atrioventricular block, complete', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TINDAKAN KATETER URIN'] },
  { id: '44', code: 'I47.1', description: 'Supraventricular tachycardia', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '45', code: 'I47.2', description: 'Ventricular tachycardia', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '46', code: 'I47.9', description: 'Paroxysmal tachycardia, unspecified', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '47', code: 'I48', description: 'Atrial fibrillation and flutter', tariff: 2749800, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL EKG', 'TERAPI ARITMIA', 'TINDAKAN KATETER URIN'] },
  { id: '48', code: 'I50.0', description: 'Congestive heart failure', tariff: 2436300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL ECHO JANTUNG', 'JUMLAH ANTIDIURETIK', 'TINDAKAN KATETER URIN'] },
  { id: '49', code: 'I50.9', description: 'Heart failure, unspecified', tariff: 2436300, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'HASIL ECHO JANTUNG', 'JUMLAH ANTIDIURETIK', 'TINDAKAN KATETER URIN'] },
  { id: '50', code: 'I61.0', description: 'Intracerebral haemorrhage in hemisphere, subcortical', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '51', code: 'I61.1', description: 'Intracerebral haemorrhage in hemisphere, cortical', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '52', code: 'I61.2', description: 'Intracerebral haemorrhage in hemisphere, unspecified', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '53', code: 'I61.3', description: 'Intracerebral haemorrhage in brain stem', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '54', code: 'I61.4', description: 'Intracerebral haemorrhage in cerebellum', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '55', code: 'I61.5', description: 'Intracerebral haemorrhage, intraventricular', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '56', code: 'I61.6', description: 'Intracerebral haemorrhage, multiple localized', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '57', code: 'I61.8', description: 'Other intracerebral haemorrhage', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '58', code: 'I61.9', description: 'Intracerebral haemorrhage, unspecified', tariff: 2091000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '59', code: 'I63.9', description: 'Cerebral infarction, unspecified', tariff: 3521200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TANDA STROKE', 'BACAAN CT SCAN'] },
  { id: '60', code: 'I84', description: 'haemorrhoids', tariff: 5018700, severity: 'I', requiredDocuments: ['SEP', 'KELUHAN', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '61', code: 'I95.9', description: 'Hypotension, unspecified', tariff: 2116600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TENSI < 90', 'LOADING CAIRAN', 'Jumlah Cairan Minimal 4 kolf', 'Jumlah vascon'] },
  { id: '62', code: 'J02.9', description: 'Acute pharyngitis, unspecified', tariff: 1881200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'STATUS LOKALIS', 'MATA COWONG (+)', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '63', code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', tariff: 1881200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'MATA COWONG (+)', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '64', code: 'J18.0', description: 'Bronchopneumonia, unspecified', tariff: 3432600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'SPO2 < 90%', 'RR > 30x/menit', 'JUMLAH O2', 'CURB SCORE', 'BACAAN THORAKS', '5 HARI PERAWATAN', 'JUMLAH ANTIBIOTIK'] },
  { id: '65', code: 'J18.1', description: 'Lobar pneumonia, unspecified', tariff: 3432600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'SPO2 < 90%', 'RR > 30x/menit', 'JUMLAH O2', 'CURB SCORE', 'BACAAN THORAKS', '5 HARI PERAWATAN', 'JUMLAH ANTIBIOTIK'] },
  { id: '66', code: 'J18.9', description: 'Pneumonia, unspecified', tariff: 3432600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'SPO2 < 90%', 'RR > 30x/menit', 'JUMLAH O2', 'CURB SCORE', 'BACAAN THORAKS', '5 HARI PERAWATAN', 'JUMLAH ANTIBIOTIK'] },
  { id: '67', code: 'J20.9', description: 'Acute bronchitis, unspecified', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '68', code: 'J22', description: 'Unspecified acute lower respiratory infection', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '69', code: 'J40', description: 'Bronchitis, not specified as acute or chronic', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH ANTIBIOTIK'] },
  { id: '70', code: 'J44.1', description: 'COPD with acute exacerbation', tariff: 2850100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH NEBUL'] },
  { id: '71', code: 'J45.9', description: 'Asthma, unspecified', tariff: 2114700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH NEBUL'] },
  { id: '72', code: 'J46', description: 'Status asthmaticus', tariff: 2114700, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'JUMLAH NEBUL'] },
  { id: '73', code: 'J81', description: 'Pulmonary oedema', tariff: 2740900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN THORAKS', 'TINDAKAN KATETER', 'JUMLAH ANTIDIURETIK'] },
  { id: '74', code: 'K35.3', description: 'Acute appendicitis with localized peritonitis', tariff: 3167600, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'STATUS LOKALIS', 'ALVARADO SCORE', 'LAPORAN OPERASI'] },
  { id: '75', code: 'K40.9', description: 'Unilateral inguinal hernia', tariff: 4283800, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '76', code: 'K42.9', description: 'Umbilical hernia', tariff: 4009400, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'LAPORAN OPERASI'] },
  { id: '77', code: 'K56.7', description: 'Ileus, unspecified', tariff: 1953900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN BOF LLD', 'TINDAKAN NGT', 'TINDAKAN KATETER URIN'] },
  { id: '78', code: 'K80.2', description: 'Calculus of gallbladder', tariff: 2950000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN USG ABDOMEN', 'TERAPI URSODEOXUCHOLIC'] },
  { id: '79', code: 'K80.8', description: 'Other cholelithiasis', tariff: 2950000, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN USG ABDOMEN', 'TERAPI URSODEOXUCHOLIC'] },
  { id: '80', code: 'K92.0', description: 'Haematemesis+anemia', tariff: 1670300, severity: 'I', requiredDocuments: ['SEP', 'MUNTAH DARAH', 'DL', 'LEMBAR TRANSFUSI', 'TINDAKAN TRANSFUSI'] },
  { id: '81', code: 'K92.1', description: 'Melaena+anemia', tariff: 1670300, severity: 'I', requiredDocuments: ['SEP', 'BAB HITAM', 'DL', 'LEMBAR TRANSFUSI', 'TINDAKAN TRANSFUSI'] },
  { id: '82', code: 'L05.0', description: 'Pilonidal cyst with abscess', tariff: 1433000, severity: 'I', requiredDocuments: ['SEP', 'LAPORAN OPERASI', 'STATUS LOKALIS'] },
  { id: '83', code: 'M66.24', description: 'Spontaneous rupture of extensor tendons', tariff: 3995800, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'ST.LOKALIS', 'LAP.OP'] },
  { id: '84', code: 'M71.26', description: 'Synovial cyst of popliteal space', tariff: 10393700, severity: 'I', requiredDocuments: ['SEP', 'STATUS LOKALIS', 'PA', 'LAPORAN OPERASI'] },
  { id: '85', code: 'N17.9', description: 'Acute renal failure, unspecified', tariff: 2665400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'PRODUKSI URIN', 'TINDAKAN KATETER', 'LAB KREATININ'] },
  { id: '86', code: 'N19', description: 'Unspecified renal failure', tariff: 2665400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'PRODUKSI URIN', 'TINDAKAN KATETER', 'LAB KREATININ'] },
  { id: '87', code: 'N20.0', description: 'Calculus of kidney', tariff: 3379400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BACAAN BOF ATAU USG ABDOMEN'] },
  { id: '88', code: 'N23', description: 'Unspecified renal colic', tariff: 3379400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'VAS > 8'] },
  { id: '89', code: 'N39.0', description: 'Urinary tract infection', tariff: 2208400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'BAKTERI URIN (+)', 'LEUKOSIT URIN', 'JUMLAH ANTIBIOTIK'] },
  { id: '90', code: 'N80.0', description: 'Endometriosis of uterus', tariff: 5804800, severity: 'I', requiredDocuments: ['SEP', 'USG', 'LAPORAN OPERASI'] },
  { id: '91', code: 'O14.1', description: 'Severe pre-eclampsia', tariff: 4926400, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'GEJALA IMPENDING', 'JUMLAH MGSO4', 'LAPORAN OPERASI'] },
  { id: '92', code: 'O21.1', description: 'Hyperemesis gravidarum', tariff: 2067900, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'JUMLAH CAIRAN REHIDRASI'] },
  { id: '93', code: 'O34.2', description: 'Maternal care due to uterine scar', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'RUJUKAN FKTP', 'KIA', 'LAPORAN OPERASI'] },
  { id: '94', code: 'O41.0', description: 'Oligohydramnios', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'AFI < 4', 'KIA', 'LAPORAN OPERASI'] },
  { id: '95', code: 'O42.1', description: 'PROM after 24 hours', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'PARTOGRAF', 'KIA', 'LAPORAN OPERASI'] },
  { id: '96', code: 'O44.1', description: 'Placenta praevia with haemorrhage', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'BACAAN USG', 'KIA', 'LAPORAN OPERASI'] },
  { id: '97', code: 'O61.0', description: 'Failed medical induction', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'PARTOGRAF', 'KIA', 'LAPORAN OPERASI'] },
  { id: '98', code: 'O68.9', description: 'Labour complicated by fetal stress', tariff: 4656700, severity: 'I', requiredDocuments: ['SEP', 'NST', 'KIA', 'LAPORAN OPERASI'] },
  { id: '99', code: 'P59.9', description: 'Neonatal jaundice, unspecified', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'SCORE KRAMER', 'BILIRUBIN > 20', 'TINDAKAN FOTOTERAPI'] },
  { id: '100', code: 'R18', description: 'Ascites', tariff: 2953100, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'TINDAKAN PUNGSI'] },
  { id: '101', code: 'R56.0', description: 'Febrile convulsions', tariff: 2601200, severity: 'I', requiredDocuments: ['SEP', 'TRIAGE', 'KEJANG 2x', 'TERAPI DIAZEPAM'] },
  { id: '102', code: 'S42.00', description: 'Fracture of clavicle, closed', tariff: 5723900, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'RONTGEN KLAVIKULA', 'LAP.OP'] },
  { id: '103', code: 'S42.01', description: 'Fracture of clavicle, open', tariff: 5723901, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'RONTGEN KLAVIKULA', 'LAP.OP'] },
  { id: '104', code: 'S42.70', description: 'Multiple fractures of clavicle, closed', tariff: 2322600, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'RONTGEN KLAVIKULA', 'LAP.OP'] },
  { id: '105', code: 'S42.71', description: 'Multiple fractures of clavicle, open', tariff: 2322600, severity: 'I', requiredDocuments: ['SEP', 'KRONOLOGI', 'RONTGEN KLAVIKULA', 'LAP.OP'] },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_USERS: User[] = [
  { 
    id: 'u1', 
    username: 'admin', 
    name: 'Administrator', 
    role: 'Admin', 
    email: 'admin@mclaim.id', 
    password: '123456' 
  },
  { 
    id: 'u2', 
    username: 'makhdum', 
    name: 'dr Ahmad Makhdum Basya', 
    role: 'Verifikator', 
    email: 'makhdum@mclaim.id', 
    password: '123' 
  }
];

export const ApiClient = {
  // Authentication
  async login(username: string): Promise<User | null> {
    await sleep(500);
    const users = await this.getUsers();
    return users.find(u => u.username === username || u.email === username) || null;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    await sleep(800);
    const stored = localStorage.getItem('mclaim_patients');
    return stored ? JSON.parse(stored) : [];
  },

  async savePatients(patients: Patient[]) {
    await sleep(300);
    localStorage.setItem('mclaim_patients', JSON.stringify(patients));
  },

  // INA-CBG Templates
  async getTemplates(): Promise<INACBGTemplate[]> {
    await sleep(600);
    const stored = localStorage.getItem('mclaim_templates');
    return stored ? JSON.parse(stored) : INA_CBG_DATA;
  },

  async saveTemplates(templates: INACBGTemplate[]) {
    await sleep(300);
    localStorage.setItem('mclaim_templates', JSON.stringify(templates));
  },

  // Users
  async getUsers(): Promise<User[]> {
    await sleep(400);
    const stored = localStorage.getItem('mclaim_users');
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  },

  async saveUsers(users: User[]) {
    await sleep(300);
    localStorage.setItem('mclaim_users', JSON.stringify(users));
  }
};
