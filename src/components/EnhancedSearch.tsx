import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { debounce } from '../utils/debounce';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';

interface SearchFilters {
  query: string;
  major: string;
  year: string;
  lookingFor: string;
  academicGoal: string;
  leisureGoal: string;
  sortBy: 'newest' | 'compatibility' | 'name';
}

interface EnhancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Partial<SearchFilters>;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  availableMajors?: string[];
  availableYears?: string[];
  availableLookingFor?: string[];
  availableAcademicGoals?: string[];
  availableLeisureGoals?: string[];
}

export function EnhancedSearch({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableMajors = [],
  availableYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'],
  availableLookingFor = ['Study Partner', 'Roommate', 'Friend', 'Activity Partner', 'Co-founder'],
  availableAcademicGoals = [],
  availableLeisureGoals = [],
}: EnhancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
    [onSearchChange]
  );

  // Update local state immediately, debounce the actual search
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'all' && v !== 'All'
  ).length;

  const clearFilters = () => {
    onFiltersChange({
      major: 'all',
      year: 'all',
      lookingFor: 'all',
      academicGoal: 'all',
      leisureGoal: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <Input
          type="text"
          placeholder="Search by name, major, interests..."
          value={localSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Search profiles"
        />
        {localSearchQuery && (
          <button
            onClick={() => {
              setLocalSearchQuery('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1E4F74]"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1 justify-start"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-[#2E7B91] text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value: 'newest' | 'compatibility' | 'name') => {
            onFiltersChange({ ...filters, sortBy: value });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="compatibility">Compatibility</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortAscending(!sortAscending)}
          aria-label={sortAscending ? 'Sort descending' : 'Sort ascending'}
        >
          {sortAscending ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-[#1E4F74]">Filter Profiles</h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-[#64748b]"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Major Filter */}
              {availableMajors.length > 0 && (
                <div>
                  <label className="text-xs text-[#64748b] mb-1 block">Major</label>
                  <Select
                    value={filters.major || 'all'}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, major: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Majors</SelectItem>
                      {availableMajors.map((major) => (
                        <SelectItem key={major} value={major}>
                          {major}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Year Filter */}
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Year</label>
                <Select
                  value={filters.year || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Looking For Filter */}
              <div>
                <label className="text-xs text-[#64748b] mb-1 block">Looking For</label>
                <Select
                  value={filters.lookingFor || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({ ...filters, lookingFor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {availableLookingFor.map((item) => (
                      <SelectItem key={item} value={item.toLowerCase().replace(/\s+/g, '-')}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Goal Filter */}
              {availableAcademicGoals.length > 0 && (
                <div>
                  <label className="text-xs text-[#64748b] mb-1 block">Academic Goal</label>
                  <Select
                    value={filters.academicGoal || 'all'}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, academicGoal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Goals</SelectItem>
                      {availableAcademicGoals.map((goal) => (
                        <SelectItem key={goal} value={goal.toLowerCase().replace(/\s+/g, '-')}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

