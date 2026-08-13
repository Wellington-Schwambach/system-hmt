import styled, { createGlobalStyle } from 'styled-components';

export const PrintGlobalStyle = createGlobalStyle`
  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm;
    }

    body * {
      visibility: hidden !important;
    }

    #settlement-print-report,
    #settlement-print-report * {
      visibility: visible !important;
    }

    #settlement-print-report {
      position: absolute !important;
      inset: 0 auto auto 0 !important;
      width: 100% !important;
      display: block !important;
      color: #111 !important;
      background: #fff !important;
    }
  }
`;

export const Report = styled.section`
  display: none;

  @media print {
    display: block;
    font-family: Arial, sans-serif;
    font-size: 10px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #00a651;
`;

export const Brand = styled.div`
  h1 {
    margin: 0;
    font-size: 18px;
  }

  p {
    margin: 4px 0 0;
    color: #555;
  }
`;

export const DriverInfo = styled.div`
  text-align: right;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 3px;
    color: #555;
  }
`;

export const Section = styled.section`
  margin-top: 14px;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 7px;
  padding-bottom: 4px;
  border-bottom: 1px solid #d8e1db;
  color: #006f38;
  font-size: 12px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 5px;
    border: 1px solid #d8e1db;
    text-align: left;
  }

  th {
    background: #eef8f2;
    font-size: 8px;
    text-transform: uppercase;
  }

  td:last-child,
  th:last-child {
    text-align: right;
  }
`;

export const VehicleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

export const VehicleCard = styled.div`
  padding: 8px;
  border: 1px solid #d8e1db;
  border-radius: 6px;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 4px;
    color: #555;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px 16px;
`;

export const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: ${({ $total }) => ($total ? '8px' : '4px 0')};
  border-top: ${({ $total }) => ($total ? '2px solid #00a651' : '0')};
  color: ${({ $total }) => ($total ? '#006f38' : '#111')};
  font-size: ${({ $total }) => ($total ? '14px' : '10px')};
  font-weight: ${({ $total }) => ($total ? 800 : 500)};
`;

export const Footer = styled.footer`
  margin-top: 18px;
  padding-top: 8px;
  border-top: 1px solid #d8e1db;
  color: #777;
  font-size: 8px;
  text-align: center;
`;
