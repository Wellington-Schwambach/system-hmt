import { ENTRY_LABELS } from './constants';
import type { DriverSettlementSnapshot } from './types';
import { formatCurrency, formatDate, formatDecimal } from './utils';

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLocaleLowerCase('pt-BR');
}

function getAverageSourceLabel(source: DriverSettlementSnapshot['vehicleSummaries'][number]['source']) {
  if (source === 'PERIOD') {
    return 'Média do período';
  }

  if (source === 'LATEST') {
    return 'Última média disponível';
  }

  return 'Sem dados de abastecimento';
}

function buildTravelsRows(settlement: DriverSettlementSnapshot): string {
  if (settlement.travels.length === 0) {
    return '<tr><td colspan="6" class="empty-row">Nenhuma viagem encontrada no período.</td></tr>';
  }

  return settlement.travels
    .map(
      (travel) => `
        <tr>
          <td>${escapeHtml(formatDate(travel.date))}</td>
          <td>${escapeHtml(travel.cteNumber)}</td>
          <td>${escapeHtml(travel.origin)}</td>
          <td>${escapeHtml(travel.destination)}</td>
          <td>${escapeHtml(travel.plate)}</td>
          <td class="numeric">${escapeHtml(formatCurrency(travel.netFreight))}</td>
        </tr>`,
    )
    .join('');
}

function buildVehicleRows(settlement: DriverSettlementSnapshot): string {
  if (settlement.vehicleSummaries.length === 0) {
    return '<tr><td colspan="5" class="empty-row">Nenhuma média disponível.</td></tr>';
  }

  return settlement.vehicleSummaries
    .map(
      (summary) => `
        <tr>
          <td><strong>${escapeHtml(summary.plate)}</strong></td>
          <td class="numeric">${escapeHtml(summary.tripsCount)}</td>
          <td class="numeric">${escapeHtml(summary.fuelingsCount)}</td>
          <td class="numeric">${
            summary.averageKmPerLiter === null
              ? 'Sem dados'
              : `${escapeHtml(formatDecimal(summary.averageKmPerLiter))} km/L`
          }</td>
          <td>${escapeHtml(getAverageSourceLabel(summary.source))}</td>
        </tr>`,
    )
    .join('');
}

function buildDiscountRows(settlement: DriverSettlementSnapshot): string {
  if (settlement.entries.length === 0) {
    return '<p class="empty-message">Nenhum desconto lançado neste acerto.</p>';
  }

  const rows = settlement.entries
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(formatDate(entry.date))}</td>
          <td>${escapeHtml(ENTRY_LABELS[entry.type])}</td>
          <td>${escapeHtml(entry.description || '-')}</td>
          <td class="numeric">${escapeHtml(formatCurrency(entry.value))}</td>
        </tr>`,
    )
    .join('');

  return `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th class="numeric">Valor</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function buildSettlementReportHtml(settlement: DriverSettlementSnapshot): string {
  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const suggestedFileName = `acerto-${sanitizeFileName(settlement.driver || 'motorista')}-${settlement.startDate}-${settlement.endDate}.pdf`;

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(suggestedFileName)}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Arial, Helvetica, sans-serif;
        color: #232a26;
        background: #edf3ef;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #edf3ef;
      }

      .actions {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        border-bottom: 1px solid #d7e2da;
        background: rgba(255, 255, 255, 0.96);
      }

      button {
        min-height: 42px;
        padding: 0 18px;
        border: 1px solid #b9c9bf;
        border-radius: 10px;
        color: #25312a;
        background: #ffffff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      button.primary {
        border-color: #00a651;
        color: #ffffff;
        background: #00a651;
      }

      .screen-hint {
        max-width: 210mm;
        margin: 14px auto 0;
        padding: 10px 14px;
        border: 1px solid #cfe5d7;
        border-radius: 10px;
        color: #315340;
        background: #f2fbf5;
        font-size: 13px;
      }

      .report {
        width: min(210mm, calc(100% - 24px));
        min-height: 297mm;
        margin: 14px auto 30px;
        padding: 14mm;
        background: #ffffff;
        box-shadow: 0 8px 30px rgba(24, 48, 34, 0.12);
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 14px;
        border-bottom: 3px solid #00a651;
      }

      .brand h1 {
        margin: 0;
        color: #006f38;
        font-size: 22px;
        text-transform: uppercase;
      }

      .brand p,
      .driver-info span {
        margin: 4px 0 0;
        color: #617068;
        font-size: 12px;
      }

      .driver-info {
        text-align: right;
      }

      .driver-info strong,
      .driver-info span {
        display: block;
      }

      .driver-info strong {
        color: #26312b;
        font-size: 15px;
      }

      .section {
        margin-top: 18px;
        break-inside: avoid;
      }

      .section.allow-break {
        break-inside: auto;
      }

      .section-title {
        margin: 0 0 8px;
        padding-bottom: 5px;
        border-bottom: 1px solid #d8e1db;
        color: #006f38;
        font-size: 14px;
      }

      .table-wrapper {
        width: 100%;
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      thead {
        display: table-header-group;
      }

      tr {
        break-inside: avoid;
      }

      th,
      td {
        padding: 6px;
        border: 1px solid #d8e1db;
        vertical-align: top;
        text-align: left;
        font-size: 9px;
        overflow-wrap: anywhere;
      }

      th {
        color: #174f32;
        background: #eef8f2;
        font-size: 8px;
        text-transform: uppercase;
      }

      .numeric {
        text-align: right;
      }

      .table-total td {
        color: #006f38;
        background: #eef8f2;
        font-weight: 800;
      }

      .empty-row,
      .empty-message {
        color: #66736c;
        text-align: center;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 5px 20px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 5px 0;
        border-bottom: 1px dashed #dfe7e2;
        font-size: 11px;
      }

      .summary-row strong {
        white-space: nowrap;
      }

      .receivable {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-top: 12px;
        padding: 13px;
        border: 2px solid #00a651;
        border-radius: 10px;
        color: #006f38;
        background: #eef8f2;
        font-size: 15px;
        font-weight: 800;
      }

      .receivable strong {
        font-size: 20px;
      }

      .footer {
        margin-top: 22px;
        padding-top: 10px;
        border-top: 1px solid #d8e1db;
        color: #6f7b74;
        font-size: 9px;
        text-align: center;
      }

      @page {
        size: A4 portrait;
        margin: 11mm;
      }

      @media print {
        body {
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .actions,
        .screen-hint {
          display: none !important;
        }

        .report {
          width: 100%;
          min-height: 0;
          margin: 0;
          padding: 0;
          box-shadow: none;
        }

        .section {
          break-inside: avoid-page;
        }

        .section.allow-break {
          break-inside: auto;
        }
      }

      @media (max-width: 720px) {
        .report {
          width: calc(100% - 16px);
          padding: 16px;
        }

        .header {
          flex-direction: column;
        }

        .driver-info {
          text-align: left;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="actions">
      <button id="print-report" type="button" class="primary">Imprimir / Salvar como PDF</button>
      <button id="close-report" type="button">Fechar</button>
    </div>

    <p class="screen-hint">
      Na janela de impressão, selecione <strong>Salvar como PDF</strong> para gerar o arquivo.
      Nome sugerido: <strong>${escapeHtml(suggestedFileName)}</strong>
    </p>

    <main class="report">
      <header class="header">
        <div class="brand">
          <h1>Henrique Transportes</h1>
          <p>Espelho do acerto de motorista</p>
        </div>
        <div class="driver-info">
          <strong>${escapeHtml(settlement.driver || 'Motorista não informado')}</strong>
          <span>Período: ${escapeHtml(formatDate(settlement.startDate))} a ${escapeHtml(
            formatDate(settlement.endDate),
          )}</span>
          <span>Finalizado em: ${escapeHtml(formatDate(settlement.savedAt.slice(0, 10)))}</span>
        </div>
      </header>

      <section class="section allow-break">
        <h2 class="section-title">Relação de viagens</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 11%">Data</th>
                <th style="width: 11%">CT-e</th>
                <th style="width: 22%">Origem</th>
                <th style="width: 22%">Destino</th>
                <th style="width: 13%">Veículo</th>
                <th class="numeric" style="width: 21%">Frete líquido</th>
              </tr>
            </thead>
            <tbody>
              ${buildTravelsRows(settlement)}
              <tr class="table-total">
                <td colspan="5" class="numeric">Total de fretes líquidos</td>
                <td class="numeric">${escapeHtml(formatCurrency(settlement.totals.totalNetFreight))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section allow-break">
        <h2 class="section-title">Médias por veículo</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Veículo</th>
                <th class="numeric">Viagens</th>
                <th class="numeric">Abastecimentos</th>
                <th class="numeric">Média</th>
                <th>Referência</th>
              </tr>
            </thead>
            <tbody>${buildVehicleRows(settlement)}</tbody>
          </table>
        </div>
      </section>

      <section class="section allow-break">
        <h2 class="section-title">Descontos lançados</h2>
        ${buildDiscountRows(settlement)}
      </section>

      <section class="section">
        <h2 class="section-title">Demonstrativo financeiro</h2>
        <div class="summary-grid">
          <div class="summary-row"><span>Total de fretes</span><strong>${escapeHtml(
            formatCurrency(settlement.totals.totalNetFreight),
          )}</strong></div>
          <div class="summary-row"><span>Percentual aplicado</span><strong>${escapeHtml(
            formatDecimal(settlement.totals.bonusPercent),
          )}%</strong></div>
          <div class="summary-row"><span>Bonificação</span><strong>${escapeHtml(
            formatCurrency(settlement.totals.bonusValue),
          )}</strong></div>
          <div class="summary-row"><span>Salário base</span><strong>${escapeHtml(
            formatCurrency(settlement.totals.baseSalary),
          )}</strong></div>
          <div class="summary-row"><span>Diárias</span><strong>${escapeHtml(
            formatCurrency(settlement.totals.dailyAllowance),
          )}</strong></div>
          <div class="summary-row"><span>Outros proventos</span><strong>${escapeHtml(
            formatCurrency(settlement.totals.otherEarnings),
          )}</strong></div>
          <div class="summary-row"><span>Vales</span><strong>- ${escapeHtml(
            formatCurrency(settlement.totals.advances),
          )}</strong></div>
          <div class="summary-row"><span>Multas</span><strong>- ${escapeHtml(
            formatCurrency(settlement.totals.fines),
          )}</strong></div>
          <div class="summary-row"><span>Outros descontos</span><strong>- ${escapeHtml(
            formatCurrency(settlement.totals.otherDiscounts),
          )}</strong></div>
          <div class="summary-row"><span>Total de descontos</span><strong>- ${escapeHtml(
            formatCurrency(settlement.totals.totalDiscounts),
          )}</strong></div>
        </div>
        <div class="receivable">
          <span>Total a receber</span>
          <strong>${escapeHtml(formatCurrency(settlement.totals.totalReceivable))}</strong>
        </div>
      </section>

      <footer class="footer">
        Documento preparado pelo sistema HMT Transportes em ${escapeHtml(generatedAt)}.
      </footer>
    </main>

    <script>
      document.getElementById('print-report').addEventListener('click', () => window.print());
      document.getElementById('close-report').addEventListener('click', () => window.close());
    </script>
  </body>
</html>`;
}

export function printSettlementReport(settlement: DriverSettlementSnapshot): boolean {
  const reportHtml = buildSettlementReportHtml(settlement);
  const reportBlob = new Blob([reportHtml], {
    type: 'text/html;charset=utf-8',
  });
  const reportUrl = URL.createObjectURL(reportBlob);
  const reportWindow = window.open(reportUrl, '_blank', 'popup=yes,width=1100,height=820');

  if (!reportWindow) {
    URL.revokeObjectURL(reportUrl);
    return false;
  }

  reportWindow.focus();
  window.setTimeout(() => URL.revokeObjectURL(reportUrl), 60_000);
  return true;
}
