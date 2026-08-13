import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Icon = styled.div`
  width: 3.5rem;
  height: 3.5rem;

  border-radius: 16px;

  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, #60a5fa);

  display: flex;
  justify-content: center;
  align-items: center;

  color: white;

  font-size: 1.4rem;

  font-weight: bold;

  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.25);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h1`
  font-size: 1.35rem;

  color: ${({ theme }) => theme.colors.secondary};

  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

export const Subtitle = styled.span`
  font-size: 0.85rem;

  color: ${({ theme }) => theme.colors.textSecondary};
`;
