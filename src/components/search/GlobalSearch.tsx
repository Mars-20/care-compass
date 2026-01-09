import { useState, useEffect, useCallback } from 'react';
import { Search, User, Calendar, Stethoscope, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/hooks/useClinic';

interface SearchResult {
  id: string;
  type: 'patient' | 'visit' | 'appointment';
  title: string;
  subtitle: string;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinic } = useClinic();
  
  const debouncedQuery = useDebounce(query, 300);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !clinic?.id) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name, medical_record_number, phone')
        .eq('clinic_id', clinic.id)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,medical_record_number.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(5);

      if (patients) {
        patients.forEach((patient) => {
          searchResults.push({
            id: patient.id,
            type: 'patient',
            title: `${patient.first_name} ${patient.last_name}`,
            subtitle: `${patient.medical_record_number} - ${patient.phone}`,
          });
        });
      }

      // Search visits
      const { data: visits } = await supabase
        .from('visits')
        .select(`
          id, 
          visit_number, 
          visit_date,
          patients!inner(first_name, last_name)
        `)
        .eq('clinic_id', clinic.id)
        .or(`visit_number.ilike.%${searchQuery}%`)
        .limit(5);

      if (visits) {
        visits.forEach((visit: any) => {
          searchResults.push({
            id: visit.id,
            type: 'visit',
            title: `زيارة ${visit.visit_number}`,
            subtitle: `${visit.patients.first_name} ${visit.patients.last_name}`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [clinic?.id]);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'patient':
        navigate(`/patients/${result.id}`);
        break;
      case 'visit':
        navigate(`/visits/${result.id}`);
        break;
      case 'appointment':
        navigate(`/appointments`);
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'patient':
        return <User className="w-4 h-4" />;
      case 'visit':
        return <Stethoscope className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:ml-2" />
        <span className="hidden xl:inline-flex">بحث...</span>
        <kbd className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="ابحث عن مريض، زيارة، موعد..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          
          {!loading && query && results.length === 0 && (
            <CommandEmpty>لا توجد نتائج لـ "{query}"</CommandEmpty>
          )}

          {!loading && results.length > 0 && (
            <>
              {['patient', 'visit', 'appointment'].map((type) => {
                const typeResults = results.filter((r) => r.type === type);
                if (typeResults.length === 0) return null;

                const groupLabels = {
                  patient: 'المرضى',
                  visit: 'الزيارات',
                  appointment: 'المواعيد',
                };

                return (
                  <CommandGroup key={type} heading={groupLabels[type as keyof typeof groupLabels]}>
                    {typeResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result)}
                        className="gap-2"
                      >
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <p>{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </>
          )}

          {!query && (
            <div className="py-6 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>ابدأ بالكتابة للبحث</p>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
