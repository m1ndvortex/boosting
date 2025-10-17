import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ServiceBrowser } from '../../components/marketplace/ServiceBrowser';
import { ServiceDetails } from '../../components/marketplace/ServiceDetails';
import { OrderTracking } from '../../components/marketplace/OrderTracking';
import { OrderHistory } from '../../components/marketplace/OrderHistory';
import { MarketplaceService } from '../../services/marketplaceService';
import type { ServiceListing } from '../../services/marketplaceService';
import { useAuth } from '../../contexts/AuthContext';
import type { ServiceFilters, SearchParams } from '../../types';
import './MarketplacePage.css';

export const MarketplacePage: React.FC = () => {
  const { state: authState } = useAuth();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load services on component mount and when filters change
  useEffect(() => {
    loadServices();
  }, [filters]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadServices();
    }
  }, [searchQuery]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const serviceListings = await MarketplaceService.getMarketplaceServices(filters);
      setServices(serviceListings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams: SearchParams = {
        query: searchQuery,
        filters
      };
      const searchResults = await MarketplaceService.searchServices(searchParams);
      setServices(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ServiceFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (!authState.user) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-page__error">
          <h2>Authentication Required</h2>
          <p>Please log in to access the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <Routes>
        <Route
          path="/"
          element={
            <ServiceBrowser
              services={services}
              loading={loading}
              error={error}
              filters={filters}
              searchQuery={searchQuery}
              onFiltersChange={handleFiltersChange}
              onSearchChange={handleSearchChange}
              onRefresh={loadServices}
            />
          }
        />
        <Route
          path="/service/:serviceId"
          element={<ServiceDetails />}
        />
        <Route
          path="/orders"
          element={<OrderTracking userId={authState.user.id} />}
        />
        <Route
          path="/history"
          element={<OrderHistory userId={authState.user.id} />}
        />
      </Routes>
    </div>
  );
};