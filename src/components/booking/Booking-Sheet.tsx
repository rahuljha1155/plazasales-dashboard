import { useRef, useState } from "react";
import printJS from "print-js";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { api } from "@/services/api";
import { Icon } from "@iconify/react/dist/iconify.js";
import { BookingReplyStatus } from "@/types/booking";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-500 border-green-200";
    case "pending":
      return "bg-yellow-50 text-yellow-500 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return "✓";
    case "pending":
      return "⏳";
    case "cancelled":
      return "✕";
    default:
      return "ℹ";
  }
};

// types/booking.ts
export interface PersonalInfo {
  fullName: string;
  email: string;
  country: string;
  phoneNumber: string;
  _id: string;
}

export interface Package {
  duration: string;
  name: string;
  id: string;
}

export interface Pax {
  _id: string;
  min: number;
  max: number;
  discount: number;
}

export interface FixedDate {
  _id: string;
  package: string;
  startDate: string;
  endDate: string;
  status: string;
  numberOfPerson: number;
  pricePerPerson: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  seatsAvailable: number;
  soldSeats: number;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  adults: number;
  children: number;
  package: Package;
  fixedDateId: FixedDate;
  fixedDate: {
    _id: string;
    startDate: string;
    endDate: string;
    status: string;
    numberOfPerson: number;
    pricePerPerson: number;
    availableSeats: number;
  };
  personalInfo: PersonalInfo[];
  pax?: Pax[];
  arrivalDate: string;
  departureDate: string;
  message: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

// Helper function to calculate PAX discount
const calculatePaxDiscount = (numberOfTravelers: number, paxRules?: Pax[]): number => {
  if (!paxRules || paxRules.length === 0) return 0;

  for (const pax of paxRules) {
    if (numberOfTravelers >= pax.min && numberOfTravelers <= pax.max) {
      return pax.discount;
    }
  }
  return 0;
};

const InvoiceComponent = ({
  bookingData,
  onOpenChange,
}: {
  bookingData: Booking;
  onOpenChange: (open: boolean) => void;
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    bookingData.status
  );

  const handleDownload = async () => {
    if (isGeneratingPdf) return; // Prevent multiple simultaneous downloads

    setIsGeneratingPdf(true);

    try {
      // Add small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Always use the programmatic PDF generation method
      await generatePdfProgrammatically();
      toast.success("Invoice downloaded successfully!");
    } catch (error) {

      // Provide more specific error messages based on the error type
      let errorMessage = "Failed to download invoice. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error while generating PDF. Please check your connection and try again.";
        } else if (error.message.includes('permission') || error.message.includes('download')) {
          errorMessage = "Download blocked by browser. Please allow downloads and try again.";
        }
      }

      toast.error(errorMessage);

      // Offer alternative download method as fallback
      toast.info("Tip: You can use the 'Print PDF' button as an alternative to save the invoice.", {
        duration: 5000,
      });
    } finally {
      // Add small delay before re-enabling button to prevent rapid clicks
      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 500);
    }
  };
  // Fast print function using print-js
  const handlePrint = () => {
    try {

      // Create a temporary print content that matches PDF structure
      const printContent = createPrintContent();

      // Use print-js for better print handling
      printJS({
        printable: printContent,
        type: "raw-html",
        targetStyles: ["*"],
        header: "",
        documentTitle: `Real-Himalaya_Invoice_${bookingData.bookingReference}`,
        css: [
          `
          @page { 
            margin: 0.5in; 
            size: A4; 
          }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            color: black; 
            background: white; 
          }
          .print-header { 
            background-color: #f5f5f5; 
            padding: 20pt; 
            margin-bottom: 20pt; 
            border-bottom: 2pt solid #ddd; 
          }
          .print-logo { 
            width: 80pt; 
            height: 20pt; 
            float: left; 
            margin-right: 10pt; 
          }
          .print-title { 
            font-size: 16pt; 
            font-weight: bold; 
            color: #e83759; 
            float: right; 
            margin-top: 5pt; 
          }
          .print-section { 
            margin-bottom: 15pt; 
            page-break-inside: avoid; 
          }
          .print-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10pt 0; 
          }
          .print-table th, .print-table td { 
            border: 1px solid #ddd; 
            padding: 8pt; 
            text-align: left; 
          }
          .print-table th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .print-totals { 
            float: right; 
            width: 200pt; 
            margin-top: 20pt; 
          }
          .print-footer { 
            background-color: #2d3748; 
            color: white; 
            padding: 15pt; 
            text-align: center; 
            margin-top: 30pt; 
          }
          .clearfix::after { 
            content: ""; 
            display: table; 
            clear: both; 
          }
        `,
        ],
      });
      toast.success("Print dialog opened!");
    } catch (error) {
      toast.error("Print function failed. Error: " + (error instanceof Error ? error.message : "Unknown error"));

      // Fallback to browser print with modified content
      window.print();
    }
  };

  // Create print content that matches PDF structure
  const createPrintContent = () => {
    const user = bookingData.personalInfo[0] || {};
    const unitPrice = bookingData.fixedDate?.pricePerPerson || 0;
    const quantity = bookingData.personalInfo.length;

    // Use actual booking total if available, otherwise calculate manually
    const actualTotal = bookingData.totalAmount || 0;
    const currency = bookingData.currency || "USD";


    // Calculate breakdown with PAX discount if available
    const subtotal = unitPrice * quantity;
    const paxDiscountPercent = calculatePaxDiscount(quantity, bookingData.pax);
    const discountAmount = subtotal * (paxDiscountPercent / 100);
    const total = actualTotal > 0 ? actualTotal : subtotal - discountAmount;

    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${bookingData.bookingReference}</title>
    </head>
    <body>
     <div
  id="invoice-content"
  style="background-color: white; max-width: 80rem; margin: 0 auto; border-radius: 4px; border: 1px solid #e5e7eb; overflow: hidden;"
>
  <div style="display: flex; justify-content: center; align-items: center;">
    <h2 style="font-size: 1.875rem; font-weight: 600; margin-top: 1.5rem;">INVOICE</h2>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
    <div>
      <h2 style="font-size: 1.5rem; font-weight: 600;">Real Himalaya Pvt. Ltd</h2>
      <p>Pulchowk, Lalitpur, Nepal</p>
      <p>info@realhimalaya.com</p>
    </div>
    <div style="display: flex; justify-content: flex-end;">
      <img src="/logo/realHimalaya.svg" alt="real himalaya" style="width: 11rem;" />
    </div>
  </div>

  <!-- Company and Client Info -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.5rem;">
    <!-- To -->
    <div>
      <h3 style="font-weight: 600; color: #111827; padding-bottom: 0.5rem; font-size: 1.25rem;">Bill To</h3>
      <!-- Dynamic user info -->
      <div>
        <p style="font-size: 1.125rem;">${user.fullName || 'N/A'}</p>
        <div style="font-size: 0.875rem;">
          ${user.email ? `<p><a href="mailto:${user.email}" style="font-size: 1.125rem; text-decoration: none;">${user.email}</a></p>` : ''}
          ${user.phoneNumber ? `<p><a href="tel:${user.phoneNumber}" style="font-size: 1.125rem; color: #111827; text-decoration: none;">${user.phoneNumber}</a></p>` : ''}
          ${user.country ? `<p style="font-size: 1.125rem;">${user.country}</p>` : ''}
        </div>
      </div>
    </div>

    <!-- Details -->
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="font-weight: 600; display: flex; justify-content: space-between; align-items: center; color: #111827; padding-bottom: 0.5rem; font-size: 1.25rem;">
        <span>INVOICE NO :</span> <span>${bookingData.bookingReference}</span>
      </li>
      <li style="display: flex; justify-content: space-between; align-items: center; color: #111827; font-size: 1.125rem;">
        <span>Invoice Date :</span> <span>${new Date(bookingData.updatedAt).toLocaleDateString()}</span>
      </li>
      <li style="display: flex; justify-content: space-between; align-items: center; color: #111827; font-size: 1.125rem;">
        <span>Due Date :</span> <span>${bookingData?.fixedDate?.endDate ? new Date(bookingData.fixedDate.endDate).toLocaleDateString() : "N/A"}</span>
      </li>
      <li style="display: flex; justify-content: space-between; align-items: center; color: #111827; font-size: 1.125rem;">
        <span>Booking Status :</span>
        <span style="display: inline-flex; text-transform: uppercase; align-items: center; border: 1px solid #10b981; border-radius: 3px; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 500; color: #10b981;">${bookingData.status}</span>
      </li>
    </ul>
  </div>

  <!-- Items Table -->
  <div style="padding: 1.5rem; border-top: 1px solid #e5e7eb;">
    <h3 style="font-weight: 600; color: #111827; margin-bottom: 1rem; font-size: 1.125rem;">Invoice Items</h3>
    <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <tr>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">#</th>
            <th style="padding: 0.75rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">Description</th>
            <th style="padding: 0.75rem; text-align: center; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">Travelers</th>
            <th style="padding: 0.75rem; text-align: center; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">Duration</th>
            <th style="padding: 0.75rem; text-align: right; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">Unit Price</th>
            <th style="padding: 0.75rem; text-align: right; font-size: 0.75rem; font-weight: 500; color: #374151; text-transform: uppercase;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="transition: background-color 0.2s;">
            <td style="padding: 0.75rem; font-size: 0.875rem; font-weight: 500;">1</td>
            <td style="padding: 0.75rem; font-size: 0.875rem;">
              <p style="font-weight: 500; color: #111827;">${bookingData.package?.name || 'Adventure Package'}</p>
              <p style="margin-top: 0.25rem; font-size: 0.75rem; color: #6b7280;">${bookingData.fixedDate && new Date(bookingData.fixedDate.startDate).toLocaleDateString()} - ${bookingData.fixedDate && new Date(bookingData.fixedDate.endDate).toLocaleDateString()}</p>
            </td>
            <td style="padding: 0.75rem; text-align: center; font-size: 0.875rem; font-weight: 500; color: #374151;">${quantity}</td>
            <td style="padding: 0.75rem; text-align: center; font-size: 0.875rem; font-weight: 500; color: #374151;">${bookingData.package?.duration ? bookingData.package.duration + ' Days' : 'N/A'}</td>
            <td style="padding: 0.75rem; text-align: right; font-size: 0.875rem; font-weight: 500; color: #374151;">$${unitPrice.toFixed(2)}</td>
            <td style="padding: 0.75rem; text-align: right; font-size: 0.875rem; font-weight: 600; color: #111827;">$${subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Totals and Notes -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; padding: 1.5rem;">
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 600;">Payment Summary</h2>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 500;">Subtotal:</span>
        <span style="font-weight: 600; color: #111827;">$${subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 500;">Discount (0%):</span>
        <span style="font-weight: 500;">-$0.00</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 500;">PAX Discount (${paxDiscountPercent}%):</span>
        <span style="font-weight: 600; color: #111827;">-$${discountAmount.toFixed(2)}</span>
      </div>
      <hr style="border: 1px solid #d1d5db;" />
      <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
        <span style="font-weight: 600; color: #111827;">Total Amount:</span>
        <span style="font-size: 1.25rem; font-weight: 700; color: #059669;">$${total.toFixed(2)}</span>
      </div>
    </div>
  </div>
</div>

    </body>
  </html>`;
  };

  // Status options for the dropdown
  const statusOptions = [
    {
      value: BookingReplyStatus.APPROVED,
      label: "Approved",
      description: "Accept the booking request",
      color: "text-green-600",
    },
    {
      value: BookingReplyStatus.DECLINED,
      label: "Declined",
      description: "Reject the booking request",
      color: "text-red-600",
    },
    {
      value: BookingReplyStatus.RESCHEDULED,
      label: "Rescheduled",
      description: "Request to reschedule the booking",
      color: "text-primary",
    },
    {
      value: BookingReplyStatus.PENDING,
      label: "Pending",
      description: "Keep the booking under review",
      color: "text-yellow-500",
    },
  ];

  // Handle status change and navigate to reply page
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    // Navigate to reply page with the selected status as URL parameter
    navigate(
      `/dashboard/bookings/reply/${bookingData._id}?status=${newStatus}`
    );
  };

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      const payload: { reason?: string } = {};
      if (cancellationReason.trim()) {
        payload.reason = cancellationReason;
      }

      const response = await api.patch(
        `/booking/${bookingData?._id}/cancel`,
        payload
      );

      if (response.status !== 200) {
        throw new Error("Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      setShowCancelDialog(false);
      onOpenChange?.(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  // Fast programmatic PDF generation using jsPDF - matches print content exactly
  const generatePdfProgrammatically = async () => {
    try {
      // Calculate values
      const actualTotal = bookingData.totalAmount || 0;
      const currency = bookingData.currency || "USD";
      const currencySymbol =
        currency === "USD" ? "$" :
          currency === "EUR" ? "€" :
            currency === "GBP" ? "£" : "$";

      const unitPrice = bookingData.fixedDate?.pricePerPerson || 0;
      const quantity = bookingData.personalInfo.length;
      const subtotal = unitPrice * quantity;
      const paxDiscountPercent = calculatePaxDiscount(quantity, bookingData.pax);
      const discountAmount = subtotal * (paxDiscountPercent / 100);
      const total = actualTotal > 0 ? actualTotal : subtotal - discountAmount;

      // Create a new PDF instance for each download
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 20;

      // ---------- HEADER ----------
      try {
        const logo = await loadImageAsBase64("/logo/realHimalaya.svg");
        if (logo) {
          pdf.addImage(logo, "PNG", pageWidth - 70, 10, 50, 15);
        } else {
          pdf.setFontSize(12).setFont("helvetica", "bold");
          pdf.text("Real Himalaya Pvt. Ltd", pageWidth - 70, 20);
        }
      } catch {
        pdf.setFontSize(12).setFont("helvetica", "bold");
        pdf.text("Real Himalaya Pvt. Ltd", pageWidth - 70, 20);
      }

      pdf.setFontSize(18).setFont("helvetica", "bold");
      pdf.text("INVOICE", pageWidth / 2, y, { align: "center" });

      y += 15;

      // ---------- COMPANY INFO ----------
      pdf.setFontSize(12).setFont("helvetica", "bold");
      pdf.text("Real Himalaya Pvt. Ltd", 15, y);
      pdf.setFontSize(9).setFont("helvetica", "normal");
      pdf.text("Pulchowk, Lalitpur, Nepal", 15, y + 6);
      pdf.text("info@realhimalaya.com", 15, y + 12);

      // ---------- INVOICE DETAILS ----------
      pdf.setFontSize(11).setFont("helvetica", "bold");
      pdf.text(`INVOICE NO: ${bookingData.bookingReference}`, pageWidth - 90, y);
      pdf.setFontSize(9).setFont("helvetica", "normal");
      pdf.text(`Invoice Date: ${new Date(bookingData.updatedAt).toLocaleDateString()}`, pageWidth - 90, y + 6);
      pdf.text(`Due Date: ${new Date(bookingData.fixedDate.endDate).toLocaleDateString()}`, pageWidth - 90, y + 12);
      pdf.text(`Status: ${bookingData.status}`, pageWidth - 90, y + 18);

      y += 30;

      // ---------- BILL TO ----------
      pdf.setFontSize(12).setFont("helvetica", "bold");
      pdf.text("Bill To", 15, y);

      const user = bookingData.personalInfo[0] || {};
      pdf.setFontSize(10).setFont("helvetica", "normal");
      y += 6;
      pdf.text(user.fullName || "N/A", 15, y);
      if (user.email) { y += 5; pdf.text(user.email, 15, y); }
      if (user.phoneNumber) { y += 5; pdf.text(user.phoneNumber, 15, y); }
      if (user.country) { y += 5; pdf.text(user.country, 15, y); }

      y += 15;

      // ---------- ITEMS TABLE ----------
      pdf.setFontSize(11).setFont("helvetica", "bold");
      pdf.text("Invoice Items", 15, y);
      y += 8;

      // Table configuration
      const tableStartY = y;
      const tableWidth = 180;
      const tableStartX = 15;
      const rowHeight = 8;
      const headers = ["#", "Description", "Travelers", "Duration", "Unit Price", "Total"];
      const colWidths = [10, 60, 20, 20, 25, 25]; // Column widths
      const startX = [15, 25, 85, 105, 125, 155]; // Column start positions

      // Draw table border (outer rectangle)
      pdf.setLineWidth(0.5);
      pdf.rect(tableStartX, tableStartY, tableWidth, rowHeight * 2); // Full table border

      // Draw column separators (vertical lines)
      let currentX = tableStartX;
      for (let i = 0; i < colWidths.length; i++) {
        currentX += colWidths[i];
        if (i < colWidths.length - 1) { // Don't draw line after last column
          pdf.line(currentX, tableStartY, currentX, tableStartY + rowHeight * 2);
        }
      }

      // Draw header row separator (horizontal line)
      pdf.line(tableStartX, tableStartY + rowHeight, tableStartX + tableWidth, tableStartY + rowHeight);

      // Header text
      headers.forEach((h, i) => {
        pdf.setFontSize(9).setFont("helvetica", "bold");
        pdf.text(h, startX[i] + 2, y + 5); // Add padding from left border
      });

      y += rowHeight;

      // Data row text
      pdf.setFontSize(9).setFont("helvetica", "normal");
      pdf.text("1", startX[0] + 2, y + 5);

      // Truncate long package names to fit in column
      const packageName = bookingData.package?.name || "Adventure Package";
      const maxNameLength = 25; // Adjust based on column width
      const displayName = packageName.length > maxNameLength
        ? packageName.substring(0, maxNameLength - 3) + "..."
        : packageName;
      pdf.text(displayName, startX[1] + 2, y + 5);

      pdf.text(quantity.toString(), startX[2] + 2, y + 5);
      pdf.text(
        bookingData.package?.duration ? bookingData.package?.duration + " Days" : "N/A",
        startX[3] + 2,
        y + 5
      );
      pdf.text(`${currencySymbol}${unitPrice.toFixed(2)}`, startX[4] + colWidths[4] - 2, y + 5, { align: "right" });
      pdf.text(`${currencySymbol}${subtotal.toFixed(2)}`, startX[5] + colWidths[5] - 2, y + 5, { align: "right" });

      y += rowHeight + 12; // Add extra spacing after table

      // ---------- PAYMENT SUMMARY ----------
      pdf.setFontSize(12).setFont("helvetica", "bold");
      pdf.text("Payment Summary", 15, y);

      y += 8;
      pdf.setFontSize(10).setFont("helvetica", "normal");
      pdf.text("Subtotal:", 140, y);
      pdf.text(`${currencySymbol}${subtotal.toFixed(2)}`, 200, y, { align: "right" });

      y += 6;
      pdf.text("Discount (0%):", 140, y);
      pdf.text("-$0.00", 200, y, { align: "right" });

      y += 6;
      pdf.text(`PAX Discount (${paxDiscountPercent}%):`, 140, y);
      pdf.text(`-${currencySymbol}${discountAmount.toFixed(2)}`, 200, y, { align: "right" });

      y += 6;
      pdf.line(140, y, 200, y);

      y += 8;
      pdf.setFontSize(11).setFont("helvetica", "bold");
      pdf.text("Total Amount:", 140, y);
      pdf.text(`${currencySymbol}${total.toFixed(2)}`, 200, y, { align: "right" });

      // ---------- FOOTER ----------
      const footerY = pageHeight - 20;
      pdf.setFontSize(8).setFont("helvetica", "normal");
      pdf.text(
        "Real Himalaya Pvt. Ltd. - Your Gateway to Extraordinary Adventures",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );
      pdf.text(
        `© ${new Date().getFullYear()} All rights reserved | Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        footerY + 6,
        { align: "center" }
      );

      // Save with timestamp to ensure unique filename for each download
      const timestamp = new Date().getTime();
      const fileName = `Real-Himalaya_Invoice_${bookingData.bookingReference}_${timestamp}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      throw error; // Re-throw the error so handleDownload can catch it
    }
  };

  // Helper to load image
  const loadImageAsBase64 = (imagePath: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve("");
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve("");
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");

          // Clean up
          canvas.width = 0;
          canvas.height = 0;

          resolve(dataUrl);
        } catch (error) {
          resolve("");
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve("");
      };

      // Add cache busting parameter to avoid browser cache issues
      const cacheBuster = new Date().getTime();
      img.src = `${imagePath}?t=${cacheBuster}`;
    });
  };




  // Use actual booking total if available, otherwise calculate manually
  const actualTotal = bookingData.totalAmount || 0;
  const currency = bookingData.currency || "USD";
  const currencySymbol =
    currency === "USD"
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : "$";

  // Calculate breakdown with PAX discount if available
  const unitPrice = bookingData.fixedDate?.pricePerPerson || 0;
  const quantity = bookingData.personalInfo.length;
  const subtotal = unitPrice * quantity;
  const paxDiscountPercent = calculatePaxDiscount(quantity, bookingData.pax);
  const discountAmount = subtotal * (paxDiscountPercent / 100);
  const total = actualTotal > 0 ? actualTotal : subtotal - discountAmount;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable, .printable * {
            visibility: visible;
          }
          .printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-one !important;
            background: white !important;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          /* Ensure colors print correctly */
          .printable * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Optimize table printing */
          .printable table {
            page-break-inside: auto;
          }
          .printable tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          .printable thead {
            display: table-header-group;
          }
          .printable tfoot {
            display: table-footer-group;
          }
          /* Remove borders for print */
          .printable .border {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          .printable .rounded-sm, .printable .rounded-sm {
            border-radius: 8px !important;
          }
        }
        
        /* Ensure good PDF rendering */
        .printable {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
      `}</style>

      <div className="printable hidden" id="pdf-content">
        {createPrintContent()}
      </div>

      {/* Download Instructions */}
      {/* <div className="w-full mb-4 p-4 bg-orange-50 border border-gray-200 rounded-sm no-print">
        <div className="flex items-start space-x-3">
          <Icon icon="solar:info-circle-bold" width="20" height="20" className="text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-900 mb-1">Download Options</h4>
            <div className="text-sm text-orange-800 space-y-1">
              <p><strong>Save as PDF:</strong> Downloads invoice as PDF file</p>
              <p><strong>Print/Save PDF:</strong> Opens print dialog (you can save as PDF from there)</p>
              <p><strong>Download HTML:</strong> Downloads as HTML file if PDF fails</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="w-full flex flex-wrap justify-between items-center gap-4 mb-6 p-4 bg-gray-50 rounded-sm border border-gray-200 no-print">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              icon={isGeneratingPdf ? "solar:loader-bold" : "solar:download-bold"}
              width="16"
              height="16"
              className={`mr-2 ${isGeneratingPdf ? "animate-spin" : ""}`}
            />
            {isGeneratingPdf ? "Generating..." : "Save as PDF"}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="px-4 py-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-sm transition-colors"
          >
            <Icon
              icon="solar:printer-bold"
              width="16"
              height="16"
              className="mr-2"
            />
            Print PDF
          </Button>

          {bookingData.status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              className="px-4 py-2 gap-2 text-white font-medium bg-red-500 hover:bg-red-600 rounded-sm transition-colors"
            >
              <Icon
                icon="solar:trash-bin-minimalistic-bold"
                width="16"
                height="16"
              />
              Cancel
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="px-4 py-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-sm transition-colors"
          >
            <Icon
              icon="solar:close-circle-bold"
              width="16"
              height="16"
              className="mr-2"
            />
            Close
          </Button>
        </div>

        <div className="">
          {/* Status Dropdown */}
          <div className="flex gap-3 items-center no-print">
            <Select
              value={selectedStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full max-w-xs bg-white border-gray-300 hover:border-gray-400 focus:border-orange-500 rounded-sm">
                <SelectValue placeholder="Select status to reply" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span className={`font-medium ${option.color}`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Invoice Container */}
      <div
        id="invoice-content"
        ref={invoiceRef}
        className="bg-white rounded-sm border border-gray-200 printable overflow-hidden max-w-full mx-auto"
      >
        <div className="flex justify-center items-center">
          <h2 className="text-3xl font-semibold mt-6">INVOICE</h2>
        </div>
        <div className="grid border-b grid-cols-2 gap-6 p-6 ">
          <div className="">
            <h2 className="text-2xl font-semibold">Real Himalaya Pvt. Ltd</h2>
            <p>Pulchowk, Lalitpur, Nepal</p>
            <p>info@realhimalaya.com</p>
          </div>
          <div className="flex justify-end">
            <img src="/logo/realHimalaya.svg" alt="real himalaya" className="w-44" />
          </div>
        </div>
        {/* Company and Client Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 py-6">
          {/* To */}
          <div className="">
            <h3 className="font-semibold text-gray-900  pb-2 text-xl">
              Bill To
            </h3>
            {bookingData.personalInfo.map((user: any, index: number) => (
              <ul
                key={user._id}
                className={`  ${index > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""
                  }`}
              >
                <li className=" text-lg">
                  {user.fullName}
                </li>
                <li className=" text-sm">
                  {user.email && (
                    <p className="flex items-center ">
                      <a
                        href={`mailto:${user.email}`}
                        className=" text-lg hover:underline transition-colors"
                      >
                        {user.email}
                      </a>
                    </p>
                  )}
                  {user.phoneNumber && (
                    <p className="flex items-center ">
                      <a
                        href={`tel:${user.phoneNumber}`}
                        className=" hover:text-gray-900 text-lg transition-colors"
                      >
                        {user.phoneNumber}
                      </a>
                    </p>
                  )}
                  {user.country && (
                    <p className="flex items-center text-lg">
                      {user.country}
                    </p>
                  )}
                </li>
              </ul>
            ))}
          </div>

          {/* Details */}
          <ul className="">
            <li className="font-semibold flex justify-between items-center text-gray-900 pb-2  text-xl">
              <span>INVOICE NO :</span> <span>{bookingData.bookingReference}</span>
            </li>
            <li className=" flex justify-between items-center text-gray-900   text-lg">
              <span>Invoice Date :</span> <span>{new Date(bookingData.updatedAt).toLocaleDateString()}</span>
            </li>
            <li className=" flex justify-between items-center text-gray-900   text-lg">
              <span>Due Date :</span> <span>{bookingData?.fixedDate?.endDate ? new Date(bookingData?.fixedDate?.endDate).toLocaleDateString() : "N/A"}</span>
            </li>
            <li className=" flex justify-between items-center text-gray-900   text-lg">
              <span>Booking Status :</span><span
                className={`inline-flex uppercase items-center rounded-sm px-2 py-1 text-xs font-medium border ${getStatusColor(
                  bookingData.status
                )}`}
              >
                {bookingData.status}
              </span>
            </li>
          </ul>
        </div>



        {/* Items Table */}
        <div className="px-6 py-6  border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 text-lg">
            Invoice Items
          </h3>
          <div className="overflow-x-auto rounded-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Travelers
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm  font-medium">
                    1
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {bookingData.package?.name || "Adventure Package"}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Icon
                          icon="solar:calendar-bold"
                          width="12"
                          height="12"
                          className="mr-1"
                        />
                        {bookingData.fixedDate &&
                          format(
                            new Date(bookingData.fixedDate.startDate),
                            "MMM d"
                          )}{" "}
                        -{" "}
                        {bookingData.fixedDate &&
                          bookingData?.fixedDate?.endDate ?
                          format(
                            new Date(bookingData.fixedDate.endDate),
                            "MMM d, yyyy"
                          ) : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center font-medium">
                    {bookingData.personalInfo.length || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center font-medium">
                    {bookingData.package?.duration
                      ? bookingData?.package?.duration + " Days"
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">
                    $
                    {bookingData.fixedDate?.pricePerPerson?.toFixed(2) ||
                      "0.00"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    $
                    {(
                      bookingData.personalInfo.length *
                      (bookingData.fixedDate?.pricePerPerson || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Notes */}
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6 ">
          <div className="">
            <h2 className="text-xl font-semibold">Payment Summary</h2>
          </div>
          {/* Totals */}
          <div className="">
            <div className="space-y-4">
              <div className=" rounded-sm  space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className=" font-medium">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className=" font-medium">
                    Discount (0%):
                  </span>
                  <span className=" font-medium">-$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className=" font-medium">PAX Discount ({paxDiscountPercent}%):</span>
                  <span className="font-semibold text-gray-900">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >

      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </AlertDialogDescription>
            <div className="mt-4">
              <label
                htmlFor="cancellationReason"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                Reason for cancellation (optional)
              </label>
              <Input
                id="cancellationReason"
                placeholder="Please provide a reason for cancellation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Back</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="px-6 py-2.5 text-white font-medium cursor-pointer bg-red-500 hover:bg-red-600 rounded-sm transition-all duration-200"
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </>
  );
};

export default InvoiceComponent;
