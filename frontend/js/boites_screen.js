/* Image board
============== */
defaultLanguage = 'FR';
var defaultBoiteStyle = {'width' : '100%', 'height' : '100%', 'top' : '0%', 'left' : '0%'};

function setBoiteToDefaultSize() {
  $('#boite')[0].style.width = defaultBoiteStyle.width;
  $('#boite')[0].style.height = defaultBoiteStyle.height;
  $('#boite')[0].style.top = defaultBoiteStyle.top;
  $('#boite')[0].style.left = defaultBoiteStyle.left;
}

function startMemeGenerator(language) {
    // var currentLanguage = language;
  // (function() {
    // var memeGeneratorHTML;
    // var meme;

    // function serialiseData(data) {
    //   return JSON.stringify(data).replace(/'/g, '&#39;');
    // }
  
    // $.getJSON('/data/memes.json', function(data) {
    //   if (currentLanguage in data) {
    //     meme = data[currentLanguage];
    //   } else {
    //     meme = data[defaultLanguage];
    //   }
     
    //   var i = 0;
      
    //   memeGeneratorHTML =
    //     '<section id="meme_generator"><select id="meme_generator_select">';
    //   $.each(meme, function name(key, val) {
    //     memeGeneratorHTML += `<option value="${i++}" data-key="${key}" data-meme='${serialiseData(
    //       val
    //     )}'>${val[0]}</option>`;
    //   });
    //   memeGeneratorHTML += '</select></section>';
    //   memeGeneratorHTML += `<section id="meme_lines">
    //   <header class="impact" id="meme_generator_header"></header>
    //   <footer class="impact" id="meme_generator_footer"></footer>
    //   </section>`;
    //   $('.boite--image').append(memeGeneratorHTML);
    // });
  
    // var active = false;
  
    // window.addEventListener('keydown', function(e) {
    //   if (active) {
    //     if ('code' in e) {
    //       var code = e.key.toUpperCase();
    //       if (e.code.startsWith('Digit')) {
    //         code = e.code.replace('Digit', '');
    //       }
    //       var $opt = $(`option[data-key="${code}"]`);
    //       if ($opt.length) {
    //         $('#meme_generator_select')
    //           .val($opt.attr('value'))
    //           .trigger('change');
    //       }
    //     }
    //   }
    // });
  
    // function zoomOut($this) {
    //   $('.boite--image')
    //     .removeClass('meme_editor')
    //     .addClass('gallery');
    //   $this.removeClass('active');
    //   $('#meme_generator').addClass('hide');
    //   $('#meme_lines').addClass('hide');
    //   $('#meme_generator_header').empty();
    //   $('#meme_generator_footer').empty();
    // }
  
    // function zoomIn($this) {
    //   $('.boite--image')
    //     .addClass('meme_editor')
    //     .removeClass('gallery');
    //   $this.addClass('active');
    // }
  
    // $('main')
    //   .on('contextmenu', '.boite--image > div', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     e.stopImmediatePropagation();
    //     var $this = $(this);
    //     $('#meme_generator').toggleClass('hide');
    //     zoomIn($this);
    //   })
    //   .on('click', '.boite--image > div', function() {
    //     var $this = $(this);
    //     if ($this.hasClass('active')) {
    //       zoomOut($this);
    //     } else {
    //       zoomIn($this);
    //     }
    //     socket.emit('start', {
    //       to: 'performers',
    //       start: true
    //     });
    //   })
    //   .on('change', '#meme_generator_select', function() {
    //     var $selected = $(this).find(':selected');
    //     var data = $selected.data('meme');
    //     if (typeof data === 'object') {
    //       var header = typeof data[0] === 'string' ? data[0] : data[1];
    //       var footer = typeof data[0] === 'string' ? data[1] : data[2];
    //       $('#meme_generator_header').html(header || '');
    //       $('#meme_generator_footer').html(footer || '');
    //       $('#meme_generator').addClass('hide');
    //       $('#meme_lines').removeClass('hide');
    //     }
    //   });
  
    var cache = [];
    $boite[0].className = 'boite--image meme_editor';
    $('.meme').className = 'meme active';
    
    boites.image = {
      type: 'image',
      init: function() {
        if (cat !== 'screen') return;
        setBoiteToDefaultSize();
        $boite.empty();
        $boite.show();
        cache = [];
        active = true;
  
        if (page === 'assistant') {
          $boite.append(memeGeneratorHTML);
          $('#meme_generator').addClass('hide');
          $('#meme_lines').addClass('hide');
        }
  
        // $boite[0].className = 'boite--image gallery';
        $boite[0].className = 'boite--image meme_editor';
        $('.meme').className = 'meme active'
      },
      destroy: function() { 
        active = false;
        $boite.empty();
        $boite.hide();
        $boite[0].className = '';
      },
      validated: function(params) {
        if (cache.includes(params.text) === false) {
          $boite.append(`<div class="meme">${params.text}</div>`);
          cache.push(params.text);
        }
      }
    };
  // })();
}


boites.singe_savant = {
  type: 'singe_savant',
  hamlet: '',
  init: function() {
    setBoiteToDefaultSize();
    this.hamlet = '';
  },
  key: function(letter) {
    this.hamlet += letter;
    mode.write(this.hamlet);
  },
  destroy: function() {
    setTimeout(() => {
      mode.write(this.hamlet);
    }, 0);
  }
};

boites.choix = {
  type: 'choix',
  init: function(str) {
    setBoiteToDefaultSize();
    if (cat !== 'screen') return;
    $boite.empty();
    if (!$.trim(str)) {
      return;
    }
    $boite.show();
    var data = parseChoix(str);
    if (!data) return;
    $boite[0].className = 'boite--choix';

    $boite.append(`<h1 class="sans_serif">${data.title || ' '}</h1>`);

    data.choix.forEach(item => {
      var $btn = $(`<button>${item.text}</button>`).on('click', function() {
        boites.choix.destroy();
      });
      if (item.scene) $btn.data('scene', item.scene);
      $boite.append($btn);
    });
  },
  destroy: function() {
    $boite.empty();
    $boite.hide();
    $boite[0].className = '';
  },
  stop: function(key) {
    // setMusic({ src: 'Sons/reveil.mp3', volume: 20, loop: false });
    setMusic({ src: $('audio').attr('scr'), volume: 20, loop: false });
    $boite
      .find('button')
      .addClass('stopped')
      .eq(key)
      .removeClass('stopped')
      .addClass('strobe');
  }
};

boites.collective_song = {
  
  type : 'collective_song',
  // start: function() {
  //   $('.step__texte').hide();
  // },
  init: function(data) {
    setBoiteToDefaultSize();
    if (cat !== 'screen') return;
    $('#boite').empty();

    if (jQuery.type(data) === 'object') {
      if ('answer' in data) {
        // CHECK FIRST IF THERE IS CUSTOM TEXT BOX IF NOT WRITE IN DEFAULT ONE
        if ($('.step__decor pre').length !== 0) {
          $('.step__decor pre')[0].innerHTML = data.question + '  ' +  data.answer;
        } else {
          $('.step__texte')[0].innerHTML = data.question + '  ' +  data.answer;
        }
      }
    }
  },
  // start : function(data) {
  //   if ('answer' in data) {
  //     setBoiteToDefaultSize();
  //     if (cat !== 'screen') return;
  //     $('#boite').empty();
  //     $('#boite').append(`<p style='padding: 45% 0; text-align: center;'>${data.question} ${data.answer}</p>`)
  //     $('#boite').show();
  //   }
  // },
  destroy: function() {
    $boite.empty();
    $boite.hide();
    $boite[0].className = '';
  },
};

(function() {
  var cache = {};

  function display(id, cb) {
    if (id in cache) {
      cb(cache[id]);
    } else {
      var src = 'data/media/Gif/Avatars/Avatars' + id + '.gif';

      if (jQuery(`#avatars img[src*=${id}]`).length > 0) {
        jQuery(`#avatars img[src*=${id}]`).remove();
      }
      var img = new Image();
      $img = $(img);
      cache[id] = $img;
      img.src = src;
      img.onload = function() {
        $boite.append($img);
        randomPos($img);
        cb($img);
      };
    }
  }

  function displayOnScreen($img, screen) {
    if (screen === cat) $img.show();
    else $img.hide();
  }

  boites.gifs = {
    type: 'gifs',
    init: function(str) {
      setBoiteToDefaultSize();
     
      if (cat !== 'screen') return;
      cache = {};
      $boite.empty();
      $boite.show();
      $boite[0].className = 'boite--gifs';
      
      if (str !== ' ' && str !== '') {
        var data = JSON.parse(str);
        
        $('#boite').css("right", "auto");
        $('#boite').css("bottom", "auto");
       
        $boite[0].style.width = data['width'];
        $boite[0].style.height = data['height'];
        $boite[0].style.top = data['top'];
        $boite[0].style.left = data['left'];
        $boite[0].style.borderRadius = data['border-radius'];
        
        var CSS = ['background-color', 'background-image', 'background-size', 'background-repeat']
        for (parameter of CSS) {
          if (parameter in data) {
            $boite[0].style[parameter] = data[parameter]
          }
        }    
      }
    },

    teleportation: function({ id, screen }) {
      display(id, function($img) {
        displayOnScreen($img, screen);
        randomPos($img);
      });
    },
    tonus_down: function({ id, screen }) {
      var invisible = id in cache === false;
      display(id, function($img) {
        if (invisible) displayOnScreen($img, screen);
        $img.css({
          transform: 'scale(3)',
          zIndex: 999
        });
      });
    },
    tonus_up: function({ id, screen }) {
      display(id, function($img) {
        $img.css({
          transform: 'scale(1)',
          zIndex: ''
        });
      });
    },
    glissade: function({ id, screen }) {
      var invisible = id in cache === false;
      display(id, function($img) {
        if (invisible) displayOnScreen($img, screen);
        var x = `${Math.random() > 0.5 ? '-' : ''}${Math.random() * 50 + 15}`;
        var y = `${Math.random() > 0.5 ? '-' : ''}${Math.random() * 50 + 15}`;
        $img.css({
          transition: 'transform 1s',
          transform: `translate(${x}vw, ${y}vh)`
        });
        setTimeout(() => {
          $img.css({
            transition: 'transform 1s',
            transform: 'translate(0, 0)'
          });
          setTimeout(() => {
            $img.css({
              transition: 'transform 0.1s'
            });
          }, 1000);
        }, 1000);
      });
    },

    kill: function(data) {
      var $img = $boite.find('img');
      var l = $img.length;
      var x = l;
      var seconds = 6000;
      data = typeof data === 'object' ? data : {};
      if (typeof data.percent === 'number') {
        x = (l / 100) * data.percent;
      }
      if (typeof data.seconds === 'number') {
        seconds = data.seconds * 1000;
      }
      data.seconds * 1000;
      for (let i = 0; i < x; i++) {
        $img.eq(Math.floor(Math.random() * l)).addClass('hide');
      }
      setTimeout(() => {
        $img.removeClass('hide');
      }, seconds);
    },
    destroy: function() {
      $boite.empty();
      $boite.hide();
      $boite[0].className = '';
    }
  };
})();

(function() {
  var game;
  boites.gameboy = {
    type: 'gameboy',
    init: function(str) {
      setBoiteToDefaultSize();
      if (cat !== 'screen') return;
      $boite.empty();
      $boite.show();
      $boite[0].className = 'boite--gameboy';
      var $iframe = $('<iframe></iframe>');
      var iframe = $iframe[0];
      $boite.append($iframe);
      iframe.src = '/boites/gameboy/index.html?data=sm';
      iframe.onload = function() {
        game = iframe.contentWindow;
        setTimeout(() => {
          game.GameBoyKeyDown('start');
          setTimeout(() => {
            game.GameBoyKeyUp('start');
          }, 100);
        }, 1000);
      };
    },
    gamepad: function(key) {
      if (game) {
        game.GameBoyKeyDown(key);
        setTimeout(() => {
          game.GameBoyKeyUp(key);
        }, 200);
      }
    },
    destroy: function() {
      $boite.empty();
      $boite.hide();
      $boite[0].className = '';
    }
  };
})();

(function() {
  var keys = {
    up: 69,
    left: 83,
    right: 70,
    down: 68,
    a: 81
  };

  function simulateKey(keyCode, type, modifiers) {
    var evtName = typeof type === 'string' ? 'key' + type : 'keydown';
    var modifier = typeof modifiers === 'object' ? modifier : {};

    var event = game.document.createEvent('HTMLEvents');
    event.initEvent(evtName, true, false);
    event.keyCode = keyCode;

    for (var i in modifiers) {
      event[i] = modifiers[i];
    }

    game.document.dispatchEvent(event);
  }

  function press(key) {
    var code = keys[key];
    simulateKey(code);
    setTimeout(() => {
      simulateKey(code, 'up');
    }, 200);
  }

  var game;
  boites.kof93 = {
    type: 'kof93',
    init: function(str) {
      setBoiteToDefaultSize();
      if (cat !== 'screen') return;
      $boite.empty();
      $boite.show();
      $boite[0].className = 'boite--kof93';
      var $iframe = $('<iframe></iframe>');
      var iframe = $iframe[0];
      $boite.append($iframe);
      iframe.src = '/boites/kof93/index.html';
      iframe.onload = function() {
        game = iframe.contentWindow;
      };
    },
    gamepad: function(key) {
      if (game) {
        press(key);
      }
    },
    destroy: function() {
      $boite.empty();
      $boite.hide();
      $boite[0].className = '';
    }
  };
})();
