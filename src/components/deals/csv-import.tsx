'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DealStage } from '@/types';

interface ParsedDeal {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_type: 'buyer' | 'seller';
  property_address?: string;
  deal_stage: DealStage;
  notes?: string;
}

export function CSVImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedDeal[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const parseCSV = (text: string): ParsedDeal[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const deals: ParsedDeal[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Map common column names
      const clientName = row['client_name'] || row['name'] || row['client'] || '';
      const clientType = (row['client_type'] || row['type'] || 'buyer').toLowerCase();
      
      if (!clientName) continue;

      deals.push({
        client_name: clientName,
        client_email: row['client_email'] || row['email'] || undefined,
        client_phone: row['client_phone'] || row['phone'] || undefined,
        client_type: clientType === 'seller' ? 'seller' : 'buyer',
        property_address: row['property_address'] || row['property'] || row['address'] || undefined,
        deal_stage: (row['deal_stage'] || row['stage'] || 'new_lead_buyer') as DealStage,
        notes: row['notes'] || undefined,
      });
    }

    return deals;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError('No valid deals found in CSV. Make sure you have a "client_name" column.');
          return;
        }
        setPreview(parsed);
      } catch (err) {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setImporting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setImporting(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const deal of preview) {
      const { error } = await supabase.from('crm_deals').insert({
        user_id: user.id,
        client_name: deal.client_name,
        client_email: deal.client_email || null,
        client_phone: deal.client_phone || null,
        client_type: deal.client_type,
        property_address: deal.property_address || null,
        deal_stage: deal.deal_stage.includes('seller') ? deal.deal_stage : 
          (deal.client_type === 'seller' ? 'new_lead_seller' : deal.deal_stage),
        notes: deal.notes || null,
        last_contact_at: new Date().toISOString(),
      });

      if (error) {
        failed++;
      } else {
        success++;
      }
    }

    setResults({ success, failed });
    setImporting(false);
    setPreview([]);

    if (success > 0) {
      router.refresh();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreview([]);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Import CSV
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-600">Import Deals</h2>
                  <p className="text-sm text-ink-200">Upload a CSV file with your deals</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-surface-50 rounded-lg">
                <X className="w-5 h-5 text-ink-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {results ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-ink-600 mb-2">Import Complete</h3>
                  <p className="text-ink-300">
                    {results.success} deals imported successfully
                    {results.failed > 0 && `, ${results.failed} failed`}
                  </p>
                  <Button className="mt-6" onClick={handleClose}>Done</Button>
                </div>
              ) : preview.length > 0 ? (
                <div>
                  <p className="text-sm text-ink-400 mb-4">
                    Found {preview.length} deals to import:
                  </p>
                  <div className="max-h-64 overflow-y-auto border border-surface-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-medium text-ink-400">Name</th>
                          <th className="text-left p-2 font-medium text-ink-400">Type</th>
                          <th className="text-left p-2 font-medium text-ink-400">Property</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-100">
                        {preview.map((deal, i) => (
                          <tr key={i}>
                            <td className="p-2 text-ink-500">{deal.client_name}</td>
                            <td className="p-2 text-ink-300 capitalize">{deal.client_type}</td>
                            <td className="p-2 text-ink-300 truncate max-w-[150px]">
                              {deal.property_address || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-surface-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-ink-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-ink-500 mb-1">
                        Click to upload CSV
                      </p>
                      <p className="text-xs text-ink-200">
                        or drag and drop
                      </p>
                    </label>
                  </div>
                  
                  <div className="mt-4 p-4 bg-surface-50 rounded-lg">
                    <p className="text-xs font-medium text-ink-400 mb-2">Expected columns:</p>
                    <p className="text-xs text-ink-300">
                      client_name (required), client_email, client_phone, client_type, property_address, notes
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {preview.length > 0 && !results && (
              <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => {
                  setPreview([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}>
                  Cancel
                </Button>
                <Button onClick={handleImport} loading={importing}>
                  Import {preview.length} Deals
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
