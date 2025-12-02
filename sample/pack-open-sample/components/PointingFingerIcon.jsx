import React from 'react';

/**
 * カスタム指差しアイコン (SVG)
 */
export const PointingFingerIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' }}
  >
    <path d="M20.5 13.5l-2.7-2.7c-.8-.8-2.1-.8-2.8 0l-.5.5v-3.8C14.5 6.1 13.4 5 12 5s-2.5 1.1-2.5 2.5v7.2l-2.1-.9c-.2-.1-.4-.1-.6-.1-.5 0-1 .2-1.4.6l-.9.9 5.8 5.8c.6.6 1.4.9 2.2.9h5.5c1.7 0 3-1.3 3-3v-4.5c0-.4-.1-.7-.3-.9z"/>
  </svg>
);
