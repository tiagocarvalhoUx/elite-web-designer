/**
 * Gerador de og-image.png sem dependências externas.
 * Cria um SVG detalhado e o converte para PNG usando a API do Node.js.
 *
 * Uso: node scripts/generate-og.mjs
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../public/og-image.png');

const W = 1200;
const H = 630;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ─────────────────────────────────────────────────────────────
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, W, H);

// Purple radial glow (left)
const glowL = ctx.createRadialGradient(240, 315, 0, 240, 315, 520);
glowL.addColorStop(0, 'rgba(124,58,237,0.30)');
glowL.addColorStop(1, 'rgba(124,58,237,0)');
ctx.fillStyle = glowL;
ctx.fillRect(0, 0, W, H);

// Blue radial glow (top-right)
const glowR = ctx.createRadialGradient(960, 120, 0, 960, 120, 380);
glowR.addColorStop(0, 'rgba(59,130,246,0.18)');
glowR.addColorStop(1, 'rgba(59,130,246,0)');
ctx.fillStyle = glowR;
ctx.fillRect(0, 0, W, H);

// ── Grid lines ──────────────────────────────────────────────────────────────
ctx.strokeStyle = 'rgba(124,58,237,0.07)';
ctx.lineWidth = 1;
const GRID = 60;
for (let x = 0; x < W; x += GRID) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (let y = 0; y < H; y += GRID) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}

// ── Badge pill ──────────────────────────────────────────────────────────────
const bx = 90, by = 90, bw = 250, bh = 36, br = 18;
ctx.beginPath();
ctx.moveTo(bx + br, by);
ctx.lineTo(bx + bw - br, by);
ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
ctx.lineTo(bx + bw, by + bh - br);
ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
ctx.lineTo(bx + br, by + bh);
ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
ctx.lineTo(bx, by + br);
ctx.arcTo(bx, by, bx + br, by, br);
ctx.closePath();
ctx.fillStyle = 'rgba(124,58,237,0.15)';
ctx.fill();
ctx.strokeStyle = 'rgba(124,58,237,0.45)';
ctx.lineWidth = 1.5;
ctx.stroke();

// Badge dot
ctx.beginPath();
ctx.arc(bx + 20, by + bh / 2, 5, 0, Math.PI * 2);
ctx.fillStyle = '#a78bfa';
ctx.fill();

// Badge text
ctx.font = '600 14px Inter, Arial, sans-serif';
ctx.fillStyle = '#a78bfa';
ctx.fillText('WEB DESIGN PREMIUM', bx + 34, by + 23);

// ── Main title ───────────────────────────────────────────────────────────────
ctx.font = '900 80px Inter, Arial, sans-serif';
ctx.fillStyle = '#ffffff';
ctx.fillText('Sites que', 90, 230);

// Gradient text for second line
const titleGrad = ctx.createLinearGradient(90, 240, 700, 320);
titleGrad.addColorStop(0, '#a78bfa');
titleGrad.addColorStop(0.5, '#60a5fa');
titleGrad.addColorStop(1, '#f472b6');
ctx.fillStyle = titleGrad;
ctx.fillText('vendem de verdade', 90, 325);

// ── Subtitle ─────────────────────────────────────────────────────────────────
ctx.font = '400 22px Inter, Arial, sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.50)';
ctx.fillText('Design profissional, performance máxima', 90, 390);
ctx.fillText('e resultados reais para o seu negócio.', 90, 420);

// ── Pills row ────────────────────────────────────────────────────────────────
const pills = [
  { label: 'Web Design',   bg: 'rgba(124,58,237,0.20)',  border: 'rgba(124,58,237,0.40)',  color: '#a78bfa' },
  { label: 'E-commerce',   bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  color: '#93c5fd' },
  { label: 'Landing Page', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.30)', color: '#f9a8d4' },
];

let px = 90;
const py = 470, ph = 38, pillBr = 19;
ctx.font = '600 15px Inter, Arial, sans-serif';
pills.forEach(p => {
  const textW = ctx.measureText(p.label).width;
  const pw = textW + 40;
  ctx.beginPath();
  ctx.moveTo(px + pillBr, py);
  ctx.lineTo(px + pw - pillBr, py);
  ctx.arcTo(px + pw, py, px + pw, py + ph, pillBr);
  ctx.lineTo(px + pw, py + ph - pillBr);
  ctx.arcTo(px + pw, py + ph, px + pw - pillBr, py + ph, pillBr);
  ctx.lineTo(px + pillBr, py + ph);
  ctx.arcTo(px, py + ph, px, py + ph - pillBr, pillBr);
  ctx.lineTo(px, py + pillBr);
  ctx.arcTo(px, py, px + pillBr, py, pillBr);
  ctx.closePath();
  ctx.fillStyle = p.bg;
  ctx.fill();
  ctx.strokeStyle = p.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = p.color;
  ctx.fillText(p.label, px + 20, py + 25);
  px += pw + 12;
});

// ── Right: Logo circle ────────────────────────────────────────────────────────
const cx2 = 960, cy2 = 290, cr = 130;

// Outer ring
ctx.beginPath();
ctx.arc(cx2, cy2, cr, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(124,58,237,0.25)';
ctx.lineWidth = 2;
ctx.stroke();

// Inner ring
ctx.beginPath();
ctx.arc(cx2, cy2, cr - 20, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(124,58,237,0.12)';
ctx.lineWidth = 1;
ctx.stroke();

// Logo gradient fill
const logoGrad = ctx.createRadialGradient(cx2 - 20, cy2 - 20, 0, cx2, cy2, 80);
logoGrad.addColorStop(0, '#9333ea');
logoGrad.addColorStop(1, '#2563eb');
ctx.beginPath();
ctx.arc(cx2, cy2, 80, 0, Math.PI * 2);
ctx.fillStyle = logoGrad;
ctx.fill();

// Logo glow
ctx.shadowColor = 'rgba(124,58,237,0.6)';
ctx.shadowBlur = 40;
ctx.beginPath();
ctx.arc(cx2, cy2, 80, 0, Math.PI * 2);
ctx.fillStyle = logoGrad;
ctx.fill();
ctx.shadowBlur = 0;

// Logo text "ED"
ctx.font = '900 52px Inter, Arial, sans-serif';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('ED', cx2, cy2 + 2);
ctx.textAlign = 'left';
ctx.textBaseline = 'alphabetic';

// ── Bottom bar ────────────────────────────────────────────────────────────────
// Domain
ctx.font = '500 14px Inter, Arial, sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.28)';
ctx.fillText('designer-web-de-elite.vercel.app', 90, 590);

// CTA button (right side)
const ctaX = 930, ctaY = 568, ctaW = 200, ctaH = 40, ctaBr = 8;
const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
ctaGrad.addColorStop(0, '#7c3aed');
ctaGrad.addColorStop(1, '#3b82f6');
ctx.beginPath();
ctx.moveTo(ctaX + ctaBr, ctaY);
ctx.lineTo(ctaX + ctaW - ctaBr, ctaY);
ctx.arcTo(ctaX + ctaW, ctaY, ctaX + ctaW, ctaY + ctaH, ctaBr);
ctx.lineTo(ctaX + ctaW, ctaY + ctaH - ctaBr);
ctx.arcTo(ctaX + ctaW, ctaY + ctaH, ctaX + ctaW - ctaBr, ctaY + ctaH, ctaBr);
ctx.lineTo(ctaX + ctaBr, ctaY + ctaH);
ctx.arcTo(ctaX, ctaY + ctaH, ctaX, ctaY + ctaH - ctaBr, ctaBr);
ctx.lineTo(ctaX, ctaY + ctaBr);
ctx.arcTo(ctaX, ctaY, ctaX + ctaBr, ctaY, ctaBr);
ctx.closePath();
ctx.fillStyle = ctaGrad;
ctx.fill();

ctx.font = '700 15px Inter, Arial, sans-serif';
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.fillText('Solicitar Orçamento', ctaX + ctaW / 2, ctaY + 26);
ctx.textAlign = 'left';

// ── Save ─────────────────────────────────────────────────────────────────────
const buffer = canvas.toBuffer('image/png');
writeFileSync(OUTPUT, buffer);
console.log(`✅  og-image.png gerado em: ${OUTPUT}`);
