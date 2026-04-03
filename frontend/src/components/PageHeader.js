import React from 'react';

function PageHeader({ title, description, extra }) {
  return (
    <div className="page-header">
      <div>
        <div
          style={{
            width: 58,
            height: 6,
            borderRadius: 999,
            marginBottom: 10,
            background: 'linear-gradient(90deg, #0a7cff 0%, #00c99a 45%, #ff8b3d 100%)',
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
