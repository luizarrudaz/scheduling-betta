import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface DownloadButtonProps {
  onCsvDownload: () => void;
  onXlsxDownload: () => void;
}

export default function DownloadButton({ onCsvDownload, onXlsxDownload }: DownloadButtonProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-md bg-white p-2 text-gray-700 shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA7014]">
          <span className="sr-only">Opções de download</span>
          <ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-2xl border border-gray-100 overflow-hidden focus:outline-none"
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onCsvDownload}
                  className={`${
                    active ? 'bg-orange-50 text-[#FA7014]' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm transition-colors focus:outline-none`}
                >
                  <DocumentTextIcon
                    className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#FA7014] transition-colors"
                    aria-hidden="true"
                  />
                  Exportar para .CSV
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onXlsxDownload}
                  className={`${
                    active ? 'bg-orange-50 text-[#FA7014]' : 'text-gray-700'
                  } group flex w-full items-center px-4 py-2 text-sm transition-colors focus:outline-none`}
                >
                  <TableCellsIcon
                    className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#FA7014] transition-colors"
                    aria-hidden="true"
                  />
                  Exportar para .XLSX
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}