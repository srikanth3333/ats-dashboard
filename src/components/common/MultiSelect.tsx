import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";

// Generic interface for selectable items
interface SelectableItem {
  id: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

interface MultiSelectProps {
  title: string;
  subtitle?: string;
  items: SelectableItem[];
  initialSelected?: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  maxVisibleUnselected?: number;
  placeholder?: string;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  title,
  subtitle,
  items,
  initialSelected = [],
  onSelectionChange,
  maxVisibleUnselected = 4,
  placeholder = "Add items",
  className = "",
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);
  const [showDropdown, setShowDropdown] = useState(false);

  // Update parent when selection changes
  useEffect(() => {
    onSelectionChange(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const removeItem = (id: string) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const unselectedItems = items.filter(
    (item) => !selectedIds.includes(item.id)
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}

      {/* Selected items as pills */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedItems.map((item) => (
            <div
              key={`selected-${item.id}`}
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-full text-sm font-medium"
            >
              <span>{item.label}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="hover:bg-gray-700 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${item.label}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add items button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={unselectedItems.length === 0}
        >
          <Plus size={16} />
          {placeholder}
        </button>

        {/* Dropdown menu */}
        {showDropdown && unselectedItems.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-2 max-h-60 overflow-y-auto">
              {unselectedItems.map((item) => (
                <button
                  type="button"
                  key={`dropdown-${item.id}`}
                  onClick={() => {
                    toggleItem(item.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default MultiSelect;
