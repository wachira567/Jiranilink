import React, { useState } from "react";
import ChatButton from "./ChatButton";

const ItemCard = ({ item, owner, onBorrow, isOwnItem = false, onViewOnMap }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="item-card catalog-item-card">
      <div className="item-image-container" style={{
        height: '180px',
        backgroundColor: 'var(--glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden'
      }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="item-icon-placeholder" style={{ fontSize: '5rem' }}>{item.image || "📦"}</div>
        )}
        {!item.availability && (
          <div className="unavailable-overlay">Unavailable</div>
        )}
      </div>

      <div className="item-content">
        <div className="item-header">
          <div className="item-info">
            <h3>{item.name}</h3>
            <p className="category">{item.category}</p>
            <p className="owner">By {owner.name}</p>
          </div>
        </div>

        {showDetails && (
          <div className="item-details">
            <p className="description">{item.description}</p>
            <div className="item-pricing">
              {item.deposit > 0 && (
                <p className="deposit">💰 Deposit: KES {item.deposit}</p>
              )}
              {item.dailyRate > 0 && (
                <p className="rate">💵 Rate: KES {item.dailyRate}/day</p>
              )}
              {item.dailyRate === 0 && item.deposit === 0 && (
                <p className="free-badge">🎁 Free to borrow</p>
              )}
            </div>
          </div>
        )}

        <div className="item-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Less" : "More"} Details
          </button>
          
          <button
            className="btn-secondary"
            onClick={() => onViewOnMap && onViewOnMap(item)}
            title={item.coordinates ? "View on Map" : "No location available"}
          >
            📍 Map
          </button>

          {!isOwnItem && (
            <>
              <ChatButton
                ownerId={item.ownerId}
                ownerName={owner.name}
                itemId={item.id}
                itemName={item.name}
              />
              <button
                className="btn-primary"
                onClick={() => onBorrow(item)}
                disabled={!item.availability}
              >
                {item.availability ? "Borrow" : "Unavailable"}
              </button>
            </>
          )}
          {isOwnItem && <span className="own-item-badge">Your Item</span>}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
