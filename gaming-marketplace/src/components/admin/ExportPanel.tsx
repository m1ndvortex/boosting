import React, { useState } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { ExportService } from '../../services/exportService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import './ExportPanel.css';

interface ExportPanelProps {
  className?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ className = '' }) => {
  const { showSuccess, showError } = useNotifications();
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async (exportType: string) => {
    setIsExporting(true);
    
    try {
      // Get date range if specified
      const dateRangeFilter = dateRange.start && dateRange.end ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      } : undefined;

      // Mock data - in real app, this would come from your data services
      const mockData = await getMockData(exportType, dateRangeFilter);

      switch (exportType) {
        case 'users': {
          ExportService.exportUsers(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'orders': {
          ExportService.exportOrders(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'transactions': {
          ExportService.exportTransactions(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'services': {
          ExportService.exportServices(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'teams': {
          ExportService.exportTeams(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'errors': {
          ExportService.exportErrorLogs(mockData, { 
            format: exportFormat,
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        case 'full-report': {
          const allData = await getAllMockData(dateRangeFilter);
          ExportService.exportAdminReport(allData, { 
            format: 'json',
            dateRange: dateRangeFilter 
          });
          break;
        }
        
        default:
          throw new Error('Unknown export type');
      }

      showSuccess(
        'Export Successful',
        `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} data has been exported successfully.`
      );
    } catch (error) {
      console.error('Export failed:', error);
      showError(
        'Export Failed',
        `Failed to export ${exportType} data. Please try again.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isExporting} message="Exporting data...">
      <div className={`export-panel ${className}`}>
        <div className="export-panel__header">
          <h3 className="export-panel__title">Data Export</h3>
          <p className="export-panel__description">
            Export platform data for analysis and reporting
          </p>
        </div>

        <div className="export-panel__controls">
          <div className="export-panel__date-range">
            <h4 className="export-panel__section-title">Date Range (Optional)</h4>
            <div className="export-panel__date-inputs">
              <div className="export-panel__date-field">
                <label htmlFor="start-date">Start Date</label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="export-panel__date-field">
                <label htmlFor="end-date">End Date</label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="export-panel__format">
            <h4 className="export-panel__section-title">Export Format</h4>
            <div className="export-panel__format-options">
              <label className="export-panel__radio">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv')}
                />
                <span>CSV (Spreadsheet)</span>
              </label>
              <label className="export-panel__radio">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                />
                <span>JSON (Raw Data)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="export-panel__exports">
          <h4 className="export-panel__section-title">Available Exports</h4>
          
          <div className="export-panel__grid">
            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Users</h5>
                <p>User accounts, roles, and registration data</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('users')}
                disabled={isExporting}
              >
                Export Users
              </Button>
            </div>

            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Orders</h5>
                <p>Service orders, status, and completion data</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('orders')}
                disabled={isExporting}
              >
                Export Orders
              </Button>
            </div>

            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Transactions</h5>
                <p>Financial transactions and payment history</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('transactions')}
                disabled={isExporting}
              >
                Export Transactions
              </Button>
            </div>

            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Services</h5>
                <p>Available services, pricing, and advertisers</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('services')}
                disabled={isExporting}
              >
                Export Services
              </Button>
            </div>

            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Teams</h5>
                <p>Team information and member data</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('teams')}
                disabled={isExporting}
              >
                Export Teams
              </Button>
            </div>

            <div className="export-panel__export-item">
              <div className="export-panel__export-info">
                <h5>Error Logs</h5>
                <p>System errors and debugging information</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('errors')}
                disabled={isExporting}
              >
                Export Errors
              </Button>
            </div>
          </div>

          <div className="export-panel__full-report">
            <div className="export-panel__export-item export-panel__export-item--featured">
              <div className="export-panel__export-info">
                <h5>Complete Admin Report</h5>
                <p>Comprehensive report including all data types and analytics</p>
              </div>
              <Button
                variant="primary"
                onClick={() => handleExport('full-report')}
                disabled={isExporting}
              >
                Generate Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
};

// Mock data functions - replace with actual data service calls
async function getMockData(type: string, _dateRange?: { start: Date; end: Date }) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data based on type
  switch (type) {
    case 'users':
      return generateMockUsers(50);
    case 'orders':
      return generateMockOrders(100);
    case 'transactions':
      return generateMockTransactions(200);
    case 'services':
      return generateMockServices(30);
    case 'teams':
      return generateMockTeams(10);
    case 'errors':
      return generateMockErrors(25);
    default:
      return [];
  }
}

async function getAllMockData(_dateRange?: { start: Date; end: Date }) {
  return {
    users: generateMockUsers(50),
    orders: generateMockOrders(100),
    transactions: generateMockTransactions(200),
    services: generateMockServices(30),
    teams: generateMockTeams(10),
    errorLogs: generateMockErrors(25)
  };
}

// Mock data generators
function generateMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    username: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
    roles: [{ name: 'client' }],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null
  }));
}

function generateMockOrders(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `order_${i + 1}`,
    service: { title: `Service ${i + 1}` },
    buyer: { username: `buyer${i + 1}` },
    booster: { username: `booster${i + 1}` },
    status: ['pending', 'completed', 'in_progress'][Math.floor(Math.random() * 3)],
    pricePaid: Math.floor(Math.random() * 1000) + 50,
    currency: ['gold', 'usd', 'toman'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    completedAt: Math.random() > 0.5 ? new Date() : null
  }));
}

function generateMockTransactions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `tx_${i + 1}`,
    user: { username: `user${i + 1}` },
    type: ['deposit', 'withdrawal', 'purchase'][Math.floor(Math.random() * 3)],
    amount: Math.floor(Math.random() * 500) + 10,
    currency: ['gold', 'usd', 'toman'][Math.floor(Math.random() * 3)],
    status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
    paymentMethod: 'Credit Card',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    approvedBy: Math.random() > 0.5 ? 'admin' : null
  }));
}

function generateMockServices(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `service_${i + 1}`,
    title: `Service ${i + 1}`,
    game: { name: 'World of Warcraft' },
    serviceType: { name: 'Mythic+ Dungeon' },
    advertiser: { username: `advertiser${i + 1}` },
    prices: {
      gold: Math.floor(Math.random() * 1000) + 100,
      usd: Math.floor(Math.random() * 100) + 10,
      toman: Math.floor(Math.random() * 10000) + 1000
    },
    status: 'active',
    workspaceType: 'personal',
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  }));
}

function generateMockTeams(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `team_${i + 1}`,
    name: `Team ${i + 1}`,
    leader: { username: `leader${i + 1}` },
    members: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, j) => ({ id: `member_${j}` })),
    isActive: Math.random() > 0.2,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  }));
}

function generateMockErrors(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `error_${i + 1}`,
    error: {
      code: 'VALIDATION_FAILED',
      message: 'Validation error occurred',
      userId: `user_${i + 1}`,
      context: 'form_submission',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    url: 'https://example.com/page'
  }));
}