'use strict';

var user;
var $online = $('#online');
var connected = false;
var paramId = findGetParameter('id');
var id = paramId != null ? paramId : localStorage.getItem('id') || uuid();

const defaultLanguage = 'FR';

function findGetParameter(parameterName) {
  var result = null;
  var tmp = [];
  location.search
    .substr(1)
    .split('&')
    .forEach(function(item) {
      tmp = item.split('=');
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

function displayPseudo() {
  return '<span style="color:' + user.color + '">' + user.nick + '</span>';
}

var mobileJSON;
function displayContent(language) {
  $.when(
    $.getJSON(`/data/mobile.json`)
  ).then(function(text) {
    var content;
    if(language in text) {
      mobileJSON = text[language];
      content = text[language];
    } else {
      mobileJSON = text[defaultLanguage];
      content = text[defaultLanguage];
    }
    for (const section in content) {
      $('#' + section).find('span').each( (index, element) => {
        element.innerHTML = '';
        element.innerHTML = content[section][index]
      })
    }
  })
}

// actions.vibrate = function(delay) {
//   delay = typeof delay === 'number' ? delay : 30;
//   if ('vibrate' in window.navigator && firstClick) {
//     window.navigator.vibrate(0);
//     window.navigator.vibrate(delay);
//   }
// };

actions.closeAlert = function() {
  $alert.empty().hide();
};

var $alert = $('#alert');

var defaultAlert = {
  buttons: [['OK', actions.closeAlert]]
};
actions.alert = function(msg, cb) {
  // actions.vibrate();

  if (typeof msg === 'string') {
    msg = {
      title: 'Alert',
      text: msg
    };
  }

  msg = $.extend({}, defaultAlert, msg);

  $btns = false;
  if (msg.buttons) {
    var $btns = $('<div class="alert__buttons box-h"></div>');
    msg.buttons.forEach(function(item) {
      var $btn = $('<button>' + item[0] + '</button>');
      $btn.on('click', function() {
        if (typeof item[1] === 'function') item[1]($btn);
        if (typeof cb === 'function') {
          var ret = cb($btn);
          if (ret === false) actions.closeAlert();
        }
      });
      $btns.append($btn);
    });
  }

  var $body = $('<div class="alert__body"></div>').append(
    msg.title && $('<div class="alert__title">' + msg.title + '</div>'),
    msg.text && $('<div class="alert__text">' + msg.text + '</div>'),
    $btns
  );

  if (!msg.title && !msg.text) $body.addClass('alert__body--nocontent');

  $alert
    .empty()
    .append($body)
    .show();
};

socket.on('interaction', function(data) {
  if (data.code) actions.eval(data.code);
  if (data.type === 'message' && data.texte) {
    boites.chat.msg('you', data.texte);
  } else if (data.type === 'alert') {
    actions.alert(data.texte);
  } else if (data.type === 'choix') {
    setBoite({ title: 'choix', arg: data.texte });
  }
});

var avatarID = 0;
var $send_gif = $('#send_gif');
function setGif() {
  for (var i = 0; i < user.nick.length; i++) avatarID = avatarID + user.nick[i].charCodeAt(0);
  avatarID = avatarID % 87;
  $send_gif.attr('src', 'data/media/Gif/Avatars/Avatars' + avatarID + '.gif');
  socket.emit('avatar created', ({'avatarID' : avatarID,  'userID' : localStorage.getItem('id')}))
}

socket.on('step', function(data) {
  // console.log('step', cat, data);
  displayContent(data.language);
  if ('user' in data) {
    user = data.user;
    $('#nick').html(displayPseudo());
    if (paramId == null) localStorage.setItem('id', user.id);
    setGif();
    $.when(
      $.getJSON(`/data/mobile.json`)
    ).then(function(text) {
      var currentLanguage;
      if (data.language in text) {
        currentLanguage = data.language;
      } else {
        currentLanguage = defaultLanguage;
      }
      actions.alert(
        { title: text[currentLanguage]["avertissement-boite"].title, text: text[currentLanguage]["avertissement-boite"].text + ' ' + displayPseudo() },
        function() {
          $header.show();
          socket.emit('console', text[currentLanguage]["avertissement-boite"].console);
        }
      );
      var gifImage = $('#send_gif')[0].cloneNode(true);    
      $(gifImage).insertAfter($('.alert__text'))
    })    
  }
 
  if ('boite' in data && 'type' in data.boite) {
    setBoite(data.boite);
  }
  // startChatBot(data.language); 
});

socket.on('display HTML content', (data) => {
  displayContent(data);
});

socket.on('change language', (data) => {
  displayContent(data);
  // startChatBot(data);
})

socket.on('change nickname', (data) => {
  user.nick = data;
  $('#nick').html(displayPseudo());
})

socket.on('collective song question', (data) => {
  boites.collective_song.questions(data);
})

// socket.on('error', function(error) {
//   var name = user && user.name;
//   console.log('📡 ' + name, 'error', error);
// });

// socket.on('reconnect', function(attemptNumber) {
//   var name = user && user.name;
//   console.log('📡 ' + name, 'reconnect', attemptNumber);
// });

// socket.on('reconnect_error', function(error) {
//   var name = user && user.name;
//   console.log('📡 ' + name, 'reconnection error', error);
// });

// socket.on('reconnect_failed', function() {
//   var name = user && user.name;
//   console.log('📡 ' + name, 'reconnection failed');
// });

socket.on('disconnect', function(reason) {
  var name = user && user.name;
  // console.log('📡 ' + name, 'disconnect', reason);

  connected = false;
  $online.addClass('disconnected').text('Disconnected');
  actions.alert(
    { text: 'You are disconnected', buttons: [['Re-Connection']] },
    function() {
      window.location.reload();
    }
  );
});

socket.on('connect', function() {
  var name = user && user.name;
  // console.log('📡 ' + name, 'connect');
  connected = true;
  $online.removeClass('disconnected').text('Connected');
  socket.emit('join', id);
});

$(window).on('click', function() {
  if (connected === false) {
    window.location.reload();
  }
  if (
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== 'leto.nute.net' &&
    inIframe() === false
  ) {
    toggleFullScreen();
  }
});

$('#disconnected').on('click', function() {
  window.location.reload();
});

// $('body').on('click', 'button', function() {
//   actions.vibrate();
// });

socket.open();
