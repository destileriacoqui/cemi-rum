(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.COQUI_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return {
    'ron-blanco': { name: 'Ron Coquí Blanco', price: 13, image: 'img/ron-blanco-store-v3.webp' },
    'ron-limon': { name: 'Ron Coquí Limón', price: 14, image: 'img/ron-limon-store.webp' },
    'pitorro-blanco': { name: 'Pitorro® Blanco', price: 19, image: 'img/pitorro-blanco-store.webp' },
    'pitorro-coco-35': { name: 'Pitorro® de Coco 35%', price: 25, image: 'img/pitorro-coco-35-store-v2.webp' },
    'pitorro-coco-15': { name: 'Pitorro® Coco 15%', price: 19, image: 'img/pitorro-coco-15-store.webp' },
    'pitorro-cafe': { name: 'Pitorro® Café', price: 19, image: 'img/pitorro-cafe-store.webp' },
    'pitorro-tamarindo': { name: 'Pitorro® Tamarindo', price: 25, image: 'img/pitorro-tamarindo-store.webp' },
    'pitorro-parcha': { name: 'Pitorro® Parcha', price: 25, image: 'img/pitorro-parcha-store.webp' },
    'pitorro-pina': { name: 'Pitorro® Piña', price: 25, image: 'img/pitorro-pina-store.webp' },
    'pitorro-fresa': { name: 'Pitorro® Fresa', price: 25, image: 'img/pitorro-fresa-store.webp' },
    'pitorro-frutas': { name: 'Pitorro® Frutas', price: 25, image: 'img/pitorro-frutas-store.webp' },
    'blend-coco-pina': { name: 'Coco Piña', price: 22, image: 'img/blend-coco-pina-store.webp' },
    'blend-coco-almendra': { name: 'Coco Almendra', price: 22, image: 'img/blend-coco-almendra-store.webp' },
    'blend-fresa-pina': { name: 'Fresa Piña', price: 22, image: 'img/blend-fresa-pina-store.webp' },
    'blend-jengibre-coco': { name: 'Jengibre Coco', price: 22, image: 'img/blend-jengibre-coco-store.webp' },
    'blend-mango-pina': { name: 'Mango Piña', price: 22, image: 'img/blend-mango-pina-store.webp' },
    'blend-coco-fresa-pina': { name: 'Coco, Fresa y Piña', price: 22, image: 'img/blend-coco-fresa-pina-store.webp' },
    carjakers: { name: "Carjaker's Rum", price: 36, image: 'img/carjakers-store.webp' },
    'caneca-blanco': { name: 'Caneca Ron Coquí Blanco', price: 3.25, image: 'img/caneca-blanco-store.webp' },
    'caneca-limon': { name: 'Caneca Ron Coquí Limón', price: 4, image: 'img/caneca-limon-store.webp' },
    'mini-blanco': { name: 'Pitorro® Miniature Blanco', price: 3.25, image: 'img/mini-blanco-store.webp' },
    'mini-coco': { name: 'Pitorro® Miniature Coco', price: 3.25, image: 'img/mini-coco-store.webp' },
    'mini-parcha': { name: 'Pitorro® Miniature Parcha', price: 3.25, image: 'img/mini-parcha-store.webp' },
    'mini-tamarindo': { name: 'Pitorro® Miniature Tamarindo', price: 3.25, image: 'img/mini-tamarindo-store.webp' },
    'mini-cafe': { name: 'Pitorro® Miniature Café', price: 3.25, image: 'img/mini-cafe-store.webp' }
  };
});
