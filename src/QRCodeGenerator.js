import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, MapPin } from 'lucide-react';

const QRCodeGenerator = () => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  
  // Define all your locations
  const locations = [
    // Building 929
    { building: '929', area: 'Sapharie Room', room: '', label: 'Building 929 - Sapharie Room' },
    { building: '929', area: 'Cleanroom', room: '', label: 'Building 929 - Cleanroom' },
    
    // Building 908 - Cleanroom Labs
    { building: '908', area: 'Cleanroom', room: 'Lab 1', label: 'Building 908 - Lab 1' },
    { building: '908', area: 'Cleanroom', room: 'Lab 2', label: 'Building 908 - Lab 2' },
    { building: '908', area: 'Cleanroom', room: 'Lab 3', label: 'Building 908 - Lab 3' },
    { building: '908', area: 'Cleanroom', room: 'Lab 4', label: 'Building 908 - Lab 4' },
    { building: '908', area: 'Cleanroom', room: 'Common area', label: 'Building 908 - Common Area' },
    { building: '908', area: 'Cleanroom', room: 'Powder Dispense room 1', label: 'Building 908 - Powder Dispense 1' },
    { building: '908', area: 'Cleanroom', room: 'Powder Dispense room 2', label: 'Building 908 - Powder Dispense 2' },
    { building: '908', area: 'Cleanroom', room: 'Powder Dispense room 3', label: 'Building 908 - Powder Dispense 3' },
    { building: '908', area: 'Cleanroom', room: 'Powder Dispense room 4', label: 'Building 908 - Powder Dispense 4' },
    { building: '908', area: 'Cleanroom', room: 'ChemSpeed room', label: 'Building 908 - ChemSpeed Room' },
    
    // Building 908 - Warehouse
    { building: '908', area: 'Warehouse', room: '', label: 'Building 908 - Warehouse' },
  ];

  const generateUrl = (location) => {
    const params = new URLSearchParams({
      building: location.building,
      area: location.area,
    });
    if (location.room) {
      params.append('room', location.room);
    }
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadAllQRCodes = () => {
    alert('To download individual QR codes, right-click on each QR code and select "Save Image As"');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Hidden when printing */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 print:hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🧬 QR Code Generator</h1>
              <p className="text-gray-600">Generate QR codes for quick safety reporting at each location</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
              >
                <Printer size={20} className="mr-2" />
                Print All
              </button>
              <button
                onClick={downloadAllQRCodes}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Download size={20} className="mr-2" />
                Download Guide
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📱 How to Use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Print this page (click "Print All" button)</li>
              <li>Cut out each QR code card</li>
              <li>Laminate for durability (recommended)</li>
              <li>Post at the corresponding location</li>
              <li>Users scan with phone camera to report instantly!</li>
            </ol>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URL (Update for production):
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://yourapp.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              For production, change to your deployed app URL
            </p>
          </div>
        </div>

        {/* QR Code Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
          {locations.map((location, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 break-inside-avoid"
            >
              {/* Location Header */}
              <div className="flex items-start space-x-3 mb-4">
                <MapPin className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">
                    {location.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Scan to report safety concerns
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4 bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={generateUrl(location)}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239333ea'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-900 font-medium text-center">
                  📸 Point camera at QR code<br/>
                  No app needed - works with phone camera
                </p>
              </div>

              {/* URL (small text) */}
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400 break-all font-mono">
                  {generateUrl(location)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer - Hidden when printing */}
        <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
          <p>🧬 Nucleus Biologics Safety Reporting System</p>
          <p className="mt-2">Generated {locations.length} QR codes</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;