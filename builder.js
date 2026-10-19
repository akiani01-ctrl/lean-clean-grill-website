// Meal builder: adds up protein, calories, carbs and price from the menu.
(function () {
  var MENU = {
    main: [
      { id: 'classic', name: 'Classic Beef Burger', price: 9.99, pro: 39, cal: 450, carb: 40, bun: true, dbl: { price: 4.49, pro: 61, cal: 650 }, beast: 23.99 },
      { id: 'chicken', name: 'Grilled Chicken Sandwich', price: 8.99, pro: 56, cal: 520, carb: 40, bun: true, dbl: { price: 3.99, pro: 100, cal: 750 }, beast: 22.99 },
      { id: 'salmon', name: 'Salmon Sandwich', price: 14.99, pro: 46, cal: 600, carb: 40, bun: true, dbl: { price: 9.99, pro: 80, cal: 950 }, beast: 28.99 },
      { id: 'cbowl', name: 'Chicken Bowl', price: 7.99, pro: 52, cal: 500, carb: 53, dbl: { price: 3.99, pro: 96, cal: 730 } },
      { id: 'bbowl', name: 'Beef Bowl', price: 10.49, pro: 41, cal: 570, carb: 53, dbl: { price: 4.49, pro: 63, cal: 770 } },
      { id: 'sbowl', name: 'Salmon Bowl', price: 13.49, pro: 42, cal: 620, carb: 53, dbl: { price: 9.99, pro: 76, cal: 970 } },
      { id: 'none', name: 'No main' }
    ],
    snack: [
      { id: 'chips', name: 'Protein Chips', price: 3.99, pro: 19, cal: 140, carb: 5 },
      { id: 'jerky', name: 'Halal Beef Jerky', price: 10.99, pro: 13, cal: 70, carb: 2 },
      { id: 'none', name: 'None' }
    ],
    sweet: [
      { id: 'cookie', name: 'Protein Cookie', price: 4.49, pro: 16, cal: 220, carb: 25 },
      { id: 'brownie', name: 'Protein Brownie', price: 4.49, pro: 15, cal: 200, carb: 22 },
      { id: 'bar', name: 'Protein Bar', price: 4.99, pro: 20, cal: 200, carb: 18 },
      { id: 'yogurt', name: 'Blueberry Yogurt Cup', price: 7.99, pro: 49, cal: 330, carb: 31 },
      { id: 'none', name: 'None' }
    ],
    drink: [
      { id: 'choc', name: 'Chocolate Shake', price: 5.99, pro: 40, cal: 250, carb: 15 },
      { id: 'van', name: 'Vanilla Shake', price: 5.99, pro: 40, cal: 240, carb: 14 },
      { id: 'pbb', name: 'PB Banana Shake', price: 7.49, pro: 42, cal: 380, carb: 35 },
      { id: 'water', name: 'Bottled Water', price: 1.49, pro: 0, cal: 0, carb: 0 },
      { id: 'sparkling', name: 'Sparkling Water', price: 1.99, pro: 0, cal: 0, carb: 0 },
      { id: 'soda', name: 'Zero Sugar Soda', price: 1.99, pro: 0, cal: 0, carb: 0 },
      { id: 'electro', name: 'Electrolyte Drink', price: 2.49, pro: 0, cal: 0, carb: 0 },
      { id: 'none', name: 'None' }
    ]
  };
  var DEFAULTS = { main: 'classic', snack: 'chips', sweet: 'cookie', drink: 'choc' };
  var state = Object.assign({}, DEFAULTS);

  var form = document.getElementById('builder');
  if (!form) return;
  var dbl = document.getElementById('mod-double');
  var wrap = document.getElementById('mod-wrap');

  form.querySelectorAll('.chips').forEach(function (box) {
    var group = box.getAttribute('data-group');
    MENU[group].forEach(function (item) {
      var label = document.createElement('label');
      label.className = 'chip';
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = group;
      input.value = item.id;
      input.checked = state[group] === item.id;
      input.addEventListener('change', function () { state[group] = item.id; render(); });
      var span = document.createElement('span');
      span.textContent = item.name;
      label.appendChild(input);
      label.appendChild(span);
      box.appendChild(label);
    });
  });
  dbl.addEventListener('change', render);
  wrap.addEventListener('change', render);

  function find(group) {
    return MENU[group].filter(function (i) { return i.id === state[group]; })[0];
  }
  function money(n) { return '$' + n.toFixed(2); }

  function render() {
    var main = find('main');
    var isSandwich = !!main.bun;
    var canDouble = !!main.dbl;
    dbl.disabled = !canDouble;
    wrap.disabled = !isSandwich;
    if (!canDouble) { dbl.checked = false; }
    if (!isSandwich) { wrap.checked = false; }
    dbl.parentElement.classList.toggle('off', !canDouble);
    wrap.parentElement.classList.toggle('off', !isSandwich);

    var t = { pro: 0, cal: 0, carb: 0, price: 0 };
    var lines = [];

    if (main.id !== 'none') {
      var m = { pro: main.pro, cal: main.cal, carb: main.carb, price: main.price };
      var name = main.name;
      if (canDouble && dbl.checked) {
        m.pro = main.dbl.pro; m.cal = main.dbl.cal; m.price += main.dbl.price;
        name += ', double meat';
      }
      if (isSandwich && wrap.checked) {
        m.pro -= 12; m.cal -= 180; m.carb -= 38;
        name += ', lettuce wrap';
      }
      add(t, m); lines.push([name, m.pro]);
    }
    ['snack', 'sweet', 'drink'].forEach(function (g) {
      var it = find(g);
      if (it.id !== 'none') { add(t, it); lines.push([it.name, it.pro]); }
    });

    tween(document.getElementById('t-pro'), t.pro);
    document.getElementById('t-cal').textContent = t.cal.toLocaleString();
    document.getElementById('t-carb').textContent = t.carb + 'g';

    var beastEl = document.getElementById('t-beast');
    var isBeast = isSandwich && !dbl.checked && state.snack === 'chips' && state.sweet === 'cookie' && state.drink === 'choc';
    var priceEl = document.getElementById('t-price');
    if (isBeast) {
      priceEl.innerHTML = money(main.beast) + ' <s>' + money(t.price) + '</s>';
      beastEl.hidden = false;
      beastEl.textContent = 'That’s a Beast Meal. You save ' + money(t.price - main.beast) + '.';
    } else {
      priceEl.textContent = money(t.price);
      beastEl.hidden = true;
    }

    var ul = document.getElementById('t-items');
    ul.innerHTML = '';
    lines.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('span'); a.textContent = l[0];
      var b = document.createElement('span'); b.textContent = l[1] + 'g';
      li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tween(el, to) {
    var from = parseInt(el.textContent, 10) || 0;
    if (reduceMotion || from === to) { el.textContent = to; return; }
    var t0 = null;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    (function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 450);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function add(t, i) { t.pro += i.pro; t.cal += i.cal; t.carb += i.carb; t.price += i.price; }

  render();
})();
