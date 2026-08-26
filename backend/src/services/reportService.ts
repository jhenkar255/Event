import { createObjectCsvStringifier } from 'csv-writer';

export class ReportService {
  /**
   * Export Users list to CSV
   */
  public static exportUsersCsv(users: any[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: '_id', title: 'User ID' },
        { id: 'name', title: 'Full Name' },
        { id: 'email', title: 'Email Address' },
        { id: 'phone', title: 'Phone Number' },
        { id: 'role', title: 'Role' },
        { id: 'city', title: 'City' },
        { id: 'createdAt', title: 'Registered Date' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(
      users.map((u) => ({
        _id: u._id?.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone || 'N/A',
        role: u.role,
        city: u.city || 'N/A',
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A',
      }))
    );

    return (header || '') + records;
  }

  /**
   * Export Events list to CSV
   */
  public static exportEventsCsv(events: any[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'eventId', title: 'Event Code' },
        { id: 'name', title: 'Event Name' },
        { id: 'type', title: 'Event Type' },
        { id: 'culturalTradition', title: 'Culture' },
        { id: 'date', title: 'Event Date' },
        { id: 'city', title: 'City' },
        { id: 'guestCount', title: 'Guests' },
        { id: 'budget', title: 'Budget (INR)' },
        { id: 'spentBudget', title: 'Spent (INR)' },
        { id: 'status', title: 'Status' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(
      events.map((e) => ({
        eventId: e.eventId,
        name: e.name,
        type: e.type,
        culturalTradition: e.culturalTradition || 'Custom',
        date: e.date,
        city: e.location?.city || 'Jaipur',
        guestCount: e.guestCount,
        budget: e.budget,
        spentBudget: e.spentBudget || 0,
        status: e.status,
      }))
    );

    return (header || '') + records;
  }

  /**
   * Export Payments list to CSV
   */
  public static exportPaymentsCsv(payments: any[]): string {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'paymentId', title: 'Payment Code' },
        { id: 'receiptNumber', title: 'Receipt No' },
        { id: 'customerName', title: 'Customer Name' },
        { id: 'customerEmail', title: 'Email' },
        { id: 'serviceName', title: 'Service / Item' },
        { id: 'amount', title: 'Base Amount' },
        { id: 'taxAmount', title: 'GST Amount' },
        { id: 'totalAmount', title: 'Total Paid (INR)' },
        { id: 'method', title: 'Method' },
        { id: 'status', title: 'Status' },
        { id: 'date', title: 'Transaction Date' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(
      payments.map((p) => ({
        paymentId: p.paymentId,
        receiptNumber: p.receiptNumber,
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        serviceName: p.serviceName,
        amount: p.amount,
        taxAmount: p.taxAmount,
        totalAmount: p.totalAmount,
        method: p.method,
        status: p.status,
        date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A',
      }))
    );

    return (header || '') + records;
  }
}
