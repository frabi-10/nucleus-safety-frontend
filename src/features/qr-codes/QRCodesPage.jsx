import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download } from 'lucide-react';
import { Button, Card } from '@components/ui';
import { LOCATIONS } from '@utils/constants';
import { generateQRCodeURL } from '@utils/helpers';

export const QRCodesPage = () => {
  const handlePrint = () => {
    window.print();
  };

  // Generate all location combinations
  const qrCodes = [];
  Object.entries(LOCATIONS).forEach(([building, areas]) => {
    Object.entries(areas).forEach(([area, rooms]) => {
      rooms.forEach((room) => {
        qrCodes.push({
          building,
          area,
          room,
          url: generateQRCodeURL(building, area, room),
        });
      });
    });
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header - Hidden when printing */}
      <div className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Codes</h1>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print QR Codes
        </Button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
        {qrCodes.map((qr, index) => (
          <Card
            key={index}
            className="text-center p-6 print:break-inside-avoid print:border-2 print:border-gray-300"
          >
            {/* Location Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{qr.building}</h3>
              <p className="text-gray-600">{qr.area}</p>
              <p className="text-sm text-gray-500">{qr.room}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG
                  value={qr.url}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="print:w-48 print:h-48"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600">
              <p className="font-medium">Scan to Report Safety Concerns</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Print Styles */}
      <style>{`
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

          .print\\:break-inside-avoid {
            break-inside: avoid;
          }

          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .print\\:border-2 {
            border-width: 2px;
          }

          .print\\:border-gray-300 {
            border-color: #d1d5db;
          }

          .print\\:w-48 {
            width: 12rem;
          }

          .print\\:h-48 {
            height: 12rem;
          }
        }
      `}</style>
    </div>
  );
};
