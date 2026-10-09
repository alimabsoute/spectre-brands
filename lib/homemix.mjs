// Homepage mixes (design-refresh previews only). Each mix lives in lib/homemix/mixN.mjs + assets/homemix/mixN.css.
// The build calls homeMixData() once (real site content) and renderHomeMixes() to write /preview/home-mix-N/.
// scripts/homemix.mjs re-renders the four pages into dist/ from dist/assets/homemix/data.json, without a full build.
import { TIERS } from './registry.mjs';
import { inline } from './md.mjs';

export const MIX_IDS = [1, 2, 3, 4];

export function homeMixData({ site, companies, img }) {
  const cats = site.categories.filter(k => companies.some(c => c.category === k.id))
    .map(k => ({ id: k.id, label: k.label, blurb: k.blurb, n: companies.filter(c => c.category === k.id).length }));
  const brands = companies.map(c => {
    const pic = img.lead(c, { alt: '' });
    const illustration = !/<(img|picture)\b/.test(pic) || /\/art\//.test(pic);
    return {
      slug: c.slug, name: c.name, number: c.number, tier: c.tier, tierLabel: TIERS[c.tier].label,
      category: c.category, categoryLabel: cats.find(k => k.id === c.category).label,
      years: c.years, died: c.died, place: c.place, cause: (site.causes.find(k => k.id === c.cause) || {}).label || '',
      blurb: c.card.blurb, stat: c.card.stat || null, pic, illustration,
      caption: img.caption(c) || ''
    };
  });
  return {
    site: { headline: site.headline, headlineHtml: inline(site.headline), intro: site.intro, introHtml: inline(site.intro), featured: site.featured,
      tiers: { dead: TIERS.dead.text, ghost: TIERS.ghost.text } },
    categories: cats, brands
  };
}

export async function renderHomeMixes({ data, write }) {
  const out = [];
  for (const n of MIX_IDS) {
    const mod = await import(`./homemix/mix${n}.mjs?t=${Date.now()}`);
    write(`preview/home-mix-${n}/index.html`, mod.render(data));
    out.push({ n, name: mod.meta.name, idea: mod.meta.idea });
  }
  return out;
}
