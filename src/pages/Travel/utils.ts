import type { TravelCteTypeFilter, TravelRecord, TravelRecordWithMetrics, TravelSummary } from './types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(date: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function parseDecimalInput(value: string): number {
  const trimmedValue = value.trim();

  if (!trimmedValue) return 0;

  const normalizedValue = trimmedValue
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function getShipperLabel(shipper: string): string {
  return shipper || 'Não informado';
}

function compactDriverName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 2) return parts.join(' ');
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export function getDriverDisplay(record: TravelRecord): string {
  if (record.operationType === 'THIRD_PARTY') {
    return `Terceiro: ${record.thirdPartyName || 'Não informado'}`;
  }

  const drivers = [record.driverOne, record.driverTwo].filter(Boolean);

  if (drivers.length === 0) return 'Não informado';
  if (drivers.length === 1) return drivers[0];

  return drivers.map(compactDriverName).join(' / ');
}

export function enrichTravelRecords(records: TravelRecord[]): TravelRecordWithMetrics[] {
  return [...records]
    .sort((firstRecord, secondRecord) => {
      const dateComparison = secondRecord.date.localeCompare(firstRecord.date);
      return dateComparison !== 0 ? dateComparison : secondRecord.id - firstRecord.id;
    })
    .map((record) => ({
      ...record,
      freightDifference: Math.max(record.grossFreight - record.netFreight, 0),
      driverDisplay: getDriverDisplay(record),
    }));
}

export function getTravelSummary(
  records: TravelRecordWithMetrics[],
  cteTypeFilter: TravelCteTypeFilter = 'ALL',
): TravelSummary {
  return records.reduce<TravelSummary>(
    (summary, record) => {
      const ctes = cteTypeFilter === 'ALL'
        ? record.ctes
        : record.ctes.filter((cte) => cte.cteType === cteTypeFilter);

      const useRecordTotals = cteTypeFilter === 'ALL' || ctes.length === 0;
      const netFreight = useRecordTotals
        ? record.netFreight
        : ctes.reduce((total, cte) => total + cte.netFreight, 0);
      const grossFreight = useRecordTotals
        ? record.grossFreight
        : ctes.reduce((total, cte) => total + cte.grossFreight, 0);
      const insurance = useRecordTotals
        ? record.insuranceAmount
        : ctes.reduce((total, cte) => total + cte.insuranceAmount, 0);
      const toll = useRecordTotals
        ? record.tollAmount
        : ctes.reduce((total, cte) => total + cte.tollAmount, 0);
      const icms = useRecordTotals
        ? record.icmsAmount
        : ctes.reduce((total, cte) => total + cte.icmsAmount, 0);

      const countsAsTrip = record.ctes.some((cte) => cte.cteType === 'NORMAL');

      return {
        totalTrips: summary.totalTrips + (countsAsTrip ? 1 : 0),
        totalGrossFreight: summary.totalGrossFreight + grossFreight,
        totalNetFreight: summary.totalNetFreight + netFreight,
        totalDifference: summary.totalDifference + Math.max(grossFreight - netFreight, 0),
        totalInsurance: summary.totalInsurance + insurance,
        totalToll: summary.totalToll + toll,
        totalIcms: summary.totalIcms + icms,
      };
    },
    {
      totalTrips: 0,
      totalGrossFreight: 0,
      totalNetFreight: 0,
      totalDifference: 0,
      totalInsurance: 0,
      totalToll: 0,
      totalIcms: 0,
    },
  );
}

function escapeXmlForXlsx(value: string | number): string {
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

function xlsxTextCell(reference: string, value: string | number, style = 0): string {
  const styleAttribute = style > 0 ? ` s="${style}"` : '';
  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXmlForXlsx(value)}</t></is></c>`;
}

const TRAVEL_XLSX_CRC_TABLE = (() => {
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
    crc = TRAVEL_XLSX_CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
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

interface TravelZipEntry {
  name: string;
  data: string;
}

function createTravelZip(entries: TravelZipEntry[]): Uint8Array {
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

function cteTypeLabel(value: TravelRecord['cteType']): string {
  if (value === 'FREIGHT_COMPLEMENT') return 'Complemento de frete';
  if (value === 'DAILY') return 'Diária';
  return 'Normal';
}

function operationTypeLabel(record: TravelRecord): string {
  return record.operationType === 'THIRD_PARTY' ? 'Terceiro contratado' : 'Frota própria';
}

function formatDateTimeForExcel(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

export function exportTravelsToExcel(
  records: TravelRecordWithMetrics[],
  cteTypeFilter: TravelCteTypeFilter = 'ALL',
): void {
  const headers = [
    'ID viagem',
    'Data viagem',
    'Embarcador',
    'Origem',
    'Destino',
    'Operação',
    'Placa / Cavalo',
    'Motorista 1',
    'Motorista 2',
    'Terceiro contratado',
    'Placa terceiro',
    'Valor de repasse',
    'Data de repasse',
    'Carreta do desengate',
    'Data de recebimento',
    'Tipo CT-e',
    'Nº CT-e',
    'Série',
    'CT-e original',
    'Frete líquido',
    'Seguro',
    'Pedágio',
    'ICMS',
    'Frete bruto',
    'Criado em',
    'Atualizado em',
  ];

  const rows: Array<Array<string | number>> = records.flatMap((record) => {
    const ctes = record.ctes.filter(
      (cte) => cteTypeFilter === 'ALL' || cte.cteType === cteTypeFilter,
    );

    return ctes.map((cte) => [
      record.id,
      formatDate(record.date),
      record.shipper,
      record.origin,
      record.destination,
      operationTypeLabel(record),
      record.plate,
      record.driverOne,
      record.driverTwo,
      record.thirdPartyName,
      record.thirdPartyPlate,
      record.operationType === 'THIRD_PARTY' ? formatCurrency(record.thirdPartyPayoutAmount) : '',
      record.operationType === 'THIRD_PARTY' ? formatDate(record.thirdPartyPayoutDate) : '',
      record.detachedTrailerPlate,
      record.receivedDate ? formatDate(record.receivedDate) : '',
      cteTypeLabel(cte.cteType),
      cte.cteNumber,
      cte.cteSeries,
      cte.complementedCteNumber,
      formatCurrency(cte.netFreight),
      formatCurrency(cte.insuranceAmount),
      formatCurrency(cte.tollAmount),
      formatCurrency(cte.icmsAmount),
      formatCurrency(cte.grossFreight),
      formatDateTimeForExcel(record.createdAt),
      formatDateTimeForExcel(record.updatedAt),
    ]);
  });

  const allRows = [headers, ...rows];
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) =>
          xlsxTextCell(
            `${spreadsheetColumn(columnIndex)}${rowIndex + 1}`,
            value,
            rowIndex === 0 ? 1 : 0,
          ),
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
  <cols><col min="1" max="${headers.length}" width="21" customWidth="1"/></cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Viagens" sheetId="1" r:id="rId1"/></sheets>
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

  const zipBytes = createTravelZip(entries);
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
  anchor.download = `viagens-filtradas-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
