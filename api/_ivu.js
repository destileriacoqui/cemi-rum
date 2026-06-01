const IVU_RATE = 0.115;

function ivuFor(subtotal) {
  return Math.round(Number(subtotal || 0) * IVU_RATE * 100) / 100;
}

module.exports = { IVU_RATE, ivuFor };
