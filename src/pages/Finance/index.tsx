import { Truck } from 'lucide-react';

import { ModulePlaceholder } from '../../components/ModulePlaceholder';

export function Finance() {
  return (
    <ModulePlaceholder
      title="Financeiro"
      description="Este espaço será usado para cadastrar e gerenciar as finanças da frota da Henrique Transportes."
      icon={Truck}
    />
  );
}
