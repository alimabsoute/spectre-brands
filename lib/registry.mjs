// The schema of a post-mortem page. Every section id a company may use is listed here.
// core: true  -> every company must provide it (build fails without it)
// core: false -> optional module, rendered and listed in the nav only if the company has the file
// group       -> which nav menu the section appears under
export const GROUPS = [
  { id: 'story', label: 'Story' },
  { id: 'business', label: 'Business' },
  { id: 'brand', label: 'Brand' },
  { id: 'people', label: 'People' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'sources', label: 'Sources' }
];

export const SECTIONS = {
  overview:  { core: true,  group: 'story',    type: 'overview',  label: 'Overview' },        // from company.json, not a section file
  context:   { core: false, group: 'story',    type: 'analysis',  label: 'Context' },
  story:     { core: true,  group: 'story',    type: 'story',     label: 'Story' },
  timeline:  { core: true,  group: 'story',    type: 'timeline',  label: 'Timeline' },
  map:       { core: false, group: 'story',    type: 'map',       label: 'Map' },
  numbers:   { core: true,  group: 'business', type: 'analysis',  label: 'The numbers' },
  economics: { core: false, group: 'business', type: 'analysis',  label: 'Unit economics' },
  marketing: { core: false, group: 'business', type: 'analysis',  label: 'Marketing' },
  rivals:    { core: false, group: 'business', type: 'analysis',  label: 'Rivals' },
  website:   { core: false, group: 'brand',    type: 'website',   label: 'Old website' },
  gallery:   { core: false, group: 'brand',    type: 'gallery',   label: 'Brand gallery' },
  people:    { core: false, group: 'people',   type: 'people',    label: 'People' },
  press:     { core: false, group: 'people',   type: 'press',     label: 'Press' },
  cause:     { core: true,  group: 'verdict',  type: 'cause',     label: 'Cause of death' },
  whatif:    { core: true,  group: 'verdict',  type: 'whatif',    label: 'What if' },
  afterlife: { core: true,  group: 'verdict',  type: 'afterlife', label: 'Afterlife' },
  sources:   { core: true,  group: 'sources',  type: 'sources',   label: 'Sources' }
};

// Canonical page order. A company's "sections" list may reorder optional modules, but core
// sections are always present.
export const ORDER = ['context', 'story', 'timeline', 'map', 'numbers', 'economics', 'marketing', 'rivals',
  'website', 'gallery', 'people', 'press', 'cause', 'whatif', 'afterlife', 'sources'];

export const TIERS = {
  dead:  { label: 'Dead',  text: 'The company is gone: liquidated, dissolved or shut down, with nothing left operating under the name.' },
  ghost: { label: 'Ghost', text: 'The company failed, but the name lives on as a licensed brand, a shell or a storefront run by someone else.' }
};
