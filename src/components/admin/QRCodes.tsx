"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

export default function QRCodes() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const tables = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-7xl mx-auto space-y-8 print:m-0 print:space-y-8">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Table QR Codes</h2>
          <p className="text-sm text-muted-foreground mt-1">Scan to open the dashboard for corresponding tables.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span className="font-semibold text-sm">Print QR Codes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-2 print:gap-8">
        {tables.map((table) => {
          const url = `${baseUrl}/?table=${table}`;
          return (
            <div key={table} className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider">Table {table}</h3>
              <div className="bg-white p-4 rounded-xl border border-border/50 shadow-inner mb-6">
                {baseUrl && (
                  <QRCodeSVG 
                    value={url} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground break-all max-w-[250px] font-medium bg-muted px-3 py-1.5 rounded-md">
                {url}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
