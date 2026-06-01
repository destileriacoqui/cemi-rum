(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.COQUI_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return {
    'ron-blanco': { name: 'Ron Coquí Blanco', price: 13, image: 'img/ron-blanco.webp' },
    'ron-limon': { name: 'Ron Coquí Limón', price: 14, image: 'img/ron-limon.webp' },
    'pitorro-blanco': { name: 'Pitorro Blanco', price: 19, image: 'img/pitorro-blanco.webp' },
    'pitorro-coco-35': { name: 'Pitorro de Coco 35%', price: 25, image: 'img/pitorro-coco-35.webp' },
    'pitorro-coco-15': { name: 'Pitorro Coco 15%', price: 19, image: 'img/pitorro-coco-15.webp' },
    'pitorro-cafe': { name: 'Pitorro Café', price: 19, image: 'img/pitorro-cafe.webp' },
    'pitorro-tamarindo': { name: 'Pitorro Tamarindo', price: 25, image: 'img/pitorro-tamarindo.webp' },
    'pitorro-parcha': { name: 'Pitorro Parcha', price: 25, image: 'img/pitorro-parcha.webp' },
    'pitorro-pina': { name: 'Pitorro Piña', price: 25, image: 'img/pitorro-pina.webp' },
    'pitorro-fresa': { name: 'Pitorro Fresa', price: 25, image: 'img/pitorro-fresa.webp' },
    'pitorro-frutas': { name: 'Pitorro Frutas', price: 25, image: 'img/pitorro-frutas.webp' },
    'blend-coco-pina': { name: 'Coco Piña', price: 22, image: 'img/blend-coco-pina.webp' },
    'blend-coco-almendra': { name: 'Coco Almendra', price: 22, image: 'img/blend-coco-almendra.webp' },
    'blend-fresa-pina': { name: 'Fresa / Piña', price: 22, image: 'img/blend-fresa-pina.webp' },
    'blend-jengibre-coco': { name: 'Jengibre Coco', price: 22, image: 'img/blend-jengibre-coco.webp' },
    'blend-mango-pina': { name: 'Mango / Piña', price: 22, image: 'img/blend-mango-pina.webp' },
    'blend-coco-fresa-pina': { name: 'Coco, Fresa y Piña', price: 22, image: 'img/blend-coco-fresa-pina.webp' },
    carjakers: { name: "Carjaker's Rum", price: 36, image: 'img/carjakers.webp' },
    'caneca-blanco': { name: 'Caneca Ron Coquí Blanco', price: 3.25, image: 'img/caneca-blanco.webp' },
    'caneca-limon': { name: 'Caneca Ron Coquí Limón', price: 4, image: 'img/caneca-limon.webp' },
    'mini-blanco': { name: 'Pitorro Miniature Blanco', price: 3.25, image: 'img/mini-blanco.webp' },
    'mini-coco': { name: 'Pitorro Miniature Coco', price: 3.25, image: 'img/mini-coco.webp' },
    'mini-parcha': { name: 'Pitorro Miniature Parcha', price: 3.25, image: 'img/mini-parcha.webp' },
    'mini-tamarindo': { name: 'Pitorro Miniature Tamarindo', price: 3.25, image: 'img/mini-tamarindo.webp' },
    'mini-cafe': { name: 'Pitorro Miniature Café', price: 3.25, image: 'img/mini-cafe.webp' }
  };
});
