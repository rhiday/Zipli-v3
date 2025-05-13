import React, { useState } from 'react';
import type { FC } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { FilterIcon } from 'lucide-react';

const TYPE_OPTIONS = [
  { label: 'Donations', value: 'donations' },
  { label: 'Requests', value: 'requests' },
];
const ALLERGENS = [
  'Lactose-Free',
  'Low-Lactose',
  'Gluten-Free',
  'Soy-Free',
];
const FOOD_TYPE_OPTIONS = [
  'Prepared meals',
  'Fresh produce',
  'Cold packaged foods',
  'Bakery and Pastry',
  'Other',
];
const DONATION_STATUSES = ['available', 'claimed', 'picked_up', 'cancelled'];
const REQUEST_STATUSES = ['active', 'fulfilled', 'cancelled'];

export type FilterBarProps = {
  onFilterChange?: (key: string, value: string | string[]) => void;
  activeFilters?: Record<string, string | string[]>;
  showStatus?: boolean;
  statusOptions?: string[];
  showType?: boolean;
  showAllergens?: boolean;
  showFoodType?: boolean;
  showMinQty?: boolean;
  showDateRange?: boolean;
};

const FilterBar: FC<FilterBarProps> = ({
  onFilterChange,
  activeFilters = {},
  showStatus = false,
  statusOptions = DONATION_STATUSES,
  showType = true,
  showAllergens = true,
  showFoodType = true,
  showMinQty = true,
  showDateRange = true,
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [modalAllergens, setModalAllergens] = useState<string[]>(Array.isArray(activeFilters.allergens) ? activeFilters.allergens : []);
  const [modalMinQty, setModalMinQty] = useState(activeFilters.minQty ? String(activeFilters.minQty) : '');
  const [modalDateFrom, setModalDateFrom] = useState(activeFilters.dateFrom ? String(activeFilters.dateFrom) : '');
  const [modalDateTo, setModalDateTo] = useState(activeFilters.dateTo ? String(activeFilters.dateTo) : '');

  // Helper for multi-select allergens
  const toggleAllergen = (allergen: string) => {
    setModalAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const applyModalFilters = () => {
    onFilterChange?.('allergens', modalAllergens);
    onFilterChange?.('minQty', modalMinQty);
    onFilterChange?.('dateFrom', modalDateFrom);
    onFilterChange?.('dateTo', modalDateTo);
    setShowAllFilters(false);
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto py-2 md:grid md:grid-cols-5 md:gap-3">
      {showType && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[110px] flex-shrink-0">
              Type
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-white border rounded shadow">
            <div className="flex flex-col gap-1">
              {TYPE_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  variant={activeFilters.type === opt.value ? 'primary' : 'ghost'}
                  className="justify-start"
                  onClick={() => onFilterChange?.('type', opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {showAllergens && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[110px] flex-shrink-0">
              Dietary
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-white border rounded shadow">
            <div className="flex flex-wrap gap-1">
              {ALLERGENS.map(allergen => (
                <Button
                  key={allergen}
                  variant={Array.isArray(activeFilters.allergens) && activeFilters.allergens.includes(allergen) ? 'primary' : 'ghost'}
                  className="text-xs px-2 py-1"
                  onClick={() => {
                    const current = Array.isArray(activeFilters.allergens) ? activeFilters.allergens : [];
                    const next = current.includes(allergen)
                      ? current.filter(a => a !== allergen)
                      : [...current, allergen];
                    onFilterChange?.('allergens', next);
                  }}
                >
                  {allergen}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {showFoodType && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[110px] flex-shrink-0">
              Food Type
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-white border rounded shadow">
            <div className="flex flex-col gap-1">
              {FOOD_TYPE_OPTIONS.map(opt => (
                <Button
                  key={opt}
                  variant={activeFilters.foodType === opt ? 'primary' : 'ghost'}
                  className="justify-start"
                  onClick={() => onFilterChange?.('foodType', opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {showStatus && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[110px] flex-shrink-0">
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-white border rounded shadow">
            <div className="flex flex-col gap-1">
              {statusOptions.map(opt => (
                <Button
                  key={opt}
                  variant={activeFilters.status === opt ? 'primary' : 'ghost'}
                  className="justify-start capitalize"
                  onClick={() => onFilterChange?.('status', opt)}
                >
                  {opt.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <Dialog open={showAllFilters} onOpenChange={setShowAllFilters}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[110px] flex-shrink-0 font-semibold"
            onClick={() => setShowAllFilters(true)}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            All filters
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg w-full bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">All Filters</h2>
          <div className="grid grid-cols-2 gap-4">
            {showAllergens && (
              <div>
                <label className="block text-sm font-medium mb-1">Dietary Preferences</label>
                <div className="flex flex-wrap gap-1">
                  {ALLERGENS.map(allergen => (
                    <Button
                      key={allergen}
                      variant={modalAllergens.includes(allergen) ? 'primary' : 'ghost'}
                      className="text-xs px-2 py-1"
                      onClick={() => toggleAllergen(allergen)}
                    >
                      {allergen}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {showMinQty && (
              <div>
                <label className="block text-sm font-medium mb-1">Min. Quantity/People</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={modalMinQty}
                  onChange={e => setModalMinQty(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            )}
            {showDateRange && (
              <div>
                <label className="block text-sm font-medium mb-1">Date From</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={modalDateFrom}
                  onChange={e => setModalDateFrom(e.target.value)}
                />
              </div>
            )}
            {showDateRange && (
              <div>
                <label className="block text-sm font-medium mb-1">Date Until</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={modalDateTo}
                  onChange={e => setModalDateTo(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAllFilters(false)}>Cancel</Button>
            <Button onClick={applyModalFilters}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterBar; 