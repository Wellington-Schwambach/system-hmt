import { VEHICLE_FUEL_OPTIONS, VEHICLE_STATUS_OPTIONS, VEHICLE_TYPE_OPTIONS } from './constants';
import type {
  VehicleFormData,
  VehicleFuelType,
  VehicleRecord,
  VehicleStatus,
  VehicleType,
} from './types';

export function normalizePlate(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7);
}

export function normalizeUppercase(value: string, maxLength: number): string {
  return value.toUpperCase().slice(0, maxLength);
}

export function onlyDigits(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

export function vehicleRecordToFormData(record: VehicleRecord): VehicleFormData {
  return {
    fleetNumber: record.fleetNumber,
    plate: record.plate,
    type: record.type,
    brand: record.brand,
    model: record.model,
    manufactureYear: String(record.manufactureYear),
    modelYear: String(record.modelYear),
    color: record.color,
    chassis: record.chassis,
    renavam: record.renavam,
    fuelType: record.fuelType,
    loadCapacityKg: record.loadCapacityKg ? String(record.loadCapacityKg) : '',
    tareKg: record.tareKg ? String(record.tareKg) : '',
    currentKm: record.currentKm ? String(record.currentKm) : '',
    status: record.status,
    opentechExpiryDate: record.opentechExpiryDate,
    angelliraExpiryDate: record.angelliraExpiryDate,
    licensingExpiryDate: record.licensingExpiryDate,
    tachographExpiryDate: record.tachographExpiryDate,
    notes: record.notes,
    crlvFile: null,
    crlvValidUntil: record.crlv?.validUntil ?? '',
    removeCrlv: false,
  };
}

export function getVehicleTypeLabel(type: VehicleType): string {
  return VEHICLE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function getVehicleFuelLabel(fuelType: VehicleFuelType): string {
  return VEHICLE_FUEL_OPTIONS.find((option) => option.value === fuelType)?.label ?? fuelType;
}

export function getVehicleStatusLabel(status: VehicleStatus): string {
  return VEHICLE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string): string {
  if (!value) {
    return 'Não informado';
  }

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function formatFileSize(value: number | null): string {
  if (!value || value <= 0) {
    return '';
  }

  if (value < 1024 * 1024) {
    return `${Math.ceil(value / 1024)} KB`;
  }

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

function numberCell(reference: string, value: number): string {
  return `<c r="${reference}"><v>${Number.isFinite(value) ? value : 0}</v></c>`;
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

export function exportVehiclesToExcel(records: VehicleRecord[]): void {
  const headers = [
    'Placa',
    'Marca',
    'Modelo',
    'Ano fabricação',
    'Ano modelo',
    'Cor',
    'Chassi',
    'Renavam',
    'Capacidade',
    'Tara',
  ];

  const rows: Array<Array<string | number>> = records.map((record) => [
    record.plate,
    record.brand,
    record.model,
    record.manufactureYear,
    record.modelYear,
    record.color,
    record.chassis,
    record.renavam,
    record.loadCapacityKg,
    record.tareKg,
  ]);
  const allRows = [headers, ...rows];
  const numericColumns = new Set([3, 4, 8, 9]);
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const reference = `${spreadsheetColumn(columnIndex)}${rowIndex + 1}`;

          if (rowIndex > 0 && numericColumns.has(columnIndex)) {
            return numberCell(reference, Number(value));
          }

          return textCell(reference, value, rowIndex === 0 ? 1 : 0);
        })
        .join('');

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
  const lastRow = Math.max(allRows.length, 1);

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:J${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols>
    <col min="1" max="1" width="14" customWidth="1"/>
    <col min="2" max="3" width="22" customWidth="1"/>
    <col min="4" max="5" width="16" customWidth="1"/>
    <col min="6" max="6" width="15" customWidth="1"/>
    <col min="7" max="8" width="24" customWidth="1"/>
    <col min="9" max="10" width="16" customWidth="1"/>
  </cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:J${lastRow}"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Veículos" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const archive = createZip([
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    { name: 'xl/workbook.xml', data: workbook },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    { name: 'xl/worksheets/sheet1.xml', data: worksheet },
    { name: 'xl/styles.xml', data: styles },
  ]);
  const archiveBuffer = new ArrayBuffer(archive.byteLength);
  new Uint8Array(archiveBuffer).set(archive);
  const blob = new Blob([archiveBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `veiculos_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
