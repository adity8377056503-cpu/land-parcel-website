"use client";

import { X, Printer, ShieldCheck, CheckCircle2, Download, Building2 } from "lucide-react";
import { PaymentTransaction } from "@/types";
import { OFFICIAL_BUSINESS } from "@/lib/utils";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
}

export default function InvoiceModal({ isOpen, onClose, transaction }: InvoiceModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = transaction.invoice_number || `INV-LP-${transaction.id.slice(-6).toUpperCase()}`;
  const formattedDate = new Date(transaction.submitted_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-[#E2E8F0] print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        {/* Header Actions (hidden on print) */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0] mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Official Tax Invoice & Receipt
            </span>
            <span className="text-xs text-[#64748B] font-mono">{invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="space-y-6">
          {/* Company & Invoice Meta Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-[#172B4D] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#C6A66B]" />
                </div>
                <div>
                  <span className="text-xl font-bold font-display tracking-tight text-[#172B4D]">
                    LAND
                  </span>
                  <span className="text-xl font-bold font-display tracking-tight text-[#C6A66B] ml-1">
                    PARCEL
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] italic mb-2">
                {OFFICIAL_BUSINESS.tagline}
              </p>
              <div className="text-xs text-[#64748B] space-y-0.5">
                <div><strong>Business Owner:</strong> {OFFICIAL_BUSINESS.owner_name}</div>
                <div><strong>Official Email:</strong> {OFFICIAL_BUSINESS.email}</div>
                <div><strong>WhatsApp / Phone:</strong> +91 {OFFICIAL_BUSINESS.whatsapp}</div>
                <div><strong>Primary Market:</strong> {OFFICIAL_BUSINESS.primary_market}</div>
              </div>
            </div>

            <div className="sm:text-right text-xs space-y-1 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] min-w-[200px]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Invoice Number</div>
              <div className="text-base font-extrabold font-mono text-[#172B4D]">{invoiceNumber}</div>
              <div className="text-[11px] text-[#64748B]">Date: <strong>{formattedDate}</strong></div>
              <div>
                Status:{" "}
                {transaction.status === "verified" ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                    Paid & Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="bg-[#EAF3FA]/60 p-4 rounded-2xl border border-blue-100 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
              Billed To (Subscriber):
            </div>
            <div className="font-bold text-sm text-[#172B4D]">{transaction.client_name}</div>
            <div className="text-[#64748B] mt-0.5">
              Mobile: +91 {transaction.client_mobile} {transaction.client_email ? `· ${transaction.client_email}` : ""}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider">
                  <th className="py-2.5 pl-4">Description / Plan</th>
                  <th className="py-2.5">Validity</th>
                  <th className="py-2.5">Credits Added</th>
                  <th className="py-2.5 pr-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-3 pl-4">
                    <div className="font-bold text-[#172B4D]">{transaction.plan_name}</div>
                    <div className="text-[11px] text-[#64748B]">
                      Official listing subscription on Land Parcel marketplace.
                    </div>
                  </td>
                  <td className="py-3 text-[#172B4D] font-medium">
                    {transaction.amount >= 999 ? "3 Months (90 Days)" : "1 Month (30 Days)"}
                  </td>
                  <td className="py-3 text-emerald-700 font-bold">
                    +{transaction.amount >= 999 ? 50 : 20} Listing Credits
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-[#172B4D]">
                    ₹{transaction.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#F8FAFC] font-bold border-t border-[#E2E8F0]">
                  <td colSpan={3} className="py-3 pl-4 text-[#172B4D] uppercase tracking-wider text-[11px]">
                    Total Amount Paid (INR):
                  </td>
                  <td className="py-3 pr-4 text-right text-base text-[#172B4D] font-extrabold font-display">
                    ₹{transaction.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment & Audit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Payment Method:</span>
              <span className="font-semibold text-[#172B4D] capitalize">
                {transaction.payment_method.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Transaction / UTR Reference:</span>
              <code className="font-mono font-bold text-[#172B4D]">{transaction.reference_number}</code>
            </div>
          </div>

          {/* Authorized Signatory */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-xs">
            <div className="text-[#64748B] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Verified by Land Parcel System</span>
              </div>
              <p className="text-[11px]">
                This is an official computer-generated receipt issued for real estate marketplace listing credits.
              </p>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-[#172B4D] text-sm tracking-wide">
                Suraj Prakash
              </div>
              <div className="text-[11px] text-[#64748B]">Founder &amp; Business Owner</div>
              <div className="text-[10px] text-[#C6A66B] font-semibold">Land Parcel (Delhi NCR)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
