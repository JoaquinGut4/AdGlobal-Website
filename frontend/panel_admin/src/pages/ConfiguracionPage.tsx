import { Settings } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Usuarios del panel administrativo',
  'Roles y permisos por módulo',
  'Parámetros generales del sistema',
  'Sedes, almacenes y áreas',
  'Seguridad, accesos y sesiones',
  'Preferencias y datos de la empresa',
];

export function ConfiguracionPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Configuración"
      subtitle="Administrar usuarios, roles, permisos y parámetros generales."
      capabilities={CAPACIDADES}
    />
  );
}
