import React from 'react';
import { ChevronRight } from 'lucide-react';

const ExportCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-gray-900 font-semibold mb-1">Export to PDF</h3>
        <p className="text-gray-600 text-sm">Environmental and social impact data for reporting, and operation planning.</p>
      </div>
      <ChevronRight className="text-gray-400" size={24} />
    </div>
  );
};

export default ExportCard; 