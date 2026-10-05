import type { LogisticsLoad, LogisticsStage } from '../Logistic/types';

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index: number): string {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
}

function cell(reference: string, value: string | number, style = 0): string {
  const styleAttribute = style ? ` s="${style}"` : '';
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
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function le16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function le32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function zip(entries: Array<{ name: string; data: string }>): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  let localOffset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = encoder.encode(entry.data);
    const checksum = crc32(data);
    const localHeader = concat([
      le32(0x04034b50), le16(20), le16(0x0800), le16(0), le16(dosTime), le16(dosDate),
      le32(checksum), le32(data.length), le32(data.length), le16(name.length), le16(0), name,
    ]);
    localParts.push(localHeader, data);

    const centralHeader = concat([
      le32(0x02014b50), le16(20), le16(20), le16(0x0800), le16(0), le16(dosTime), le16(dosDate),
      le32(checksum), le32(data.length), le32(data.length), le16(name.length), le16(0), le16(0),
      le16(0), le16(0), le32(0), le32(localOffset), name,
    ]);
    centralParts.push(centralHeader);
    localOffset += localHeader.length + data.length;
  }

  const localData = concat(localParts);
  const centralData = concat(centralParts);
  const end = concat([
    le32(0x06054b50), le16(0), le16(0), le16(entries.length), le16(entries.length),
    le32(centralData.length), le32(localData.length), le16(0),
  ]);
  return concat([localData, centralData, end]);
}

function localDateString(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function dateKeyFromIso(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const raw = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
  }
  return localDateString(date);
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const key = dateKeyFromIso(value) ?? value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function formatDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function stageLabel(stage: LogisticsStage): string {
  return {
    PROGRAMMING: 'Programação',
    COLLECTION: 'Coleta',
    LOADING: 'Carregamento',
    DELIVERY: 'Baixa / Entrega',
  }[stage];
}

function loadIdentifier(load: LogisticsLoad): string {
  if (load.loadMode === 'CARGO') return load.cargoNumber || '';
  if (load.loadMode === 'LOAD') {
    return load.loadEntries
      .map((entry) => `${entry.status === 'EMPTY' ? 'Vazio' : 'Cheio'}: ${entry.number || ''}`)
      .join(' / ');
  }
  return load.cargoNumber || load.loadNumber || '';
}

function movementOnDay(load: LogisticsLoad, date: string): string {
  const movements: string[] = [];
  if (dateKeyFromIso(load.collectionScheduledAt) === date) movements.push('Agendamento de coleta');
  if (dateKeyFromIso(load.collectionAt) === date) movements.push('Coleta realizada');
  if (dateKeyFromIso(load.loadingAt) === date) movements.push('Carregamento');
  if (load.deliveryAppointments.some((entry) => dateKeyFromIso(entry.scheduledAt) === date)) movements.push('Baixa agendada');
  if (dateKeyFromIso(load.deliveryAt) === date) movements.push('Baixa / entrega');
  return movements.join(' / ');
}

function appointmentText(entries: LogisticsLoad['collectionAppointments']): string {
  return entries
    .map((entry) => [formatDateTime(entry.scheduledAt), entry.location].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join(' | ');
}

function statusText(load: LogisticsLoad): string {
  return load.statusNotes
    .filter((note) => note.isVisible)
    .map((note) => note.observation.trim())
    .filter(Boolean)
    .join(' | ');
}

export function exportLogisticsDayToExcel(records: LogisticsLoad[], selectedDate: string): void {
  const headers = [
    'Data',
    'Movimentação no dia',
    'Embarcador',
    'Referência',
    'Remessa',
    'Carga / Load',
    'Modo',
    'Armador',
    'Booking',
    'Booking coleta',
    'Grade',
    'Data/Hora grade',
    'Agendar coleta',
    'Horários coleta',
    'Coleta realizada',
    'Origem',
    'Local carregamento',
    'Data/Hora carregamento',
    'Observação origem',
    'Destino',
    'Local entrega',
    'Tipo local entrega',
    'Agendamentos baixa',
    'Data/Hora baixa',
    'Observação destino',
    'Tipo de carga',
    'Tipo container',
    'Plano',
    'Nº container',
    'Tara container (kg)',
    'Payload container (kg)',
    'Lacre armador',
    'Navio',
    'Deadline',
    'País',
    'Temperatura',
    'Lacre SIF',
    'Cavalo',
    'Carreta',
    'Motorista 1',
    'Motorista 2',
    'Etapa',
    'Status viagem',
    'Finalizada em',
    'Finalizada por',
  ];

  const rows: Array<Array<string | number>> = records.map((load) => [
    formatDate(selectedDate),
    movementOnDay(load, selectedDate),
    load.shipperName || '',
    load.referenceCode || '',
    load.shipmentNumber || '',
    loadIdentifier(load),
    load.loadMode === 'CARGO' ? 'Carga' : load.loadMode === 'LOAD' ? 'Load' : '',
    load.shipownerName || load.shipowner || '',
    load.bookingNumber || '',
    load.collectionBookingNumber || '',
    load.gradeNumber || '',
    formatDateTime(load.gradeAt),
    formatDate(load.collectionScheduledAt),
    appointmentText(load.collectionAppointments),
    formatDateTime(load.collectionAt),
    load.loadingCityLabel || '',
    load.loadingLocation || '',
    formatDateTime(load.loadingAt),
    load.notes || '',
    load.deliveryCityLabel || '',
    load.deliveryLocation || '',
    load.deliveryLocationTypeName || '',
    appointmentText(load.deliveryAppointments),
    formatDateTime(load.deliveryAt),
    load.destinationNotes || '',
    load.cargoTypeName || '',
    load.containerTypeName || '',
    load.plan || '',
    load.containerNumber || '',
    load.containerTareKg ?? '',
    load.containerPayloadKg ?? '',
    load.shipownerSeal || '',
    load.vessel || '',
    formatDate(load.deadline),
    load.country || '',
    load.temperature || '',
    load.sifSeal || '',
    load.plateMode === 'THIRD_PARTY' ? (load.thirdPartyTractorPlate || '') : (load.tractorPlate || ''),
    load.plateMode === 'THIRD_PARTY' ? (load.thirdPartyTrailerPlate || '') : (load.trailerPlate || ''),
    load.driverName || '',
    load.driverTwoName || '',
    stageLabel(load.stage),
    statusText(load),
    formatDateTime(load.completedAt),
    load.completedByName || '',
  ]);

  const allRows = [headers, ...rows];
  const sheetRows = allRows.map((row, rowIndex) => {
    const cells = row
      .map((value, columnIndex) => cell(`${columnName(columnIndex)}${rowIndex + 1}`, value, rowIndex === 0 ? 1 : 0))
      .join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');

  const lastColumn = columnName(headers.length - 1);
  const lastRow = Math.max(1, allRows.length);
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols><col min="1" max="${headers.length}" width="22" customWidth="1"/></cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Logística do dia" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

  const bytes = zip([
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: 'xl/workbook.xml', data: workbook },
    { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'xl/worksheets/sheet1.xml', data: worksheet },
    { name: 'xl/styles.xml', data: styles },
  ]);

  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `logistica-${selectedDate}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
