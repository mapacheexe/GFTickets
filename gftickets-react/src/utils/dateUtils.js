export const formatearFecha = (fechaStr) => {
  return new Date(fechaStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};