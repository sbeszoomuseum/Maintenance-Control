import React, { useState, useEffect } from 'react';
import './MaintenancePopup.css';

const MaintenancePopup = ({ clientId = 'biomuseum-main', backendUrl = 'http://localhost:5001' }) => {
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissedKey = `maintenance-popup-dismissed-${clientId}`;
    const isDismissed = localStorage.getItem(dismissedKey);
    if (isDismissed && Date.now() - JSON.parse(isDismissed) < 3600000) { // 1 hour
      setDismissed(true);
    }

    checkMaintenanceStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkMaintenanceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      setLoading(true);
      
      // Call the backend API endpoint
      const response = await fetch(`${backendUrl}/api/maintenance/status/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          const statusData = data.data;
          setStatus(statusData);
          
          // Show popup if:
          // - status is not 'active' (i.e., 'due' or 'suspended')
          // - OR payment_status is 'unpaid' or 'pending'
          const shouldShow = statusData.status !== 'active' || 
                            (statusData.payment_status && statusData.payment_status !== 'paid');
          
          if (shouldShow && !dismissed) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      } else {
        console.error('Error fetching maintenance status:', response.status);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      setIsVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setIsVisible(false);
    // Store dismissal for 1 hour
    const dismissedKey = `maintenance-popup-dismissed-${clientId}`;
    localStorage.setItem(dismissedKey, JSON.stringify(Date.now()));
  };

  if (!isVisible || loading || !status) return null;

  const statusType = status?.status || 'active';
  const paymentStatus = status?.payment_status || 'paid';
  
  // Determine severity level
  const isSuspended = statusType === 'suspended';
  const isDue = statusType === 'due' || paymentStatus === 'unpaid';
  const isPending = paymentStatus === 'pending';

  const getTitle = () => {
    if (isSuspended) return 'Account Suspended';
    if (isDue) return 'Payment Required';
    if (isPending) return 'Payment Pending';
    return 'Important Notice';
  };

  const getIcon = () => {
    if (isSuspended) return '🔒';
    if (isDue) return '⚠️';
    if (isPending) return '⏳';
    return 'ℹ️';
  };

  const getSeverityClass = () => {
    if (isSuspended) return 'severity-critical';
    if (isDue) return 'severity-warning';
    if (isPending) return 'severity-info';
    return 'severity-normal';
  };

  return (
    <>
      {isVisible && (
        <div 
          className="maintenance-popup-overlay"
          onClick={(e) => {
            // Only allow closing overlay by clicking outside if not suspended
            if (!isSuspended && e.target === e.currentTarget) {
              closePopup();
            }
          }}
        >
          <div className={`maintenance-popup-container ${getSeverityClass()}`}>
            {!isSuspended && (
              <button 
                className="popup-close" 
                onClick={closePopup}
                aria-label="Close"
                title="Close notification"
              >
                ✕
              </button>
            )}

            <div className="popup-header">
              <div className="popup-icon">{getIcon()}</div>
              <h2 className="popup-title">{getTitle()}</h2>
            </div>

            <div className="popup-content">
              <p className="popup-message">
                {status?.message || 'Please contact our support team for assistance.'}
              </p>

              {(status?.next_billing_date || status?.last_paid_date) && (
                <div className="popup-details">
                  {status?.last_paid_date && (
                    <div className="detail-item">
                      <span className="detail-label">Last Payment:</span>
                      <span className="detail-value">
                        {new Date(status.last_paid_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {status?.next_billing_date && (
                    <div className="detail-item">
                      <span className="detail-label">Next Billing:</span>
                      <span className="detail-value highlight">
                        {new Date(status.next_billing_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="popup-status-badge">
                <span className={`status-indicator status-${statusType}`}></span>
                <span className="status-text">
                  Status: <strong>{statusType.charAt(0).toUpperCase() + statusType.slice(1)}</strong>
                </span>
              </div>
            </div>

            <div className="popup-footer">
              <button 
                className="popup-button popup-button-primary" 
                onClick={!isSuspended ? closePopup : undefined}
                disabled={isSuspended}
                title={isSuspended ? 'Account is suspended. Contact support to resolve.' : 'Acknowledge this message'}
              >
                {isSuspended ? 'Account Locked - Contact Support' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenancePopup;
