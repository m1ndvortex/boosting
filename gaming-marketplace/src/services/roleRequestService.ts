// Role Request Service for managing advertiser and team advertiser role requests

import type { RoleRequest, RoleRequestFormData } from '../types';
import { StorageService } from './storage';

const STORAGE_KEY = 'gaming_marketplace_role_requests';

export class RoleRequestService {
  // Get all role requests
  static getAllRequests(): RoleRequest[] {
    const stored = StorageService.getItem<RoleRequest[]>(STORAGE_KEY) || [];
    // Convert date strings back to Date objects
    return stored.map(request => {
      // Safely parse dates - handle both Date objects and ISO strings
      const submittedAt = request.submittedAt instanceof Date 
        ? request.submittedAt 
        : new Date(request.submittedAt);
      
      const reviewedAt = request.reviewedAt 
        ? (request.reviewedAt instanceof Date 
          ? request.reviewedAt 
          : new Date(request.reviewedAt))
        : undefined;

      return {
        ...request,
        submittedAt,
        reviewedAt,
      };
    });
  }

  // Save requests to storage
  private static saveRequests(requests: RoleRequest[]): void {
    // Ensure dates are properly serialized as ISO strings
    const serializedRequests = requests.map(request => ({
      ...request,
      submittedAt: request.submittedAt instanceof Date 
        ? request.submittedAt.toISOString() 
        : request.submittedAt,
      reviewedAt: request.reviewedAt 
        ? (request.reviewedAt instanceof Date 
          ? request.reviewedAt.toISOString() 
          : request.reviewedAt)
        : undefined,
    }));
    StorageService.setItem(STORAGE_KEY, serializedRequests);
  }

  // Get requests by user ID
  static getUserRequests(userId: string): RoleRequest[] {
    const allRequests = this.getAllRequests();
    return allRequests.filter(request => request.userId === userId);
  }

  // Get requests by status
  static getRequestsByStatus(status: RoleRequest['status']): RoleRequest[] {
    const allRequests = this.getAllRequests();
    return allRequests.filter(request => request.status === status);
  }

  // Get pending requests (for admin)
  static getPendingRequests(): RoleRequest[] {
    return this.getRequestsByStatus('pending');
  }

  // Get single request by ID
  static getRequestById(requestId: string): RoleRequest | null {
    const allRequests = this.getAllRequests();
    return allRequests.find(request => request.id === requestId) || null;
  }

  // Create new role request
  static async createRequest(
    userId: string,
    username: string,
    email: string,
    formData: RoleRequestFormData
  ): Promise<RoleRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allRequests = this.getAllRequests();

    // Check if user already has a pending request for this role
    const existingPending = allRequests.find(
      request =>
        request.userId === userId &&
        request.requestedRole === formData.requestedRole &&
        request.status === 'pending'
    );

    if (existingPending) {
      throw new Error(`You already have a pending ${formData.requestedRole} request`);
    }

    // Convert File to base64 string for storage
    let idCardData: string | undefined;
    let idCardName: string | undefined;
    
    if (formData.idCardFile) {
      idCardName = formData.idCardFile.name;
      // In a real app, we'd upload to a server and get a URL
      // For now, create a data URL
      idCardData = await this.fileToBase64(formData.idCardFile);
    }

    const newRequest: RoleRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      email,
      requestedRole: formData.requestedRole,
      status: 'pending',
      reason: formData.reason,
      experience: formData.experience,
      idCardFile: idCardData,
      idCardName: idCardName,
      submittedAt: new Date(),
    };

    allRequests.push(newRequest);
    this.saveRequests(allRequests);

    return newRequest;
  }

  // Convert File to base64 string
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Update request status (approve/reject)
  static async updateRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<RoleRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allRequests = this.getAllRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Role request not found');
    }

    const request = allRequests[requestIndex];

    if (request.status !== 'pending') {
      throw new Error(`Cannot update request with status: ${request.status}`);
    }

    const updatedRequest: RoleRequest = {
      ...request,
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    };

    allRequests[requestIndex] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }

  // Delete request (admin only)
  static async deleteRequest(requestId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const allRequests = this.getAllRequests();
    const filteredRequests = allRequests.filter(request => request.id !== requestId);

    if (filteredRequests.length === allRequests.length) {
      throw new Error('Role request not found');
    }

    this.saveRequests(filteredRequests);
  }

  // Update request details (before review)
  static async updateRequest(
    requestId: string,
    updates: Partial<Pick<RoleRequest, 'reason' | 'experience'>>
  ): Promise<RoleRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const allRequests = this.getAllRequests();
    const requestIndex = allRequests.findIndex(request => request.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Role request not found');
    }

    const request = allRequests[requestIndex];

    if (request.status !== 'pending') {
      throw new Error('Cannot update a reviewed request');
    }

    const updatedRequest: RoleRequest = {
      ...request,
      ...updates,
    };

    allRequests[requestIndex] = updatedRequest;
    this.saveRequests(allRequests);

    return updatedRequest;
  }

  // Get statistics for admin dashboard
  static getStatistics(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } {
    const allRequests = this.getAllRequests();

    return {
      total: allRequests.length,
      pending: allRequests.filter(r => r.status === 'pending').length,
      approved: allRequests.filter(r => r.status === 'approved').length,
      rejected: allRequests.filter(r => r.status === 'rejected').length,
    };
  }
}
