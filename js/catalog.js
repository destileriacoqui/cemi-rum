(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.COQUI_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return {
    'ron-blanco': { name: 'Ron Coquí Blanco', price: 13, image: 'img/ron-blanco.png' },
    'ron-limon': { name: 'Ron Coquí Limón', price: 14, image: 'img/ron-limon.png' },
    'pitorro-blanco': { name: 'Pitorro Blanco', price: 19, image: 'img/pitorro-blanco.png' },
    'pitorro-coco-35': { name: 'Pitorro de Coco 35%', price: 25, image: 'img/pitorro-coco-35.png' },
    'pitorro-coco-15': { name: 'Pitorro Coco 15%', price: 19, image: 'img/pitorro-coco-15.png' },
    'pitorro-cafe': { name: 'Pitorro Café', price: 19, image: 'img/pitorro-cafe.png' },
    'pitorro-tamarindo': { name: 'Pitorro Tamarindo', price: 25, image: 'img/pitorro-tamarindo.png' },
    'pitorro-parcha': { name: 'Pitorro Parcha', price: 25, image: 'img/pitorro-parcha.png' },
    'pitorro-pina': { name: 'Pitorro Piña', price: 25, image: 'img/pitorro-pina.png' },
    'pitorro-fresa': { name: 'Pitorro Fresa', price: 25, image: 'img/pitorro-fresa.png' },
    'pitorro-frutas': { name: 'Pitorro Frutas', price: 25, image: 'img/pitorro-frutas.png' },
    'blend-coco-pina': { name: 'Coco Piña', price: 22, image: 'img/blend-coco-pina.png' },
    'blend-coco-almendra': { name: 'Coco Almendra', price: 22, image: 'img/blend-coco-almendra.png' },
    'blend-fresa-pina': { name: 'Fresa / Piña', price: 22, image: 'img/blend-fresa-pina.png' },
    'blend-jengibre-coco': { name: 'Jengibre Coco', price: 22, image: 'img/blend-jengibre-coco.png' },
    'blend-mango-pina': { name: 'Mango / Piña', price: 22, image: 'img/blend-mango-pina.png' },
    'blend-coco-fresa-pina': { name: 'Coco, Fresa y Piña', price: 22, image: 'img/blend-coco-fresa-pina.png' },
    carjakers: { name: "Carjaker's Rum", price: 36, image: 'img/carjakers.png' },
    'caneca-blanco': { name: 'Caneca Ron Coquí Blanco', price: 3.25, image: 'img/caneca-blanco.png' },
    'caneca-limon': { name: 'Caneca Ron Coquí Limón', price: 4, image: 'img/caneca-limon.png' },
    'mini-blanco': { name: 'Pitorro Miniature Blanco', price: 3.25, image: 'img/mini-blanco.png' },
    'mini-coco': { name: 'Pitorro Miniature Coco', price: 3.25, image: 'img/mini-coco.png' },
    'mini-parcha': { name: 'Pitorro Miniature Parcha', price: 3.25, image: 'img/mini-parcha.png' },
    'mini-tamarindo': { name: 'Pitorro Miniature Tamarindo', price: 3.25, image: 'img/mini-tamarindo.png' },
    'mini-cafe': { name: 'Pitorro Miniature Café', price: 3.25, image: 'img/mini-cafe.png' }
  };
});
