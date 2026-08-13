import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: 520px;

  background: ${({ theme }) => theme.colors.surfaceGlassStrong};

  backdrop-filter: blur(12px);

  border-radius: 28px;

  padding: 48px;

  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);

  display: flex;
  flex-direction: column;
`;
