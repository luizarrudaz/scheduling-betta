import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Event } from '../../types/Event/Event';

interface ServiceSelectorProps {
  services: Event[];
  selectedService: Event | null;
  onServiceSelect: (service: Event | null) => void;
}

export default function ServiceSelector({ services, selectedService, onServiceSelect }: ServiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleService = (service: Event) => {
    onServiceSelect(selectedService?.id === service.id ? null : service);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 w-full max-w-2xl mx-auto">
      <div className="relative w-full text-sm">
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {selectedService && (
            <div className="flex items-center bg-primary-light/10 dark:bg-primary/20 rounded-full px-2.5 py-0.5 border border-primary-light/20 dark:border-primary/30">
              <span className="mr-1.5 text-primary-dark dark:text-neutral-100 font-medium text-sm truncate max-w-[160px]">
                {selectedService.title}
              </span>
              <button
                type="button"
                onClick={() => onServiceSelect(null)}
                className="text-primary-light hover:text-primary dark:text-primary-light/70 dark:hover:text-primary-light"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 border-2 border-dashed rounded-lg bg-neutral-50 dark:bg-neutral-700/30 border-neutral-300 dark:border-neutral-600 hover:border-primary dark:hover:border-primary-light transition-colors text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <span className="text-sm">
            {selectedService ? "Trocar serviço" : "Selecionar serviço*"}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg shadow-medium max-h-48 overflow-y-auto text-sm">
            {services.map(service => (
              <button
                type="button"
                key={service.id}
                onClick={() => toggleService(service)}
                className={`w-full text-left px-3 py-2 cursor-pointer flex justify-between items-center transition-colors ${
                  selectedService?.id === service.id
                    ? 'bg-primary-light/10 dark:bg-primary/20 border-l-4 border-primary'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{service.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{service.location}</p>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap pl-2">
                  {service.sessionDuration}min
                </span>
              </button>
            ))}
             {services.length === 0 && (
              <div className="px-3 py-2 text-center text-neutral-500 dark:text-neutral-400">
                Nenhum evento disponível.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}