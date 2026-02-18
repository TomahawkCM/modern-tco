"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebtAccount } from "@/lib/calculators/types";
import { useTranslations } from "next-intl";

interface SortableDebtItemProps {
  debt: DebtAccount;
  index: number;
  formatCurrency: (amount: number) => string;
}

function SortableDebtItem({ debt, index, formatCurrency }: SortableDebtItemProps) {
  const tAria = useTranslations("aria");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: debt.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 transition-colors",
        isDragging && "z-50 border-teal-500/50 bg-slate-800 shadow-lg shadow-teal-500/10"
      )}
    >
      <button
        className="cursor-grab touch-none text-slate-500 hover:text-slate-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={tAria("reorderDebt", { name: debt.name })}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{debt.name}</p>
        <p className="text-xs text-slate-400">
          {formatCurrency(debt.balance)} &middot; {debt.apr}% APR
        </p>
      </div>
    </div>
  );
}

interface CustomOrderListProps {
  debts: DebtAccount[];
  order: string[];
  onOrderChange: (newOrder: string[]) => void;
  formatCurrency: (amount: number) => string;
}

export function CustomOrderList({
  debts,
  order,
  onOrderChange,
  formatCurrency,
}: CustomOrderListProps) {
  const t = useTranslations("debtPayoff");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedDebts = order
    .map((id) => debts.find((d) => d.id === id))
    .filter((d): d is DebtAccount => d != null);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = order.indexOf(active.id as string);
        const newIndex = order.indexOf(over.id as string);
        onOrderChange(arrayMove(order, oldIndex, newIndex));
      }
    },
    [order, onOrderChange]
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">{t("customOrderHint")}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {sortedDebts.map((debt, index) => (
              <SortableDebtItem
                key={debt.id}
                debt={debt}
                index={index}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
