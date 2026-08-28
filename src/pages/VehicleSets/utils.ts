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
  const headers = ['Data/Hora', 'Ação', 'Cavalo', 'Carreta', 'Motorista', 'Usuário', 'Observação'];
  const rows = records.map((record) => [
    formatDateTime(record.occurredAt),
    actionLabel(record.action),
    record.tractorPlate,
    record.trailerPlate || '',
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

  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const rows = ordered.map((record, index) => {
    const fleet = record.tractor?.fleetNumber || '-';
    const plates = record.trailerPlate ? `${record.tractorPlate} / ${record.trailerPlate}` : `${record.tractorPlate} / Sem carreta`;
    const driverNames = [record.driverName, record.driverTwoName].filter(Boolean) as string[];
    const driverData = [record.driver, record.driverTwo].filter(Boolean);
    const driverDates = [record.driverAssignedAt, record.driverTwoAssignedAt].filter(Boolean) as string[];

    const namesHtml = driverNames.length > 0
      ? driverNames.map((name) => `<div class="stack-line">${escapeXml(name)}</div>`).join('')
      : '<div class="stack-line">-</div>';

    const cpfHtml = driverData.length > 0
      ? driverData.map((driver) => {
          if (!driver) return '';
          const cpf = driver.cpf ? driver.cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-';
          return `<div class="stack-line">${escapeXml(cpf)}</div>`;
        }).join('')
      : '<div class="stack-line">-</div>';

    const entryHtml = driverDates.length > 0
      ? driverDates.map((date) => `<div class="stack-line">${escapeXml(formatDateTime(date))}</div>`).join('')
      : '<div class="stack-line">-</div>';

    const birthdaysHtml = driverData.length > 0
      ? driverData.map((driver) => `<div class="stack-line birth">${escapeXml(formatBirthDay(driver?.birthDate ?? null))}</div>`).join('')
      : '<div class="stack-line birth">-</div>';

    return `<tr>
      <td class="sequence">${index + 1}</td>
      <td class="fleet">${record.trailerPlate ? `<strong>${escapeXml(fleet)}</strong>` : `<div class="detached">DESENGATE</div><strong>${escapeXml(fleet)}</strong>`}</td>
      <td class="plates"><strong>${escapeXml(plates)}</strong></td>
      <td>${namesHtml}</td>
      <td>${cpfHtml}</td>
      <td>${entryHtml}</td>
      <td>${birthdaysHtml}</td>
    </tr>`;
  }).join('');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Conjuntos ativos - Henrique Transportes</title>
<style>
  @page { size: A4 portrait; margin: 11mm 10mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #163322; font-family: Arial, Helvetica, sans-serif; background: #f4f7f5; }
  .page { width: 100%; }
  .sheet { background: #fff; border: 1px solid #d8e5dc; border-radius: 16px; overflow: hidden; }
  .topbar { padding: 16px 20px 12px; background: linear-gradient(135deg, #0f7a3e, #16924b); color: #fff; }
  .eyebrow { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .9; }
  .title-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-top: 8px; }
  h1 { margin: 0; font-size: 24px; line-height: 1.1; }
  .subtitle { margin: 4px 0 0; font-size: 12px; opacity: .95; }
  .meta { text-align: right; font-size: 12px; line-height: 1.45; }
  .org { padding: 14px 20px 6px; display: grid; gap: 4px; color: #355244; font-size: 11px; }
  .org strong { color: #173524; }
  .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 12px 20px 16px; }
  .summary-card { border: 1px solid #d7e6dc; border-radius: 12px; padding: 10px 12px; background: #f7fbf8; }
  .summary-card .label { display: block; color: #567362; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
  .summary-card .value { display: block; margin-top: 4px; color: #173524; font-size: 14px; font-weight: 800; }
  .table-wrap { padding: 0 20px 20px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10.5px; }
  thead { display: table-header-group; }
  th { padding: 9px 8px; border: 1px solid #cfe0d5; background: #ecf5ef; color: #214130; text-align: left; font-size: 10px; letter-spacing: .05em; text-transform: uppercase; }
  td { padding: 8px; border: 1px solid #d8e5dc; vertical-align: top; color: #183726; }
  tbody tr:nth-child(even) td { background: #fbfdfb; }
  th:nth-child(1), td:nth-child(1) { width: 6%; text-align: center; }
  th:nth-child(2), td:nth-child(2) { width: 10%; }
  th:nth-child(3), td:nth-child(3) { width: 23%; }
  th:nth-child(4), td:nth-child(4) { width: 25%; }
  th:nth-child(5), td:nth-child(5) { width: 15%; }
  th:nth-child(6), td:nth-child(6) { width: 13%; }
  th:nth-child(7), td:nth-child(7) { width: 8%; }
  .sequence { text-align: center; font-weight: 800; }
  .fleet strong, .plates strong { font-size: 11px; }
  .detached { display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px; padding: 2px 6px; border-radius: 999px; background: #fff4d9; color: #8a6116; font-size: 9px; font-weight: 800; }
  .stack-line + .stack-line { margin-top: 4px; }
  .birth { color: #c0392b; font-weight: 700; }
  .empty { text-align: center; padding: 28px 16px; color: #6a8676; }
  .footer { padding: 0 20px 18px; color: #587463; font-size: 10px; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  .actions { position: fixed; right: 18px; bottom: 18px; display: flex; gap: 8px; }
  button { border: 0; border-radius: 10px; padding: 11px 16px; font: 700 13px Arial; cursor: pointer; }
  .primary { background: #15803d; color: #fff; }
  @media print {
    body { background: #fff; }
    .sheet { border: 0; border-radius: 0; }
    .actions { display: none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="sheet">
    <div class="topbar">
      <p class="eyebrow">Henrique Transportes</p>
      <div class="title-row">
        <div>
          <h1>Conjuntos ativos</h1>
          <p class="subtitle">Relatório operacional para conferência dos cavalos, placas e motoristas vinculados.</p>
        </div>
        <div class="meta">
          <div><strong>Gerado em:</strong> ${escapeXml(generatedAt)}</div>
          <div><strong>Total de conjuntos:</strong> ${ordered.length}</div>
        </div>
      </div>
    </div>

    <div class="org">
      <div><strong>CNPJ EXPORTADOR:</strong> AURORA 83.310.441/0032-13 &nbsp;&nbsp; BRF 01.838.723/0169-88 &nbsp;&nbsp; <strong>ANTT 045829170</strong></div>
      <div><strong>CNPJ HENRIQUE TRANSPORTES:</strong> 15.323.201/0001-05</div>
    </div>

    <div class="summary">
      <div class="summary-card"><span class="label">Cavalos ativos</span><span class="value">${ordered.length}</span></div>
      <div class="summary-card"><span class="label">Com carreta</span><span class="value">${ordered.filter((item) => item.trailerPlate).length}</span></div>
      <div class="summary-card"><span class="label">Sem carreta</span><span class="value">${ordered.filter((item) => !item.trailerPlate).length}</span></div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Frota</th>
            <th>Placas</th>
            <th>Motorista</th>
            <th>CPF</th>
            <th>Entrada no veículo</th>
            <th>Nasc.</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td class="empty" colspan="7">Nenhum conjunto ativo.</td></tr>'}</tbody>
      </table>
    </div>
    <div class="footer">As placas foram mantidas no padrão operacional utilizado pela empresa. A coluna <strong>Entrada no veículo</strong> considera a data do vínculo do motorista ao cavalo, e não a data do atrelamento do conjunto.</div>
  </div>
</div>
<div class="actions"><button class="primary" type="button" onclick="window.print()">Imprimir / Salvar PDF</button></div>
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  return true;
}
