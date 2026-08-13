import { EMPLOYEES_STORAGE_KEY, INITIAL_EMPLOYEE_RECORDS } from '../pages/Employees/constants';
import type { EmployeeRecord } from '../pages/Employees/types';

function isEmployeeRecord(value: unknown): value is EmployeeRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const employee = value as Partial<EmployeeRecord>;
  return typeof employee.fullName === 'string' && typeof employee.jobTitle === 'string';
}

export function getDriverOptions(extraDrivers: string[] = []): string[] {
  let employees = INITIAL_EMPLOYEE_RECORDS;

  try {
    const storedEmployees = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);

    if (storedEmployees) {
      const parsedEmployees = JSON.parse(storedEmployees) as unknown;

      if (Array.isArray(parsedEmployees)) {
        const validEmployees = parsedEmployees.filter(isEmployeeRecord);

        if (validEmployees.length > 0) {
          employees = validEmployees;
        }
      }
    }
  } catch {
    employees = INITIAL_EMPLOYEE_RECORDS;
  }

  const employeeDrivers = employees
    .filter((employee) => employee.jobTitle.toLocaleLowerCase('pt-BR').includes('motorista'))
    .map((employee) => employee.fullName.trim())
    .filter(Boolean);

  return Array.from(
    new Set([...employeeDrivers, ...extraDrivers.map((driver) => driver.trim()).filter(Boolean)]),
  ).sort((firstDriver, secondDriver) => firstDriver.localeCompare(secondDriver, 'pt-BR'));
}
