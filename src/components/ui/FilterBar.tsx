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
  const [modalFoodType, setModalFoodType] = useState(activeFilters.foodType ? String(activeFilters.foodType) : '');
  const [modalMinQty, setModalMinQty] = useState(activeFilters.minQty ? String(activeFilters.minQty) : '');
  const [modalDateFrom, setModalDateFrom] = useState(activeFilters.dateFrom ? String(activeFilters.dateFrom) : '');
  const [modalDateTo, setModalDateTo] = useState(activeFilters.dateTo ? String(activeFilters.dateTo) : '');

  React.useEffect(() => {
    setModalFoodType(activeFilters.foodType ? String(activeFilters.foodType) : '');
    setModalMinQty(activeFilters.minQty ? String(activeFilters.minQty) : '');
    setModalDateFrom(activeFilters.dateFrom ? String(activeFilters.dateFrom) : '');
    setModalDateTo(activeFilters.dateTo ? String(activeFilters.dateTo) : '');
  }, [activeFilters.foodType, activeFilters.minQty, activeFilters.dateFrom, activeFilters.dateTo]);

  const applyModalFilters = () => {
    onFilterChange?.('foodType', modalFoodType);
    onFilterChange?.('minQty', modalMinQty);
    onFilterChange?.('dateFrom', modalDateFrom);
    onFilterChange?.('dateTo', modalDateTo);
    setShowAllFilters(false);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {showStatus && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" className="min-w-[110px] flex-shrink-0">
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
            variant="secondary"
            className="min-w-[110px] flex-shrink-0 font-semibold"
            onClick={() => setShowAllFilters(true)}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            All filters
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg w-full bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">All Filters</h2>
          <div className="space-y-4">
            {showFoodType && (
              <div>
                <label className="block text-sm font-medium mb-1">Food Type</label>
                <div className="flex flex-col gap-1">
                  {FOOD_TYPE_OPTIONS.map(opt => (
                    <Button
                      key={opt}
                      variant={modalFoodType === opt ? 'primary' : 'ghost'}
                      className="justify-start w-full text-left"
                      onClick={() => setModalFoodType(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                  {modalFoodType && (
                    <Button
                      variant='ghost'
                      className="justify-start w-full text-left text-xs text-gray-500 mt-1"
                      onClick={() => setModalFoodType('')}
                    >
                      Clear food type
                    </Button>
                  )}
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