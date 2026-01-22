import { useRef, useState } from "react";
import printJS from "print-js";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
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
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-50 text-zinc-800";
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
  personalInfo: PersonalInfo[];
  arrivalDate: string;
  departureDate: string;
  message: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

const CustomBookingInvoiceComponent = ({
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
      color: "text-orange-600",
    },
    {
      value: BookingReplyStatus.PENDING,
      label: "Pending",
      description: "Keep the booking under review",
      color: "text-yellow-500",
    },
  ];

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
        documentTitle: `Real-Himalaya_Custom_Invoice_${bookingData.bookingReference}`,
        css: [
          `
          @page { 
            margin: 0.5in; 
            size: A4; 
          }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.4; 
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
    } catch (error) {
      // Fallback to browser print
      window.print();
    }
  };

  // Create print content that matches PDF structure
  const createPrintContent = () => {
    const user = bookingData.personalInfo[0] || {};
    const subtotal = bookingData.totalAmount;
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${bookingData.bookingReference}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 40px;
          color: #333;
          font-size: 14px;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #3B82F6;
          color: white;
          padding: 15px;
          margin-bottom: 30px;
        }

        .print-logo {
          height: 50px;
        }

        .print-title {
          font-size: 28px;
          font-weight: bold;
          color: white;
        }

        .print-section {
          margin-bottom: 15px;
        }

        .print-section h3 {
          margin-bottom: 5px;
          font-size: 16px;
          color: #3B82F6;
        }

        .print-section p {
          margin: 2px 0;
        }

        .from-to {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .from-to > div {
          flex: 1;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 30px;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }

        .print-table th {
          background-color: #F5F5F5;
          color: #000;
        }

        .print-totals {
          text-align: right;
          margin-top: 10px;
        }

        .print-totals p {
          margin: 5px 0;
          font-size: 15px;
        }

        .print-footer {
          margin-top: 20px;
          text-align: center;
          border-top: 1px dashed #aaa;
          padding-top: 15px;
          font-size: 13px;
          color: #777;
        }

        @media print {
          body {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="print-header">
        <img src="/logo/Real-Himalaya.png" alt="Real-Himalaya" class="print-logo" />
        <div class="print-title">INVOICE</div>
      </div>

      <!-- Invoice Info -->
      <div class="print-section">
        <p><strong>Invoice #:</strong> ${bookingData.bookingReference}</p>
        <p><strong>Date:</strong> ${format(new Date(), "MMM d, yyyy")}</p>
      </div>

      <!-- From and Bill To in Flex -->
      <div class="print-section from-to">
        <div>
          <h3>From:</h3>
          <p><strong>Real-Himalaya Pvt. Ltd.</strong></p>
          <p>Pulchowk, Lalitpur, Nepal</p>
          <p>Email: support@Real-Himalayaadventure.com</p>
        </div>
        <div>
          <h3>Bill To:</h3>
          <p><strong>${user.fullName || "N/A"}</strong></p>
          ${user.email ? `<p>Email: ${user.email}</p>` : ""}
          ${user.phoneNumber ? `<p>Phone: ${user.phoneNumber}</p>` : ""}
          ${user.country ? `<p>Country: ${user.country}</p>` : ""}
        </div>
      </div>

      <!-- Package Info -->
      <div class="print-section">
        <h3>Package Details:</h3>
        <p><strong>Package:</strong> ${bookingData.package?.name || "Custom Adventure Package"
      }</p>
        <p><strong>Duration:</strong> ${bookingData.package?.duration || "Custom"
      }</p>
        ${bookingData.arrivalDate
        ? `
          <p><strong>Arrival Date:</strong> ${format(
          new Date(bookingData.arrivalDate),
          "MMM d, yyyy"
        )}</p>
        `
        : ""
      }
        ${bookingData.departureDate
        ? `
          <p><strong>Departure Date:</strong> ${format(
          new Date(bookingData.departureDate),
          "MMM d, yyyy"
        )}</p>
        `
        : ""
      }
        <p><strong>Travelers:</strong> ${bookingData.personalInfo.length}</p>
        <p><strong>Adults:</strong> ${bookingData.adults || 0}</p>
        <p><strong>Children:</strong> ${bookingData.children || 0}</p>
      </div>

      <!-- Pricing Table -->
      <div class="print-section">
        <table class="print-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Travelers</th>
              <th>Duration</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${bookingData.package?.name || "Custom Adventure Package"
      }</td>
              <td>${bookingData.personalInfo.length}</td>
              <td>${bookingData.package?.duration || "Custom"}</td>
              <td>$${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="print-totals">
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>VAT (15%):</strong> $${vat.toFixed(2)}</p>
        <hr>
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      </div>

      <!-- Message -->
      ${bookingData.message
        ? `
        <div class="print-section" style="margin-top: 30px;">
          <h3>Message:</h3>
          <p>${bookingData.message}</p>
        </div>
      `
        : ""
      }

      <!-- Footer -->
      <div class="print-footer">
        <p><strong>Real-Himalaya Pvt. Ltd. - Your Gateway to Extraordinary Adventures</strong></p>
        <p>© ${new Date().getFullYear()} All rights reserved | Generated on ${format(
        new Date(),
        "MMM d, yyyy"
      )}</p>
      </div>
    </body>
    </html>`;
  };

  // Handle status change and navigate to reply page
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    // Navigate to custom booking reply page with the selected status as URL parameter
    navigate(
      `/dashboard/custom-bookings/reply/${bookingData._id}?status=${newStatus}`
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

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading("Generating PDF...");

      // Get the print content HTML
      const printContent = createPrintContent();

      // Create a blob with the HTML content
      const blob = new Blob([printContent], { type: "text/html" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Real-Himalaya_Custom_Invoice_${bookingData.bookingReference
        }_${format(new Date(), "yyyy-MM-dd")}.html`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {

      // Provide more specific error messages
      let errorMessage = "Failed to download invoice. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('download')) {
          errorMessage = "Download blocked by browser. Please allow downloads and try again.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error while generating invoice. Please check your connection.";
        }
      }

      toast.error(errorMessage);

      // Offer alternative method
      toast.info("Tip: You can use the 'Print' button as an alternative to save the invoice.", {
        duration: 5000,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const vat = bookingData.totalAmount * 0.15;
  const total = bookingData.totalAmount + vat;

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
            box-shadow: none;
            background: white;
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
          }
          .printable .rounded-sm {
            border-radius: 2px !important;
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

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row justify-between gap-4 mb-6 no-print">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSavePdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            {isGeneratingPdf ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Generating...
              </>
            ) : (
              <>
                <Icon
                  icon="solar:download-bold"
                  width="18"
                  height="18"
                  className="mr-2"
                />
                Save as PDF
              </>
            )}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="px-4 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-sm transition-all duration-200 cursor-pointer bg-white"
          >
            <Icon
              icon="solar:printer-bold"
              width="18"
              height="18"
              className="mr-2"
            />
            Print PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            className="px-4 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-sm transition-all duration-200 cursor-pointer bg-white"
          >
            Close
          </Button>
          {bookingData.status !== "cancelled" && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              className="px-4 py-2 text-white cursor-pointer bg-red-500 hover:bg-red-600 border-0 rounded-sm transition-all duration-200"
            >
              Cancel Booking
            </Button>
          )}
        </div>

        <Link
          to={`/dashboard/custom-bookings/reply/${bookingData._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-sm transition-all duration-200"
        >
          <Icon icon="solar:reply-bold-duotone" width="20" height="20" />
          Reply Email
        </Link>
      </div>

      {/* Invoice Container */}
      <div
        id="custom-invoice-content"
        ref={invoiceRef}
        className="bg-white rounded-sm border border-gray-200 printable overflow-hidden"
      >
        {/* Invoice Header */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start  gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16  rounded-sm flex items-center justify-center ">
                  <img
                    src="/logo/realHimalaya-logo.svg"
                    alt="Real-Himalaya Logo"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    INVOICE
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg">
                    #{bookingData.bookingReference}
                  </p>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="mt-4 space-y-2 no-print">
                <label className="text-gray-700 font-medium text-sm">
                  Change Status & Reply:
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full max-w-xs bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded-sm">
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
                <p className="text-xs text-gray-500">
                  Selecting a status will open the reply form with that status
                  pre-selected
                </p>
              </div>

              <p className="text-gray-600 mt-3 text-sm">
                Issued:{" "}
                {bookingData.createdAt
                  ? format(new Date(bookingData.createdAt), "MMMM do, yyyy")
                  : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-lg">
                Real-Himalaya Pvt. Ltd.
              </p>
              <p className="text-gray-600 text-sm mt-1">Pulchowk, Lalitpur, Nepal</p>
              <p className="text-gray-600 text-sm">+977-9800000000</p>
              <p className="text-blue-600 text-sm font-medium mt-1">
                support@Real-Himalayaadventure.com
              </p>
            </div>
          </div>
        </div>

        {/* Company and Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* From */}
          <div className="bg-white p-5 rounded-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              From
            </h3>
            <address className="not-italic text-gray-700 space-y-1.5">
              <p className="font-medium">Real-Himalaya Pvt. Ltd.</p>
              <p>Pulchowk, Lalitpur</p>
              <p>Nepal</p>
              <p>
                <a
                  href="mailto:support@Real-Himalayaadventure.com"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  support@Real-Himalayaadventure.com
                </a>
              </p>
              <p>
                <a href="tel:+9779800000000" className="text-gray-700">
                  +977-9800000000
                </a>
              </p>
            </address>
          </div>

          {/* To */}
          <div className="bg-white p-5 rounded-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              To
            </h3>
            {bookingData.personalInfo.map((user: any) => (
              <div key={user._id} className="text-gray-700 space-y-1.5">
                <p className="font-medium">{user.fullName}</p>
                {user.email && (
                  <p>
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {user.email}
                    </a>
                  </p>
                )}
                {user.phoneNumber && (
                  <p>
                    <a
                      href={`tel:${user.phoneNumber}`}
                      className="text-gray-700"
                    >
                      {user.phoneNumber}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="bg-white p-5 rounded-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              Details
            </h3>
            <div className="space-y-2.5 text-gray-700">
              <div className="flex items-start">
                <span className="w-24 text-gray-600 text-sm">Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium ${getStatusColor(
                    bookingData.status
                  )}`}
                >
                  {getStatusIcon(bookingData.status)} {bookingData.status}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 text-sm">Booked At:</span>
                <span className="text-sm">
                  {bookingData.createdAt
                    ? format(
                      new Date(bookingData.createdAt),
                      "MMM d, yyyy h:mm a"
                    )
                    : "N/A"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 text-sm">Arrival:</span>
                <span className="text-sm">
                  {bookingData.arrivalDate
                    ? format(new Date(bookingData.arrivalDate), "MMM d, yyyy")
                    : "N/A"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-600 text-sm">Travellers:</span>
                <span className="text-sm">{bookingData.personalInfo.length || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookingData.personalInfo.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.item}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {item.desc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ${item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals and Notes */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes */}
          <div className="bg-blue-50 p-5 rounded-sm border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">Notes</h3>
            <p className="text-gray-700 text-sm">
              Thank you for choosing Real-Himalaya. Please feel free to contact
              us if you have any questions regarding this invoice.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-medium text-gray-800 mb-2">
                Payment Information
              </h4>
              <p className="text-sm text-gray-700">
                Bank Transfer: Himalayan Bank Ltd.
                <br />
                Account #: 0123456789
                <br />
                SWIFT: HIMANPKA
              </p>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-5 rounded-sm border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">
                  ${bookingData.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount (0%):</span>
                <span className="text-red-600">-${0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (15%):</span>
                <span className="font-medium text-gray-800">${vat.toFixed(2)}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-300">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Payment due upon receipt
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white p-6 text-center">
          <p className="font-semibold">Real-Himalaya</p>
          <p className="text-gray-300 text-sm mt-1">
            Pulchowk, Lalitpur, Nepal • support@Real-Himalayaadventure.com •
            +977-9800000000
          </p>
          <p className="text-gray-400 text-xs mt-3">
            Invoice generated on {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

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
              className="text-white cursor-pointer bg-red-500 hover:bg-red-500"
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
      </AlertDialog>
    </>
  );
};

export default CustomBookingInvoiceComponent;
