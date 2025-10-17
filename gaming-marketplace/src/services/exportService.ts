// Data export service for admin reports

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown) => string;
}

export class ExportService {
  // Export data to CSV format
  static exportToCSV(data: unknown[], columns: ExportColumn[], options: ExportOptions = { format: 'csv' }): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        return col.formatter ? col.formatter(value) : this.formatValue(value);
      })
    );

    let csvContent = '';
    
    if (options.includeHeaders !== false) {
      csvContent += headers.join(',') + '\n';
    }
    
    csvContent += rows.map(row => 
      row.map(cell => this.escapeCsvValue(cell)).join(',')
    ).join('\n');

    this.downloadFile(csvContent, options.filename || 'export.csv', 'text/csv');
  }

  // Export data to JSON format
  static exportToJSON(data: unknown[], options: ExportOptions = { format: 'json' }): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
      filters: options.filters || {},
      dateRange: options.dateRange,
      data: data
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, options.filename || 'export.json', 'application/json');
  }

  // Export user data
  static exportUsers(users: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'User ID' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'roles', label: 'Roles', formatter: (roles) => Array.isArray(roles) ? roles.map((r: { name: string }) => r.name).join(', ') : '' },
      { key: 'createdAt', label: 'Created Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : '' },
      { key: 'lastLoginAt', label: 'Last Login', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : 'Never' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `users_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(users, columns, exportOptions);
    } else {
      this.exportToJSON(users, exportOptions);
    }
  }

  // Export order data
  static exportOrders(orders: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'Order ID' },
      { key: 'service.title', label: 'Service' },
      { key: 'buyer.username', label: 'Buyer' },
      { key: 'booster.username', label: 'Booster' },
      { key: 'status', label: 'Status' },
      { key: 'pricePaid', label: 'Price Paid' },
      { key: 'currency', label: 'Currency' },
      { key: 'createdAt', label: 'Order Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : '' },
      { key: 'completedAt', label: 'Completed Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : 'Not completed' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `orders_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(orders, columns, exportOptions);
    } else {
      this.exportToJSON(orders, exportOptions);
    }
  }

  // Export financial data
  static exportTransactions(transactions: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'Transaction ID' },
      { key: 'user.username', label: 'User' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' },
      { key: 'status', label: 'Status' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'createdAt', label: 'Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : '' },
      { key: 'approvedBy', label: 'Approved By' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `transactions_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(transactions, columns, exportOptions);
    } else {
      this.exportToJSON(transactions, exportOptions);
    }
  }

  // Export service data
  static exportServices(services: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'Service ID' },
      { key: 'title', label: 'Title' },
      { key: 'game.name', label: 'Game' },
      { key: 'serviceType.name', label: 'Service Type' },
      { key: 'advertiser.username', label: 'Advertiser' },
      { key: 'prices.gold', label: 'Price (Gold)' },
      { key: 'prices.usd', label: 'Price (USD)' },
      { key: 'prices.toman', label: 'Price (Toman)' },
      { key: 'status', label: 'Status' },
      { key: 'workspaceType', label: 'Workspace' },
      { key: 'createdAt', label: 'Created Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : '' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `services_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(services, columns, exportOptions);
    } else {
      this.exportToJSON(services, exportOptions);
    }
  }

  // Export team data
  static exportTeams(teams: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'Team ID' },
      { key: 'name', label: 'Team Name' },
      { key: 'leader.username', label: 'Team Leader' },
      { key: 'members', label: 'Member Count', formatter: (members) => Array.isArray(members) ? members.length.toString() : '0' },
      { key: 'isActive', label: 'Status', formatter: (active) => active ? 'Active' : 'Inactive' },
      { key: 'createdAt', label: 'Created Date', formatter: (date) => date ? new Date(date as string).toLocaleDateString() : '' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `teams_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(teams, columns, exportOptions);
    } else {
      this.exportToJSON(teams, exportOptions);
    }
  }

  // Export error logs
  static exportErrorLogs(errorLogs: unknown[], options: Partial<ExportOptions> = {}): void {
    const columns: ExportColumn[] = [
      { key: 'id', label: 'Log ID' },
      { key: 'error.code', label: 'Error Code' },
      { key: 'error.message', label: 'Error Message' },
      { key: 'error.userId', label: 'User ID' },
      { key: 'error.context', label: 'Context' },
      { key: 'userAgent', label: 'User Agent' },
      { key: 'url', label: 'URL' },
      { key: 'error.timestamp', label: 'Timestamp', formatter: (date) => date ? new Date(date as string).toLocaleString() : '' }
    ];

    const exportOptions: ExportOptions = {
      format: 'csv',
      filename: `error_logs_export_${this.getDateString()}.csv`,
      ...options
    };

    if (exportOptions.format === 'csv') {
      this.exportToCSV(errorLogs, columns, exportOptions);
    } else {
      this.exportToJSON(errorLogs, exportOptions);
    }
  }

  // Generate comprehensive admin report
  static exportAdminReport(data: {
    users: unknown[];
    orders: unknown[];
    transactions: unknown[];
    services: unknown[];
    teams: unknown[];
    errorLogs: unknown[];
  }, options: Partial<ExportOptions> = {}): void {
    const reportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalUsers: data.users.length,
        totalOrders: data.orders.length,
        totalTransactions: data.transactions.length,
        totalServices: data.services.length,
        totalTeams: data.teams.length,
        totalErrors: data.errorLogs.length,
        completedOrders: data.orders.filter((o: any) => o.status === 'completed').length,
        pendingOrders: data.orders.filter((o: any) => o.status === 'pending').length,
        totalRevenue: data.transactions
          .filter((t: any) => t.type === 'purchase' && t.status === 'completed')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
      },
      data
    };

    const exportOptions: ExportOptions = {
      format: 'json',
      filename: `admin_report_${this.getDateString()}.json`,
      ...options
    };

    this.exportToJSON([reportData], exportOptions);
  }

  // Utility methods
  private static getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: any, key) => current?.[key], obj);
  }

  private static formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private static getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
  }

  // Filter data by date range
  static filterByDateRange<T extends { createdAt: string | Date }>(
    data: T[], 
    dateRange?: { start: Date; end: Date }
  ): T[] {
    if (!dateRange) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }

  // Get export statistics
  static getExportStats(data: unknown[]): {
    totalRecords: number;
    dateRange: { earliest: Date; latest: Date } | null;
    recordTypes: Record<string, number>;
  } {
    if (!data || data.length === 0) {
      return {
        totalRecords: 0,
        dateRange: null,
        recordTypes: {}
      };
    }

    const dates = data
      .map((item: any) => new Date(item.createdAt || item.timestamp))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    const recordTypes: Record<string, number> = {};
    data.forEach((item: any) => {
      const type = item.type || item.status || 'unknown';
      recordTypes[type] = (recordTypes[type] || 0) + 1;
    });

    return {
      totalRecords: data.length,
      dateRange: dates.length > 0 ? {
        earliest: dates[0],
        latest: dates[dates.length - 1]
      } : null,
      recordTypes
    };
  }
}