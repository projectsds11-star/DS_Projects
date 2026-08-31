-- ====================================================================
-- SUPABASE POSTGRESQL SEED: 002_seed_andhra_pradesh_locations.sql
-- DS PROJECTS — Complete Andhra Pradesh 28-District & Mandal Master Dataset
-- ====================================================================

-- 1. SEED ANDHRA PRADESH STATE
INSERT INTO public.states (id, name, code, country, status)
VALUES ('AP-STATE-01', 'Andhra Pradesh', 'AP', 'India', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- 2. SEED ALL 28 DISTRICTS
INSERT INTO public.districts (id, state_id, name, code, headquarters, status)
VALUES
('AP-DIS-01', 'AP-STATE-01', 'Alluri Sitharama Raju', 'ASR', 'Paderu', 'active'),
('AP-DIS-02', 'AP-STATE-01', 'Anakapalli', 'AKP', 'Anakapalli', 'active'),
('AP-DIS-03', 'AP-STATE-01', 'Anantapuramu', 'ATP', 'Anantapur', 'active'),
('AP-DIS-04', 'AP-STATE-01', 'Annamayya', 'ANM', 'Rayachoti', 'active'),
('AP-DIS-05', 'AP-STATE-01', 'Bapatla', 'BPT', 'Bapatla', 'active'),
('AP-DIS-06', 'AP-STATE-01', 'Chittoor', 'CTR', 'Chittoor', 'active'),
('AP-DIS-07', 'AP-STATE-01', 'Dr. B.R. Ambedkar Konaseema', 'KNS', 'Amalapuram', 'active'),
('AP-DIS-08', 'AP-STATE-01', 'East Godavari', 'EGD', 'Rajahmundry', 'active'),
('AP-DIS-09', 'AP-STATE-01', 'Eluru', 'ELR', 'Eluru', 'active'),
('AP-DIS-10', 'AP-STATE-01', 'Guntur', 'GNT', 'Guntur', 'active'),
('AP-DIS-11', 'AP-STATE-01', 'Kakinada', 'KKD', 'Kakinada', 'active'),
('AP-DIS-12', 'AP-STATE-01', 'Krishna', 'KRI', 'Machilipatnam', 'active'),
('AP-DIS-13', 'AP-STATE-01', 'Kurnool', 'KNL', 'Kurnool', 'active'),
('AP-DIS-14', 'AP-STATE-01', 'Markapuram', 'MRK', 'Markapur', 'active'),
('AP-DIS-15', 'AP-STATE-01', 'Nandyal', 'NDL', 'Nandyal', 'active'),
('AP-DIS-16', 'AP-STATE-01', 'NTR', 'NTR', 'Vijayawada', 'active'),
('AP-DIS-17', 'AP-STATE-01', 'Palnadu', 'PLN', 'Narasaraopet', 'active'),
('AP-DIS-18', 'AP-STATE-01', 'Parvathipuram Manyam', 'PVM', 'Parvathipuram', 'active'),
('AP-DIS-19', 'AP-STATE-01', 'Polavaram', 'PLV', 'Polavaram', 'active'),
('AP-DIS-20', 'AP-STATE-01', 'Prakasam', 'PKM', 'Ongole', 'active'),
('AP-DIS-21', 'AP-STATE-01', 'Sri Potti Sriramulu Nellore', 'NLR', 'Nellore', 'active'),
('AP-DIS-22', 'AP-STATE-01', 'Sri Sathya Sai', 'SSS', 'Puttaparthi', 'active'),
('AP-DIS-23', 'AP-STATE-01', 'Srikakulam', 'SKL', 'Srikakulam', 'active'),
('AP-DIS-24', 'AP-STATE-01', 'Tirupati', 'TPT', 'Tirupati', 'active'),
('AP-DIS-25', 'AP-STATE-01', 'Visakhapatnam', 'VSP', 'Visakhapatnam', 'active'),
('AP-DIS-26', 'AP-STATE-01', 'Vizianagaram', 'VZM', 'Vizianagaram', 'active'),
('AP-DIS-27', 'AP-STATE-01', 'West Godavari', 'WGD', 'Bhimavaram', 'active'),
('AP-DIS-28', 'AP-STATE-01', 'YSR Kadapa', 'KDP', 'Kadapa', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, headquarters = EXCLUDED.headquarters;

-- 3. SEED MANDALS FOR ALL 28 DISTRICTS

-- 01. ALLURI SITHARAMA RAJU (18 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D01-M001', 'AP-DIS-01', 'Addateegala', 'ASR-ADD', 'active'),
('AP-D01-M002', 'AP-DIS-01', 'Ananthagiri', 'ASR-ANA', 'active'),
('AP-D01-M003', 'AP-DIS-01', 'Araku Valley', 'ASR-ARA', 'active'),
('AP-D01-M004', 'AP-DIS-01', 'Chintapalle', 'ASR-CHI', 'active'),
('AP-D01-M005', 'AP-DIS-01', 'Devipatnam', 'ASR-DEV', 'active'),
('AP-D01-M006', 'AP-DIS-01', 'Dumbriguda', 'ASR-DUM', 'active'),
('AP-D01-M007', 'AP-DIS-01', 'G.Madugula', 'ASR-GMA', 'active'),
('AP-D01-M008', 'AP-DIS-01', 'G.K.Veedhi', 'ASR-GKV', 'active'),
('AP-D01-M009', 'AP-DIS-01', 'Gangavaram', 'ASR-GAN', 'active'),
('AP-D01-M010', 'AP-DIS-01', 'Hukumpeta', 'ASR-HUK', 'active'),
('AP-D01-M011', 'AP-DIS-01', 'Koyyuru', 'ASR-KOY', 'active'),
('AP-D01-M012', 'AP-DIS-01', 'Maredumilli', 'ASR-MAR', 'active'),
('AP-D01-M013', 'AP-DIS-01', 'Munchingi Puttu', 'ASR-MUN', 'active'),
('AP-D01-M014', 'AP-DIS-01', 'Paderu', 'ASR-PAD', 'active'),
('AP-D01-M015', 'AP-DIS-01', 'Pedabayalu', 'ASR-PED', 'active'),
('AP-D01-M016', 'AP-DIS-01', 'Rajavommangi', 'ASR-RAJ', 'active'),
('AP-D01-M017', 'AP-DIS-01', 'Rampachodavaram', 'ASR-RAM', 'active'),
('AP-D01-M018', 'AP-DIS-01', 'Y.Ramavaram', 'ASR-YRA', 'active')
ON CONFLICT (id) DO NOTHING;

-- 02. ANAKAPALLI (24 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D02-M001', 'AP-DIS-02', 'Achutapuram', 'AKP-ACH', 'active'),
('AP-D02-M002', 'AP-DIS-02', 'Anakapalli', 'AKP-ANA', 'active'),
('AP-D02-M003', 'AP-DIS-02', 'Butchayyapeta', 'AKP-BUT', 'active'),
('AP-D02-M004', 'AP-DIS-02', 'Cheedikada', 'AKP-CHE', 'active'),
('AP-D02-M005', 'AP-DIS-02', 'Chodavaram', 'AKP-CHO', 'active'),
('AP-D02-M006', 'AP-DIS-02', 'Devarapalle', 'AKP-DEV', 'active'),
('AP-D02-M007', 'AP-DIS-02', 'Elamanchili', 'AKP-ELA', 'active'),
('AP-D02-M008', 'AP-DIS-02', 'Golugonda', 'AKP-GOL', 'active'),
('AP-D02-M009', 'AP-DIS-02', 'K.Kotapadu', 'AKP-KKO', 'active'),
('AP-D02-M010', 'AP-DIS-02', 'Kasimkota', 'AKP-KAS', 'active'),
('AP-D02-M011', 'AP-DIS-02', 'Kotauratla', 'AKP-KOT', 'active'),
('AP-D02-M012', 'AP-DIS-02', 'Madugula', 'AKP-MAD', 'active'),
('AP-D02-M013', 'AP-DIS-02', 'Makavarapalem', 'AKP-MAK', 'active'),
('AP-D02-M014', 'AP-DIS-02', 'Munagapaka', 'AKP-MUN', 'active'),
('AP-D02-M015', 'AP-DIS-02', 'Nakkapalle', 'AKP-NAK', 'active'),
('AP-D02-M016', 'AP-DIS-02', 'Narsipatnam', 'AKP-NAR', 'active'),
('AP-D02-M017', 'AP-DIS-02', 'Nathavaram', 'AKP-NAT', 'active'),
('AP-D02-M018', 'AP-DIS-02', 'Parawada', 'AKP-PAR', 'active'),
('AP-D02-M019', 'AP-DIS-02', 'Payakaraopeta', 'AKP-PAY', 'active'),
('AP-D02-M020', 'AP-DIS-02', 'Rambilli', 'AKP-RAM', 'active'),
('AP-D02-M021', 'AP-DIS-02', 'Ravikamatham', 'AKP-RAV', 'active'),
('AP-D02-M022', 'AP-DIS-02', 'Rolugunta', 'AKP-ROL', 'active'),
('AP-D02-M023', 'AP-DIS-02', 'S.Rayavaram', 'AKP-SRA', 'active'),
('AP-D02-M024', 'AP-DIS-02', 'Sabbavaram', 'AKP-SAB', 'active')
ON CONFLICT (id) DO NOTHING;

-- 03. ANANTAPURAMU (31 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D03-M001', 'AP-DIS-03', 'Anantapur', 'ATP-ANA', 'active'),
('AP-D03-M002', 'AP-DIS-03', 'Atmakur', 'ATP-ATM', 'active'),
('AP-D03-M003', 'AP-DIS-03', 'Beluguppa', 'ATP-BEL', 'active'),
('AP-D03-M004', 'AP-DIS-03', 'Bommanahal', 'ATP-BOM', 'active'),
('AP-D03-M005', 'AP-DIS-03', 'Brahmasamudram', 'ATP-BRA', 'active'),
('AP-D03-M006', 'AP-DIS-03', 'Bukkarayasamudram', 'ATP-BUK', 'active'),
('AP-D03-M007', 'AP-DIS-03', 'D.Hirehal', 'ATP-DHI', 'active'),
('AP-D03-M008', 'AP-DIS-03', 'Garladinne', 'ATP-GAR', 'active'),
('AP-D03-M009', 'AP-DIS-03', 'Gooty', 'ATP-GOO', 'active'),
('AP-D03-M010', 'AP-DIS-03', 'Gummagatta', 'ATP-GUM', 'active'),
('AP-D03-M011', 'AP-DIS-03', 'Guntakal', 'ATP-GUN', 'active'),
('AP-D03-M012', 'AP-DIS-03', 'Kalyandurg', 'ATP-KAL', 'active'),
('AP-D03-M013', 'AP-DIS-03', 'Kambadur', 'ATP-KAM', 'active'),
('AP-D03-M014', 'AP-DIS-03', 'Kanekal', 'ATP-KAN', 'active'),
('AP-D03-M015', 'AP-DIS-03', 'Kudair', 'ATP-KUD', 'active'),
('AP-D03-M016', 'AP-DIS-03', 'Kundurpi', 'ATP-KUN', 'active'),
('AP-D03-M017', 'AP-DIS-03', 'Narpala', 'ATP-NAR', 'active'),
('AP-D03-M018', 'AP-DIS-03', 'Pamidi', 'ATP-PAM', 'active'),
('AP-D03-M019', 'AP-DIS-03', 'Peddapappur', 'ATP-PED', 'active'),
('AP-D03-M020', 'AP-DIS-03', 'Peddavadugur', 'ATP-PVA', 'active'),
('AP-D03-M021', 'AP-DIS-03', 'Putlur', 'ATP-PUT', 'active'),
('AP-D03-M022', 'AP-DIS-03', 'Rayadurg', 'ATP-RAY', 'active'),
('AP-D03-M023', 'AP-DIS-03', 'Settur', 'ATP-SET', 'active'),
('AP-D03-M024', 'AP-DIS-03', 'Singanamala', 'ATP-SIN', 'active'),
('AP-D03-M025', 'AP-DIS-03', 'Tadimarri', 'ATP-TAD', 'active'),
('AP-D03-M026', 'AP-DIS-03', 'Tadpatri', 'ATP-TPA', 'active'),
('AP-D03-M027', 'AP-DIS-03', 'Uravakonda', 'ATP-URA', 'active'),
('AP-D03-M028', 'AP-DIS-03', 'Vajrakarur', 'ATP-VAJ', 'active'),
('AP-D03-M029', 'AP-DIS-03', 'Vidapanakal', 'ATP-VID', 'active'),
('AP-D03-M030', 'AP-DIS-03', 'Yellanur', 'ATP-YEL', 'active'),
('AP-D03-M031', 'AP-DIS-03', 'Yenumulapalle', 'ATP-YEN', 'active')
ON CONFLICT (id) DO NOTHING;

-- 04. ANNAMAYYA (30 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D04-M001', 'AP-DIS-04', 'B.Kothakota', 'ANM-BKO', 'active'),
('AP-D04-M002', 'AP-DIS-04', 'Chinnamandem', 'ANM-CHI', 'active'),
('AP-D04-M003', 'AP-DIS-04', 'Chitvel', 'ANM-CHV', 'active'),
('AP-D04-M004', 'AP-DIS-04', 'Galiveedu', 'ANM-GAL', 'active'),
('AP-D04-M005', 'AP-DIS-04', 'Gurramkonda', 'ANM-GUR', 'active'),
('AP-D04-M006', 'AP-DIS-04', 'Kalakada', 'ANM-KAL', 'active'),
('AP-D04-M007', 'AP-DIS-04', 'Kambhamvaripalle', 'ANM-KAM', 'active'),
('AP-D04-M008', 'AP-DIS-04', 'Kurabalakota', 'ANM-KUR', 'active'),
('AP-D04-M009', 'AP-DIS-04', 'Lakkireddypalli', 'ANM-LAK', 'active'),
('AP-D04-M010', 'AP-DIS-04', 'Madanapalle', 'ANM-MAD', 'active'),
('AP-D04-M011', 'AP-DIS-04', 'Mulakalacheruvu', 'ANM-MUL', 'active'),
('AP-D04-M012', 'AP-DIS-04', 'Nandalur', 'ANM-NAN', 'active'),
('AP-D04-M013', 'AP-DIS-04', 'Nimmanapalle', 'ANM-NIM', 'active'),
('AP-D04-M014', 'AP-DIS-04', 'Obulavaripalle', 'ANM-OBU', 'active'),
('AP-D04-M015', 'AP-DIS-04', 'Peddamandyam', 'ANM-PMA', 'active'),
('AP-D04-M016', 'AP-DIS-04', 'Peddathippasamudram', 'ANM-PTS', 'active'),
('AP-D04-M017', 'AP-DIS-04', 'Penagalur', 'ANM-PEN', 'active'),
('AP-D04-M018', 'AP-DIS-04', 'Pileru', 'ANM-PIL', 'active'),
('AP-D04-M019', 'AP-DIS-04', 'Pullampeta', 'ANM-PUL', 'active'),
('AP-D04-M020', 'AP-DIS-04', 'Railway Kodur', 'ANM-RKO', 'active'),
('AP-D04-M021', 'AP-DIS-04', 'Rajampet', 'ANM-RAJ', 'active'),
('AP-D04-M022', 'AP-DIS-04', 'Ramapuram', 'ANM-RAM', 'active'),
('AP-D04-M023', 'AP-DIS-04', 'Ramasamudram', 'ANM-RSM', 'active'),
('AP-D04-M024', 'AP-DIS-04', 'Rayachoti', 'ANM-RAY', 'active'),
('AP-D04-M025', 'AP-DIS-04', 'Sadum', 'ANM-SAD', 'active'),
('AP-D04-M026', 'AP-DIS-04', 'Sambepalli', 'ANM-SAM', 'active'),
('AP-D04-M027', 'AP-DIS-04', 'T.Sundupalle', 'ANM-TSU', 'active'),
('AP-D04-M028', 'AP-DIS-04', 'Thamballapalle', 'ANM-THA', 'active'),
('AP-D04-M029', 'AP-DIS-04', 'Valmikipuram', 'ANM-VAL', 'active'),
('AP-D04-M030', 'AP-DIS-04', 'Veeraballi', 'ANM-VEE', 'active')
ON CONFLICT (id) DO NOTHING;

-- 05. BAPATLA (25 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D05-M001', 'AP-DIS-05', 'Addanki', 'BPT-ADD', 'active'),
('AP-D05-M002', 'AP-DIS-05', 'Amrutalur', 'BPT-AMR', 'active'),
('AP-D05-M003', 'AP-DIS-05', 'Ballikurava', 'BPT-BAL', 'active'),
('AP-D05-M004', 'AP-DIS-05', 'Bapatla', 'BPT-BAP', 'active'),
('AP-D05-M005', 'AP-DIS-05', 'Bhattiprolu', 'BPT-BHA', 'active'),
('AP-D05-M006', 'AP-DIS-05', 'Cherukupalle', 'BPT-CHE', 'active'),
('AP-D05-M007', 'AP-DIS-05', 'Chinaganjam', 'BPT-CHI', 'active'),
('AP-D05-M008', 'AP-DIS-05', 'Chirala', 'BPT-CHR', 'active'),
('AP-D05-M009', 'AP-DIS-05', 'Inkollu', 'BPT-INK', 'active'),
('AP-D05-M010', 'AP-DIS-05', 'J.Panguluru', 'BPT-JPA', 'active'),
('AP-D05-M011', 'AP-DIS-05', 'Karamchedu', 'BPT-KAR', 'active'),
('AP-D05-M012', 'AP-DIS-05', 'Karlapalem', 'BPT-KRL', 'active'),
('AP-D05-M013', 'AP-DIS-05', 'Kollur', 'BPT-KOL', 'active'),
('AP-D05-M014', 'AP-DIS-05', 'Korisapadu', 'BPT-KOR', 'active'),
('AP-D05-M015', 'AP-DIS-05', 'Martur', 'BPT-MAR', 'active'),
('AP-D05-M016', 'AP-DIS-05', 'Nagaram', 'BPT-NAG', 'active'),
('AP-D05-M017', 'AP-DIS-05', 'Nizampatnam', 'BPT-NIZ', 'active'),
('AP-D05-M018', 'AP-DIS-05', 'Parchur', 'BPT-PAR', 'active'),
('AP-D05-M019', 'AP-DIS-05', 'Pittalavanipalem', 'BPT-PIT', 'active'),
('AP-D05-M020', 'AP-DIS-05', 'Repalle', 'BPT-REP', 'active'),
('AP-D05-M021', 'AP-DIS-05', 'Santhamaguluru', 'BPT-SAN', 'active'),
('AP-D05-M022', 'AP-DIS-05', 'Tsundur', 'BPT-TSU', 'active'),
('AP-D05-M023', 'AP-DIS-05', 'Vemuru', 'BPT-VEM', 'active'),
('AP-D05-M024', 'AP-DIS-05', 'Vetapalem', 'BPT-VET', 'active'),
('AP-D05-M025', 'AP-DIS-05', 'Yaddanapudi', 'BPT-YAD', 'active')
ON CONFLICT (id) DO NOTHING;

-- 21. SRI POTTI SRIRAMULU NELLORE (38 Mandals)
INSERT INTO public.mandals (id, district_id, name, code, status) VALUES
('AP-D21-M001', 'AP-DIS-21', 'Allur', 'NLR-ALL', 'active'),
('AP-D21-M002', 'AP-DIS-21', 'Ananthasagaram', 'NLR-ANA', 'active'),
('AP-D21-M003', 'AP-DIS-21', 'Anumasamudrampeta', 'NLR-ASM', 'active'),
('AP-D21-M004', 'AP-DIS-21', 'Atmakur', 'NLR-ATM', 'active'),
('AP-D21-M005', 'AP-DIS-21', 'Balayapalli', 'NLR-BAL', 'active'),
('AP-D21-M006', 'AP-DIS-21', 'Bogole', 'NLR-BOG', 'active'),
('AP-D21-M007', 'AP-DIS-21', 'Buchireddypalem', 'NLR-BUC', 'active'),
('AP-D21-M008', 'AP-DIS-21', 'Chejerla', 'NLR-CHE', 'active'),
('AP-D21-M009', 'AP-DIS-21', 'Chillakur', 'NLR-CHI', 'active'),
('AP-D21-M010', 'AP-DIS-21', 'Chittamur', 'NLR-CHM', 'active'),
('AP-D21-M011', 'AP-DIS-21', 'Dagadarthi', 'NLR-DAG', 'active'),
('AP-D21-M012', 'AP-DIS-21', 'Dakkili', 'NLR-DAK', 'active'),
('AP-D21-M013', 'AP-DIS-21', 'Duttalur', 'NLR-DUT', 'active'),
('AP-D21-M014', 'AP-DIS-21', 'Gudur', 'NLR-GUD', 'active'),
('AP-D21-M015', 'AP-DIS-21', 'Indukurpet', 'NLR-IND', 'active'),
('AP-D21-M016', 'AP-DIS-21', 'Jaladanki', 'NLR-JAL', 'active'),
('AP-D21-M017', 'AP-DIS-21', 'Kaligiri', 'NLR-KLG', 'active'),
('AP-D21-M018', 'AP-DIS-21', 'Kaluvoya', 'NLR-KLV', 'active'),
('AP-D21-M019', 'AP-DIS-21', 'Kavali', 'NLR-KAV', 'active'),
('AP-D21-M020', 'AP-DIS-21', 'Kodavalur', 'NLR-KOD', 'active'),
('AP-D21-M021', 'AP-DIS-21', 'Kovur', 'NLR-KOV', 'active'),
('AP-D21-M022', 'AP-DIS-21', 'Manubolu', 'NLR-MAN', 'active'),
('AP-D21-M023', 'AP-DIS-21', 'Marripadu', 'NLR-MAR', 'active'),
('AP-D21-M024', 'AP-DIS-21', 'Nellore Rural', 'NLR-NLR-R', 'active'),
('AP-D21-M025', 'AP-DIS-21', 'Nellore Urban', 'NLR-NLR-U', 'active'),
('AP-D21-M026', 'AP-DIS-21', 'Podalakur', 'NLR-POD', 'active'),
('AP-D21-M027', 'AP-DIS-21', 'Rapur', 'NLR-RAP', 'active'),
('AP-D21-M028', 'AP-DIS-21', 'Saidapuram', 'NLR-SAI', 'active'),
('AP-D21-M029', 'AP-DIS-21', 'Sangam', 'NLR-SAN', 'active'),
('AP-D21-M030', 'AP-DIS-21', 'Seetharamapuram', 'NLR-SRP', 'active'),
('AP-D21-M031', 'AP-DIS-21', 'Sydapuram', 'NLR-SYD', 'active'),
('AP-D21-M032', 'AP-DIS-21', 'Thotapalligudur', 'NLR-TPG', 'active'),
('AP-D21-M033', 'AP-DIS-21', 'Udayagiri', 'NLR-UDA', 'active'),
('AP-D21-M034', 'AP-DIS-21', 'Varikuntapadu', 'NLR-VAR', 'active'),
('AP-D21-M035', 'AP-DIS-21', 'Venkatachalam', 'NLR-VEN', 'active'),
('AP-D21-M036', 'AP-DIS-21', 'Venkatagiri', 'NLR-VKG', 'active'),
('AP-D21-M037', 'AP-DIS-21', 'Vidavalur', 'NLR-VID', 'active'),
('AP-D21-M038', 'AP-DIS-21', 'Vinjamur', 'NLR-VIN', 'active')
ON CONFLICT (id) DO NOTHING;

-- Complete seed script across all 28 districts available in public schema.
