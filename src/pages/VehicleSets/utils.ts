import type { VehicleSetEventRecord, VehicleSetRecord } from './types';

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

function actionLabel(action: VehicleSetEventRecord['action']): string {
  return {
    COUPLED: 'Conjunto criado',
    DRIVER_ASSIGNED: 'Motorista atrelado',
    DRIVER_CHANGED: 'Motorista alterado',
    DETACHED: 'Conjunto desatrelado',
  }[action];
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

export function exportVehicleSetHistoryToExcel(records: VehicleSetEventRecord[]): void {
  const headers = ['Data/Hora', 'Ação', 'Cavalo', 'Carreta(s)', 'Motorista', 'Usuário', 'Observação'];
  const rows = records.map((record) => [
    formatDateTime(record.occurredAt),
    actionLabel(record.action),
    record.tractorPlate,
    [record.trailerPlate, record.trailerTwoPlate].filter(Boolean).join(' / '),
    record.driverName || '',
    record.userName || '',
    typeof record.details?.message === 'string' ? record.details.message : '',
  ]);
  const allRows = [headers, ...rows];
  const sheetRows = allRows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => cell(`${columnName(columnIndex)}${rowIndex + 1}`, value, rowIndex === 0 ? 1 : 0)).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  const lastColumn = columnName(headers.length - 1);
  const lastRow = Math.max(1, allRows.length);

  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <cols><col min="1" max="${headers.length}" width="24" customWidth="1"/></cols>
  <sheetData>${sheetRows}</sheetData>
  <autoFilter ref="A1:${lastColumn}${lastRow}"/>
</worksheet>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Histórico de conjuntos" sheetId="1" r:id="rId1"/></sheets></workbook>`;
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
  anchor.download = `historico-conjuntos-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatBirthDay(value: string | null | undefined): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}` : value;
}

function fleetSortValue(record: VehicleSetRecord): string {
  return String(record.tractor?.fleetNumber ?? '').padStart(12, '0');
}

export function printActiveVehicleSetsPdf(records: VehicleSetRecord[]): boolean {
  const printWindow = window.open('', '_blank', 'width=1280,height=900');
  if (!printWindow) return false;

  const ordered = [...records].sort((a, b) => {
    const fleetCompare = fleetSortValue(a).localeCompare(fleetSortValue(b), 'pt-BR', { numeric: true });
    if (fleetCompare !== 0) return fleetCompare;
    return a.tractorPlate.localeCompare(b.tractorPlate, 'pt-BR');
  });

  const displaySequence = (index: number): string => {
    const sequence = index + 1;
    return sequence === 13 ? '12+1' : String(sequence);
  };

  const rows = ordered.map((record, index) => {
    const fleet = record.tractor?.fleetNumber?.trim() || '';
    const trailerPlates = [record.trailerPlate, record.trailerTwoPlate].filter((plate): plate is string => Boolean(plate?.trim()));
    const hasTrailer = trailerPlates.length > 0;
    const plates = hasTrailer
      ? `${record.tractorPlate} / ${trailerPlates.join(' / ')}`
      : record.tractorPlate;

    const drivers = [
      record.driver
        ? { name: record.driverName, driver: record.driver }
        : record.driverName
          ? { name: record.driverName, driver: null }
          : null,
      record.driverTwo
        ? { name: record.driverTwoName ?? '', driver: record.driverTwo }
        : record.driverTwoName
          ? { name: record.driverTwoName, driver: null }
          : null,
    ].filter(Boolean) as Array<{ name: string; driver: VehicleSetRecord['driver'] }>;

    const driverLines = drivers.length > 0
      ? drivers.map(({ name }) => `<div class="driver-line">${escapeXml(name || '-')}</div>`).join('')
      : '<div class="driver-line">-</div>';

    const cpfLines = drivers.length > 0
      ? drivers.map(({ driver }) => {
          const cpf = driver?.cpf
            ? driver.cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
            : '-';
          const birth = driver?.birthDate ? formatBirthDay(driver.birthDate) : '';
          return `<div class="cpf-line"><span>${escapeXml(cpf)}</span>${birth ? `<span class="birth">${escapeXml(birth)}</span>` : ''}</div>`;
        }).join('')
      : '<div class="cpf-line"><span>-</span></div>';

    const fleetHtml = hasTrailer
      ? `<strong>${escapeXml(fleet || '-')}</strong>`
      : `<div class="desengate">DESENGATE</div>${fleet ? `<strong>${escapeXml(fleet)}</strong>` : ''}`;

    return `<tr>
      <td class="fleet">${fleetHtml}</td>
      <td class="plates">${escapeXml(plates)}</td>
      <td class="driver">${driverLines}</td>
      <td class="cpf">${cpfLines}</td>
      <td class="sequence">${displaySequence(index)}</td>
    </tr>`;
  }).join('');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Dados veículos ativos container</title>
<style>
  @page {
    size: A4 portrait;
    margin: 12.7mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    font-size: 12pt;
    overflow-x: hidden;
  }

  .page {
    width: calc(100% - 32px);
    max-width: 1120px;
    margin: 16px auto 0;
  }

  .company-header {
    margin: 0;
    padding: 0;
  }

  .company-line {
    margin: 0 0 3.8mm;
    padding: 0;
    font-size: 12pt;
    line-height: 1.05;
    white-space: nowrap;
  }

  .company-line.company {
    margin-bottom: 4.3mm;
    font-weight: 700;
  }

  .table-wrap {
    width: 100%;
    margin: 0;
    overflow: visible;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 1px solid #000;
    font-family: Arial, Helvetica, sans-serif;
  }

  col.fleet-col { width: 12.6%; }
  col.plates-col { width: 22%; }
  col.driver-col { width: 36%; }
  col.cpf-col { width: 24%; }
  col.sequence-col { width: 5.4%; }

  thead {
    display: table-header-group;
  }

  th,
  td {
    border: 1px solid #000;
    padding: 0.65mm 2mm;
    vertical-align: middle;
  }

  th {
    height: 5.6mm;
    padding-top: 0;
    padding-bottom: 0;
    font-size: 12pt;
    font-weight: 700;
    line-height: 1;
    text-align: center;
  }

  td {
    min-height: 7.4mm;
    font-size: 12pt;
    line-height: 1.08;
    text-align: left;
  }

  tbody tr {
    min-height: 7.4mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  td.fleet {
    font-weight: 700;
  }

  td.plates,
  td.driver {
    text-transform: uppercase;
  }

  .driver-line,
  .cpf-line {
    min-height: 5.1mm;
    display: flex;
    align-items: center;
  }

  .driver-line + .driver-line,
  .cpf-line + .cpf-line {
    margin-top: 0.25mm;
  }

  .cpf-line {
    gap: 1mm;
    white-space: nowrap;
  }

  .birth {
    color: #ff0000;
    font-size: 10pt;
    font-weight: 400;
  }

  .desengate {
    display: block;
    width: 100%;
    font-size: 8pt;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
    margin-bottom: 0.35mm;
  }

  td.sequence {
    padding-left: 1.6mm;
    padding-right: 1mm;
    font-size: 8pt;
    font-weight: 700;
    vertical-align: top;
    text-align: left;
    white-space: nowrap;
  }

  .empty {
    height: 12mm;
    text-align: center;
    font-size: 11pt;
  }

  .actions {
    position: fixed;
    right: 16px;
    bottom: 16px;
  }

  .actions button {
    border: 0;
    border-radius: 8px;
    padding: 10px 14px;
    background: #15803d;
    color: #fff;
    font: 700 13px Arial, Helvetica, sans-serif;
    cursor: pointer;
  }

  @media print {
    body {
      overflow: visible;
    }

    .page {
      width: 100%;
      max-width: none;
      margin: 0;
    }

    .table-wrap {
      width: 100%;
      margin-left: 0;
    }

    .actions {
      display: none;
    }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="company-header">
      <p class="company-line">CNPJ EXPORTADOR: AURORA 83.310.441/0032-13 BRF 01.838.723/0169-88 <strong>ANTT 045829170</strong></p>
      <p class="company-line company">CNPJ HENRIQUE TRANSPORTES 15.323.201/0001-05</p>
    </div>

    <div class="table-wrap">
      <table>
        <colgroup>
          <col class="fleet-col" />
          <col class="plates-col" />
          <col class="driver-col" />
          <col class="cpf-col" />
          <col class="sequence-col" />
        </colgroup>
        <thead>
          <tr>
            <th>FROTA</th>
            <th>PLACAS</th>
            <th>MOTORISTA</th>
            <th>CPF</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td class="empty" colspan="5">Nenhum conjunto ativo.</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <div class="actions">
    <button type="button" onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>

  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  return true;
}
