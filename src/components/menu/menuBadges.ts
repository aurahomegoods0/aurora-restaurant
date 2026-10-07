import { BADGE_TAGS, type BadgeTag } from './menuUtils';

export const badgeStyles: Record<BadgeTag, string> = {
  Halal:
    'border-[#C9A227]/40 bg-gradient-to-br from-[#3d3520]/90 to-[#1a1810]/90 text-[#E8D48B]',
  Vegan:
    'border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 to-[#0A0A0A]/90 text-emerald-200/90',
  'Gluten-Free':
    'border-sky-400/30 bg-gradient-to-br from-sky-950/70 to-[#0A0A0A]/90 text-sky-200/90',
  Vegetarian:
    'border-[#8B7355]/40 bg-gradient-to-br from-[#2a2520]/90 to-[#0A0A0A]/90 text-[#D4C4A8]',
};

export function filterBadgeTags(tags: string[] | null): BadgeTag[] {
  return (tags ?? []).filter((tag): tag is BadgeTag =>
    (BADGE_TAGS as readonly string[]).includes(tag),
  );
}
