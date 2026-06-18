import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export const SortableItem = ({ id, children, as: Component = 'div', className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Component
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
    >
      {children}
    </Component>
  );
};

interface DragHandleProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DragHandle = ({ id, children, className }: DragHandleProps) => {
  const {
    attributes,
    listeners,
  } = useSortable({ id });

  return (
    <div
      {...attributes}
      {...listeners}
      className={`${className} cursor-grab active:cursor-grabbing`}
    >
      {children}
    </div>
  );
};
