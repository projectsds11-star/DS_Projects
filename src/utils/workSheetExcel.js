import * as XLSX from 'xlsx';

/**
 * Exact 11 Columns as specified in DAILY_WORK_SHEET_FOR_FILED_REPOERT.xlsx
 */
export const DAILY_WORK_COLUMNS = [
  { key: 'sNo', label: 'S. No.', width: 8, required: true },
  { key: 'enterpriseName', label: 'ENTERPRISE NAME', width: 28, required: true },
  { key: 'nic2Sector', label: 'NIC 2 SECTOR', width: 24, required: false },
  { key: 'unitAddress', label: 'UNIT ADDRESS', width: 30, required: false },
  { key: 'state', label: 'STATE', width: 16, required: false },
  { key: 'size', label: 'SIZE', width: 14, required: false },
  { key: 'certification', label: 'CERTIFICATION', width: 18, required: false },
  { key: 'certificateStatus', label: 'CERTIFICATE STATUS', width: 20, required: false },
  { key: 'address', label: 'ADDRESS', width: 28, required: false },
  { key: 'district', label: 'DISTRICT', width: 18, required: false },
  { key: 'remarks', label: 'REMARKS', width: 26, required: false },
];

export const SAMPLE_WORK_ROWS = [
  {
    sNo: 1,
    enterpriseName: 'SRI BALAJI COTTON GINNING & SPINNING MILLS',
    nic2Sector: '13 - Manufacture of textiles',
    unitAddress: 'Plot No. 14, Growth Centre, Industrial Estate',
    state: 'Andhra Pradesh',
    size: 'Small',
    certification: 'ZED Bronze',
    certificateStatus: 'Applied',
    address: 'Guntur Road, Santhanuthalapadu',
    district: 'Prakasam',
    remarks: 'Owner met in person. Udyam verified, document checklist signed.'
  },
  {
    sNo: 2,
    enterpriseName: 'KRISHNA AGRO TECH & FOOD PACKAGING UNITS',
    nic2Sector: '10 - Manufacture of food products',
    unitAddress: 'D.No. 4-118/A, Bypass Road',
    state: 'Andhra Pradesh',
    size: 'Micro',
    certification: 'ZED Bronze',
    certificateStatus: 'Documents Collected',
    address: 'Opp. AP Seeds Warehouse, Kavali Road',
    district: 'Prakasam',
    remarks: 'Application form filled. Photo of facility captured.'
  },
  {
    sNo: 3,
    enterpriseName: 'VIJAYA PRECISION ENGINEERING WORKS',
    nic2Sector: '25 - Fabricated metal products',
    unitAddress: 'Plot 7-B, Auto Nagar Phase 2',
    state: 'Andhra Pradesh',
    size: 'Micro',
    certification: 'ZED Silver',
    certificateStatus: 'In Process',
    address: 'Ongole Urban Mandal',
    district: 'Prakasam',
    remarks: 'Quality parameters evaluated. Washroom & safety verified.'
  }
];

/**
 * Downloads a pre-formatted Excel (.xlsx) template with exact 11 columns and sample rows
 */
export function downloadWorkSheetTemplate(includeSamples = true) {
  const wb = XLSX.utils.book_new();

  const headers = DAILY_WORK_COLUMNS.map(col => col.label);

  const dataRows = [headers];

  if (includeSamples) {
    SAMPLE_WORK_ROWS.forEach(row => {
      dataRows.push([
        row.sNo,
        row.enterpriseName,
        row.nic2Sector,
        row.unitAddress,
        row.state,
        row.size,
        row.certification,
        row.certificateStatus,
        row.address,
        row.district,
        row.remarks
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(dataRows);

  // Set column widths
  ws['!cols'] = DAILY_WORK_COLUMNS.map(col => ({ wch: col.width }));

  XLSX.utils.book_append_sheet(wb, ws, 'Daily Work Report');

  const fileName = 'DAILY_WORK_SHEET_FOR_FIELD_REPORT.xlsx';
  XLSX.writeFile(wb, fileName);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into structured row objects
 */
export async function parseWorkSheetFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for parsing'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          throw new Error('The uploaded workbook contains no sheets.');
        }

        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        // Parse sheet to array of arrays
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('The uploaded sheet is completely empty.');
        }

        // Find header row (search first 10 rows for "ENTERPRISE NAME" or similar keywords)
        let headerRowIndex = -1;
        let colIndexMap = {};

        for (let r = 0; r < Math.min(10, rawRows.length); r++) {
          const row = rawRows[r].map(cell => String(cell || '').trim().toUpperCase());
          
          const hasEnterprise = row.some(cell => cell.includes('ENTERPRISE') || cell.includes('NAME') || cell.includes('UNIT'));
          const hasDistrict = row.some(cell => cell.includes('DISTRICT') || cell.includes('STATE') || cell.includes('SECTOR'));

          if (hasEnterprise || hasDistrict) {
            headerRowIndex = r;

            // Map standard column keys to row indices
            row.forEach((cellText, idx) => {
              if (cellText.includes('S.') || cellText.includes('SL') || cellText === 'NO' || cellText === 'S.NO' || cellText === 'S. NO.') {
                colIndexMap.sNo = idx;
              } else if (cellText.includes('ENTERPRISE') || (cellText.includes('UNIT') && cellText.includes('NAME'))) {
                colIndexMap.enterpriseName = idx;
              } else if (cellText.includes('NIC') || cellText.includes('SECTOR')) {
                colIndexMap.nic2Sector = idx;
              } else if (cellText.includes('UNIT ADDRESS') || cellText.includes('UNIT ADDR')) {
                colIndexMap.unitAddress = idx;
              } else if (cellText === 'STATE' || cellText.includes('STATE')) {
                colIndexMap.state = idx;
              } else if (cellText === 'SIZE' || cellText.includes('MICRO') || cellText.includes('CATEGORY')) {
                colIndexMap.size = idx;
              } else if (cellText === 'CERTIFICATION' || cellText.includes('ZED') || cellText.includes('CERT')) {
                colIndexMap.certification = idx;
              } else if (cellText.includes('CERTIFICATE STATUS') || cellText.includes('STATUS')) {
                colIndexMap.certificateStatus = idx;
              } else if (cellText === 'ADDRESS' || cellText.includes('STREET') || cellText.includes('LOCATION')) {
                if (colIndexMap.address === undefined) colIndexMap.address = idx;
              } else if (cellText.includes('DISTRICT') || cellText.includes('DIST')) {
                colIndexMap.district = idx;
              } else if (cellText.includes('REMARK') || cellText.includes('NOTE') || cellText.includes('COMMENT')) {
                colIndexMap.remarks = idx;
              }
            });
            break;
          }
        }

        // Fallback default index map if header not matched cleanly
        if (headerRowIndex === -1) {
          headerRowIndex = 0; // Assume first row is header
        }

        // Default positional mapping if keys were not found in header
        if (colIndexMap.sNo === undefined) colIndexMap.sNo = 0;
        if (colIndexMap.enterpriseName === undefined) colIndexMap.enterpriseName = 1;
        if (colIndexMap.nic2Sector === undefined) colIndexMap.nic2Sector = 2;
        if (colIndexMap.unitAddress === undefined) colIndexMap.unitAddress = 3;
        if (colIndexMap.state === undefined) colIndexMap.state = 4;
        if (colIndexMap.size === undefined) colIndexMap.size = 5;
        if (colIndexMap.certification === undefined) colIndexMap.certification = 6;
        if (colIndexMap.certificateStatus === undefined) colIndexMap.certificateStatus = 7;
        if (colIndexMap.address === undefined) colIndexMap.address = 8;
        if (colIndexMap.district === undefined) colIndexMap.district = 9;
        if (colIndexMap.remarks === undefined) colIndexMap.remarks = 10;

        const parsedRows = [];
        let autoSerial = 1;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const rowData = rawRows[r];
          if (!rowData || !Array.isArray(rowData)) continue;

          // Check if row is completely empty
          const hasContent = rowData.some(val => val !== null && val !== undefined && String(val).trim() !== '');
          if (!hasContent) continue;

          const entName = String(rowData[colIndexMap.enterpriseName] || '').trim();
          // If no enterprise name and no address, skip dummy or footer row
          if (!entName && !rowData[colIndexMap.unitAddress]) continue;

          parsedRows.push({
            id: `row_${Date.now()}_${r}_${Math.random().toString(36).substring(2, 7)}`,
            sNo: rowData[colIndexMap.sNo] ? String(rowData[colIndexMap.sNo]).trim() : autoSerial,
            enterpriseName: entName || 'Unnamed Enterprise',
            nic2Sector: String(rowData[colIndexMap.nic2Sector] || '').trim(),
            unitAddress: String(rowData[colIndexMap.unitAddress] || '').trim(),
            state: String(rowData[colIndexMap.state] || 'Andhra Pradesh').trim(),
            size: String(rowData[colIndexMap.size] || 'Micro').trim(),
            certification: String(rowData[colIndexMap.certification] || 'ZED Bronze').trim(),
            certificateStatus: String(rowData[colIndexMap.certificateStatus] || 'Applied').trim(),
            address: String(rowData[colIndexMap.address] || '').trim(),
            district: String(rowData[colIndexMap.district] || '').trim(),
            remarks: String(rowData[colIndexMap.remarks] || '').trim()
          });

          autoSerial++;
        }

        resolve({
          fileName: file.name,
          fileSize: file.size,
          totalRows: parsedRows.length,
          rows: parsedRows
        });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading Excel file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports a submitted work report and its rows to Excel (.xlsx)
 */
export function exportWorkSheetToExcel(report, rows = []) {
  const wb = XLSX.utils.book_new();

  const reportDate = report?.work_date || new Date().toISOString().slice(0, 10);
  const employeeName = report?.employee_name || report?.employee_id || 'Candidate';
  const district = report?.district || '';

  // Meta header rows
  const metaRows = [
    ['DS PROJECTS PRIVATE LIMITED - DAILY FIELD WORK REPORT'],
    [`Submitted By: ${employeeName} (${report?.employee_id || 'N/A'})`, `Date: ${reportDate}`, `District: ${district}`],
    [`Report ID: ${report?.report_code || report?.id || 'N/A'}`, `Status: ${report?.status || 'Submitted'}`, `Total Enterprises: ${rows.length}`],
    [] // Blank separator
  ];

  const tableHeaders = DAILY_WORK_COLUMNS.map(col => col.label);
  metaRows.push(tableHeaders);

  rows.forEach((r, idx) => {
    metaRows.push([
      r.sNo || idx + 1,
      r.enterpriseName || '',
      r.nic2Sector || '',
      r.unitAddress || '',
      r.state || 'Andhra Pradesh',
      r.size || 'Micro',
      r.certification || 'ZED Bronze',
      r.certificateStatus || 'Applied',
      r.address || '',
      r.district || district || '',
      r.remarks || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(metaRows);

  ws['!cols'] = DAILY_WORK_COLUMNS.map(col => ({ wch: col.width }));

  XLSX.utils.book_append_sheet(wb, ws, 'Verified Field Report');

  const safeEmp = (employeeName || 'Staff').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = (reportDate || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const outFileName = `DAILY_WORK_REPORT_${safeEmp}_${safeDate}.xlsx`;

  XLSX.writeFile(wb, outFileName);
}
