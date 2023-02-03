'use strict';

var $header = $('#header');
var $footer = $('#footer');

var mobileJSON;

socket.on('display HTML content', (data) => {
  $.getJSON(`/data/mobile.json`)
  .then(function(text) {
    mobileJSON = text[data];
  })
});
socket.open();


/* No Phone
=========== */
boites.no_phone = {
  type: 'no_phone',

  init: function() {
    $header.show();
    $('#no_phone').show();
  },

  destroy: function() {
    $('#no_phone').hide();
  }
};

/* Attente
========== */
boites.attente = {
  type: 'attente',

  init: function() {
    $header.show();
    $('#attente').show();
  },

  destroy: function() {
    $('#attente').hide();
  }
};

/* Vide
======= */
boites.vide = {
  type: 'vide',
  init: function() {
    $footer.hide();
  }
};

/* Avertissement
================ */
boites.avertissement = {
  type: 'avertissement',

  init: function() {
    $header.hide();
    $footer.hide();
    $('#avertissement').show();
    actions.alert(
      { title: "Welcome", text: "Your nickname is" + ' ' + displayPseudo()},
      function() {
        $header.show();
        socket.emit('console', "connected");
      }
    );
    var gifImage = $('#send_gif')[0].cloneNode(true);    
    $(gifImage).insertAfter($('.alert__text'))
  },

  destroy: function() {
    $('#avertissement').hide();
  }
};

/* Choix
======== */
(function() {
  boites.choix = {
    type: 'choix',
    // selected: true,

    init: function(str) {
      $header.show();

      if (!$.trim(str)) {
        this.destroy();
        return;
      }

      var data = parseChoix(str);

      var choiceMade = false;
      var alertData = { buttons: [] };
      if (data.title) alertData.title = data.title;

      data.choix.forEach(function(item, key) {
        alertData.buttons.push([
          item.text,
          function($btn) {
            socket.emit('boite', {
              type: 'choix',
              action: 'vote',
              arg: key
            });
            if (choiceMade) return;
            choiceMade = true;
            $alert.find('button').prop('disabled', true);
            $btn.addClass('active');
          }
        ]);
      });

      actions.alert(alertData);
      $('.alert__buttons').before($('<div class="choix_texte"></div>'));
    },

    stop: function() {
      $alert.find('.choix_texte').text("Voting is closed !");
      $alert.find('button').prop('disabled', true);
    },

    destroy: function() {
      actions.closeAlert();
    }
  };
})();

/* Chat
======= */
(function() {
  var $chat = $('#chat');
  var $input__message = $('#input__message');

  var log = $chat[0];
  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  var chatActive = false;
  var chatBot = false;
  var chatBotActive = false;

  if (cat === 'mobile') {
    $(window).resize(function() {
      scrollDown();
    });

    var tid;
    $('#sendMsgForm').on('submit', function(e) {
      e.preventDefault();
      var val = $.trim($input__message.val());
      if (val) {
        $input__message.val('');
        setTimeout(function() {
          $input__message.focus();
        }, 0);
        boites.chat.msg('me', val);
        if (chatBot === true) {
          if (chatBotActive) {
            clearTimeout(tid);
            tid = setTimeout(function() {
              boites.chat.msg('you', bot.reply(val));
            }, Math.random() * 2000 + 700);
          }
        } else {
          socket.emit('message', {
            text: val
          });
        }
      }
    });
  }

  boites.chat = {
    type: 'chat',
    // selected: true,

    msg: function(who, val) {
      $chat.append(
        $('<div class="chat__line chat__line--' + who + '"></div>').append(
          '<div class="bulle bulle--' + who + '">' + val + '</div>'
        )
      );
      scrollDown();
      if (chatActive === false) {
        actions.alert({
          title: 'Message',
          text: val
        });
      }
    },

    init: function(str) {
      chatActive = true;
      $chat.show();
      $header.show();
      $footer.show();
      str = $.trim(str);
      if (str) boites.chat.msg('you', str);
    },

    destroy: function() {
      chatActive = false;
      $chat.hide();
      $footer.hide();
    }
  };

  boites.chatbot = {
    type: 'chatbot',
    // selected: true,

    init: function() {
      chatBot = true;
      chatBotActive = true;
      boites.chat.init();

      setTimeout(function() {
        boites.chat.msg('you', bot.initials());
      }, Math.random() * 1000 + 700);
    },

    quit: function() {
      chatBotActive = false;
      setTimeout(function() {
        boites.chat.msg('you', bot.finals());
      }, Math.random() * 1000 + 700);
    },

    destroy: function() {
      chatBot = false;
      chatBotActive = false;
      boites.chat.destroy();
    }
  };
})();

/* Image
======== */
(function() {
  if (cat === 'mobile') {
    var $image = $('#image');
    var $image_upload = $('#image_upload');
    var $image_output = $('#image_output');
    var image_output = $image_output[0];

    var $image_check_icon = $('#image_check_icon');
    var $image_photo_icon = $('#image_photo_icon');

  
    // function doFile(file) {
    //   if (file !== null) {
    //     // loadImageOrientation();
    //     // function loadImageOrientation() {
    //         loadImage.parseMetaData(file, function (data) {
    //           let options = {};
    //             if (data.exif) {
    //                 options.orientation = data.exif.get('Orientation');
    //             }
    //             // loadImage(file, callback, options);
    //             loadImage(
    //               file,
    //               function(canvas) {
    //                 if (canvas) {
    //                   var dataURL = canvas.toDataURL('image/jpeg', 0.8);
    //                   image_output.src = dataURL;
    //                   socket.emit('boite', {
    //                     type: 'image',
    //                     action: 'url',
    //                     arg: dataURL
    //                   });
    //                   $image_output.show();
    //                   $image_check_icon.show();
    //                   $image_photo_icon.hide();
    //                 } else alert("Image reading problem");
    //               },
    //               {
    //                 maxWidth: 1500,
    //                 orientation: options.orientation,
    //                 meta: true,
    //                 canvas: true
    //               }
    //             );
    //         });
    //     // }
    //     // loadImage(
    //     //   file,
    //     //   function(canvas) {
    //     //     if (canvas) {
    //     //       var dataURL = canvas.toDataURL('image/jpeg', 0.8);
    //     //       image_output.src = dataURL;
    //     //       socket.emit('boite', {
    //     //         type: 'image',
    //     //         action: 'url',
    //     //         arg: dataURL
    //     //       });
    //     //       $image_output.show();
    //     //       $image_check_icon.show();
    //     //       $image_photo_icon.hide();
    //     //     } else alert("Image reading problem");
    //     //   },
    //     //   {
    //     //     maxWidth: 1500,
    //     //     orientation: true,
    //     //     meta: true,
    //     //     canvas: true
    //     //   }
    //     // );
    //   }
    // }

    function doFile(file) {
      if (file !== null) {
        loadImage(
          file,
          function(canvas) {
            if (canvas) {
              var dataURL = canvas.toDataURL('image/jpeg', 0.8);
              image_output.src = dataURL;
              socket.emit('boite', {
                type: 'image',
                action: 'url',
                arg: dataURL
              });
              $image_output.show();
              $image_check_icon.show();
              $image_photo_icon.hide();
            } else alert("Image reading problem");
          },
          {
            maxWidth: 1500,
            orientation: true,
            meta: true,
            canvas: true
          }
        );
      }
    }

    function loadImageOrientation(file, callback, options) {
      loadImage.parseMetaData(file, function (data) {
          if (data.exif) {
              // options.orientation = data.exif.get('Orientation');
          }
          loadImage(file, callback, options);
          
      });
    }

    var fileInput = $image_upload[0];
    var active = false;
    fileInput.addEventListener('change', function() {
      if (active === true && fileInput.files[0] !== null) 
      
      loadImageOrientation(fileInput.files[0], function(canvas) {
        if (canvas) {
          var dataURL = canvas.toDataURL('image/jpeg', 0.8);
          image_output.src = dataURL;
          socket.emit('boite', {
            type: 'image',
            action: 'url',
            arg: dataURL
          });
          $image_output.show();
          $image_check_icon.show();
          $image_photo_icon.hide();
        } else alert("Image reading problem");
      },
      {
        maxWidth: 1500,
        orientation: 0,
        meta: true,
        canvas: true
      });
    });
  }

  boites.image = {
    type: 'image',

    init: function() {
      active = true;

      $image_check_icon.hide();
      $image_photo_icon.show();
      $image_output.hide();

      $image.show();
      $header.show();
    },

    destroy: function() {
      active = false;
      $image_upload.off();
      $image.hide();
    }
  };
})();

/* Singe savant
=============== */
(function() {
  var keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!'.split('');
  var $no_now = $('#no_now');
  var $keyboard = $('#keyboard');
  var $key = $('#key');
  $.each(keyboard, function(i, item) {
    $keyboard.append('<button data-key="' + item + '">' + item + '</button>');
  });
  $keyboard.append('<button data-key=" " class="espace">_</button>');

  $keyboard.on('click', 'button', function() {
    var $this = $(this);
    var key = $this.data('key');
    socket.emit('boite', {
      type: 'singe_savant',
      action: 'key',
      arg: key
    });
    if (key === ' ') key = '_';
    $keyboard.hide();
    $no_now.hide();
    $key.show().text(key);
  });

  var $singe_savant = $('#singe_savant');

  boites.singe_savant = {
    type: 'singe_savant',
    // selected: true,

    init: function() {
      $singe_savant.show();
      $header.show();
      $no_now.show();
      $key.hide();
      $keyboard.hide();
    },

    keyboard: function() {
      // actions.vibrate();
      $no_now.hide();
      $key.hide();
      $keyboard.show();
    },

    next: function(id) {
      if ($key.css('display') == 'none') {
        $no_now.show();
      }
      $keyboard.hide();
      if (id === user.id) this.keyboard();
    },

    destroy: function() {
      $singe_savant.hide();
    }
  };
})();


/* Collective song
=============== */
(function() {
  var $collective_song = $('#collective_song');
  $collective_song.empty();
 
  boites.collective_song = {
    type: 'collective_song',    

    questions: function(data) {
      if (data) {
        
      $collective_song.empty();
      data.forEach(element => {
        $collective_song.append(
          `<div style='display: none' class='question_box'>
            <p id=${element.question_group + '_question'}>${element.question}</p>
            <input autocomplete='off' type='text' oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -']/g, '')" id=${element.question_group + '_input'}></input>
            <button id=${element.question_group}>Send</button>
          </div>`
        )
       
      })
      $collective_song.off('click');
      $collective_song.on('click', 'button', function() {
        if ($('#' + this.id + '_input').val() !== '') {
          socket.emit('collective song response', {
            group: this.id,
            question : $('#' + this.id + '_question')[0].innerHTML,
            answer: $('#' + this.id + '_input').val().charAt(0).toLowerCase() + $('#' + this.id + '_input').val().slice(1)
          });
          $(this).parent().css('display', 'none');
          if ($(this).parent().next()[0]) {
            $(this).parent().next().css('display', 'flex')
          }
        }
      });
      $collective_song[0].children[0].style.display = '';
    }
    $collective_song.show();
    },
   
    destroy: function() {
      $collective_song.empty();
      $collective_song.hide();
    }
  };
})();


/* Gifs
======= */
(function() {
  var $gifs = $('#gifs');
  var $send_gif = $('#send_gif');

  // function getScreen() {
  //   return Math.random() > 0.3 ? 'screen' : Math.random() > 0.5 ? 'emo' : 'console';
  // }

  $('#gifs__teleportation').on('click', function() {
    socket.emit('send', {
      to: ['screen'],
      boite: {
        type: 'gifs',
        action: 'teleportation',
        arg: { id: avatarID, screen: 'screen' }
      }
    });
  });

  $('#gifs__tonus').on('pointerdown', function() {
    socket.emit('send', {
      to: ['screen'],
      boite: {
        type: 'gifs',
        action: 'tonus_down',
        arg: { id: avatarID, screen: 'screen' }
      }
    });
  });

  $('#gifs__tonus').on('pointerup', function() {
    socket.emit('send', {
      to: ['screen'],
      boite: {
        type: 'gifs',
        action: 'tonus_up',
        arg: { id: avatarID, screen: 'screen' }
      }
    });
  });

  $('#gifs__glissade').on('click', function() {
    socket.emit('send', {
      to: ['screen'],
      boite: {
        type: 'gifs',
        action: 'glissade',
        arg: { id: avatarID, screen: 'screen' }
      }
    });
  });

  // var tempid = 0;
  // var gifIsSet = false;
  // function setGif() {
  //   for (var i = 0; i < user.nick.length; i++) tempid = tempid + user.nick[i].charCodeAt(0);
  //   tempid = tempid % 87;
  //   $send_gif.attr('src', 'data/media/Gif/Avatars/Avatars' + tempid + '.gif');
  //   gifIsSet = true;
  // }

  boites.gifs = {
    type: 'gifs',
    // selected: true,

    init: function(arg) {
      // if (gifIsSet === false) setGif();
      $header.show();
      if (arg === 'start') {
        $('#gifs-controls').hide();
        $('#gifs__teleportation').click();
      }
      $gifs.show();
      // if start of show just send avatar to screen
    },

    destroy: function() {
      $gifs.hide();
    }
  };
})();

/* Game boy
=========== */
var $gamepad = $('#gamepad');

$gamepad.on('click', 'button', function() {
  socket.emit('gamepad', this.id);
});

(function() {
  boites.gameboy = {
    type: 'gameboy',
    // selected: true,

    init: function() {
      $header.show();
      $gamepad.show();
    },

    destroy: function() {
      $gamepad.hide();
    }
  };
})();

/* FIN
====== */
(function() {
  boites.fin = {
    type: 'fin',
    // selected: true,

    init: function() {
      $('#fin').show();
      $header.hide();
      $footer.hide();
    },

    destroy: function() {
      $('#fin').hide();
    }
  };
})();

/* KOF93
======== */
(function() {
  boites.kof93 = {
    type: 'kof93',
    // selected: true,

    init: function() {
      $header.show();
      $gamepad.show();
    },

    destroy: function() {
      $gamepad.hide();
    }
  };
})();

/* Musique
========== */
(function() {
  var $musique = $('#musique');
  var $speaker = $('#speaker');

  var firstClick = true;
  var metro;
  var noteCtx;
  var customWaveform;
  var sineTerms;
  var cosineTerms;
  var masterGainNode;

  var presets = [
    // ['sine', -24, 0.9],
    ['sine', -12, 0.8],
    ['sine', 0, 0.5],
    // ['sine', 12, 0.3],
    // ['sine', 24, 0.2],
    //
    ['square', -24, 0.3],
    ['square', -12, 0.2],
    ['square', 0, 0.2],
    // ['square', 12, 0.3],
    // ['square', 24, 0.2],
    //
    ['sawtooth', -24, 0.5],
    ['sawtooth', -12, 0.4],
    ['sawtooth', 0, 0.3],
    ['sawtooth', 12, 0.2],
    // ['sawtooth', 24, 0.2],
    //
    // ['triangle', -24, 0.9],
    ['triangle', -12, 0.8],
    ['triangle', 0, 0.5],
    ['triangle', 12, 0.3],
    ['triangle', 24, 0.2],
    //
    ['custom', -24, 0.7],
    ['custom', -12, 0.6],
    ['custom', 0, 0.5]
    // ['custom', 12, 0.4],
    // ['custom', 24, 0.2] //
  ];

  var pitch;
  var wave;
  var volumeControl;
  function randomisePreset() {
    var p = sample(presets);
    // var p = presets[15];
    // console.log(p);
    wave = p[0];
    pitch = p[1];
    volumeControl = p[2];
  }

  var osc;

  function initSound() {
    if (firstClick) {
      customWaveform = null;
      sineTerms = null;
      cosineTerms = null;

      if ('webkitAudioContext' in window) {
        noteCtx = new webkitAudioContext();
      } else {
        noteCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      masterGainNode = noteCtx.createGain();
      masterGainNode.connect(noteCtx.destination);

      sineTerms = new Float32Array([0, 0, 1, 0, 1]);
      cosineTerms = new Float32Array(sineTerms.length);
      customWaveform = noteCtx.createPeriodicWave(cosineTerms, sineTerms);

      firstClick = false;

      osc = noteCtx.createOscillator();
      osc.connect(masterGainNode);
      osc.start();
      masterGainNode.gain.value = 0;
    }
  }

  function note(note, duration) {
    if (songLoop === false) return;

    var freq = Math.pow(2, (note - 69 + pitch) / 12) * 440;

    if (wave == 'custom') {
      osc.setPeriodicWave(customWaveform);
    } else {
      osc.type = wave;
    }

    osc.frequency.value = freq;
    masterGainNode.gain.value = volumeControl;
    $speaker.css('zoom', 1);
    setTimeout(function() {
      masterGainNode.gain.value = 0;
      $speaker.css('zoom', 0.97);
    }, duration);
  }

  var tempo = 300;
  var pStep;
  var songLoop = true;

  var proba = 0.8;

  var musicScale = [60, 62, 63, 65, 67, 69, 70, 72];

  var musicOn = [];

  var musicLength = [
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2),
    parseInt(tempo * 0.5 + Math.random() * 4 - 2)
  ];

  function randomiseMusicOn() {
    musicOn = [
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0,
      Math.random() > proba ? 1 : 0
    ];

    var ok = false;
    for (var i = 0, l = musicOn.length; i < l; i++) {
      if (musicOn[i]) ok = true;
    }
    if (ok === false) musicOn[0] = 1;
  }

  var partition = [];

  function song() {
    if (partition[pStep] != 0) {
      if (musicOn[pStep] == 1) {
        note(partition[pStep], musicLength[0]);
      }
    }
    pStep += 1;
    if (pStep >= partition.length) {
      if (songLoop == false) {
        clearInterval(metro);
      }
      pStep = 0;
    }
  }

  function startSong() {
    actions.alert(
      {
        title: "Music",
        text: "Adjust volume in your phone"
      },
      function() {
        initSound();
        playSong();
      }
    );
  }

  function randomise() {
    pStep = 0;
    partition = musicScale;
    // partition = [sample(musicScale)];
    // for (var i = 0, l = musicScale.length; i < l; i++) {
    //   if (Math.random() > 0.1) partition.push(musicScale[i]);
    // }

    randomiseMusicOn();
    randomisePreset();
  }

  function playSong() {
    randomise();
    clearInterval(metro);
    songLoop = true;

    setTimeout(function() {
      metro = window.setInterval(song, tempo);
    }, parseInt(Math.random() * tempo));
  }

  function stopSong() {
    songLoop = false;
    actions.closeAlert();
  }

  $(document).on(
    'visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange',
    function() {
      if (musique) {
        document.hidden ||
        document.webkitHidden ||
        document.mozHidden ||
        document.msHidden
          ? stopSong()
          : startSong();
      }
    }
  );

  // $musique.on('click', function() {
  //   randomise();
  // });

  var musique = false;
  boites.musique = {
    type: 'musique',
    // selected: true,

    init: function() {
      musique = true;
      $header.show();
      $musique.show();
      startSong();
    },

    destroy: function() {
      musique = false;
      stopSong();
      $musique.hide();
    }
  };
})();
