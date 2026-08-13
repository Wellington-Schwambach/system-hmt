import { EMPLOYEE_STATUS_OPTIONS } from './constants';
import type {
  EmployeeFormData,
  EmployeeRecord,
  EmployeeStatus,
} from './types';

export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

export function normalizeUppercase(value: string, maxLength: number): string {
  return value.toUpperCase().slice(0, maxLength);
}

export function employeeRecordToFormData(record: EmployeeRecord): EmployeeFormData {
  return {
    employeeCode: record.employeeCode,
    fullName: record.fullName,
    cpf: record.cpf,
    rg: record.rg,
    birthDate: record.birthDate,
    phone: record.phone,
    email: record.email,
    fullAddress: record.fullAddress,
    jobTitle: record.jobTitle,
    admissionDate: record.admissionDate,
    terminationDate: record.terminationDate,
    familyContact: record.familyContact,
    probationEndDate: record.probationEndDate,
    status: record.status,
    cnhNumber: record.cnhNumber,
    cnhCategory: record.cnhCategory,
    cnhIssuedAt: record.cnhIssuedAt,
    cnhFirstLicenseDate: record.cnhFirstLicenseDate,
    cnhExpiryDate: record.cnhExpiryDate,
    cnhState: record.cnhState,
    cnhSecurityCode: record.cnhSecurityCode,
    asoExpiryDate: record.asoExpiryDate,
    opentechExpiryDate: record.opentechExpiryDate,
    angelliraExpiryDate: record.angelliraExpiryDate,
    toxicologicalExpiryDate: record.toxicologicalExpiryDate,
    trainings: record.trainings,
    notes: record.notes,
    cnhFile: null,
    asoFile: null,
    toxicologicalFile: null,
    registrationFormFile: null,
    removeCnhFile: false,
    removeAsoFile: false,
    removeToxicologicalFile: false,
    removeRegistrationFormFile: false,
  };
}

export function getEmployeeStatusLabel(status: EmployeeStatus): string {
  return EMPLOYEE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function formatDate(value: string): string {
  if (!value) return 'Não informado';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function formatCpf(value: string): string {
  const digits = onlyDigits(value, 11);
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : value || 'Não informado';
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value, 11);
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return value || 'Não informado';
}

export function calculateTenure(
  admissionDate: string,
  terminationDate = '',
  today = new Date(),
): string {
  if (!admissionDate) return 'Não informado';
  const [year, month, day] = admissionDate.split('-').map(Number);
  if (!year || !month || !day) return 'Data inválida';
  const admission = new Date(year, month - 1, day);
  const endParts = terminationDate.split('-').map(Number);
  const end = endParts[0] && endParts[1] && endParts[2]
    ? new Date(endParts[0], endParts[1] - 1, endParts[2])
    : today;
  if (admission > end) return 'Ainda não iniciou';
  let years = end.getFullYear() - admission.getFullYear();
  let months = end.getMonth() - admission.getMonth();
  if (end.getDate() < admission.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years === 0 && months === 0) return 'Menos de 1 mês';
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  return parts.join(' e ');
}

export function formatFileSize(value: number | null): string {
  if (!value || value <= 0) return '';
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function escapeXml(value: string | number): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function spreadsheetColumn(index: number): string {
  let value = index + 1;
  let column = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - 1) / 26);
  }

  return column;
}

function textCell(reference: string, value: string | number, style = 0): string {
  const styleAttribute = style > 0 ? ` s="${style}"` : '';
  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[index] = crc >>> 0;
  }

  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function littleEndian16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function littleEndian32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(size);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

interface ZipEntry {
  name: string;
  data: string;
}

function createZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate =
    ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  let localOffset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.data);
    const checksum = crc32(data);
    const localHeader = concatBytes([
      littleEndian32(0x04034b50),
      littleEndian16(20),
      littleEndian16(0x0800),
      littleEndian16(0),
      littleEndian16(dosTime),
      littleEndian16(dosDate),
      littleEndian32(checksum),
      littleEndian32(data.length),
      littleEndian32(data.length),
      littleEndian16(name.length),
      littleEndian16(0),
      name,
    ]);

    localParts.push(localHeader, data);

    const centralHeader = concatBytes([
      littleEndian32(0x02014b50),
      littleEndian16(20),
      littleEndian16(20),
      littleEndian16(0x0800),
      littleEndian16(0),
      littleEndian16(dosTime),
      littleEndian16(dosDate),
      littleEndian32(checksum),
      littleEndian32(data.length),
      littleEndian32(data.length),
      littleEndian16(name.length),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian32(0),
      littleEndian32(localOffset),
      name,
    ]);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + data.length;
  }

  const localData = concatBytes(localParts);
  const centralData = concatBytes(centralParts);
  const endOfCentralDirectory = concatBytes([
    littleEndian32(0x06054b50),
    littleEndian16(0),
    littleEndian16(0),
    littleEndian16(entries.length),
    littleEndian16(entries.length),
    littleEndian32(centralData.length),
    littleEndian32(localData.length),
    littleEndian16(0),
  ]);

  return concatBytes([localData, centralData, endOfCentralDirectory]);
}


export function exportEmployeesToExcel(records: EmployeeRecord[]): void {
  const headers = [
    'Matrícula', 'Nome', 'CPF', 'RG', 'Data de nascimento', 'Telefone', 'E-mail',
    'Endereço completo', 'Cargo / Função', 'Data admissão', 'Data rescisão',
    'Contato familiar', 'Fim da experiência', 'Status', 'Tempo de empresa',
    'CNH', 'Categoria CNH', 'Emissão CNH', 'Primeira habilitação', 'Vencimento CNH',
    'UF CNH', 'Código de segurança CNH', 'Vencimento ASO', 'Vencimento Opentech',
    'Vencimento Angellira', 'Vencimento Toxicológico', 'Treinamentos', 'Observações',
    'Anexo CNH', 'Anexo ASO', 'Anexo Toxicológico', 'Ficha registro',
  ];

  const rows: Array<Array<string | number>> = records.map((record) => [
    record.employeeCode,
    record.fullName,
    record.cpf,
    record.rg,
    formatDate(record.birthDate),
    record.phone,
    record.email,
    record.fullAddress,
    record.jobTitle,
    formatDate(record.admissionDate),
    formatDate(record.terminationDate),
    record.familyContact,
    formatDate(record.probationEndDate),
    getEmployeeStatusLabel(record.status),
    calculateTenure(record.admissionDate, record.terminationDate),
    record.cnhNumber,
    record.cnhCategory,
    formatDate(record.cnhIssuedAt),
    formatDate(record.cnhFirstLicenseDate),
    formatDate(record.cnhExpiryDate),
    record.cnhState,
    record.cnhSecurityCode,
    formatDate(record.asoExpiryDate),
    formatDate(record.opentechExpiryDate),
    formatDate(record.angelliraExpiryDate),
    formatDate(record.toxicologicalExpiryDate),
    record.trainings,
    record.notes,
    record.documents.cnh?.name ?? '',
    record.documents.aso?.name ?? '',
    record.documents.toxicological?.name ?? '',
    record.documents.registrationForm?.name ?? '',
  ]);

  const allRows = [headers, ...rows];
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) =>
          textCell(`${spreadsheetColumn(columnIndex)}${rowIndex + 1}`, value, rowIndex === 0 ? 1 : 0),
        )
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
  const lastColumn = spreadsheetColumn(headers.length - 1);
  const lastRow = Math.max(allRows.length, 1);

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols><col min="1" max="32" width="21" customWidth="1"/></cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Colaboradores" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
</styleSheet>`;

  const entries = [
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: workbook },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/worksheets/sheet1.xml', data: worksheet },
    { name: 'xl/styles.xml', data: styles },
  ];

  const zipBytes = createZip(entries);
  const zipBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([zipBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `colaboradores-filtrados-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
