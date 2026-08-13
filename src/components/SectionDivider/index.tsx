import { DividerContainer, DividerLine } from './styles';

interface SectionDividerProps {
  label: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <DividerContainer aria-label={label}>
      <DividerLine />
      <span>{label}</span>
      <DividerLine />
    </DividerContainer>
  );
}
