export interface SearchableSelectOption {
  value: string;
  label: string;
  searchText?: string;
}

export interface SearchableSelectProps {
  id: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  ariaLabel?: string;
}
