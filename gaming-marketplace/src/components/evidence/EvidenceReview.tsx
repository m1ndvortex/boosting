import React, { useState } from 'react';
import { Button } from '../discord/Button';
import { Modal } from '../discord/Modal';
import type { Order, OrderEvidence } from '../../types';
import './EvidenceReview.css';

interface EvidenceReviewProps {
  order: Order;
  evidence: OrderEvidence;
  canReview: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export const EvidenceReview: React.FC<EvidenceReviewProps> = ({
  order,
  evidence,
  canReview,
  onApprove,
  onReject,
  onClose
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    // Create object URL for the image file
    if (evidence.imageFile) {
      const url = URL.createObjectURL(evidence.imageFile);
      setImageUrl(url);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [evidence.imageFile]);

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    onReject(rejectReason.trim());
    setShowRejectModal(false);
    setRejectReason('');
  };

  const formatCurrency = (amount: number, currency: string) => {
    switch (currency) {
      case 'gold':
        return `${amount.toLocaleString()}G`;
      case 'usd':
        return `$${amount.toFixed(2)}`;
      case 'toman':
        return `${amount.toLocaleString()}﷼`;
      default:
        return `${amount}`;
    }
  };

  return (
    <div className="evidence-review">
      <div className="evidence-review__header">
        <h2 className="evidence-review__title">Order Evidence Review</h2>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="evidence-review__content">
        <div className="evidence-review__order-info">
          <h3 className="evidence-review__section-title">Order Information</h3>
          <div className="evidence-review__order-details">
            <div className="evidence-review__detail-item">
              <span className="evidence-review__detail-label">Order ID:</span>
              <span className="evidence-review__detail-value">
                #{order.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="evidence-review__detail-item">
              <span className="evidence-review__detail-label">Service:</span>
              <span className="evidence-review__detail-value">
                Service #{order.serviceId.slice(-6)}
              </span>
            </div>
            <div className="evidence-review__detail-item">
              <span className="evidence-review__detail-label">Payment:</span>
              <span className="evidence-review__detail-value">
                {formatCurrency(order.pricePaid, order.currency)}
              </span>
            </div>
            <div className="evidence-review__detail-item">
              <span className="evidence-review__detail-label">Booster:</span>
              <span className="evidence-review__detail-value">
                {evidence.uploadedBy}
              </span>
            </div>
            <div className="evidence-review__detail-item">
              <span className="evidence-review__detail-label">Submitted:</span>
              <span className="evidence-review__detail-value">
                {evidence.uploadedAt.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="evidence-review__evidence">
          <h3 className="evidence-review__section-title">Submitted Evidence</h3>
          
          <div className="evidence-review__screenshot">
            <h4 className="evidence-review__subsection-title">Screenshot</h4>
            {imageUrl ? (
              <div className="evidence-review__image-container">
                <img
                  src={imageUrl}
                  alt="Order completion evidence"
                  className="evidence-review__image"
                />
                <div className="evidence-review__image-info">
                  <span className="evidence-review__image-filename">
                    {evidence.imageFile.name}
                  </span>
                  <span className="evidence-review__image-size">
                    {(evidence.imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="evidence-review__no-image">
                <span>No image available</span>
              </div>
            )}
          </div>

          <div className="evidence-review__notes">
            <h4 className="evidence-review__subsection-title">Completion Notes</h4>
            <div className="evidence-review__notes-content">
              {evidence.notes}
            </div>
          </div>
        </div>

        {canReview && order.status === 'evidence_submitted' && (
          <div className="evidence-review__actions">
            <h3 className="evidence-review__section-title">Review Actions</h3>
            <div className="evidence-review__action-buttons">
              <Button
                variant="danger"
                onClick={() => setShowRejectModal(true)}
              >
                Reject Evidence
              </Button>
              <Button
                variant="success"
                onClick={onApprove}
              >
                Approve & Complete Order
              </Button>
            </div>
          </div>
        )}

        {!canReview && (
          <div className="evidence-review__no-permission">
            <p>You don't have permission to review this evidence.</p>
          </div>
        )}

        {order.status !== 'evidence_submitted' && (
          <div className="evidence-review__status-info">
            <p>
              This evidence has already been reviewed. 
              Current status: <strong>{order.status.replace('_', ' ').toUpperCase()}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Evidence"
      >
        <div className="evidence-review__reject-modal">
          <p className="evidence-review__reject-description">
            Please provide a reason for rejecting this evidence. This will help the booster 
            understand what needs to be corrected for resubmission.
          </p>
          
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why the evidence is being rejected..."
            className="evidence-review__reject-textarea"
            rows={4}
            maxLength={500}
          />
          
          <div className="evidence-review__reject-char-count">
            {rejectReason.length}/500 characters
          </div>

          <div className="evidence-review__reject-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Reject Evidence
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};