toggleFullScreen = function() {};

const isPositiveInteger = val => val >>> 0 === parseFloat(val);

function locate(obj, path, sep = '.') {
  return path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key) => acc[key], obj);
}

function allocate(obj, path, val = null, sep = '.') {
  path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key, i, arr) => {
      acc[key] = arr.length - 1 === i ? val : acc[key] || {};
      return acc[key];
    }, obj);
  return obj;
}

allocate.json = function(obj, path, val = null, sep = '.') {
  path
    .split(sep)
    .filter(key => key !== '')
    .reduce((acc, key, i, arr) => {
      acc[key] =
        arr.length - 1 === i
          ? val
          : acc[key] || (isPositiveInteger(arr[i + 1]) ? [] : {});
      return acc[key];
    }, obj);
  return obj;
};

const getFormValues = (form, withEmpty = false) => {
  var data = {};
  [...form.elements].forEach(el => {
    if (el.name === '' || el.disabled) return;
    let val;
    if ('valueAsDate' in el && el.valueAsDate !== null) val = el.valueAsDate;
    else if (el.type === 'number') val = el.value !== '' ? Number(el.value) : '';
    else if (el.type === 'range') val = el.value !== '' ? Number(el.value) : '';
    else if (el.type === 'checkbox') val = Boolean(el.checked);
    else if (el.type === 'radio') {
      if (el.checked) val = el.value;
      else return;
    } else if (el.type === 'select-multiple') {
      val = [...el.options].filter(option => option.selected).map(option => option.value);
    } else if (withEmpty || el.value) {
      val = el.value;
    } else return;

    var name = el.name;
    if (name === 'mode_aff') name = 'mode';
    allocate(data, name, val);
  });
  return data;
};

const setFormValues = (form, data) => {
  [...form.elements].forEach(el => {
    var name = el.name;
    if (name === 'mode_aff') name = 'mode';
    var val = locate(data, name);
    if (el.type === 'checkbox') {
      el.checked = val;
    } else if (el.type === 'radio') {
      if (el.value === String(val)) el.checked = true;
    } else if (el.type === 'number' || el.type === 'range') {
      if (!Number.isNaN(Number(val))) el.value = val;
    } else if (val != null) {
      el.value = val;
    }
    $(el).trigger('input');
  });
};

var scenes;
var reponses;

var states = {
  visual: {
    // current: 'TEST boites'
  }
};


$.getJSON('/data/reponsesBot.json', function(data) {
  reponses = data;
  displayReponses();
});

socket.on('init states', function(data) {
  states = deepMerge(states, data);
  if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
  displayUsers();
  displayMedia();
});

socket.on('users change', function(users) {
  states.users = users;
  displayUsers(true);
});

socket.on('saving', function(data) {
  if (data.error === false) {
    var remove = actions.message({
      user: 'system',
      text: 'Sauvegarde ok'
    });
    setTimeout(remove, 1500);
  } else {
    actions.message({
      user: 'system',
      text: `Une erreur est survenue lors de la sauvegarde, le mieux à faire est de copier-coller des textes en cours d'édition dans un bloc note, de rafraichir la page et de re-essayer de les enregistrer

      <textarea class="code">${data.error}</textarea>`
    });
  }
});

socket.on('start', (start) => {
    document.getElementById("emo").click();
    document.getElementById("console").click();
    document.getElementById("screen").click();
})

var $main = $('main');

$main
  .on('focus', '.message_moderation textarea', function() {
    this.select();
  })
  .on('click', '.scene__toggle, .box-v > b, .box-h > b', function() {
    var $this = $(this);
    var next = $this.parent();
    if (next) {
      next.toggleClass('closed');
    }
  })
  .on('click', '.toggle', function() {
    $(this).toggleClass('active');
  });

$('#refresh_mobiles').on('click', function() {
  socket.emit('send', {
    to: 'mobiles',
    reload: true
  });
});

$('#debug').append(
  $(`<div class="box-v"></div>`).append(
    $('<button><span class="icon">⚠️</span> reset everything</button>').on(
      'click',
      function() {
        socket.emit('reset all');
      }
    ),
    '<div class="sep"></div>',
    $('<button><span class="icon">🚿</span> clean every users</button>').on(
      'click',
      function() {
        socket.emit('purge users');
      }
    )
  ),
  '<div class="sep"></div>',
  $(`<div class="box-v"></div>`).append(
    $('<button><span class="icon">♻️</span> reload</button>').on('click', function() {
      socket.emit('send', {
        to: $('#select_reload')
          .val()
          .split(/\s*,\s*/),
        reload: true
      });
    }),
    $(`<select id="select_reload">
      <option value="emos,screen,consoles,laptops,mobiles">all clients</option>
      <option value="emos,screen,consoles,laptops">all screens</option>
      <option value="mobiles">all mobiles</option>
      <option value="emos,screen,consoles,laptops,mobiles,masters">all clients (and masters)</option>
    </select>`)
  )
);

$('#tools').append(
  $(`<div class="box-v"></div>`).append(
    $(`<button class="_icon"><i>🚫</i> clear all screens</button>`).on(
      'click',
      function() {
        socket.emit('step', offStep);
      }
    )
  )
);


/* Shortcuts
============ */
var disabledCombos = ['ctrl+left', 'ctrl+right', 'y', 'n'];

Mousetrap.prototype.stopCallback = function(e, element, combo) {
  return (
    disabledCombos.includes(combo) &&
    (element.tagName == 'INPUT' ||
      element.tagName == 'SELECT' ||
      element.tagName == 'TEXTAREA' ||
      (element.contentEditable && element.contentEditable == 'true'))
  );
};

var shortcuts = {
  'ctrl+s': [
    'Sauvegarder le visual novel',
    function() {
      $('#visual__save').click();
      return false;
    },
    '#visual__save'
  ],
  'ctrl+del': [
    "Supprimer la scène ou l'étape active",
    function() {
      $('#visual__delete').click();
      return false;
    },
    '#visual__delete'
  ],
  'alt+e': [
    'Ajouter une étape',
    function() {
      $('#visual__add_step').click();
      return false;
    },
    '#visual__add_step'
  ],
  'alt+s': [
    'Ajouter une scène',
    function() {
      $('#visual__add_scene').click();
      return false;
    },
    '#visual__add_scene'
  ],
  'ctrl+left': [
    "Lancer l'étape suivante du visual novel",
    function() {
      $('#visual__prev').click();
      return false;
    },
    '#visual__prev'
  ],
  'ctrl+right': [
    "Lancer l'étape precedente du visual novel",
    function() {
      $('#visual__next').click();
      return false;
    },
    '#visual__next'
  ],
  'ctrl+enter': [
    "Lancer l'écran en cours d'édition",
    function() {
      if (document.activeElement.form) {
        var $form = $(document.activeElement.form);
        if (
          $form.hasClass('box-screen') ||
          $form[0].id === 'boite' ||
          $form[0].id === 'one_shot'
        ) {
          $form.submit();
        }
      }
      return false;
    }
  ],
  'ctrl+shift+enter': [
    'Lancer tout les écrans',
    function() {
      sendScreens();
      return false;
    },
    '#send_all_screens'
  ],
  y: [
    'Valide le 1er message de la liste de moderation',
    function() {
      $('.message_moderation')
        .first()
        .find('.btn_yes')
        .click();
    }
  ],
  n: [
    'Invalide le 1er message de la liste de moderation',
    function() {
      $('.message_moderation')
        .first()
        .find('.btn_no')
        .click();
    }
  ]
};

var $shortcuts = $('#shortcuts');
$.each(shortcuts, function(key, val) {
  Mousetrap.bind(key, val[1]);
  if (val[2]) {
    $(val[2]).attr('title', `${val[0]} (${key})`);
  }
  $shortcuts.append(`<div><strong>${key}</strong> : ${val[0]}</div>`);
});

/* Emojis
========= */
// prettier-ignore
var emojis = ['📱','😂','❤','😍','🤣','😊','🙏','💕','😭','😘','👍','🤔','🔥','🥰'];

var $emojis = $('#emojis');

$.each(emojis, function(key, val) {
  $(`<span class="emoji">${val}</span>`)
    .on('mousedown', function() {
      setEdit(val);
    })
    .appendTo($emojis);
});

/* Presets
========== */
// var $presets = $('#presets');
// $presets.append(
//   $('<button><i>⚫</i> noir</button>').on('click', function() {
//     setCtrlScreens(
//       deepMerge({}, dummyStep, offStep, {
//         osc: {
//           message: 0
//         }
//       })
//     );
//   }),
//   $('<button><i>📱</i> émoji téléphone</button>').on('click', function() {
//     setCtrlScreen(
//       screens.emo,
//       deepMerge({}, defaultScreen, {
//         active: true,
//         texte: '📱',
//         mode: 'biggest_text'
//       })
//     );
//   }),
//   $('<button><i>⏲</i> choix</button>').on('click', function() {
//     setCtrlScreens(
//       deepMerge({}, dummyStep, {
//         screen: {
//           active: true,
//           music: { src: 'Sons/chrono.wav', loop: true }
//         },
//         emo: {
//           active: true,
//           texte: '📱',
//           mode: 'biggest_text'
//         },
//         boite: {
//           type: 'choix'
//         }
//       })
//     );
//   }),
//   $('<button><i>🧙</i> final fantasy</button>').on('click', function() {
//     setCtrlScreen(
//       screens.screen,
//       deepMerge({}, defaultScreen, {
//         active: true,
//         mode: 'final-fantasy'
//       })
//     );
//   }),
//   $('<button><i>🖥</i>️ console</button>').on('click', function() {
//     setCtrlScreen(
//       screens.console,
//       deepMerge({}, defaultScreen, {
//         active: true,
//         mode: 'console'
//       })
//     );
//   })
// );

/* Moderation
============= */
$main.on('click', '.message_moderation__text img', function() {
  var image = new Image();
  image.src = this.src;
  var w = window.open('');
  w.document.write(image.outerHTML);
});

actions.message = function(data) {
  var $msg = $(`<div class="message_moderation">`);
  var $box = $(`<div class="message_moderation__btns box-v"></div>`);

  $msg.append(
    `<div class="message_moderation__nick">
    ${typeof data.user === 'string' ? '' : data.user.nick}
    </div>`
  );

  $msg.append(
    $(`<div class="message_moderation__close">&times;</div>`).on('click', function() {
      remove();
    })
  );

  $msg.append($box);

  $msg.append(`<div class="message_moderation__text">${data.text}</div>`);

  if (data.user !== 'system') {
    $box.append(
      $('<button class="icon btn_yes"></button')
        .text('👍')
        .on('click', function() {
          socket.emit('send', {
            to: 'screens',
            validated: data
          });
          socket.emit('broadcast', {
            to: [data.user.id],
            type: 'message',
            karma: 1,
            texte: sample(reponses['👍'].data)
          });
          var k = $(`#user_${data.user.id}`).find('.user__karma');
          var n = Number(k.text());
          if (Number.isNaN(n) === false) k.text(n + 1);
          remove();
        }),
      $('<button class="icon btn_no"></button')
        .text('👎')
        .on('click', function() {
          socket.emit('broadcast', {
            to: [data.user.id],
            type: 'message',
            karma: -1,
            texte: sample(reponses['👎'].data)
          });
          var k = $(`#user_${data.user.id}`).find('.user__karma');
          var n = Number(k.text());
          if (Number.isNaN(n) === false) k.text(n - 1);
          remove();
        })
    );
  }

  $('#monitoring').append($msg);

  function remove() {
    $msg.slideUp('fast', function() {
      $msg.remove();
    });
  }

  return remove;
};

/* Boites
========= */
$boites_types = $('#boites_types');

$.each(boites_mobiles, function(key, val) {
  if ('radio' in val && val.radio === false) return;
  $boites_types.append(
    $(`<div class="button_radio">
        <label class="boite_label" title="${key}">
        <input class="boite_radio boite_radio--${key}" value="${key}" type="radio" name="type" />
        <span>${key}</span>
      </label>
    </div>`)
  );
});

$('.boite_radio--no_phone').prop('checked', true);

$boites_types.on('dblclick', '.boite_label', function() {
  $(this.form).submit();
});

/* Media
======== */
var datalists = {
  decors: {
    el: $('<datalist id="list_decors"></datalist>'),
    data: []
  },
  musics: {
    el: $('<datalist id="list_musics"></datalist>'),
    data: []
  },
  styles: {
    el: $('<datalist id="list_styles"></datalist>'),
    data: []
  },
  modes: {
    el: $('<datalist id="list_modes"></datalist>'),
    data: []
  }
};

function datalistsWrite() {
  $.each(datalists, function(key, val) {
    val.el.empty();
    val.data.forEach(item => {
      val.el.append(`<option value="${item}" />`);
    });
  });
}

$.each(datalists, function(key, val) {
  $main.append(val.el);
});

var $media = $('#media');

$media.on('mousedown', '.file', function() {
  setEdit($(this).attr('title'));
});

var medias = {
  styles: $('.media_styles'),
  decors: $('.media_decors'),
  pages: $('.media_pages'),
  video: $('.media_video'),
  audio: $('.media_audio'),
  gifs: $('.media_gifs'),
  images: $('.media_images')
};

function displayMedia() {
  medias.styles.empty();
  medias.decors.empty();
  medias.pages.empty();
  medias.video.empty();
  medias.audio.empty();
  medias.gifs.empty();
  medias.images.empty();

  $.each(datalists, function(key, val) {
    val.el.empty();
    val.data.length = 0;
  });

  datalists.modes.data = Object.keys(modes);

  /* Pages
  ======== */
  $.each(states.pages, function(key, val) {
    var path = `@${val}`;
    var file = `<div title="${path}" class="file">${path}</div>`;
    medias.pages.append(file);
    datalists.decors.data.push(path);
  });

  /* Css
  ====== */
  var decorsStyleSheet = document.styleSheets[1].cssRules;
  [...decorsStyleSheet].forEach(val => {
    var styles = [...val.style];
    val = val.selectorText;
    if (val) {
      var file = `<div title="${val}" class="file">${val}</div>`;
      if (styles.includes('background-color') || styles.includes('background-image')) {
        medias.decors.append(file);
        datalists.decors.data.push(val);
      } else {
        medias.styles.append(file);
        datalists.styles.data.push(val);
      }
    }
  });

  /* Media
  ======== */
  $.each(states.media, function(key, val) {
    var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;

    // var file = `<div title="${val}" class="file">${val}</div>`;
    if (
      val.toLowerCase().endsWith('.wav') ||
      val.toLowerCase().endsWith('.flac') ||
      val.toLowerCase().endsWith('.mp3') ||
      val.toLowerCase().endsWith('.ogg')
    ) {
      medias.audio.append(file);
      datalists.musics.data.push(val);
    } else if (
      val.toLowerCase().endsWith('.jpeg') ||
      val.toLowerCase().endsWith('.jpg') ||
      val.toLowerCase().endsWith('.png') ||
      val.toLowerCase().endsWith('.svg') ||
      val.toLowerCase().endsWith('.webp') ||
      val.toLowerCase().endsWith('.jfif') 
    ) {
      medias.images.append(file);
      datalists.decors.data.push(val);
    } else if (
      val.toLowerCase().endsWith('.gif') //
    ) {
      medias.gifs.append(file);
      datalists.decors.data.push(val);
    } else if (
      val.toLowerCase().endsWith('.webm') ||
      val.toLowerCase().endsWith('.mp4') ||
      val.toLowerCase().endsWith('.mov') ||
      val.toLowerCase().endsWith('.wmv') ||
      val.toLowerCase().endsWith('.avi') ||
      val.toLowerCase().endsWith('.ogv')
    ) {
      medias.video.append(file);
      datalists.decors.data.push(val);
    }
  });

  datalistsWrite();
}

/* Screens
========== */
var $screens = $('#screens');
var tmpl_screen__ctrl = $('#tmpl_screen__ctrl').html();

var isRepetMode = true;

var screenName = {
  all_screens: '<i>📽️</i> ALL SCREENS'
};

displayScreens();

// var screens = {
//   console: $('#console'),
//   screen: $('#screen'),
//   emo: $('#emo'),
//   laptop: $('#laptop'),
//   boite: $('#boite'),
//   osc: $('#osc'),
//   saut: $('#saut')
// };

var screens = {
    all_screens: $('#all_screens')
  };

  
// var defaultScreen = getFormValues(screens.console[0], true);
// var defaultBoite = getFormValues(screens.boite[0], true);
// var defaultOsc = getFormValues(screens.osc[0], true);
// var defaultSaut = getFormValues(screens.saut[0], true);

// var dummyStep = {
//   console: defaultScreen,
//   screen: defaultScreen,
//   emo: defaultScreen,
//   laptop: defaultScreen,
//   boite: defaultBoite,
//   osc: defaultOsc,
//   saut: defaultSaut
// };

// var cleanedStep = cleanStep(deepMerge({}, dummyStep));
// cleanedStep.osc.message = '';

var offStep = {
  console: { active: false },
  screen: { active: false },
  emo: { active: false },
  laptop: { active: false }
};

function cleanStep(step) {
  if (typeof step === 'object') {
    $.each(step, (key, val) => {
      if (val === '') step[key] = ' ';
      else step[key] = cleanStep(step[key]);
    });
  }
  return step;
}

function displayScreen(name) {
  return $(
    `<form id="${name}" class="box-h box-screen" autocomplete="off"></form>`
  ).append(
    $(`<div class="box-v box-min"><div class="button_radio _box-min">
        <label>
          <input checked type="checkbox" name="active" />
          <span>${screenName[name]}</span>
        </label>
      </div>
      <!--<button class="change_screen_rotation box-min icon toggle">📐</button>-->
      </div>`),
    $(`${tmpl_screen__ctrl}`),
    // $(`<button class="icon" type="submit">📢</button>`)
  );
}

// function displayScreens() {
//   $screens.append(
//     displayScreen('console'),
//     displayScreen('screen'),
//     displayScreen('emo'),
//     displayScreen('laptop')
//   );
// }

function displayScreens() {
    $screens.append(
      displayScreen('all_screens')
    );
  }

var lastFocused;
function setEdit(val) {
  lastFocused = document.activeElement;
  lastFocused.value = val;
  setTimeout(function() {
    lastFocused.focus();
    $(lastFocused).trigger('input');
  }, 0);
}

function walkSteps($step) {
  var $parent = $step.parent();
  var data = deepMerge({}, cleanedStep);
  $parent.find('.scene__step').each(function() {
    var val = normalizeStep($(this).data('val'));
    if ('boite' in val === false) val.boite = defaultBoite;
    data = deepMerge(data, val);
    if (this === $step[0]) {
      return false;
    } else {
      if (data.console && 'active' in data.console) delete data.console.active;
      if (data.screen && 'active' in data.screen) delete data.screen.active;
      if (data.emo && 'active' in data.emo) delete data.emo.active;
      if (data.laptop && 'active' in data.laptop) delete data.laptop.active;
    }
  });
  return data;
}

function getScreen(name) {
//   if (name in screens) {
//     return getFormValues(screens[name][0]);
//   }
return getFormValues(screens[name][0]);
}

function getScreens() {
  return {
    //   all_screens: getScreen('all_screens')
    emo: getScreen('all_screens'),
    screen: getScreen('all_screens'),
    console: getScreen('all_screens'),
    laptop: getScreen('all_screens')
    // ,
    // boite: getScreen('boite'),
    // osc: getScreen('osc'),
    // saut: getScreen('saut')
  };
}


function fecthScreens() {
//   var $step = $('.scene__step.active');
//   return $step.length ? walkSteps($step) : getScreens();
return getScreens();
}

function addRepetData(data) {
  if (isRepetMode) {
    var time = $('#repet__min')
      .val()
      .trim();
    if (time !== '') time = Number($('#repet__min').val()) * 60;
    data.repet = {
      time: time,
      pause: $('.repet__pause').hasClass('active')
    };
  }
  return data;
}

function addExtraData(data) {
  // addSelectedUsersData(data);
  addRepetData(data);
  return data;
}

// function sendScreen(name) {
//   var data = fecthScreens();
//   var out = {};
//   out[name] = data[name];
//   socket.emit('step', addExtraData(out));
// }

function sendScreens() {
  var data = fecthScreens();
  socket.emit('step', addExtraData(data));
  if (boite && 'send' in boite) boite.send();
}

$('.radio_fit').on('input', function() {
  $(this.form)
    .find('.sp-preview-inner')
    .css(
      'background-size',
      $(this.form)
        .find('.radio_fit:checked')
        .val()
    );
});

$('.color-picker')
  .on('input', function() {
    var $this = $(this);
    var val = $this.val();

    var $prev = $(this)
      .next()
      .find('.sp-preview-inner');

    $prev[0].className = 'sp-preview-inner';
    $prev.css('background-color', '');
    $prev.css('background-image', '');

    if (val.startsWith('.')) {
      $prev.addClass(val.slice(1));
    } else {
      $prev.css('background-color', val);
      $prev.css('background-image', `url(/data/media/${val})`);
    }
  })
  .spectrum({
    showAlpha: true,
    allowEmpty: true,
    showPalette: true,
    showInitial: true,
    preferredFormat: 'hex3',
    // prettier-ignore
    palette: [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
      ],
    change: function() {
      $(this).trigger('input');
    }
  });

$('#send_all_screens').on('click', sendScreens);

$('.repet__pause').on('click', function() {
  setTimeout(function() {
    socket.emit('send', {
      to: ['screens', 'consoles', 'emos', 'laptops'],
      repet: addRepetData({}).repet
    });
  }, 0);
});
$('.repet__rewind').on('click', function() {
  socket.emit('send', {
    to: ['screens', 'consoles', 'emos', 'laptops'],
    rewind: true
  });
});
$('.repet__forward').on('click', function() {
  socket.emit('send', {
    to: ['screens', 'consoles', 'emos', 'laptops'],
    forward: true
  });
});

/* Visual Novel
=============== */
var $visual = $('#visual');

function checkSceneName(titre) {
  var ok = true;
  $('.scene__toggle').each(function() {
    if ($(this).text() === titre) ok = false;
  });

  if (!ok) {
    alert('Ce nom de scene existe déjà');
    return false;
  }

  return true;
}

function getSceneName(msg = 'Titre', def) {
  var titre = prompt(msg, def);
  if (titre) {
    titre = titre.trim();
    var ok = checkSceneName(titre);
    if (ok) return titre;
  }
  return false;
}

function scrollToStep($step) {
  var $scene = $step.parent().parent();
  if ($scene.hasClass('closed')) {
    $('#visual__closeall').click();
    $scene.removeClass('closed');
  }
  $visual.scrollTo($step, {
    offset: -1 * ($visual.height() / 2),
    over: { top: 0.5 },
    duration: 200
  });
}

function normalizeStep(val) {
  var data =
    typeof val === 'string'
      ? {
          screen: { texte: val },
          emo: {},
          console: {},
          laptop: {},
          boite: {},
          osc: {}
        }
      : val;

  ['screen', 'emo', 'console', 'laptop'].forEach(item => {
    if (item in data && 'decor' in data[item]) {
      data[item].decor.fit = data[item].decor.fit || 'cover';
    }
  });

  return data;
}

function normalizeSeq(val) {
  var val = normalizeStep(val);
  var tmp = {
    screen: deepMerge({}, defaultScreen, val.screen),
    emo: deepMerge({}, defaultScreen, val.emo),
    console: deepMerge({}, defaultScreen, val.console),
    laptop: deepMerge({}, defaultScreen, val.laptop),
    boite: deepMerge({}, defaultBoite, val.boite),
    osc: deepMerge({}, dummyStep.osc, val.osc),
    saut: deepMerge({}, dummyStep.saut, val.saut)
  };

  return tmp;
}

function setCtrlScreen($dest, data) {
  if (data) setFormValues($dest[0], data);
}

function setCtrlScreens(data) {
  setCtrlScreen(screens.emo, data.emo);
  setCtrlScreen(screens.screen, data.screen);
  setCtrlScreen(screens.console, data.console);
  setCtrlScreen(screens.laptop, data.laptop);
  setCtrlScreen(screens.boite, data.boite);
  setCtrlScreen(screens.osc, data.osc);
  setCtrlScreen(screens.saut, data.saut);
}

function activateStep($this) {
  $('.scene__radio:checked').prop('checked', false);
  $('.scene__step').removeClass('active');
  $this.addClass('active');
  setCtrlScreens(normalizeSeq($this.data('val')));
}

function walkStep(data, def) {
  var out = {};
  Object.entries(data).forEach(([key, val]) => {
    if (typeof val === 'object' && key in def) {
      var res = walkStep(val, def[key]);
      if (Object.keys(res).length) out[key] = res;
    } else if (def[key] !== val) out[key] = val;
  });
  return out;
}

// function serialiseStep(val) {
//   if (typeof val === 'object') {
//     val = walkStep(val, dummyStep);
//     if (
//       Object.keys(val).length === 1 &&
//       'screen' in val &&
//       Object.keys(val.screen).length === 1 &&
//       'texte' in val.screen
//     ) {
//       val = val.screen.texte;
//     }
//     if (val.emo && val.emo.active === false) val.emo = { active: false };
//     if (val.screen && val.screen.active === false) val.screen = { active: false };
//     if (val.console && val.console.active === false) val.console = { active: false };
//     if (val.laptop && val.laptop.active === false) val.laptop = { active: false };
//   }
//   return val;
// }

function stringifyStep(val) {
  return JSON.stringify(val, null, 2);
}

// function displayStep(val) {
//   val = serialiseStep(val);
//   return $('<div class="scene__step">')
//     .data({
//       val: val,
//       original: val,
//       saved: []
//     })
//     .append(
//       $('<span class="scene__step__json"></span>').text(stringifyStep(val)),
//       $(`<button class="scene__step__reset no_btn icon">↩️</button>`).attr(
//         'title',
//         'Rétablir les précédentes sauvegardes de cette étape'
//       )
//     );
// }

// function displaySteps(seq) {
//   if (!seq) return;
//   var out = [];
//   $.each(seq, function(key, val) {
//     out.push(displayStep(val));
//   });
//   return out;
// }

// function displayScene(key, val) {
//   return $(`<div class="scene${states.visual.current === key ? '' : ' closed'}">`).append(
//     $(`<input class="scene__radio" name="scene__radio" type="radio">`),
//     $(`<b class="scene__toggle">${key}</b>`),
//     $(`<div data-key="${key}" class="scene__content"></div>`)
//       .append(displaySteps(val))
//       .sortable({
//         axis: 'y'
//       })
//   );
// }

// function addScene(key, val) {
//   $visual.append(displayScene(key, val));
// }

function displaySaut() {
  $('#saut_select').empty();
  $('#saut_select').append(`<option value="">...</option>`);
  $('.scene__content').each(function() {
    var key = $(this).data('key');
    $('#saut_select').append(`<option>${key}</option>`);
  });
}

// function displayVisual() {
//   $visual.empty();
//   $.each(scenes, addScene);
//   $visual.sortable({
//     handle: 'b',
//     axis: 'y'
//   });
//   displaySaut();
// }

$('#visual__save').on('click', function() {
  var data = {};
  $('.scene__content').each(function() {
    var $this = $(this);
    var key = $this.data('key');
    var steps = [];
    data[key] = steps;

    $this.find('.scene__step').each(function() {
      $line = $(this);
      var val = $line.data('val');
      val = serialiseStep(val);
      steps.push(val);
      var saved = $line.data('saved');
      saved.push(val);
      $line.data('saved', saved);
    });
  });

  socket.emit('save', data);
});

$('#visual__add_scene').on('click', function() {
  $('#visual__closeall').click();
  var titre = getSceneName('Nom de la nouvelle scène');
  if (!titre) return;

  var $scene = displayScene(titre, ['']);
  var $prevScene = $('.scene__radio:checked');
  if ($prevScene.length) {
    $prevScene.parent().after($scene);
  } else {
    $visual.append($scene);
  }
  $scene.find('.scene__radio').click();
  $scene.find('.scene__toggle').click();
  displaySaut();
});

$('#visual__add_step').on('click', function() {
  var $step = displayStep('');
  var $prevStep = $('.scene__step.active');
  if ($prevStep.length) $prevStep.after($step);
  else {
    var $prevScene = $('.scene__radio:checked');
    if ($prevScene.length) {
      $prevScene
        .parent()
        .find('.scene__content')
        .append($step);
    } else {
      $('.scene__content')
        .last()
        .append($step);
    }
  }
  $step.click();
  scrollToStep($step);
});

$('#visual__openall').on('click', function() {
  $('.scene').removeClass('closed');
});

$('#visual__closeall').on('click', function() {
  $('.scene').addClass('closed');
});

$('#visual__rename').on('click', function() {
  var $scene = $('.scene__radio:checked').parent();
  if ($scene.length) {
    var $content = $scene.find('.scene__content');
    var titre = getSceneName('Nouveau nom pour la scène', $content.data('key'));
    if (!titre) return;
    $scene.find('.scene__toggle').text(titre);
    $content.data('key', titre).attr('data-key', titre);
  }
});

$('#visual__clone').on('click', function() {
  var $step = $('.scene__step.active');
  if ($step.length) {
    var $clone = $step.clone(true);
    $step.after($clone);
    $clone.click();
  } else {
    var $scene = $('.scene__radio:checked').parent();
    if ($scene.length) {
      var $content = $scene.find('.scene__content');
      var titre = getSceneName('Nom pour la copie', $content.data('key') + '-2');
      if (!titre) return;
      var $clone = $scene.clone(true);
      $scene.after($clone);
      $clone.find('.scene__toggle').text(titre);
      $clone.find('.scene__content').data('key', titre);
      $clone.find('.scene__radio').prop('checked', true);
    }
  }
});

$('#visual__delete').on('click', function() {
  var $step = $('.scene__step.active');
  if ($step.length) {
    var $next = $step.next();
    if ($next.length === 0) $next = $step.prev();
    $step.remove();
    $next.click();
  } else {
    var $scene = $('.scene__radio:checked').parent();
    if ($scene.length) {
      var $next = $scene.next();
      if ($next.length === 0) $next = $scene.prev();
      $scene.remove();
      $next.find('.scene__radio').click();
    }
  }
});

$('#visual__next').on('click', function() {
  var $current = $('.scene__step.active');
  var val = $current.data('val');
  if (val && typeof val === 'object' && 'saut' in val && 'scene' in val.saut) {
    var $next = $(
      `.scene__content[data-key="${val.saut.scene}"] .scene__step:first-child`
    );
    if ($next.length) {
      activateStep($next);
      scrollToStep($next);
      sendScreens();
    }
    return;
  }

  var $next = $current.next();
  if ($next.length === 0) return;
  activateStep($next);
  scrollToStep($next);
  sendScreens();
});

$('#visual__prev').on('click', function() {
  var $current = $('.scene__step.active');
  var $next = $current.prev();
  if ($next.length === 0) return;
  activateStep($next);
  scrollToStep($next);
  sendScreens();
});

$visual
  .on('click', function(e) {
    if (e.target === $visual[0] || e.target.classList.contains('scene')) {
      $('.scene__radio').prop('checked', false);
      $('.scene__step').removeClass('active');
    }
  })
  .on('click', '.scene__radio', function() {
    $('.scene__step').removeClass('active');
  })
  .on('click', '.scene__step', function() {
    activateStep($(this));
  })
  .on('dblclick', '.scene__step', function() {
    activateStep($(this));
    sendScreens();
  })
  .on('click', '.scene__step__reset', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var $step = $(this).parent();
    var saved = $step.data('saved');
    var val = saved.pop() || $step.data('original');
    $step
      .data('val', val)
      .find('.scene__step__json')
      .text(stringifyStep(val));
    $step.click();
  });

/* Users
======== */
var $users = $('#users');
var $interactions = $('#interactions');
var $reponses = $('#reponses');

function displayUser(user) {
  return $(`<tr class="user" data-id="${user.id}" id="user_${user.id}">`).append(
    $('<td><input checked type="checkbox" class="user_check"></td>'),
    $(`<td><span class="user__online user__online--${user.online ? 'yes' : 'no'}"></td>`),
    $(`<td><span class="user__nick">${user.nick}</span></td>`),
    $(`<td><span class="user__karma">${user.karma}</span></td>`)
  );
}

$nb_users_inscrits = $('#nb_users_inscrits');
$nb_users_connectes = $('#nb_users_connectes');

function displayUsers(recheck) {
  // var checked = [];
  // $users.find(':checked').each(function() {
  //   checked.push(
  //     $(this)
  //       .parent()
  //       .parent()[0].id
  //   );
  // });
  $users.empty();
  var inscrits = 0;
  var connected = 0;
  $.each(states.users, function(key, val) {
    inscrits++;
    if (val.online) connected++;
    $users.append(displayUser(val));
  });
  $nb_users_inscrits.text(inscrits);
  $nb_users_connectes.text(connected);
  // if (recheck) {
  //   $users.find(':checked').prop('checked', false);
  //   checked.forEach(function(id) {
  //     $('#' + id)
  //       .find('input')
  //       .prop('checked', true);
  //   });
  // }
}

function addSelectedUsersData(data) {
  data.to = [];
  $('.user_check:checked')
    .parent()
    .parent()
    .each(function() {
      data.to.push($(this).data('id'));
    });
}

function sendToSelectedUsers(data) {
  addSelectedUsersData(data);
  socket.emit('broadcast', data);
}

function displayReponses() {
  $reponses.empty();
  $.each(reponses, function(key, val) {
    var $btn = $(`<button title="${val.title}" class="icon">${key}</button>`);
    $reponses.append(
      $btn.on('click', function(e) {
        e.preventDefault();
        sendToSelectedUsers({
          type: val.type,
          texte: sample(val.data)
        });
      })
    );
  });
}

$('#users_check_all').on('change', function() {
  $('.user_check').prop('checked', this.checked);
});

$('#select_random_users').on('click', function() {
  $('#users_check_all').prop('checked', false);
  var $u = $('.user_check');
  $u.prop('checked', false);
  var n = Number($('#number_random_users').val());
  if (Number.isNaN(n)) n = 1;

  var subarr = getRandomSubarray($u, n);
  subarr.each(function() {
    $(this).prop('checked', true);
  });
});

/* Main
======= */
var $one_shot__message = $('#one_shot__message');

$main
  .on('input', 'form', function() {
    if (this.id === 'form_osc_ip') return;
    var data = getScreens();
    if (this.id === 'boite' && 'boite' in data) {
      setBoite(data.boite);
    }
    var $step = $('.scene__step.active');
    if ($step.length) {
      var val = serialiseStep(data);
      $step
        .data('val', val)
        .find('.scene__step__json')
        .text(stringifyStep(val));
    }
  })
  .on('submit', 'form', function(e) {
    e.preventDefault();
    if (this.id === 'interactions') {
      sendToSelectedUsers({
        type: 'message',
        texte: $one_shot__message.val()
      });
      $one_shot__message.val('');
    } else if (this.id === 'form_osc_ip') {
      socket.emit('set osc host', $('#osc_ip').val());
    } else {
      const screens = ['console', 'screen', 'emo', 'laptop'];
      screens.forEach(element => sendScreen(element))
    //   sendScreen(this.id);
    }
  });

socket.open();

actions.next_step = function() {
  $('#visual__next').click();
};
actions.prev_step = function() {
  $('#visual__prev').click();
};

const constraints = {
  video: {
    width: {
      min: 500,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 150,
      ideal: 1080,
      max: 1440,
    },
    facingMode: "environment"
  },
};


