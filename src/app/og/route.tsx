import React from 'react';
import { ImageResponse } from 'next/og';
import { restaurantConfig } from '../../../restaurant.config';

export const runtime = 'nodejs';

export const alt = 'AURORA - Unparalleled Fine-Dining Experience';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0A0A0A 0%, #121212 50%, #1A1A1A 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gold glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background:
              'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            background:
              'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 8,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#D4AF37',
            marginBottom: 16,
          }}
        >
          {restaurantConfig.name}
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: 120,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            marginBottom: 24,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: '0.2em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          {restaurantConfig.tagline}
        </div>

        {/* Contact info */}
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 48,
            letterSpacing: '0.1em',
          }}
        >
          {restaurantConfig.contact.address}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}