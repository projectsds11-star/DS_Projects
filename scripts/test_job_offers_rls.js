import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ANON_KEY;

const anonClient = createClient(SUPABASE_URL, ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

async function testInsert() {
  const dummy = {
    offer_number: `TEST/OFF/${Date.now()}`,
    employee_id: 'DS-001',
    employee_name: 'Balaji.S',
    email: 'balajirockzz9030@gmail.com',
    position: 'Mandal Co-ordinator',
    district: 'Nellore',
    mandal: 'Kavali',
    basic_salary: 25000,
    travel_allowance: 5000,
    monthly_total: 30000,
    annual_ctc: 360000,
    status: 'Offer Sent',
  };

  console.log('--- Testing Anon Client Insert on job_offers ---');
  const { data: anonData, error: anonErr } = await anonClient.from('job_offers').insert([dummy]).select();
  if (anonErr) {
    console.error('Anon insert error:', anonErr.message, anonErr.code, anonErr.details);
  } else {
    console.log('Anon insert success:', anonData);
    await anonClient.from('job_offers').delete().eq('offer_number', dummy.offer_number);
  }

  console.log('--- Testing Admin Client Insert on job_offers ---');
  const { data: adminData, error: adminErr } = await adminClient.from('job_offers').insert([dummy]).select();
  if (adminErr) {
    console.error('Admin insert error:', adminErr.message);
  } else {
    console.log('Admin insert success:', adminData);
    await adminClient.from('job_offers').delete().eq('offer_number', dummy.offer_number);
  }
}

testInsert().catch(console.error);
