// Service for generating automatic notifications based on system events

import { type Notification } from '../contexts/NotificationContext';

export interface SystemEvent {
  type: string;
  data: unknown;
  userId?: string;
  timestamp: Date;
}

export class NotificationService {
  private static notificationCallbacks: ((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void)[] = [];

  // Register notification callback (from NotificationContext)
  static registerCallback(callback: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void) {
    this.notificationCallbacks.push(callback);
  }

  // Send notification to all registered callbacks
  private static sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  // Order-related notifications
  static notifyOrderStatusChange(order: { id: string; boosterId?: string; service?: { advertiserId?: string } }, _previousStatus: string, newStatus: string) {
    const statusMessages = {
      pending: 'Order has been created and is waiting for assignment',
      assigned: 'Order has been assigned to a booster',
      in_progress: 'Booster has started working on your order',
      evidence_submitted: 'Booster has submitted completion evidence',
      under_review: 'Order evidence is being reviewed',
      completed: 'Order has been completed successfully',
      rejected: 'Order evidence was rejected and needs resubmission'
    };

    // Notify buyer
    this.sendNotification({
      type: newStatus === 'completed' ? 'success' : newStatus === 'rejected' ? 'warning' : 'info',
      title: 'Order Status Update',
      message: `Order #${order.id}: ${statusMessages[newStatus as keyof typeof statusMessages]}`,
      actions: [
        {
          label: 'View Order',
          action: () => {
            // Navigate to order details
            window.location.href = `/orders/${order.id}`;
          },
          style: 'primary'
        }
      ]
    });

    // Notify booster if assigned
    if (order.boosterId && newStatus === 'assigned') {
      this.sendNotification({
        type: 'info',
        title: 'New Order Assignment',
        message: `You have been assigned to order #${order.id}`,
        actions: [
          {
            label: 'Start Order',
            action: () => {
              // Navigate to booster dashboard
              window.location.href = `/dashboard/booster/orders/${order.id}`;
            },
            style: 'primary'
          }
        ]
      });
    }

    // Notify advertiser when evidence is submitted
    if (newStatus === 'evidence_submitted' && order.service?.advertiserId) {
      this.sendNotification({
        type: 'info',
        title: 'Evidence Submitted',
        message: `Order #${order.id} evidence is ready for review`,
        actions: [
          {
            label: 'Review Evidence',
            action: () => {
              window.location.href = `/dashboard/advertiser/orders/${order.id}/review`;
            },
            style: 'primary'
          }
        ]
      });
    }
  }

  // Team-related notifications
  static notifyTeamInvitation(invitation: { id: string; teamName: string }) {
    this.sendNotification({
      type: 'info',
      title: 'Team Invitation',
      message: `You have been invited to join team "${invitation.teamName}"`,
      duration: 0, // Persistent
      actions: [
        {
          label: 'Accept',
          action: () => {
            // Handle team invitation acceptance
            this.acceptTeamInvitation(invitation.id);
          },
          style: 'primary'
        },
        {
          label: 'Decline',
          action: () => {
            // Handle team invitation decline
            this.declineTeamInvitation(invitation.id);
          },
          style: 'secondary'
        }
      ]
    });
  }

  static notifyTeamMemberJoined(team: { id: string; name: string; members: { userId: string }[] }, member: { userId: string; username: string }) {
    // Notify all team members
    team.members.forEach((teamMember) => {
      if (teamMember.userId !== member.userId) {
        this.sendNotification({
          type: 'success',
          title: 'New Team Member',
          message: `${member.username} has joined team "${team.name}"`,
          actions: [
            {
              label: 'View Team',
              action: () => {
                window.location.href = `/dashboard/team/${team.id}`;
              },
              style: 'secondary'
            }
          ]
        });
      }
    });
  }

  static notifyTeamServiceCreated(service: { id: string; title: string }, creator: { id: string; username: string }, team: { members: { userId: string }[] }) {
    // Notify all team members except creator
    team.members.forEach((member) => {
      if (member.userId !== creator.id) {
        this.sendNotification({
          type: 'info',
          title: 'New Team Service',
          message: `${creator.username} created service "${service.title}" in team workspace`,
          actions: [
            {
              label: 'View Service',
              action: () => {
                window.location.href = `/dashboard/services/${service.id}`;
              },
              style: 'secondary'
            }
          ]
        });
      }
    });
  }

  // Wallet-related notifications
  static notifyPaymentReceived(transaction: { amount: number; currency: string }) {
    this.sendNotification({
      type: 'success',
      title: 'Payment Received',
      message: `You received ${transaction.amount} ${transaction.currency.toUpperCase()} from order completion`,
      actions: [
        {
          label: 'View Wallet',
          action: () => {
            window.location.href = '/wallet';
          },
          style: 'secondary'
        }
      ]
    });
  }

  static notifyWithdrawalApproved(withdrawal: { id: string; amount: number; currency: string }) {
    this.sendNotification({
      type: 'success',
      title: 'Withdrawal Approved',
      message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency.toUpperCase()} has been approved`,
      actions: [
        {
          label: 'View Transaction',
          action: () => {
            window.location.href = `/wallet/transactions/${withdrawal.id}`;
          },
          style: 'secondary'
        }
      ]
    });
  }

  static notifyWithdrawalRejected(_withdrawal: { amount: number; currency: string }, reason: string) {
    this.sendNotification({
      type: 'error',
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request was rejected: ${reason}`,
      duration: 0, // Persistent
      actions: [
        {
          label: 'Contact Support',
          action: () => {
            // Open support modal or navigate to support
            console.log('Opening support...');
          },
          style: 'primary'
        }
      ]
    });
  }

  // Admin notifications
  static notifyRoleRequest(request: { id: string; username: string; role: string }) {
    this.sendNotification({
      type: 'info',
      title: 'New Role Request',
      message: `${request.username} requested ${request.role} role`,
      actions: [
        {
          label: 'Review Request',
          action: () => {
            window.location.href = `/admin/role-requests/${request.id}`;
          },
          style: 'primary'
        }
      ]
    });
  }

  static notifyWithdrawalRequest(request: { id: string; username: string; amount: number; currency: string }) {
    this.sendNotification({
      type: 'warning',
      title: 'Withdrawal Request',
      message: `${request.username} requested withdrawal of ${request.amount} ${request.currency.toUpperCase()}`,
      actions: [
        {
          label: 'Review Request',
          action: () => {
            window.location.href = `/admin/withdrawals/${request.id}`;
          },
          style: 'primary'
        }
      ]
    });
  }

  // System notifications
  static notifySystemMaintenance(maintenanceInfo: { scheduledTime: string }) {
    this.sendNotification({
      type: 'warning',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${new Date(maintenanceInfo.scheduledTime).toLocaleString()}`,
      duration: 0, // Persistent
      actions: [
        {
          label: 'Learn More',
          action: () => {
            window.location.href = '/maintenance-info';
          },
          style: 'secondary'
        }
      ]
    });
  }

  static notifySystemError(_error: unknown) {
    this.sendNotification({
      type: 'error',
      title: 'System Error',
      message: 'A system error occurred. Our team has been notified.',
      actions: [
        {
          label: 'Refresh Page',
          action: () => {
            window.location.reload();
          },
          style: 'primary'
        }
      ]
    });
  }

  // Helper methods for team invitation handling
  private static acceptTeamInvitation(invitationId: string) {
    // Mock implementation - replace with actual service call
    console.log('Accepting team invitation:', invitationId);
    
    this.sendNotification({
      type: 'success',
      title: 'Team Joined',
      message: 'You have successfully joined the team!',
      actions: [
        {
          label: 'Go to Team Dashboard',
          action: () => {
            window.location.href = '/dashboard?workspace=team';
          },
          style: 'primary'
        }
      ]
    });
  }

  private static declineTeamInvitation(invitationId: string) {
    // Mock implementation - replace with actual service call
    console.log('Declining team invitation:', invitationId);
    
    this.sendNotification({
      type: 'info',
      title: 'Invitation Declined',
      message: 'Team invitation has been declined.',
      duration: 3000
    });
  }

  // Event listener for system events
  static handleSystemEvent(event: SystemEvent) {
    switch (event.type) {
      case 'order_status_changed':
        this.notifyOrderStatusChange(
          (event.data as any).order,
          (event.data as any).previousStatus,
          (event.data as any).newStatus
        );
        break;
      
      case 'team_invitation_sent':
        this.notifyTeamInvitation((event.data as any).invitation);
        break;
      
      case 'team_member_joined':
        this.notifyTeamMemberJoined((event.data as any).team, (event.data as any).member);
        break;
      
      case 'team_service_created':
        this.notifyTeamServiceCreated(
          (event.data as any).service,
          (event.data as any).creator,
          (event.data as any).team
        );
        break;
      
      case 'payment_received':
        this.notifyPaymentReceived((event.data as any).transaction);
        break;
      
      case 'withdrawal_approved':
        this.notifyWithdrawalApproved((event.data as any).withdrawal);
        break;
      
      case 'withdrawal_rejected':
        this.notifyWithdrawalRejected((event.data as any).withdrawal, (event.data as any).reason);
        break;
      
      case 'role_request_submitted':
        this.notifyRoleRequest((event.data as any).request);
        break;
      
      case 'withdrawal_request_submitted':
        this.notifyWithdrawalRequest((event.data as any).request);
        break;
      
      case 'system_maintenance_scheduled':
        this.notifySystemMaintenance((event.data as any).maintenanceInfo);
        break;
      
      case 'system_error_occurred':
        this.notifySystemError((event.data as any).error);
        break;
      
      default:
        console.warn('Unknown system event type:', event.type);
    }
  }

  // Demo method to generate sample notifications
  static generateDemoNotifications() {
    // Order notifications
    setTimeout(() => {
      this.sendNotification({
        type: 'success',
        title: 'Order Completed',
        message: 'Your Mythic+ dungeon boost has been completed successfully!',
        actions: [
          {
            label: 'View Order',
            action: () => console.log('Viewing order...'),
            style: 'primary'
          },
          {
            label: 'Rate Booster',
            action: () => console.log('Rating booster...'),
            style: 'secondary'
          }
        ]
      });
    }, 2000);

    // Team notification
    setTimeout(() => {
      this.sendNotification({
        type: 'info',
        title: 'Team Invitation',
        message: 'You have been invited to join "Elite Boosters" team',
        duration: 0,
        actions: [
          {
            label: 'Accept',
            action: () => console.log('Accepting invitation...'),
            style: 'primary'
          },
          {
            label: 'Decline',
            action: () => console.log('Declining invitation...'),
            style: 'secondary'
          }
        ]
      });
    }, 5000);

    // Payment notification
    setTimeout(() => {
      this.sendNotification({
        type: 'success',
        title: 'Payment Received',
        message: 'You received 150 Gold from order completion',
        actions: [
          {
            label: 'View Wallet',
            action: () => console.log('Opening wallet...'),
            style: 'secondary'
          }
        ]
      });
    }, 8000);

    // Warning notification
    setTimeout(() => {
      this.sendNotification({
        type: 'warning',
        title: 'Withdrawal Pending',
        message: 'Your withdrawal request is pending admin approval',
        duration: 0
      });
    }, 11000);
  }
}