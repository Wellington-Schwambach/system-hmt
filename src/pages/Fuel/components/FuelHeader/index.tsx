import { Droplets, Fuel } from 'lucide-react';

import { Description, Header, IconCluster, IconTile, Kicker, Title, TitleGroup } from './styles';

export function FuelHeader() {
  return (
    <Header>
      <TitleGroup>
        <Kicker>Controle de abastecimento</Kicker>
        <Title>Combustível</Title>
        <Description>
          Gerencie abastecimentos de Diesel e Arla, acompanhe o consumo e consulte o status de
          faturamento de cada registro.
        </Description>
      </TitleGroup>

      <IconCluster aria-hidden="true">
        <IconTile>
          <Fuel size={24} />
        </IconTile>
        <IconTile $secondary>
          <Droplets size={22} />
        </IconTile>
      </IconCluster>
    </Header>
  );
}
