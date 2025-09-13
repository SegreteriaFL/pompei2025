// Placeholder for any case/diacritic fixes needed later
window.casefix = {
  slug: s => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
};
