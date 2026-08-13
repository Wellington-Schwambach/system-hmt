import { Truck } from 'lucide-react';

import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function Maintenance() {
  return (
    <ModulePlaceholder
      title="Manutenção"
      description="Este espaço será usado para cadastrar e gerenciar a manutenção da frota da Henrique Transportes."
      icon={Truck}
    />
  );
}
