var boites_mobiles = boites;
boites = {};

var $monitoring_incoming = $('#monitoring_incoming');
var $monitoring_outgoing = $('#monitoring_outgoing');


/* Chatbot
========== */
(function() {
  var $btn = $('<div class="box-fit box-center box-pass"></div>');
  $btn.append($('<div><div>').append($('<button id="up">Dire au revoir</button>')));

  $btn.on('click', 'button', function() {
    socket.emit('send', {
      to: 'mobiles',
      boite: {
        type: 'chatbot',
        action: 'quit'
      }
    });
  });

  $monitoring_outgoing.append($btn);
  $btn.hide();

  boites.chatbot = {
    type: 'chatbot',

    init: function() {
      $btn.show();
    },

    destroy: function() {
      $btn.hide();
    }
  };
})();

/* Gameboy & Kof93
================== */
(function() {
  var $btn = $('<div class="box-fit box-center box-pass"></div>');
  $btn.append(
    $('<div><div>').append(
      $('<button id="up">↑</button>'),
      $('<button id="down">↓</button>'),
      $('<button id="left">←</button>'),
      $('<button id="right">→</button>'),
      $('<button id="select">select</button>'),
      $('<button id="start">start</button>'),
      $('<button id="a">A</button>')
      // $('<button id="b">b</button>')
    )
  );

  $btn.on('click', 'button', function() {
    socket.emit('send', {
      to: 'screen',
      gamepad_master: this.id
    });
  });

  $monitoring_outgoing.append($btn);
  $btn.hide();

  boites.gameboy = {
    type: 'gameboy',

    init: function() {
      $btn.show();
    },

    destroy: function() {
      $btn.hide();
    }
  };

  boites.kof93 = {
    type: 'kof93',

    init: function() {
      $btn.show();
    },

    destroy: function() {
      $btn.hide();
    }
  };
})();

/* Gifs
======= */
// (function() {
//   var $btn = $('<div class="box-fit box-center box-pass"></div>');
//   var $form = $('<form class="box-v">')
//     .append(
//       `<input name="percent" type="number" placeholder="pourcentage">`,
//       `<input name="seconds" type="number" placeholder="secondes">`,
//       '<button type="submit">Kill gifs</button>'
//     )
//     .on('submit', function(e) {
//       e.preventDefault();
//       var arg = getFormValues($form[0]);
//       socket.emit('send', {
//         to: 'screen',
//         boite: {
//           type: 'gifs',
//           action: 'kill',
//           arg: arg
//         }
//       });
//     });

//   $btn.append($form);
//   $monitoring.append($btn);
//   $btn.hide();

//   boites.gifs = {
//     type: 'gifs',

//     init: function(str) {
//       // console.log(str);
//       if (typeof str === 'string') {
//         var parsed = str.split(/\n/);
//         var data = {};
//         data.percent = parseInt(parsed[0]);
//         data.seconds = parseInt(parsed[1]);
//         setFormValues($form[0], data);
//       }
//       $btn.show();
//     },

//     destroy: function() {
//       $btn.hide();
//     }
//   };
// })();


/* Singe savant
=============== */
(function() {
  var $btn = $('<div class="box-fit box-center box-pass"></div>');
  $btn.append(
    $('<button>Passez au singe suivant</button>').on('click', function() {
      boites.singe_savant.next();
    })
  );

  var keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!'.split('');
  var $keyboard = $('<div></div>');
  $.each(keyboard, function(i, item) {
    $keyboard.append('<button data-key="' + item + '">' + item + '</button>');
  });
  $keyboard.append('<button data-key=" " class="espace">_</button>');
  $keyboard.on('click', 'button', function() {
    var $this = $(this);
    var key = $this.data('key');
    socket.emit('boite', {
      type: 'singe_savant',
      action: 'key_master',
      arg: key
    });
  });

  $btn.append($keyboard);
  $monitoring_outgoing.append($btn);
  $btn.hide();

  window.addEventListener('keydown', function(e) {
    if (active) {
      e.preventDefault();
      if ('code' in e) {
        var code = e.key.toUpperCase();
        socket.emit('boite', {
          type: 'singe_savant',
          action: 'key_master',
          arg: code
        });
      }
    }
  });

  var active = false;
  boites.singe_savant = {
    type: 'singe_savant',

    init: function() {
      active = true;
      $btn.show();
    },

    send: function() {
      this.next();
    },

    next: function() {
      socket.emit('boite', {
        type: this.type,
        action: 'next'
      });
    },

    destroy: function() {
      active = false;
      $btn.hide();
    }
  };
})();

/* Collective song
=============== */
(function() {
  
  var $btn = $('<div class="box-fit box-center box-pass"></div>');
  $btn.append(
    $('<div><div>').append(
      $('<button id="2">2 groups</button>'),
      $('<button id="3">3 groups</button>'),
      $('<button id="4">4 groups</button>'),
      $('<div id="questions"></div>')
    )
  );

  var questions = {};
  $btn.on('click', 'button', function() {
    if (!jQuery.isEmptyObject(questions))  {
      socket.emit('collective song', {
        groups: this.id,
        questions: questions
      });
    }
   
  });

  

  $monitoring_outgoing.append($btn);
  $btn.hide();

  var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
  // var i = 0;
 
  
  boites.collective_song = {
    type: 'collective_song',
    
    init: function(data) {
      $btn.show();
     
      if (data) {
        $('#questions').empty();
        questions = {};
        var dataArray = data.split('\n');
        for(var i = 0; i < dataArray.length; i++) {
          $('#questions').append(`<p style="color: white;">${letters[i]} : ${dataArray[i]}</p>`);
          questions[letters[i]] = dataArray[i];
        }
      }
    },

    destroy: function() {
      $btn.hide();
    }
  };
 
})();


/* Choix
======== */
(function() {
  var $ctrl = $('<div id="boite_choix" class="box-h"></div>');
  var $title = $('<strong></strong>');
  var $stats = $('<form class="boite_choix__stats" style="background:#fff"></form>');
  var $fieldset = $('<fieldset></fieldset>');
  var $btns = $('<div class="box-v"></div>');
  var $btnOk = $('<button title="Valider ces votes" class="icon">👍</button>');
  var $btnGo = $('<button title="Lancer la scène choisie" class="icon">📢</button>');
  var $votants_cont = $('<div class="boite_choix__votants"></div>');
  var $votants_stopped = $('<span style="display:none">🛑</span>');
  var $votants = $('<span>0</span>');

  $votants_cont.append($votants_stopped, 'votants: ', $votants);
  $stats.append($fieldset);
  $btns.append($btnOk, $btnGo);
  $ctrl.append($title, $stats, $votants_cont, $btns);

  var buttonGo = $btnGo[0];

  $btnOk.on('click', function() {
    $fieldset.attr('disabled', true);

    var t = '<br>';
    var bestScore = {
      key: -1,
      score: 0
    };

    var key = 0;

    $('.choix__stats__content').each(function() {
      var $this = $(this);
      var percent = $this.find('.choix__stats__percent').text();
      t += `\
${$this.find('.choix__stats__title').text()}: \
${percent}<br>
`;
      percent = parseInt(percent);
      if (percent > bestScore.score) {
        bestScore.key = key;
        bestScore.score = percent;
      }
      key++;
    });

    $btnOk.hide();
    if (bestScore.key in parsed.choix) {
      var selected = parsed.choix[bestScore.key];
      if ('scene' in selected) {
        var scene_content = $(`[data-key="${selected.scene}"]`);
        if (scene_content.length) {
          var $step = scene_content.find('.scene__step').first();
          $btnGo.show();
          buttonGo.onclick = function() {
            $step.dblclick();
            scrollToStep($step);
            buttonGo.onclick = null;
          };
        }
      }
    }

    socket.emit('console', t);
    socket.emit('send', {
      to: ['mobiles', 'screen'],
      boite: {
        type: 'choix',
        action: 'stop',
        arg: bestScore.key
      }
    });
  });

  var faked = false;
  var manual = true;
  var other = false;
  var inputHistory = [];

  $stats.on('input', 'input', function() {
    var $this = $(this);
    var $out = $this.parent().find('.choix__stats__percent');
    var val = Number($this.val());
    $out.text(val + '%');

    if (manual === false || other === true) return;
    if (manual === true) {
      faked = true;
      $votants_stopped.show();
    }

    inputHistory = inputHistory.filter(item => item !== this);

    var otherTotal = 0;
    for (let i = 0, l = inputHistory.length; i < l; i++) {
      var item = inputHistory[i];
      otherTotal += Number(item.value);
    }

    other = true;
    for (let j = 0, l = inputHistory.length; j < l; j++) {
      var newVal = Number(inputHistory[j].value) + 100 - val - otherTotal;
      if (newVal > 0) {
        inputHistory[j].value = newVal;
        $(inputHistory[j]).trigger('input');
        break;
      } else {
        inputHistory[j].value = 0;
        $(inputHistory[j]).trigger('input');
      }
    }
    other = false;

    other = false;
    inputHistory.push(this);
  });

  $monitoring_outgoing.append($ctrl);
  $ctrl.hide();

  var parsed;

  boites.choix = {
    type: 'choix',

    init: function(data) {
      // console.log(data)
      if (!data) return;

      faked = false;
      manual = true;
      other = false;
      inputHistory.length = 0;

      $ctrl.show();
      $btnOk.show();
      $btnGo.hide();
      // $stats.css('opacity', '');
      $fieldset.attr('disabled', false);
      $votants.text('0');
      $votants_stopped.hide();

      parsed = parseChoix(data);
      if (!parsed) return;
      $fieldset.empty();
      $title.html(parsed.title || '');
      var percent = Math.round(100 / parsed.choix.length);
      parsed.choix.forEach((item, key) => {
        $fieldset.append(
          $(`<label>
        <div class="choix__stats__content box-v">
          <span class="choix__stats__title"><span>${item.text}</span></span>
          <span class="choix__stats__percent box-min">${percent}%</span>
        </div>
        <input class="input_choix" id="input_choix_${key}" type="range" value="${percent}" />
      <label>`)
        );
      });
      $('.input_choix').each(function() {
        inputHistory.push(this);
      });
    },

    stats: function(stats) {
      $votants.text(stats.votants);
      if (faked) return;
      parsed.choix.forEach(function(item, key) {
        key = String(key);
        var p = key in stats.choix ? (stats.choix[key] / stats.votants) * 100 : 0;
        manual = false;
        $('#input_choix_' + key)
          .val(p)
          .trigger('input');
        manual = true;
      });
    },

    destroy: function() {
      $ctrl.hide();
    }
  };
})();
