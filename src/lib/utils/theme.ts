export const setSectorTheme = (sectorId: string | null) => {
  if (sectorId) {
    document.body.setAttribute('data-sector', sectorId);
  } else {
    document.body.removeAttribute('data-sector');
  }
};
