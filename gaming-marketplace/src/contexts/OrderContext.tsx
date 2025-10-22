// Order context for global order state management

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Order } from '../types';
import { OrderService } from '../services/orderService';
import { useAuth } from './AuthContext';

// Order state
interface OrderState {
  orders: Order[];
  boosterOrders: Order[];
  advertiserOrders: Order[];
  loading: boolean;
  error: string | null;
}

// Order actions
type OrderAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { orders: Order[]; boosterOrders: Order[]; advertiserOrders: Order[] } }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Order context type
interface OrderContextType {
  state: OrderState;
  loadOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  uploadEvidence: (orderId: string, evidence: { imageFile: File; notes: string }) => Promise<void>;
  reviewEvidence: (orderId: string, approved: boolean, reviewerId: string, reason?: string) => Promise<void>;
  assignBooster: (orderId: string, boosterId: string) => Promise<void>;
  createOrder: (orderData: {
    serviceId: string;
    buyerId: string;
    earningsRecipientId: string;
    pricePaid: number;
    currency: 'gold' | 'usd' | 'toman';
  }) => Promise<Order>;
  clearError: () => void;
}

// Initial state
const initialState: OrderState = {
  orders: [],
  boosterOrders: [],
  advertiserOrders: [],
  loading: false,
  error: null,
};

// Order reducer
function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        orders: action.payload.orders,
        boosterOrders: action.payload.boosterOrders,
        advertiserOrders: action.payload.advertiserOrders,
        loading: false,
        error: null,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order => 
          order.id === action.payload.id ? action.payload : order
        ),
        boosterOrders: state.boosterOrders.map(order => 
          order.id === action.payload.id ? action.payload : order
        ),
        advertiserOrders: state.advertiserOrders.map(order => 
          order.id === action.payload.id ? action.payload : order
        ),
      };
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        advertiserOrders: action.payload.earningsRecipientId === state.orders[0]?.earningsRecipientId 
          ? [action.payload, ...state.advertiserOrders] 
          : state.advertiserOrders,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Order provider component
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { state: authState } = useAuth();

  // Load orders when user changes
  useEffect(() => {
    if (authState.user) {
      loadOrders();
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [authState.user]);

  // Load orders function
  const loadOrders = async (): Promise<void> => {
    if (!authState.user) return;

    dispatch({ type: 'LOAD_START' });

    try {
      const [allOrders, boosterOrders, advertiserOrders] = await Promise.all([
        OrderService.getAllOrders(),
        OrderService.getBoosterOrders(authState.user.id),
        OrderService.getAdvertiserOrders(authState.user.id)
      ]);

      dispatch({
        type: 'LOAD_SUCCESS',
        payload: { 
          orders: allOrders, 
          boosterOrders, 
          advertiserOrders 
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load orders';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
      const updatedOrder = await OrderService.updateOrderStatus(orderId, status);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Upload evidence
  const uploadEvidence = async (orderId: string, evidence: { imageFile: File; notes: string }): Promise<void> => {
    try {
      await OrderService.uploadEvidence(orderId, evidence);
      // Reload orders to get updated state
      await loadOrders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload evidence';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Review evidence
  const reviewEvidence = async (orderId: string, approved: boolean, reviewerId: string, reason?: string): Promise<void> => {
    try {
      const updatedOrder = await OrderService.reviewEvidence(orderId, approved, reviewerId, reason);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to review evidence';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Assign booster
  const assignBooster = async (orderId: string, boosterId: string): Promise<void> => {
    try {
      const updatedOrder = await OrderService.assignBooster(orderId, boosterId);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign booster';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Create order
  const createOrder = async (orderData: {
    serviceId: string;
    buyerId: string;
    earningsRecipientId: string;
    pricePaid: number;
    currency: 'gold' | 'usd' | 'toman';
  }): Promise<Order> => {
    try {
      const newOrder = await OrderService.createOrder(orderData);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      return newOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh orders function (alias for loadOrders)
  const refreshOrders = loadOrders;

  const contextValue: OrderContextType = {
    state,
    loadOrders,
    refreshOrders,
    updateOrderStatus,
    uploadEvidence,
    reviewEvidence,
    assignBooster,
    createOrder,
    clearError,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};