import React from "react";

const CardComponent = ({ 
  title, 
  description, 
  imageUrl, 
  link,
  showAddToFridgeButton = false  // Keep for compatibility, not used in new project
}) => {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 hover-card">
        {imageUrl && (
          <img 
            src={imageUrl} 
            className="card-img-top" 
            alt={title}
            style={{ 
              height: '200px', 
              objectFit: 'cover' 
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';
            }}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text text-muted">{description}</p>
          {link && link !== "#" && (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-sm"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              Visit Website
            </a>
          )}
          {(!link || link === "#") && (
            <button 
              className="btn btn-outline-secondary btn-sm" 
              disabled
              title="Coming soon"
            >
              <i className="bi bi-clock me-1"></i>
              Guide Coming Soon
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .hover-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default CardComponent;