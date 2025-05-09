import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Service {
  id: number;
  name: string;
  duration: number;
  location: string;
}

const mockServices: Service[] = [
  { id: 1, name: 'Massoterapia', duration: 30, location: 'Sala Flórida - Betta Global Partner' },
  { id: 2, name: 'Manicure', duration: 25, location: 'Sala Las Vegas - Betta Global Partner'},
  { id: 3, name: 'Acupuntura', duration: 30, location: 'Sala X - Blue6ix' },
  { id: 4, name: 'Reiki', duration: 45, location: 'Sala Y - Bits' },
  { id: 5, name: 'Quiropraxia', duration: 45, location: 'Sala Z - Noovi'}
];

export default function ServiceSelector() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleService = (service: Service) => {
    setSelectedService(prev => prev?.id === service.id ? null : service);
    setIsOpen(false);
  };

  return (
    <div className="mb-4 w-full max-w-2xl mx-auto">
      <div className="relative w-full text-sm">
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {selectedService && (
            <div className="flex items-center bg-blue-100 rounded-full px-2.5 py-0.5 border border-blue-200">
              <span className="mr-1.5 text-blue-800 text-sm truncate max-w-[160px]">
                {selectedService.name}
              </span>
              <button 
                onClick={() => setSelectedService(null)}
                className="text-blue-500 hover:text-blue-700"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-3 py-2 border-2 border-dashed rounded-lg bg-gray-50 hover:border-blue-500 transition-colors text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <span className="text-sm">
            {selectedService ? "Trocar serviço" : "Selecionar serviço*"}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
            {mockServices.map(service => (
              <div
                key={service.id}
                onClick={() => toggleService(service)}
                className={`px-3 py-2 cursor-pointer flex justify-between items-center ${
                  selectedService?.id === service.id
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{service.name}</p>
                  <p className="text-xs text-gray-500 truncate">{service.location}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap pl-2">
                  {service.duration}min
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}