import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  product_sr_number: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderBillProps {
  order: {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    order_items: OrderItem[];
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export const OrderBill = ({ order, customerName, customerPhone, customerEmail }: OrderBillProps) => {
  const generateBillHTML = () => {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - Order #${order.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #4B164C; padding-bottom: 20px; }
          .company-info h1 { color: #4B164C; font-size: 28px; margin-bottom: 5px; }
          .company-info p { color: #666; font-size: 12px; line-height: 1.6; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { color: #4B164C; font-size: 24px; margin-bottom: 10px; }
          .invoice-details p { font-size: 14px; color: #666; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .billing-info > div { flex: 1; }
          .billing-info h3 { font-size: 14px; color: #4B164C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
          .billing-info p { font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #4B164C; color: white; padding: 12px; text-align: left; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { display: flex; justify-content: flex-end; }
          .totals-table { width: 300px; }
          .totals-table td { padding: 8px 12px; }
          .totals-table .grand-total { background: #f8f8f8; font-weight: bold; font-size: 18px; color: #4B164C; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-delivered { background: #22c55e; color: white; }
          .status-other { background: #f59e0b; color: white; }
          @media print {
            body { padding: 0; }
            .invoice { border: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="company-info">
              <h1>Mirghaniya Super Centre</h1>
              <p>Premium Jewelry Packaging Solutions</p>
              <p>Usmanpur, Delhi - 110053, India</p>
              <p>Phone: +91 88518 82465</p>
              <p>Email: mirghaniyasupercentre@gmail.com</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> <span class="status-badge ${order.status === 'Delivered' ? 'status-delivered' : 'status-other'}">${order.status}</span></p>
            </div>
          </div>
          
          <div class="billing-info">
            <div>
              <h3>Bill To</h3>
              <p><strong>${customerName || 'Customer'}</strong></p>
              ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ''}
              ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SR No.</th>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map(item => `
                <tr>
                  <td>${item.product_sr_number}</td>
                  <td>${item.product_name}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.unit_price.toLocaleString('en-IN')}</td>
                  <td class="text-right">₹${item.total_price.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="text-right">₹${order.total_amount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td class="text-right">FREE</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total</td>
                <td class="text-right">₹${order.total_amount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p style="margin-top: 10px;">For any queries, please contact us at +91 88518 82465 or mirghaniyasupercentre@gmail.com</p>
            <p style="margin-top: 20px; font-size: 10px; color: #999;">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const downloadBill = () => {
    const billHTML = generateBillHTML();
    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create an iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(billHTML);
    iframe.contentDocument?.close();
    
    // Wait for content to load then print
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  // Only show for delivered orders
  if (order.status !== 'Delivered') {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={downloadBill}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Download Bill
    </Button>
  );
};
