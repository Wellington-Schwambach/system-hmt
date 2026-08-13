import { Truck } from 'lucide-react';

import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function Logistic() {
  return (
    <ModulePlaceholder
      title="Logística"
      description="Este espaço será usado para cadastrar e gerenciar a logística da frota da Henrique Transportes."
      icon={Truck}
    />
  );
}
