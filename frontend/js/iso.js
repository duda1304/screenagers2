// isomorphic code, for node and browser

if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function uuid() {
  return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}

function deepMerge() {
  var newObj = {};
  var merge = function(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          newObj[prop] = deepMerge(newObj[prop], obj[prop]);
        } else newObj[prop] = obj[prop];
      }
    }
  };
  for (var i = 0; i < arguments.length; i++) merge(arguments[i]);
  return newObj;
}

function chance(perc) {
  return Math.random() < (perc ? perc / 100 : 0.5);
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function parseChoix(choix) {
  if (typeof choix !== 'string') return;
  var lines = choix.split(/\n\n/);
  var data = { choix: [] };

  for (var i = 0, l = lines.length; i < l; i++) {
    var str = lines[i];
    str = str.trim();
    if (str) {
      if (str[0] === '#') {
        data.title = str.slice(1);
      } else {
        var cur = { text: '' };
        var str = lines[i].replace(/\[([^\]]*)\]/, function(_, scene) {
          cur.scene = scene;
          return '';
        });
        cur.text = str.trim();
        data.choix.push(cur);
      }
    }
  }

  return data;
}

var boite;
var boites = {};

function setBoite(data) {
  try {
    if (boite && data.type !== boite.type && 'destroy' in boite) {
      boite.destroy();
    }
    if (data.type && data.type in boites) {
      boite = boites[data.type];
      if ('action' in data && data.action in boite) {
        if ('init' in data) boite.init(data.init);
        boite[data.action](data.arg, data.id);
      } else if ('init' in boite) {
        boite.init(data.arg);
      }
    } else boite = null;
  } catch (err) {
    console.log('setBoite error', err);
  }
}

if (typeof exports == 'object' && typeof module == 'object') {
  module.exports = {
    boites: boites,
    setBoite: setBoite,
    uuid: uuid,
    deepMerge: deepMerge,
    sample: sample,
    chance: chance,
    parseChoix: parseChoix,
    getRandomSubarray: getRandomSubarray
  };
} else {
  actions.boite = setBoite;
}
