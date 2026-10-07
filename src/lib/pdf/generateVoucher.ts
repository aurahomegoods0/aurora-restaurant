import { restaurantConfig } from '../../../restaurant.config';
import {
  ZONE_LABELS,
  formatReservationDate,
  formatReservationTime,
  shortReservationCode,
} from '@/lib/reservation-format';
import type { ReservationDetails } from '@/types/reservation';

/*
 * The voucher is painted on a <canvas> and embedded in a jsPDF page, rather than
 * rasterised from the DOM with html2canvas. html2canvas cannot parse the oklch()
 * colours Tailwind v4 emits, and the canvas route renders any script (Latin or
 * Cyrillic guest names) with the system fonts, which jsPDF's built-in fonts can't.
 */

const PAGE_WIDTH_MM = 120;
const PAGE_HEIGHT_MM = 200;
const PX_PER_MM = 8;
const WIDTH = PAGE_WIDTH_MM * PX_PER_MM;
const HEIGHT = PAGE_HEIGHT_MM * PX_PER_MM;

const COLORS = {
  background: '#0A0A0A',
  card: '#121212',
  gold: '#D4AF37',
  goldLight: '#E8C96A',
  text: '#FFFFFF',
  muted: 'rgba(255, 255, 255, 0.55)',
  line: 'rgba(255, 255, 255, 0.09)',
} as const;

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Segoe UI", Helvetica, Arial, sans-serif';

const MARGIN_X = 96;
const CONTENT_RIGHT = WIDTH - MARGIN_X;

type SpacedContext = CanvasRenderingContext2D & { letterSpacing: string };

/** Text with CSS-style letter spacing (ignored by browsers that lack the property). */
const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font: string;
    color: string;
    align?: CanvasTextAlign;
    spacing?: number;
  },
): void => {
  const { font, color, align = 'left', spacing = 0 } = options;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  (ctx as SpacedContext).letterSpacing = `${spacing}px`;

  // Letter spacing adds a trailing gap that would push centred text off-centre.
  const offset = align === 'center' ? spacing / 2 : 0;
  ctx.fillText(text, x + offset, y);
  (ctx as SpacedContext).letterSpacing = '0px';
};

const fitText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
): string => {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;

  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed.trimEnd()}…`;
};

const strokeRect = (
  ctx: CanvasRenderingContext2D,
  inset: number,
  color: string,
  lineWidth: number,
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);
};

const drawDivider = (ctx: CanvasRenderingContext2D, y: number): void => {
  const centerX = WIDTH / 2;
  const gradient = ctx.createLinearGradient(MARGIN_X, 0, CONTENT_RIGHT, 0);
  gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
  gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.9)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(MARGIN_X, y - 1, CONTENT_RIGHT - MARGIN_X, 2);

  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(centerX, y - 9);
  ctx.lineTo(centerX + 9, y);
  ctx.lineTo(centerX, y + 9);
  ctx.lineTo(centerX - 9, y);
  ctx.closePath();
  ctx.fill();
};

/** What the QR code encodes: enough for staff to look the booking up or verify it offline. */
export const buildVoucherQrPayload = (reservation: ReservationDetails): string =>
  [
    'AURORA',
    reservation.id,
    `${reservation.reservation_date} ${formatReservationTime(reservation.reservation_time)}`,
    `T${reservation.table_number}`,
    `${reservation.party_size}P`,
  ].join('|');

const renderQrCanvas = async (
  text: string,
  size: number,
): Promise<HTMLCanvasElement> => {
  const { toCanvas } = await import('qrcode');
  const canvas = document.createElement('canvas');
  await toCanvas(canvas, text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: COLORS.background, light: '#FFFFFF' },
  });
  return canvas;
};

export const renderVoucherCanvas = async (
  reservation: ReservationDetails,
): Promise<HTMLCanvasElement> => {
  await document.fonts?.ready;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  strokeRect(ctx, 24, COLORS.gold, 3);
  strokeRect(ctx, 40, 'rgba(212, 175, 55, 0.35)', 1.5);

  // Header
  drawText(ctx, restaurantConfig.name, WIDTH / 2, 190, {
    font: `700 84px ${SERIF}`,
    color: COLORS.gold,
    align: 'center',
    spacing: 22,
  });
  drawText(ctx, 'FINE DINING  ·  TASHKENT', WIDTH / 2, 240, {
    font: `300 22px ${SANS}`,
    color: COLORS.muted,
    align: 'center',
    spacing: 7,
  });
  drawDivider(ctx, 290);

  // Reservation id
  drawText(ctx, 'BRON VAUCHERI', WIDTH / 2, 350, {
    font: `400 22px ${SANS}`,
    color: COLORS.muted,
    align: 'center',
    spacing: 8,
  });
  drawText(ctx, `#${shortReservationCode(reservation.id)}`, WIDTH / 2, 420, {
    font: `700 64px ${SERIF}`,
    color: COLORS.goldLight,
    align: 'center',
    spacing: 6,
  });
  drawText(ctx, reservation.id, WIDTH / 2, 460, {
    font: `400 17px ${SANS}`,
    color: 'rgba(255, 255, 255, 0.38)',
    align: 'center',
  });

  // Details
  const rows: [string, string][] = [
    ['MEHMON', reservation.guest_name],
    ['TELEFON', reservation.guest_phone],
    ['EMAIL', reservation.guest_email],
    ['SANA', formatReservationDate(reservation.reservation_date)],
    ['VAQT', formatReservationTime(reservation.reservation_time)],
    ['STOL', `№${reservation.table_number}`],
    ['ZONA', ZONE_LABELS[reservation.zone]],
    ['MEHMONLAR', `${reservation.party_size} kishi`],
  ];

  const rowHeight = 60;
  const firstRowBaseline = 540;
  const valueFont = `500 28px ${SANS}`;

  rows.forEach(([label, value], index) => {
    const baseline = firstRowBaseline + index * rowHeight;

    drawText(ctx, label, MARGIN_X, baseline, {
      font: `500 18px ${SANS}`,
      color: COLORS.gold,
      spacing: 4,
    });
    drawText(
      ctx,
      fitText(ctx, value, valueFont, CONTENT_RIGHT - MARGIN_X - 230),
      CONTENT_RIGHT,
      baseline,
      { font: valueFont, color: COLORS.text, align: 'right' },
    );

    ctx.fillStyle = COLORS.line;
    ctx.fillRect(MARGIN_X, baseline + 20, CONTENT_RIGHT - MARGIN_X, 1.5);
  });

  // QR code
  const qrSize = 300;
  const qrPadding = 20;
  const boxSize = qrSize + qrPadding * 2;
  const boxX = (WIDTH - boxSize) / 2;
  const boxY = 1060;

  const qr = await renderQrCanvas(buildVoucherQrPayload(reservation), qrSize);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(boxX, boxY, boxSize, boxSize);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(boxX - 10, boxY - 10, boxSize + 20, boxSize + 20);
  ctx.drawImage(qr, boxX + qrPadding, boxY + qrPadding, qrSize, qrSize);

  drawText(
    ctx,
    "Restoranga kelganingizda ushbu kodni ko'rsating",
    WIDTH / 2,
    boxY + boxSize + 56,
    { font: `400 20px ${SANS}`, color: COLORS.muted, align: 'center' },
  );

  // Footer
  drawDivider(ctx, HEIGHT - 124);
  drawText(ctx, restaurantConfig.contact.address, WIDTH / 2, HEIGHT - 84, {
    font: `400 17px ${SANS}`,
    color: COLORS.muted,
    align: 'center',
  });
  drawText(
    ctx,
    `${restaurantConfig.contact.phone}  ·  ${restaurantConfig.contact.email}`,
    WIDTH / 2,
    HEIGHT - 56,
    { font: `400 17px ${SANS}`, color: COLORS.muted, align: 'center' },
  );

  return canvas;
};

/** Builds the voucher as a single-page PDF (jsPDF is loaded on demand). */
export const generateVoucherPdf = async (
  reservation: ReservationDetails,
): Promise<import('jspdf').jsPDF> => {
  const [{ jsPDF }, canvas] = await Promise.all([
    import('jspdf'),
    renderVoucherCanvas(reservation),
  ]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH_MM, PAGE_HEIGHT_MM],
    compress: true,
  });

  doc.setProperties({
    title: `AURORA reservation ${shortReservationCode(reservation.id)}`,
    subject: 'Table reservation voucher',
    author: restaurantConfig.name,
  });
  doc.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    0,
    PAGE_WIDTH_MM,
    PAGE_HEIGHT_MM,
    undefined,
    'FAST',
  );

  return doc;
};

export const voucherFileName = (reservation: ReservationDetails): string =>
  `AURORA-voucher-${shortReservationCode(reservation.id)}.pdf`;

/** Generates the voucher and triggers a browser download. */
export const downloadReservationVoucher = async (
  reservation: ReservationDetails,
): Promise<void> => {
  const doc = await generateVoucherPdf(reservation);
  doc.save(voucherFileName(reservation));
};
