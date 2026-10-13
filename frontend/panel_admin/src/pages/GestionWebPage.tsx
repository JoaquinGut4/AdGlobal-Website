import { Globe } from 'lucide-react';
import { ModulePlaceholder } from '@/components/ui/ModulePlaceholder';

const CAPACIDADES = [
  'Productos y catálogo publicado',
  'Imágenes y contenido multimedia',
  'Servicios y descripciones de la web',
  'Secciones y textos institucionales',
  'Vista previa antes de publicar',
  'Publicación y despublicación inmediata',
];

export function GestionWebPage() {
  return (
    <ModulePlaceholder
      icon={Globe}
      title="Gestión web"
      subtitle="Actualizar productos, imágenes, servicios y contenido de la web pública."
      capabilities={CAPACIDADES}
    />
  );
}
