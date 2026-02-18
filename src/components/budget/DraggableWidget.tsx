/**
 * DraggableWidget Component
 *
 * Wraps dashboard widgets to make them draggable using dnd-kit.
 * Provides accessible drag handle and visual feedback during drag operations.
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isDragDisabled?: boolean;
}

export function DraggableWidget({ id, children, isDragDisabled = false }: DraggableWidgetProps) {
  const t = useTranslations("draggableWidget");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {/* Drag Handle */}
      {!isDragDisabled && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -end-2 -top-2 z-10 cursor-grab rounded-lg bg-teal-500 p-2 text-white opacity-0 shadow-md transition-opacity hover:bg-teal-600 focus:opacity-100 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 active:cursor-grabbing group-hover:opacity-100"
          aria-label={t("dragToReorder")}
          tabIndex={0}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Widget Content */}
      {children}
    </div>
  );
}
