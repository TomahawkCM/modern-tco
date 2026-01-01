/**
 * DraggableWidget Component
 *
 * Wraps dashboard widgets to make them draggable using dnd-kit.
 * Provides accessible drag handle and visual feedback during drag operations.
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isDragDisabled?: boolean;
}

export function DraggableWidget({
  id,
  children,
  isDragDisabled = false,
}: DraggableWidgetProps) {
  const t = useTranslations('draggableWidget');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      {!isDragDisabled && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -top-2 -right-2 z-10 bg-teal-500 text-white p-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-teal-600 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
          aria-label={t('dragToReorder')}
          tabIndex={0}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Widget Content */}
      {children}
    </div>
  );
}
