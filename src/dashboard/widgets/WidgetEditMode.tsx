"use client";

/**
 * Widget Edit Mode Component
 *
 * Provides accessible controls for customizing dashboard widget layout:
 * - Enable/disable widgets
 * - Reorder widgets with keyboard support
 * - Save/cancel changes with persistence
 *
 * ACCESSIBILITY:
 * - Full keyboard navigation (Tab, Enter, Space, Arrow keys)
 * - ARIA labels and announcements for screen readers
 * - WCAG 2.1 AA compliant (focus indicators, contrast, labels)
 */

import { useState, useRef } from "react";
import type { DashboardConfig, WidgetConfig, GridSize } from "./types";
import { WIDGET_DEFINITIONS, getWidgetDefinition } from "./WidgetRegistry";
import { setWidgetConfig } from "./widget-storage";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  GripVertical,
  Maximize2,
} from "lucide-react";
import { useTranslations } from "next-intl";
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

interface WidgetEditModeProps {
  /** Current widget configuration */
  config: DashboardConfig;
  /** Callback when config is saved */
  onSave: (config: DashboardConfig) => void;
  /** Callback when edit mode is cancelled */
  onCancel: () => void;
}

// Sortable Widget Item Component
interface SortableWidgetItemProps {
  widget: WidgetConfig;
  visibleIndex: number;
  visibleCount: number;
  isFirst: boolean;
  isLast: boolean;
  onToggleVisibility: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onChangeSize: (id: string, size: GridSize) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
}

function SortableWidgetItem({
  widget,
  visibleIndex,
  visibleCount,
  isFirst,
  isLast,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onChangeSize,
  onKeyDown,
}: SortableWidgetItemProps) {
  const t = useTranslations();
  const def = getWidgetDefinition(widget.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !widget.visible,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!def) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => onKeyDown(e, widget.id)}
      className={`group rounded-xl border-2 bg-white/5 p-4 transition-all hover:border-white/20 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        isDragging ? "border-teal-500 shadow-lg shadow-teal-500/20" : "border-white/10"
      }`}
      aria-label={`${t(def.title)} widget. ${widget.visible ? `Enabled, position ${visibleIndex} of ${visibleCount}` : "Disabled"}. Press Space to ${widget.visible ? "disable" : "enable"}${widget.visible ? ". Drag to reorder or use arrow keys" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle (only for visible widgets) */}
        {widget.visible && (
          <button
            {...attributes}
            {...listeners}
            className="flex h-10 w-10 flex-shrink-0 cursor-grab items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}

        {/* Visibility Toggle */}
        <button
          onClick={() => onToggleVisibility(widget.id)}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            widget.visible
              ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
              : "bg-white/5 text-slate-500 hover:bg-white/10"
          }`}
          aria-label={widget.visible ? "Disable widget" : "Enable widget"}
          aria-pressed={widget.visible}
        >
          {widget.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>

        {/* Widget Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{t(def.title)}</h3>
            {widget.visible && (
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-400">
                Position {visibleIndex}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">{t(def.description)}</p>
        </div>

        {/* Size Control (for visible widgets) */}
        {widget.visible && (
          <div className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <select
              value={widget.size}
              onChange={(e) => onChangeSize(widget.id, e.target.value as GridSize)}
              className="rounded-lg border-2 border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white transition-all hover:border-white/20 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={`Size for ${t(def.title)}`}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        )}

        {/* Reorder Buttons (only for visible widgets) */}
        {widget.visible && (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onMoveUp(widget.id)}
              disabled={isFirst}
              className="rounded-lg bg-white/5 p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-slate-400"
              aria-label={`Move ${t(def.title)} up${isFirst ? " (already at top)" : ""}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMoveDown(widget.id)}
              disabled={isLast}
              className="rounded-lg bg-white/5 p-2 text-slate-400 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-slate-400"
              aria-label={`Move ${t(def.title)} down${isLast ? " (already at bottom)" : ""}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WidgetEditMode({ config, onSave, onCancel }: WidgetEditModeProps) {
  const t = useTranslations();
  const [editedConfig, setEditedConfig] = useState<DashboardConfig>(config);
  const [announceMessage, setAnnounceMessage] = useState<string>("");
  const announceRef = useRef<HTMLDivElement>(null);

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Announce message to screen readers
  const announce = (message: string) => {
    setAnnounceMessage(message);
    // Clear after announcement
    setTimeout(() => setAnnounceMessage(""), 1000);
  };

  // Get all widgets (including invisible ones) sorted by order
  const allWidgets = WIDGET_DEFINITIONS.map((def) => {
    const existing = editedConfig.widgets.find((w) => w.type === def.type);
    return (
      existing || {
        id: `widget_${def.type}`,
        type: def.type,
        order: editedConfig.widgets.length,
        size: def.defaultSize,
        visible: false,
      }
    );
  }).sort((a, b) => {
    // Visible widgets first, then by order
    if (a.visible !== b.visible) return a.visible ? -1 : 1;
    return a.order - b.order;
  });

  // Toggle widget visibility
  const toggleVisibility = (widgetId: string) => {
    const widget = allWidgets.find((w) => w.id === widgetId);
    if (!widget) return;

    const newWidgets = [...editedConfig.widgets];
    const existingIndex = newWidgets.findIndex((w) => w.id === widgetId);

    if (existingIndex >= 0) {
      // Toggle visibility
      newWidgets[existingIndex] = {
        ...newWidgets[existingIndex],
        visible: !newWidgets[existingIndex].visible,
      };
    } else {
      // Add widget with visible=true
      newWidgets.push({
        ...widget,
        visible: true,
        order: newWidgets.length,
      });
    }

    setEditedConfig({ ...editedConfig, widgets: newWidgets });

    const def = getWidgetDefinition(widget.type);
    const action = widget.visible ? "disabled" : "enabled";
    announce(`${def?.title || widget.type} ${action}`);
  };

  // Move widget up in order
  const moveUp = (widgetId: string) => {
    const visibleWidgets = allWidgets.filter((w) => w.visible);
    const currentIndex = visibleWidgets.findIndex((w) => w.id === widgetId);

    if (currentIndex <= 0) {
      announce("Already at top");
      return;
    }

    const newWidgets = [...visibleWidgets];
    [newWidgets[currentIndex], newWidgets[currentIndex - 1]] = [
      newWidgets[currentIndex - 1],
      newWidgets[currentIndex],
    ];

    // Update order numbers
    const reordered = newWidgets.map((w, index) => ({ ...w, order: index }));

    // Include invisible widgets
    const invisibleWidgets = allWidgets.filter((w) => !w.visible);
    setEditedConfig({
      ...editedConfig,
      widgets: [...reordered, ...invisibleWidgets],
    });

    const def = getWidgetDefinition(visibleWidgets[currentIndex].type);
    announce(
      `${def?.title || visibleWidgets[currentIndex].type} moved to position ${currentIndex} of ${visibleWidgets.length}`
    );
  };

  // Move widget down in order
  const moveDown = (widgetId: string) => {
    const visibleWidgets = allWidgets.filter((w) => w.visible);
    const currentIndex = visibleWidgets.findIndex((w) => w.id === widgetId);

    if (currentIndex >= visibleWidgets.length - 1) {
      announce("Already at bottom");
      return;
    }

    const newWidgets = [...visibleWidgets];
    [newWidgets[currentIndex], newWidgets[currentIndex + 1]] = [
      newWidgets[currentIndex + 1],
      newWidgets[currentIndex],
    ];

    // Update order numbers
    const reordered = newWidgets.map((w, index) => ({ ...w, order: index }));

    // Include invisible widgets
    const invisibleWidgets = allWidgets.filter((w) => !w.visible);
    setEditedConfig({
      ...editedConfig,
      widgets: [...reordered, ...invisibleWidgets],
    });

    const def = getWidgetDefinition(visibleWidgets[currentIndex].type);
    announce(
      `${def?.title || visibleWidgets[currentIndex].type} moved to position ${currentIndex + 2} of ${visibleWidgets.length}`
    );
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const visibleWidgets = allWidgets.filter((w) => w.visible);
    const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
    const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder using arrayMove from @dnd-kit
    const reordered = arrayMove(visibleWidgets, oldIndex, newIndex).map((w, index) => ({
      ...w,
      order: index,
    }));

    // Include invisible widgets
    const invisibleWidgets = allWidgets.filter((w) => !w.visible);
    setEditedConfig({
      ...editedConfig,
      widgets: [...reordered, ...invisibleWidgets],
    });

    const def = getWidgetDefinition(visibleWidgets[oldIndex].type);
    announce(
      `${def?.title || visibleWidgets[oldIndex].type} moved to position ${newIndex + 1} of ${visibleWidgets.length}`
    );
  };

  // Change widget size
  const changeSize = (widgetId: string, size: GridSize) => {
    const newWidgets = editedConfig.widgets.map((w) => (w.id === widgetId ? { ...w, size } : w));

    setEditedConfig({ ...editedConfig, widgets: newWidgets });

    const widget = allWidgets.find((w) => w.id === widgetId);
    const def = widget ? getWidgetDefinition(widget.type) : null;
    announce(`${def?.title || widgetId} size changed to ${size}`);
  };

  // Save changes
  const handleSave = () => {
    try {
      setWidgetConfig(editedConfig);
      onSave(editedConfig);
      announce("Dashboard layout saved");
    } catch (error) {
      console.error("Failed to save widget config:", error);
      announce("Error saving dashboard layout");
    }
  };

  // Cancel changes
  const handleCancel = () => {
    announce("Changes discarded");
    onCancel();
  };

  // Keyboard handler for widget list
  const handleKeyDown = (e: React.KeyboardEvent, widgetId: string) => {
    const widget = allWidgets.find((w) => w.id === widgetId);
    if (!widget) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (widget.visible) moveUp(widgetId);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (widget.visible) moveDown(widgetId);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        toggleVisibility(widgetId);
        break;
    }
  };

  const visibleCount = allWidgets.filter((w) => w.visible).length;
  const totalCount = allWidgets.length;

  return (
    <div className="space-y-6">
      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceMessage}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Dashboard Layout</h2>
          <p className="mt-1 text-sm text-slate-400">
            {visibleCount} of {totalCount} widgets enabled
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Cancel editing and discard changes"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Save dashboard layout changes"
          >
            <Save className="h-4 w-4" />
            <span>Save Layout</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white">How to customize:</p>
            <ul className="mt-1 space-y-0.5 text-slate-400">
              <li>
                <strong className="text-white">Drag</strong> the{" "}
                <GripVertical className="inline h-3 w-3" aria-hidden="true" /> handle to reorder
                widgets
              </li>
              <li>
                <strong className="text-white">Click</strong> the{" "}
                <Eye className="inline h-3 w-3" aria-hidden="true" /> icon to show/hide widgets
              </li>
              <li>
                <strong className="text-white">Change size</strong> using the dropdown
                (Small/Medium/Large)
              </li>
              <li className="mt-2 border-t border-white/10 pt-2">
                <em>Keyboard shortcuts:</em> Use{" "}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5">Tab</kbd> to navigate,{" "}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5">Space</kbd> to toggle,{" "}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5">↑↓</kbd> to reorder
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Widget List with Drag and Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={allWidgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3" role="list" aria-label="Dashboard widgets configuration">
            {allWidgets.map((widget) => {
              const visibleWidgets = allWidgets.filter((w) => w.visible);
              const visibleIndex = visibleWidgets.findIndex((w) => w.id === widget.id) + 1;
              const isFirst = visibleIndex === 1;
              const isLast = visibleIndex === visibleWidgets.length;

              return (
                <SortableWidgetItem
                  key={widget.id}
                  widget={widget}
                  visibleIndex={visibleIndex}
                  visibleCount={visibleWidgets.length}
                  isFirst={isFirst}
                  isLast={isLast}
                  onToggleVisibility={toggleVisibility}
                  onMoveUp={moveUp}
                  onMoveDown={moveDown}
                  onChangeSize={changeSize}
                  onKeyDown={handleKeyDown}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
