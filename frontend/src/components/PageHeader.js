import React from 'react';

function PageHeader({ title, description, extra }) {
  return (
    <div className="page-header">
      <div>
        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 999,
            marginBottom: 12,
            background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 45%, #0d9488 100%)',
          }}
        />
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {extra}
    </div>
  );
}

export default PageHeader;
