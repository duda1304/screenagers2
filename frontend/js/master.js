
toggleFullScreen = function() {};

// ACTIVATE draggable elements
$( function() {
  $( ".draggable" ).draggable({
      stop : function(){
        let position = $(this).position();
        $(this).css('position', 'absolute');
        $(this).css('top', position.top);
      }
  });
})

// ACTIVATE resizable elements
$(".resizable").resizable({
  handles: "se",
  minHeight: "fit-content",
});

$(".box-preview").resizable({
  handles: "se",
  // minHeight: 250,
  aspectRatio : true
});

// $(".box-meme").resizable({
//   handles: "se",
//   minWidth: 500,
//   // aspectRatio : true
// });


// ACTIVATE title of elements to be shown as tooltip on hover
// $( document ).tooltip();

// const isPositiveInteger = val => val >>> 0 === parseFloat(val);

// function locate(obj, path, sep = '.') {
//   return path
//     .split(sep)
//     .filter(key => key !== '')
//     .reduce((acc, key) => acc[key], obj);
// }

// function allocate(obj, path, val = null, sep = '.') {
//   path
//     .split(sep)
//     .filter(key => key !== '')
//     .reduce((acc, key, i, arr) => {
//       acc[key] = arr.length - 1 === i ? val : acc[key] || {};
//       return acc[key];
//     }, obj);
//   return obj;
// }

// allocate.json = function(obj, path, val = null, sep = '.') {
//   path
//     .split(sep)
//     .filter(key => key !== '')
//     .reduce((acc, key, i, arr) => {
//       acc[key] =
//         arr.length - 1 === i
//           ? val
//           : acc[key] || (isPositiveInteger(arr[i + 1]) ? [] : {});
//       return acc[key];
//     }, obj);
//   return obj;
// };

// const getFormValues = (form, withEmpty = false) => {
//   var data = {};
//   [...form.elements].forEach(el => {
//     if (el.name === '' || el.disabled) return;
//     let val;
//     if ('valueAsDate' in el && el.valueAsDate !== null) val = el.valueAsDate;
//     else if (el.type === 'number') val = el.value !== '' ? Number(el.value) : '';
//     else if (el.type === 'range') val = el.value !== '' ? Number(el.value) : '';
//     else if (el.type === 'checkbox') val = Boolean(el.checked);
//     else if (el.type === 'radio') {
//       if (el.checked) val = el.value;
//       else return;
//     } else if (el.type === 'select-multiple') {
//       val = [...el.options].filter(option => option.selected).map(option => option.value);
//     } else if (withEmpty || el.value) {
//       val = el.value;
//     } else return;

//     var name = el.name;
//     if (name === 'mode_aff') name = 'mode';
//     allocate(data, name, val);
//   });
//   return data;
// };

// const setFormValues = (form, data) => {
//   [...form.elements].forEach(el => {
//     var name = el.name;
//     if (name === 'mode_aff') name = 'mode';
//     var val = locate(data, name);
//     if (el.type === 'checkbox') {
//       el.checked = val;
//     } else if (el.type === 'radio') {
//       if (el.value === String(val)) el.checked = true;
//     } else if (el.type === 'number' || el.type === 'range') {
//       if (!Number.isNaN(Number(val))) el.value = val;
//     } else if (val != null) {
//       el.value = val;
//     } 
//     $(el).trigger('input');
//   });
// };

var scenes;
var reponses;

var states = {
  visual: {
    // current: 'TEST boites'
  }
};

var languageList = [];
var defaultLanguage = 'FR';
var currentLanguage = 'FR';




$.getJSON('/data/reponsesBot.json', function(data) {
  reponses = data;
  displayReponses();
});

socket.on('init states', function(data) {
  states = deepMerge(states, data);
  if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
  displayUsers();
  // displayMedia();
});

socket.on('save message', function(data) {
  if(data.status === 'error') {
    alert ('Something went wrong, message not saved');
  } else {
    alert ('Message saved');
    displaySavedResponses();
  }
});

socket.on('delete message', function(data) {
  if(data.status === 'error') {
    alert ('Something went wrong, message not deleted');
  } else {
    alert ('Message deleted');
    displaySavedResponses();
  }
});

// MISLIM DA OVO NE TREBAM
// socket.on('language', function(data) {
//   $('#select_language').empty();
//   $.each(data.languageList, function(key, language) {
//     $(`<option value=${language}>${language}</option>`)
//       .on('mousedown', function() {
//         setLanguage(language);
//       })
//       .appendTo($('#select_language'));
//   });
//   $('#select_language').val(data.currentLanguage);
//   currentLanguage = data.currentLanguage;
//   languageList = [];
//   data.languageList.forEach(language => languageList.push(language));
//   var url = `/data/visual_${currentLanguage}.json`;
//   $.getJSON(url, function(data) {
//     scenes = data;
//     displayVisual();
//   });
// });

socket.on('users change', function(users) {
  states.users = users;
  displayUsers(true);
});



// socket.on('avatars position', (data) => {
//   $('#avatars_area').val(JSON.stringify(data));
//   $('#avatars_area').trigger('input');
//   if ($('#boite').find('.boite_radio--gifs')[0].checked) {
//     $('#boite').find('textarea').val($('#avatars_area').val());
//     $('#boite').find('textarea').trigger('input');
//   }
// })



var $main = $('main');

$('.box b').on('click', function() {
  var $this = $(this);
  var next = $this.parent();
  if (next) {
    next.toggleClass('closed');
    next.css({'height': 'auto'});
  }
})
$main
  .on('focus', '.message_moderation textarea', function() {
    this.select();
  })
  // .on('click', '.scene__toggle, b', function() {
  //   var $this = $(this);
  //   var next = $this.parent();
  //   if (next) {
  //     next.toggleClass('closed');
  //     next.css({'height': 'auto'});
  //   }
  // })
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

const offStep = {...stepObject};


$('#tools').append(
  $(`<div class="box-v tools"></div>`).append(
    $(`<button class="_icon"><i>🚫</i> clear all screens</button>`).on(
      'click',
      function() {
        socket.emit('step', offStep);
      }
    ),
    // $(`<button class="_icon">✏️ editor</button>`).on(
    //   'click',
    //   function() {
    //     var sceneName = '';
    //     var win;
    //       win = window.open('/editor', '_blank');
    //       // function sendScreen(name) {
    //         setTimeout(() => {
    //           var data = fecthScreens();
    //           var out = {};
    //           out['screen'] = data['screen'];
    //           console.log(out)
    //           socket.emit('step from master', addExtraData(out));
    //         }, 1000);
            
    //       if (win) {
    //         //Browser has allowed it to be opened
    //         win.focus();
    //     } else {
    //         //Browser has blocked it
    //         alert('Please allow popups for this website');
    //     }
    //   }
    // ),
    // $(`<button class="_icon">SCAN QR</button>`).on(
    //   'click',
    //   function() {
    //     document.querySelector('#QR_modal').style.display = 'block';
    //     getMediaStream();
    //   }
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_effect' class="_icon" >✨ etape effects</label>`),
    //   $(`<select id='select_effect'>
    //       <option value='none'>none</option>
    //       <option value='up'>⬆️ slide up</option>
    //       <option value='down'>⬇️ slide down</option>
    //       <option value='right'>➡️ slide right</option>
    //       <option value='left'>⬅️ slide left</option>
    //   </select>`)
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_language'>Select language</label>`),
    //   $(`<select class="_icon" id='select_language'></select>`)
    //   .on(
    //     'change',
    //       function() {
    //         socket.emit('change current language', {language : this.value});
    //         currentLanguage = this.value;
    //         var url = `/data/visual_${this.value}.json`;
    //         $.getJSON(url, function(data) {
    //           scenes = data;
    //           displayVisual();
    //         });
    //       }
    //   )
    // ),
    // $(`<div></div>`).append(
    //   $(`<label for='select_language'>Create QR code image</label>`),
    //   $(`<input type='text' id='QR_input'></inpuut>`),
    //   $(`<button type='file'>Save</button>`)
    //   .on(
    //     'click',
    //       function() {
    //         socket.emit('create qr code', {src : $('#QR_input')[0].value});
    //         $('#QR_input')[0].value = '';
    //       }
    //   )
    // )
  )
);

// socket.on('QR code response', function(data){
//   alert(data.message)
// })

// $('#layout').append(
//   $(`<div class="box-v"></div>`).append(
//     $(`<button class="_icon">Define layout</button>`).on(
//       'click',
//       function(e) {
//         e.preventDefault();
//         document.getElementById("layout_modal").style.display = "block";
//       }
//     ),
//     $(`<button class="_icon">Restore to default</button>`).on(
//       'click',
//       function() {
//         setDefaultMainScreenLayout();
//       }
//     )   
//   )
// );

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

// var shortcuts = {
//   'ctrl+s': [
//     'Sauvegarder le visual novel',
//     function() {
//       $('#visual__save').click();
//       return false;
//     },
//     '#visual__save'
//   ],
//   'ctrl+del': [
//     "Supprimer la scène ou l'étape active",
//     function() {
//       $('#visual__delete').click();
//       return false;
//     },
//     '#visual__delete'
//   ],
//   'alt+e': [
//     'Ajouter une étape',
//     function() {
//       $('#visual__add_step').click();
//       return false;
//     },
//     '#visual__add_step'
//   ],
//   'alt+s': [
//     'Ajouter une scène',
//     function() {
//       $('#visual__add_scene').click();
//       return false;
//     },
//     '#visual__add_scene'
//   ],
//   'ctrl+left': [
//     "Lancer l'étape suivante du visual novel",
//     function() {
//       $('#visual__prev').click();
//       return false;
//     },
//     '#visual__prev'
//   ],
//   'ctrl+right': [
//     "Lancer l'étape precedente du visual novel",
//     function() {
//       $('#visual__next').click();
//       return false;
//     },
//     '#visual__next'
//   ],
//   'ctrl+enter': [
//     "Lancer l'écran en cours d'édition",
//     function() {
//       if (document.activeElement.form) {
//         var $form = $(document.activeElement.form);
//         if (
//           $form.hasClass('box-screen') ||
//           $form[0].id === 'boite' ||
//           $form[0].id === 'one_shot'
//         ) {
//           $form.submit();
//         }
//       }
//       return false;
//     }
//   ],
//   'ctrl+shift+enter': [
//     'Lancer tout les écrans',
//     function() {
//       sendScreens();
//       return false;
//     },
//     '#send_all_screens'
//   ],
//   y: [
//     'Valide le 1er message de la liste de moderation',
//     function() {
//       $('.message_moderation')
//         .first()
//         .find('.btn_yes')
//         .click();
//     }
//   ],
//   n: [
//     'Invalide le 1er message de la liste de moderation',
//     function() {
//       $('.message_moderation')
//         .first()
//         .find('.btn_no')
//         .click();
//     }
//   ]
// };

// var $shortcuts = $('#shortcuts');
// $.each(shortcuts, function(key, val) {
//   Mousetrap.bind(key, val[1]);
//   if (val[2]) {
//     $(val[2]).attr('title', `${val[0]} (${key})`);
//   }
//   $shortcuts.append(`<div><strong>${key}</strong> : ${val[0]}</div>`);
// });

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
//   $('<button disabled><i>📱</i> émoji téléphone</button>').on('click', function() {
//     // setCtrlScreen(
//     //   screens.emo,
//     //   deepMerge({}, defaultScreen, {
//     //     active: true,
//     //     texte: '📱',
//     //     mode: 'biggest_text'
//     //   })
//     // );
//   }),
//   $('<button><i>⏲</i> choix</button>').on('click', function() {
//     setCtrlScreens(
//       deepMerge({}, dummyStep, {
//         screen: {
//           active: true,
//           music: { src: 'Sons/chrono.wav', loop: true }
//         },
//         // emo: {
//         //   active: true,
//         //   texte: '📱',
//         //   mode: 'biggest_text'
//         // },
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


function saveMessage(content) {
  socket.emit('save message', content)
}

function deleteMessage(content) {
  socket.emit('delete message', content)
}

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
          if(page !== 'assistant') {
            socket.emit('send', {
              to: 'screens',
              validated: data
            });
          } else {
            if ($('#meme').find('.meme')[0]) {
              return
            } else {
              $('.boite--image').append(`<div id="meme_div"><div class='meme active'>${data.text}</div></div>`);
              startMemeGenerator(currentLanguage);
            }
          }
          var responseText;
          if (currentLanguage in reponses['👍'].data) {
            responseText = sample(reponses['👍'].data[currentLanguage])
          } else {
            responseText = sample(reponses['👍'].data[defaultLanguage])
          }
          socket.emit('broadcast', {
            to: [data.user.id],
            type: 'message',
            karma: 1,
            texte: responseText
          });
          var k = $(`#user_${data.user.id}`).find('.user__karma');
          var n = Number(k.text());
          if (Number.isNaN(n) === false) k.text(n + 1);
          remove();
        }),
      $('<button class="icon btn_no"></button')
        .text('👎')
        .on('click', function() {
          var responseText;
          if (currentLanguage in reponses['👎'].data) {
            responseText = sample(reponses['👎'].data[currentLanguage])
          } else {
            responseText = sample(reponses['👎'].data[defaultLanguage])
          }
          socket.emit('broadcast', {
            to: [data.user.id],
            type: 'message',
            karma: -1,
            texte: responseText
          });
          var k = $(`#user_${data.user.id}`).find('.user__karma');
          var n = Number(k.text());
          if (Number.isNaN(n) === false) k.text(n - 1);
          remove();
        })
    );
  }

  $('#monitoring_incoming').append($msg);

  function remove() {
    $msg.slideUp('fast', function() {
      $msg.remove();
    });
  }

  return remove;
};

/* Preview of steps
=================== */
$('.box-preview .screens div').on('click', function() {
  $(this).addClass('active');
  $('.box-preview .screens div').not(this).removeClass('active');
  $(`#preview_div .preview`).hide();
  $(`#preview_div div[id*=${$(this).text().toLowerCase()}]`).show();
})

/* Boites
========= */
$boites_types = $('#boites_types');

$.each(boites_mobiles, function(key, val) {
  if ('radio' in val && val.radio === false) return;
  $boites_types.append(
    $(`<div class="button_radio">
        <label class="boite_label" title="${key}">
        <input disabled class="boite_radio boite_radio--${key}" value="${key}" type="radio" name="type" />
        <span>${key}</span>
      </label>
    </div>`)
  );
});

$('.boite_radio--no_phone').prop('checked', true);

// $boites_types.on('dblclick', '.boite_label', function() {
//   $(this.form).submit();
// });

/* Media
======== */
// var datalists = {
//   decors: {
//     el: $('<datalist id="list_decors"></datalist>'),
//     data: []
//   },
//   musics: {
//     el: $('<datalist id="list_musics"></datalist>'),
//     data: []
//   },
//   styles: {
//     el: $('<datalist id="list_styles"></datalist>'),
//     data: []
//   },
//   modes: {
//     el: $('<datalist id="list_modes"></datalist>'),
//     data: []
//   }
// };

// function datalistsWrite() {
//   $.each(datalists, function(key, val) {
//     val.el.empty();
//     val.data.forEach(item => {
//       val.el.append(`<option value="${item}" />`);
//     });
//   });
// }

// $.each(datalists, function(key, val) {
//   $main.append(val.el);
// });

// var $media = $('#media');

// $media.on('mousedown', '.file', function() {
//   setEdit($(this).attr('title'));
// });

// var medias = {
//   styles: $('.media_styles'),
//   decors: $('.media_decors'),
//   pages: $('.media_pages'),
//   layouts: $('.media_layouts'),
//   video: $('.media_video'),
//   audio: $('.media_audio'),
//   gifs: $('.media_gifs'),
//   images: $('.media_images')
// };

// function displayMedia() {
//   medias.styles.empty();
//   medias.decors.empty();
//   medias.pages.empty();
//   medias.layouts.empty();
//   medias.video.empty();
//   medias.audio.empty();
//   medias.gifs.empty();
//   medias.images.empty();

//   $.each(datalists, function(key, val) {
//     val.el.empty();
//     val.data.length = 0;
//   });

//   datalists.modes.data = Object.keys(modes);

//   /* Pages
//   ======== */
//   $.each(states.pages, function(key, val) {
//     var path = `@${val}`;
//     var file = `<div title="${path}" class="file">${path}</div>`;
//     medias.pages.append(file);
//     datalists.decors.data.push(path);
//   });


//   /* Css
//   ====== */
//   var decorsStyleSheet = document.styleSheets[1].cssRules;
//   [...decorsStyleSheet].forEach(val => {
//     var styles = [...val.style];
//     val = val.selectorText;
//     if (val) {
//       var file = `<div title="${val}" class="file">${val}</div>`;
//       if (styles.includes('background-color') || styles.includes('background-image')) {
//         medias.decors.append(file);
//         datalists.decors.data.push(val);
//       } else {
//         medias.styles.append(file);
//         datalists.styles.data.push(val);
//       }
//     }
//   });

//   /* Media
//   ======== */
//   $.each(states.media, function(key, val) {
//     var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
//     // var file = `<div title="${val}" class="file">${val}</div>`;
//     if (
//       val.toLowerCase().endsWith('.wav') ||
//       val.toLowerCase().endsWith('.flac') ||
//       val.toLowerCase().endsWith('.mp3') ||
//       val.toLowerCase().endsWith('.ogg')
//     ) {
//       medias.audio.append(file);
//       datalists.musics.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.jpeg') ||
//       val.toLowerCase().endsWith('.jpg') ||
//       val.toLowerCase().endsWith('.png') ||
//       val.toLowerCase().endsWith('.svg') ||
//       val.toLowerCase().endsWith('.webp') ||
//       val.toLowerCase().endsWith('.jfif') 
//     ) {
//       medias.images.append(file);
//       datalists.decors.data.push(val);
//     }  else if (
//       val.toLowerCase().endsWith('.html')
//     ) {
//       medias.layouts.append(file);
//       datalists.decors.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.gif') //
//     ) {
//       medias.gifs.append(file);
//       datalists.decors.data.push(val);
//     } else if (
//       val.toLowerCase().endsWith('.webm') ||
//       val.toLowerCase().endsWith('.mp4') ||
//       val.toLowerCase().endsWith('.mov') ||
//       val.toLowerCase().endsWith('.wmv') ||
//       val.toLowerCase().endsWith('.avi') ||
//       val.toLowerCase().endsWith('.ogv')
//     ) {
//       medias.video.append(file);
//       datalists.decors.data.push(val);
//     }
//   });

//   datalistsWrite();
// }

/* Screens
========== */
// var $screens = $('#screens');
// var tmpl_screen__ctrl = $('#tmpl_screen__ctrl').html();

var isRepetMode = true;

// var screenName = {
//   screen: '<i>📽️</i> SCREEN',
//   // emo: '<i>📺</i> EMO',
//   laptop: '<i>💻</i> LAPTOP',
//   console: '<i>🖥️</i> CONSOLE'
// };

// displayScreens();

// var screens = {
//   // console: $('#console'),
//   // screen: $('#screen'),
//   // emo: $('#emo'),
//   // laptop: $('#laptop'),
//   boite: $('#boite'),
//   osc: $('#osc'),
//   // saut: $('#saut'),
//   // mainScreen: $('#main-screen-layout')
// };

// var defaultScreen = {};
// var defaultBoite = getFormValues(screens.boite[0], true);
// var defaultOsc = getFormValues(screens.osc[0], true);
// // var defaultSaut = getFormValues(screens.saut[0], true);
// // var defaultMainScreen = getFormValues(screens.mainScreen[0], true);

// var dummyStep = {
//   console: defaultScreen,
//   screen: defaultScreen,
//   // emo: defaultScreen,
//   laptop: defaultScreen,
//   boite: defaultBoite,
//   osc: defaultOsc,
//   // saut: defaultSaut,
//   // mainScreen: defaultMainScreen
// };

// var cleanedStep = cleanStep(deepMerge({}, dummyStep));
// cleanedStep.osc.message = '';

// var offStep = {
//   console: { active: false },
//   screen: { active: false },
//   // emo: { active: false },
//   laptop: { active: false }
// };

// function cleanStep(step) {
//   if (typeof step === 'object') {
//     $.each(step, (key, val) => {
//       if (val === '') step[key] = ' ';
//       else step[key] = cleanStep(step[key]);
//     });
//   }
//   return step;
// }

// function displayScreen(name) {
//   return $(
//     `<form id="${name}" class="box-h box-screen" autocomplete="off"></form>`
//   ).append(
//     $(`<div class="box-v box-min"><div class="button_radio _box-min">
//         <label>
//           <input checked type="checkbox" name="active" />
//           <span>${screenName[name]}</span>
//         </label>
//       </div>
//       <!--<button class="change_screen_rotation box-min icon toggle">📐</button>-->
//       </div>`),
//     $(`${tmpl_screen__ctrl}`),
//     $(`<button class="icon" type="submit">📢</button>`),
//   )
// }

// function displayScreens() {
//   $screens.append(
//     displayScreen('console'),
//     displayScreen('screen'),
//     // displayScreen('emo'),
//     displayScreen('laptop')
//   );
//     $(`#console`).find('.avatars-on').remove();
//     $(`#console`).find('.avatars-off').remove();
//     $(`#console`).find('#avatars_area').remove();
//     $(`#laptop`).find('.avatars-on').remove();
//     $(`#laptop`).find('.avatars-off').remove();
//     $(`#laptop`).find('#avatars_area').remove();
// }

// var lastFocused;
// function setEdit(val) {
//   lastFocused = document.activeElement;
//   lastFocused.value = val;
//   setTimeout(function() {
//     lastFocused.focus();
//     $(lastFocused).trigger('input');
//   }, 0);
// }

// function walkSteps($step) {
//   var $parent = $step.parent();
//   var data = deepMerge({}, cleanedStep);
//   $parent.find('.scene__step').each(function() {
//     var val = normalizeStep($(this).data('val'));
//     if ('boite' in val === false) val.boite = defaultBoite;
//     data = deepMerge(data, val);
//     if (this === $step[0]) {
//       return false;
//     } else {
//       if (data.console && 'active' in data.console) delete data.console.active;
//       if (data.screen && 'active' in data.screen) delete data.screen.active;
//       // if (data.emo && 'active' in data.emo) delete data.emo.active;
//       if (data.laptop && 'active' in data.laptop) delete data.laptop.active;
//     }
//   });
//   return data;
// }

// function getScreen(name) {
//   if (name in screens) {
//     return getFormValues(screens[name][0]);
//   }
// }

// function getScreens() {
//   return {
//     // emo: getScreen('emo'),
//     screen: getScreen('screen'),
//     console: getScreen('console'),
//     laptop: getScreen('laptop'),
//     boite: getScreen('boite'),
//     osc: getScreen('osc'),
//     saut: getScreen('saut'),
//     mainScreen: getScreen('mainScreen')
//   };
// }

// function fecthScreens() {
//   var $step = $('.scene__step.active');
//   return $step.length ? walkSteps($step) : getScreens();
// }

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

// function addEtapeSlideEffect(data) {
//   if ($('#select_effect').val() !== 'none') {
//     data['screen']['effect'] = $('#select_effect').val();
//   }
//   return data;
// }

// function addExtraData(data) {
//   // addSelectedUsersData(data);
//   addRepetData(data);
//   addEtapeSlideEffect(data);
//   return data;
// }

// function sendScreen(name) {
//   var data = fecthScreens();
//   var out = {};
//   out[name] = data[name];
//   console.log(out)
//   socket.emit('step', addExtraData(out));
// }

// function sendScreens() {
//   var data = fecthScreens();
//   socket.emit('step', addExtraData(data));
//   if (boite && 'send' in boite) boite.send();
// }

// $('.radio_fit').on('input', function() {
//   $(this.form)
//     .find('.sp-preview-inner')
//     .css(
//       'background-size',
//       $(this.form)
//         .find('.radio_fit:checked')
//         .val()
//     );
// });

// $('.color-picker')
//   .on('input', function() {
//     var $this = $(this);
//     var val = $this.val();

//     var $prev = $(this)
//       .next()
//       .find('.sp-preview-inner');

//     $prev[0].className = 'sp-preview-inner';
//     $prev.css('background-color', '');
//     $prev.css('background-image', '');

//     if (val.startsWith('.')) {
//       $prev.addClass(val.slice(1));
//     } else {
//       $prev.css('background-color', val);
//       $prev.css('background-image', `url(/data/media/${val})`);
//     }
//   })
//   .spectrum({
//     showAlpha: true,
//     allowEmpty: true,
//     showPalette: true,
//     showInitial: true,
//     preferredFormat: 'hex3',
//     // prettier-ignore
//     palette: [
//         ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
//         ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
//         ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
//         ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
//         ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
//         ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
//         ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
//         ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
//       ],
//     change: function() {
//       $(this).trigger('input');
//     }
//   });

// $('#send_all_screens').on('click', sendScreens);

$('.repet__pause').on('click', function() {
  setTimeout(function() {
    socket.emit('send', {
      to: ['screens', 'consoles', 'emos', 'laptops'],
      repet: addRepetData({}).repet
    });
  }, 0);
  playPause();
});
$('.repet__rewind').on('click', function() {
  socket.emit('send', {
    to: ['screens', 'consoles', 'emos', 'laptops'],
    rewind: true
  });
  rewind();
});
$('.repet__forward').on('click', function() {
  socket.emit('send', {
    to: ['screens', 'consoles', 'emos', 'laptops'],
    forward: true
  });
  forward();
});

function playPause(media) {
  document.querySelectorAll('video').forEach(element => {
    if (element.paused) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }
    // if (repet.pause) element.pause();
    // else if (element.paused) {
    //   element.play().catch(() => {});
    // }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (element.paused) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }

    // if (repet.pause) element.pause();
    // else if (element.paused) {
    //   element.play().catch(() => {});
    // }
  })
}

function rewind(media) {
  document.querySelectorAll('video').forEach(element => {
    if (element.src) {
      var t = element.currentTime - 5;
      if (t < 0) t = 0;
      element.currentTime = t;
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (element.src) {
      var t = element.currentTime - 5;
      if (t < 0) t = 0;
      element.currentTime = t;
    }
  })
}

function forward(media) {
  document.querySelectorAll('video').forEach(element => {
    if (element.src) {
      var t = element.currentTime + 5;
      element.currentTime = t;
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (element.src) {
      var t = element.currentTime + 5;
      element.currentTime = t;
    }
  })
}

/* Visual Novel
=============== */
var $visual = $('#visual');
let mainData = {};
let active = {
    fileName : "",
    scene : "",
    step : ""
}

socket.on('initial json', function(data) {
  setJSONsdata(data);
});


function setJSONsdata(data) { 
  mainData = {};
  let count = 0;
  $('#visual').empty();
  $('#visual')
  .append('<select id="select-novel"><option selected disabled>Select visual novel</option></select>')
  .append(`<button id="refresh_visual" class="icon box-min" title="Refresh data" onclick="refreshVisual()">
            <img src='icons/refresh.png'></img>
          </button>`)

  $('#select-novel').change(function(){
    $('#visual .show').hide();
    $(`#visual #${$(this).val()}`).show();

    // unmark all scenes and steps
    $(".toggler").removeClass('active');
    $(".stepElement").removeClass('active');

    // close all scenes
    $(".toggler").next().hide();

    // set active show
    setActiveStep($(this).val(), "", "");
    
    // get scene list
    displaySceneList();

    // set language
    currentLanguage = $(`#${active.fileName} .languages`).val();
    console.log(currentLanguage)
    socket.emit('change current language', {language : currentLanguage});
  });

  const sorted = data.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  sorted.forEach(async(src) => {
      await $.getJSON(src.replace('frontend', '.'), function(jsonData) {
          let array = src.split('/');
          let fileName = array[array.length -1].replace('.json', '');
          mainData[fileName] = jsonData;
          displayStructure(fileName, jsonData);
          count = count + 1;
          if (count === data.length) {
               // CLICK ON ACTIVE ITEM 
              const currentActive = {"fileName" : active.fileName, "step" : active.step, "scene" : active.scene};
              if (currentActive.fileName !== "") {
                  currentLanguage = $(`#${currentActive.fileName} .languages`).val();
                  console.log(currentLanguage);
                  socket.emit('change current language', {language : currentLanguage});
                  // $(`#${currentActive.fileName} .show-name`).click();
                  $('#select-novel').val(currentActive.fileName);
                  $('#select-novel').trigger("change");
                  if (currentActive.scene !== "") {
                      $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] .toggler`).click();
                      scrollToStep($(`#${currentActive.fileName} li[data-scene=${currentActive.scene}]`));
                      if (currentActive.step !== "") {
                          $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] li[data-step=${currentActive.step}]`).click();
                          scrollToStep( $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] li[data-step=${currentActive.step}]`));
                      }
                  } 
              }
          }
      })    
  });
}

function displaySceneList() {
    $('#select-next-scene')
    .empty()
    .append(`<option selected value="none">Select next scene.....</option>`)

    const data = mainData[active.fileName];
    data['scene-order'].forEach(scene => {
      $('#select-next-scene').append(`<option value=${scene}>${data['scenes'][scene]['name']}</option>`)
    })
}

function getFileName(src) {
  return src.split('/')[src.split('/').length -1]
}

// FUNCTION TO MAKE TEMPORARY RANDOM STRING IDs TO CONNECT ALL ELEMENTS
function createRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function refreshVisual() {
  socket.emit('refresh visual');
}


function setActiveStep(fileName, scene, step) {
  active.fileName = fileName;
  active.scene = scene;
  active.step = step;
  // console.log(active)
}

// function toggleSubtitles(value) {
//   const subtitlesDiv = `<div class="subtitles" style="position: absolute; width: 100%; height: 15%; color: white; bottom: 0px; background-color: rgb(211,211,211, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5vw;" data-key='subtitles'></div>`
 
//   $('#line').removeData('line');
//   if (value === 'off') {
//       $('#screen .subtitles').remove();
//       $('.subtitles-menu').hide();
//       $('.subtitles-menu .editor-buttons').empty();
//       $('#line').text('Subtitle lines');
//   } else {
//       if ($('#screen .subtitles').length === 0) {
//           $('#screen').append(subtitlesDiv);
//       }
      
//       $('.subtitles-menu .editor-buttons').empty();
//       $('.subtitles-menu').show();

//       if (active.fileName in subtitlesData) {
//           if ($(`#${active.fileName} .languages`).val() in subtitlesData[active.fileName]) {
//               $('.subtitles-menu .subtitles-style')
//                   .append(`
//                           <button onclick="editElement('subtitles', 'text')">
//                               <img src="./icons/settings.svg">
//                           </button>
//                           <select id="load-saved-style"></select>
//                           <button type="button" onclick="saveSubtitlesStyle('new')">Save as</button>
//                           <button type="button" onclick="saveSubtitlesStyle('existing')">Save</button>
//                           `);
//               $('.subtitles-menu .subtitles-content')
//                   .append(`<button type="button" onclick="editTranslation()">Edit translation</button>`);  

//               loadSubtitlesStyles();
//               $('#line').text(subtitlesData[active.fileName][$(`#${active.fileName} .languages`).val()].split("\n")[0]);
//               $('#line').data('line', 0);
//               $('.subtitles').text(subtitlesData[active.fileName][$(`#${active.fileName} .languages`).val()].split("\n")[0]);
//           } else {
//               $('.subtitles-menu .subtitles-content').append(`<button type="button" onclick="importTranslation()" style="margin: 0px;">Import translation</button> <small>No subtitles on ${$(`#${active.fileName} .languages`).val()} language</small>`);
//               $('#line').text('Subtitle lines');
//               $('.subtitles').text('Subtitle lines');
//           }
//       } else {
//           $('.subtitles-menu .subtitles-content').append(`<button type="button" onclick="importTranslation()" style="margin: 0px;">Import translation</button> <small>No subtitles on ${$(`#${active.fileName} .languages`).val()} language</small>`);
//           $('#line').text('Subtitle lines');
//           $('.subtitles').text('Subtitle lines');
//       }
//   }
// }

function displayStructure(fileName, data) {
  let showElement =  `<ul id=${fileName} class="show" style="display: none;">
                          <li class="show-name"><b><u>${data.name}</u></b></li>
                          <li class="structure-buttons">
                          </li>
                          <li><select class="languages"></select></li>
                          <li>
                              <ul id=${fileName + 'sceneList'} class="scenes"></ul>
                          </li>
                      </ul>`
  $('#visual').append(showElement);
  $('#select-novel').append(`<option value=${fileName}>${data.name}</option>`)

  // $(`input:radio[name=${`${fileName}_subtitles`}]`).change(function() {
  //   toggleSubtitles(this.value);
  // });

  // APPEND AVAILABLE LANGUAGES
  $.each(data.languages, function(key, value) {   
      $('#' + fileName).find('select')
          .append($("<option></option>")
                     .attr("value", value)
                     .text(value)); 
 });

 $(`#${fileName} .languages`).on('change', function() {
  currentLanguage = $(this).val();
  console.log(currentLanguage);
  socket.emit('change current language', {language : currentLanguage});
  // console.log(currentLanguage)
 })
 

  // APPEND SCENES AND STEPS IF PRESENT
  if (!jQuery.isEmptyObject( data.scenes )  ) {
  const sceneOrder = data['scene-order'];
  sceneOrder.forEach(sceneOrderNumber => {

      let scene = data['scenes'][sceneOrderNumber];
      const stepOrder = scene['step-order'];

      const id = createRandomString(5);
      $(`<li style="margin-top: 10px;" data-scene=${sceneOrderNumber}>
          <b id=${id + 'toggler'} class="toggler">${scene.name}</b>
          </li>`).appendTo(`#${fileName + 'sceneList'}`)
      .append(`<ul id=${id} style="display: none" class="steps"></ul>`);

      stepOrder.forEach(stepOrderNumber => {
        let stepName;
        if ('name' in scene['steps'][stepOrderNumber]) {
            stepName = scene['steps'][stepOrderNumber]['name']
        } else {
            stepName = 'Step ' + stepOrderNumber;
        }
        $("#" + id).append(`<li class="stepElement" data-step=${stepOrderNumber} onclick="setStep(event, '${fileName}', ${sceneOrderNumber}, ${stepOrderNumber})">${stepName}</li>`)
      })

      // DEFINE SORTABLE FUNCTIONS FOR SCENES
      // $('#' + fileName + 'sceneList').sortable({
      //     start : function (event, ui) {
      //         startPosition = ui.item.index();
      //      },
      //      stop: function(event, ui) {
      //         let endPosition = ui.item.index();
      //         if (endPosition !== startPosition) {
      //             // ADJUST MAIN DATA
      //             let movedElement = mainData[fileName]['scene-order'].splice(startPosition, 1)[0];
      //             mainData[fileName]['scene-order'].splice(endPosition, 0, movedElement);
      //             // SAVE TO JSON
      //             saveSceneOrder(fileName, mainData[fileName]['scene-order']);
      //         }
      //      }
      // })

      // DEFINE SORTABLE FUNCTIONS FOR STEPS
      // $("#" + id).sortable({
      //     start : function (event, ui) {
      //        startPosition = ui.item.index();
      //     },
      //     stop: function(event, ui) {
      //         let endPosition = ui.item.index();
      //         if (endPosition !== startPosition) {
      //             // ADJUST MAIN DATA
      //             let movedElement = mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(startPosition, 1)[0];
      //             mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(endPosition, 0, movedElement);
      //             // SAVE TO JSON
      //             saveStepOrder(fileName, sceneOrderNumber, mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);

      //             // ADJUST TEXT STEP number IN HTML
      //             $(ui.item).text('Step ' + (endPosition + 1));
      //             $(function () {
      //                 let currentLi = ui.item;
      //                 let number = endPosition;

      //                 while (number > 0) {
      //                     $(currentLi).prev().text('Step ' + number);
      //                     currentLi = $(currentLi).prev();
      //                     number = number - 1;
      //                 }       
                      
      //                 currentLi = ui.item;
      //                 number = endPosition + 2;

      //                 while (number <= ui.item.parent().children().length) {
      //                     $(currentLi).next().text('Step ' + number);
      //                     currentLi = $(currentLi).next();
      //                     number = number + 1;
      //                 }
      //             });
      //         }
      //     }
      // });    

      // DEFINE TOGGLE FUNCTIONS FOR STEP LIST
      $("#" + id + "toggler").click(function() {
          $(".toggler").not(this).nextAll().hide();
          // $( "#" + id ).toggle();
          $(this).nextAll().toggle();
          
          $(".toggler").not(this).removeClass('active');
          $(this).toggleClass('active');

          // MARK ACTIVE SCENE in constant active and by color in menu
          if ($(this).hasClass('active')) {
              setActiveStep(fileName, sceneOrderNumber, "");
              $(".show-name").removeClass('active');
              $(`#${fileName} .show-name`).addClass('active');
              $(".stepElement").removeClass('active');
          } else {
              setActiveStep(fileName, "", "");
              $(".stepElement").removeClass('active');
          }
          // $('#step-media ul').empty();
          // $('#preview').empty();
          // $('#console-checkbox').prop('checked', false);
          // $('#boite-checkbox').prop('checked', false);
      });
  })
}
   // TOGGLE SHOW
   $(`#${fileName} .show-name`).click(function(){
      // toggle visibility
      $(".show").not(`#${fileName}`).children().not('.show-name').hide();
      $(`#${fileName}`).children().not('.show-name').toggle();
      
      // toggle class
      $(".show-name").not(this).removeClass('active');
      $(this).toggleClass('active');

      // close all scenes
      $(".toggler").next().hide();

      // unmark all scenes and steps
      $(".toggler").removeClass('active');
      $(".stepElement").removeClass('active');

      // MARK ACTIVE SHOW in constant active and by color in menu
      // if ($(this).hasClass('active')) {
      //     setActiveStep(fileName, "", "");
      // } else {
      //     setActiveStep("", "", "");
      // }
      // $('#step-media ul').empty();
      // $('#preview').empty();
      // $('#console-checkbox').prop('checked', false);
      // $('#boite-checkbox').prop('checked', false);
  })
}

const screensPreview = ['screenCurrent', 'laptopCurrent', 'screenNext', 'laptopNext'];
let screenPreview;

let videoElementsNo = 0;
let loadedVideos = 0;

function countVideoMedias(stepMedia) {
  let count = 0;
  $.each(stepMedia, function() {
    if (this.type=== 'media_video') count = count + 1;
  });
  return count
}

function checkIfProblematic(data) {
  if ('name' in data) {
    if (data.name === 'problematic') {
      return true
    } return false
  } 
  return false
}

function setStep(e, fileName, scene, step) {
  $(".stepElement").not(e.target).removeClass('active');
  // $(e.target).parent().find('.structure-buttons').remove();
  $(e.target).toggleClass('active');

  // CLEAR PREVIOUS MODES
  finalFantasy('');

  if($(e.target).hasClass('active')) {
      setActiveStep(fileName, scene, step);

      // $.getJSON('./data/json/' + fileName + '.json', function(jsonData) {
        const stepData = mainData[fileName]['scenes'][scene]['steps'][step];
        // console.log(stepData);
        if ('boite' in stepData) {
          setBoite(stepData.boite);
          $('#boite input').each(function(){
            $(this).prop('checked', false);
            $(`#boite input[value=${stepData.boite.type}]`).prop('checked', true);
        })
        } 
        
        socket.emit('step', stepData);
       
        screenPreview = 'screenCurrent';
        // if (checkIfProblematic(stepData)) {
        //   displayStep(offStep['screen']);
        // } else {
          displayStep(stepData['screen']);
        // }
        
        screenPreview = 'laptopCurrent';
        displayStep(stepData['laptop']);

        screenPreview = 'screenNext';

        const currentStepIndex = mainData[fileName]['scenes'][scene]['step-order'].indexOf(step);
        const nextStep = mainData[fileName]['scenes'][scene]['step-order'][currentStepIndex + 1];
        if (nextStep) {
          // if (checkIfProblematic(mainData[fileName]['scenes'][scene]['steps'][nextStep])) {
          //   displayStep(offStep['screen']);
          // } else {
            displayStep(mainData[fileName]['scenes'][scene]['steps'][nextStep]['screen']);
          // }
          // displayStep(mainData[fileName]['scenes'][scene]['steps'][nextStep]['screen']);
          screenPreview = 'laptopNext';
          displayStep(mainData[fileName]['scenes'][scene]['steps'][nextStep]['laptop']);
        } else {
          displayStep(offStep['screen']);
          screenPreview = 'laptopNext';
          displayStep(offStep['laptop']);
        }

        // start playing videos only after all are loaded to play trough
        // Array.from(document.getElementsByTagName('video')).forEach(video => {
        //   video.oncanplay = function() {
        //     loadedVideos = loadedVideos + 1;
        //     if (loadedVideos === videoElementsNo) {
        //       startAllVideos()
        //     }
        //   }
        // })

  } else {
      setActiveStep(fileName, scene, ""); 
      socket.emit('step', offStep);
      
      screensPreview.forEach(element => {
        screenPreview = element;
        displayStep(offStep[element.replace('Current', '').replace('Next', '')]);
      })
  }
}

function startAllVideos() {
  Array.from(document.getElementsByTagName('video')).forEach(video => {
    video.play();
  })
}

function scrollToStep($step) {
  $('#visual').scrollTo($step, {
    offset: -1 * ($('#visual').height() / 2),
    over: { top: 0.5 },
    duration: 200
  });
}

//   var tmp = {
//     screen: deepMerge({}, defaultScreen, val.screen),
//     // emo: deepMerge({}, defaultScreen, val.emo),
//     console: deepMerge({}, defaultScreen, val.console),
//     laptop: deepMerge({}, defaultScreen, val.laptop),
//     boite: deepMerge({}, defaultBoite, val.boite),
//     osc: deepMerge({}, dummyStep.osc, val.osc),
//     saut: deepMerge({}, dummyStep.saut, val.saut),
//     mainScreen: deepMerge({}, dummyStep.mainScreen, val.mainScreen)
//   };

//   return tmp;
// }

// function setCtrlScreen($dest, data) {
//   if (data) setFormValues($dest[0], data);
// }

// function setCtrlScreens(data) {
//   // setCtrlScreen(screens.emo, data.emo);
//   setCtrlScreen(screens.screen, data.screen);
//   setCtrlScreen(screens.console, data.console);
//   setCtrlScreen(screens.laptop, data.laptop);
//   setCtrlScreen(screens.boite, data.boite);
//   setCtrlScreen(screens.osc, data.osc);
//   setCtrlScreen(screens.saut, data.saut);
//   setCtrlScreen(screens.mainScreen, data.mainScreen);
// }


// function displayStep(val) {
//   val = serialiseStep(val);
//   // val1 = adjustStepForCurrentLanguage(val);
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


// function adjustStepForCurrentLanguage(item){
//   // $.each(a[0], function(key, x) {
//     // x.forEach(function(item) {
//       if (typeof item === 'string') {
//         return item;
//         // results += item + '\n';
//       } else {
//         var stepObject = item;
//         $.each(item, function(key, y) {
//           if (typeof y !== 'string') {
//             if ('texte' in y) {
//               if (typeof y.texte !== 'string') {
//                 if (currentLanguage in y.texte) {
//                   stepObject[key].texte = y.texte[currentLanguage];
//                 } else {
//                   // stepObject[key].texte = y.texte[defaultLanguage];
//                   stepObject[key].texte = `NO TRANSLATION!`
//                 }
//               }
//             } else if ('arg' in y) {
//               if (typeof y.arg !== 'string') {
//                 if (currentLanguage in y.arg) {
//                   stepObject[key].arg = y.arg[currentLanguage];
//                 } else {
//                   // stepObject[key].texte = y.texte[defaultLanguage];
//                   stepObject[key].arg = `NO TRANSLATION!`
//                 }
//               }
//             }
//           } else {
//             if (currentLanguage in item) {
//               stepObject = item[currentLanguage];
//             } else {
//               // stepObject = item[defaultLanguage];
//               stepObject = `NO TRANSLATION!`
//             }
//           }
//         });
//         return stepObject;
//       }
//     // });
//   // });
// }

// $('#visual__openall').on('click', function() {
//   $('.scene').removeClass('closed');
// });

// $('#visual__closeall').on('click', function() {
//   $('.scene').addClass('closed');
// });


$('#visual__next').on('click', function() {
  let nextStep;
  if (active.step !== '') {
    nextStep = $(`#visual #${active.fileName} [data-scene=${active.scene}] [data-step=${active.step}]`).next();
    if (nextStep.length !== 0) {
      nextStep.click();
      scrollToStep(nextStep);
    } else {
      let nextSceneNumber = $('#select-next-scene').val();
      let nextScene;
      if (nextSceneNumber === "none") {
        nextScene = $(`#visual #${active.fileName} [data-scene=${active.scene}]`).next();
      } else {
        nextScene = $(`#visual #${active.fileName} [data-scene=${nextSceneNumber}]`);
      }
      if (!nextScene.find('.toggler').hasClass('active')) {
        nextScene.find('.toggler').click();
      }
     
      nextStep = nextScene.find('.steps li').first();

      if (!nextStep.hasClass('active')) {
        nextStep.click();
      }
      scrollToStep(nextStep);
      // empty scenes preventer in editor
      // if (nextScene.find('.steps li').first().length === 0) {
      //   socket.emit('step', offStep);
      //   scrollToStep(nextScene);
      // } else {
      //   scrollToStep(nextStep);
      // }
    }
  }

});

$('#visual__prev').on('click', function() {
  if (active.step !== '') {
    const nextStep = $(`#visual #${active.fileName} [data-scene=${active.scene}] [data-step=${active.step}]`).prev();
    nextStep.click();
    scrollToStep(nextStep);
  }
});



$visual
  // .on('click', function(e) {
  //   if (e.target === $visual[0] || e.target.classList.contains('scene')) {
  //     $('.scene__radio').prop('checked', false);
  //     $('.scene__step').removeClass('active');
  //   }
  // })
  // .on('click', '.scene__radio', function() {
  //   $('.scene__step').removeClass('active');
  // })
  // .on('click', '.scene__step', function() {
  //   activateStep($(this));
  // })
  // .on('dblclick', '.scene__step', function() {
  //   activateStep($(this));
  //   sendScreens();
  // })
  // .on('click', '.scene__step__reset', function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   var $step = $(this).parent();
  //   var saved = $step.data('saved');
  //   var val = saved.pop() || $step.data('original');
  //   $step
  //     .data('val', val)
  //     .find('.scene__step__json')
  //     .text(stringifyStep(val));
  //   $step.click();
  // });

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
        var responseText;
        if (currentLanguage in val.data) {
          responseText = sample(val.data[currentLanguage])
        } else {
          responseText = sample(val.data[defaultLanguage])
        }
        sendToSelectedUsers({
          type: val.type,
          texte: responseText
        });
      })
    );
  });
  var $btn = $(`<button title="image" class="icon">IMAGE</button>`);
  var $imageInput = $(`<input type="file" style="display: none;" id="image-file"></input>`);
  $reponses.append(
    $btn.on('click', function(e) {
      e.preventDefault();
      $('#image-file').val('');
      $('#image-file').click();
    }),
    $imageInput.on('change', function (e) {
      var data = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $('#image-msg')[0].src = '';
        $('#image-msg')[0].src = evt.target.result;
        $('#remove-image').show();
      };
      reader.readAsDataURL(data);
    })
  );

  displaySavedResponses();

  $('#image-msg').on('click', function(){
    $('#image-file').click();
  });

  $('#remove-image').on('click', function(){
    $('#image-msg').attr('src', '');
    $('#remove-image').hide();
  })
}

let savedResponses;

function displaySavedResponses() {
  $.getJSON('/data/messages.json', function(data) {
    $('#select-saved-response').empty();
    $('#one_shot__message').val('');
    $('#image-msg').attr('src', '');
    $('#remove-image').hide();
    savedResponses = data.messages;
    $('#select-saved-response').append(`<option disabled selected value=''>Select saved response</option>`);
    for (let message in savedResponses) {
      $('#select-saved-response').append(`<option value=${message}>${savedResponses[message].text.substring(0, 10)}...</option>`);
    }
    $('#select-saved-response').on('change', function(){
      $('#one_shot__message').val(savedResponses[$(this).val()].text);
      $('#image-msg').attr('src', savedResponses[$(this).val()].src);
      if (savedResponses[$(this).val()].src !== '') {
        $('#remove-image').show();
      } else {
        $('#remove-image').hide();
      }
    })
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
  .on('submit', 'form', function(e) {
    e.preventDefault();
    if (this.id === 'interactions') {
      if ($(e.originalEvent.submitter).data('title') === 'send') {      
        let imageMessage = ''
        if ($('#image-msg').attr('src') !== '') {
          imageMessage = $('#image-msg')[0].outerHTML;
        };
        sendToSelectedUsers({
          type: 'message',
          texte: "<pre>" + $one_shot__message.val() + "</pre>"+ imageMessage
        });
        $one_shot__message.val('');
        $('#image-msg')[0].src = '';
        $('#remove-image').hide();
        $('#select-saved-response').val('');
      } else if ($(e.originalEvent.submitter).data('title') === 'save') {
        saveMessage({
          text: $one_shot__message.val(),
          src: $('#image-msg').attr('src'),
          key: $('#select-saved-response').val()
        })
      } else {
        if ($('#select-saved-response').val() !== '') {
          deleteMessage({
            key : $('#select-saved-response').val()
          })
        }
      }
    } else if (this.id === 'form_osc_ip') {
      socket.emit('set osc host', $('#osc_ip').val());
    } else {
      sendScreen(this.id);
    }
  });

socket.open();

actions.next_step = function() {
  $('#visual__next').click();
};
actions.prev_step = function() {
  $('#visual__prev').click();
};


// SET PREVIEW

// QR code reader
// function getMediaStream() {
//   const controls = document.querySelector('.controls');
//   const cameraOptions = document.querySelector('.video-options>select');
//   const video = document.querySelector('#stream');
//   const buttons = [...controls.querySelectorAll('.streamControl')];
//   let streamStarted = false;

//   const [play, pause] = buttons;

//   const constraints = {
//   video: {
//       deviceId: ''
//   }
//   };

//   cameraOptions.onchange = () => {
//       constraints.video.deviceId = cameraOptions.value;
//   startStream(constraints);
//   };

//   play.onclick = () => {
//   if (streamStarted) {
//       video.play();
//       play.classList.add('d-none');
//       pause.classList.remove('d-none');
//       return;
//   }
//   if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
//       constraints.video.deviceId = cameraOptions.value;
//       startStream(constraints);
//   }
//   };

//   const pauseStream = () => {
//   video.pause();
//   play.classList.remove('d-none');
//   pause.classList.add('d-none');
//   };

//   pause.onclick = pauseStream;


//   const startStream = async (constraints) => {
//       controls.classList.add('d-none');
//       navigator.mediaDevices.getUserMedia( constraints )
//       .then( MediaStream => {
//           handleStream(MediaStream);
//       }).catch( error => {
//           console.log(error)
//       });
//   };


//   const handleStream = (stream) => {
//   video.srcObject = stream;
//   play.classList.add('d-none');
//   pause.classList.remove('d-none');
//   controls.classList.remove('d-none');
//   };


//   const getCameraSelection = async () => {
//   const devices = await navigator.mediaDevices.enumerateDevices();
//   const videoDevices = devices.filter(device => device.kind === 'videoinput');
//   const options = videoDevices.map(videoDevice => {
//       return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
//   });
//   cameraOptions.innerHTML = cameraOptions.innerHTML + options.join('');
//   };

//   getCameraSelection();
// }

// function readCode() {
//   import('./lib/qr-scanner/qr-scanner.min.js').then((module) => {
//     const QrScanner = module.default;
//     // do something with QrScanner
//     new QrScanner(document.getElementById('stream'), result => 
//     console.log('decoded qr code:', result));
//     qrScanner.start();
// });
// }

// function closeQRmodal() {
//   document.getElementById('QR_modal').style.display = 'none';
// }


// function onScanSuccess(decodedText, decodedResult) {
//   // handle the scanned code as you like, for example:
//   console.log(`Code matched = ${decodedText}`, decodedResult);
// }

// function onScanFailure(error) {
//   // handle scan failure, usually better to ignore and keep scanning.
//   // for example:
//   console.warn(`Code scan error = ${error}`);
// }

// let html5QrcodeScanner = new Html5QrcodeScanner(
//   "reader",
//   { fps: 10, qrbox: {width: 250, height: 250} },
//   /* verbose= */ false);
// html5QrcodeScanner.render(onScanSuccess, onScanFailure);

function clearUnwantedMedia(data){
  const stepMedia = data['media'];

  let keysArray = [].map.call($(`#${screenPreview} .step__decor`).children().not('#boite, .console'), function (e) {
  return e.getAttribute('data-key')
  })

  keysArray.forEach(key => {
      if (!stepMedia[key]) {
        if ($(`#${screenPreview} .step [data-key=${key}]`).find('video').length !== 0) {
          $(`#${screenPreview} .step [data-key=${key}] video`).stop();
          $(`#${screenPreview} .step [data-key=${key}] video`).attr('src', '');
        }
          $(`#${screenPreview} .step [data-key=${key}]`).remove();
      }
  })
}

function applyZIndexes(data) {
  let zIndex = data['media-order'].length;
  data['media-order'].forEach((value, index) => {
      $(`#${screenPreview} .step__decor [data-key=${value}]`).css({"z-index" : zIndex});
      zIndex = zIndex - 1;
  })
}

function displayStep(data) {
    clearUnwantedMedia(data);

    $(`#${screenPreview} .step__decor small`).remove();

    const mediaOrder = data['media-order'];
    const stepMedia = data['media'];

    const videoNo = countVideoMedias(stepMedia);

    for (let data_key of mediaOrder) {
      if (videoNo < 3) {
        setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
      } else {
        if (stepMedia[data_key]['type'] !== 'media_video') {
          setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
        }
      }
    }
    applyZIndexes(data); 
    
    setElements("", "console", "", data['console']);
    $(`#${screenPreview} .step`).css('background-color', data['background-color']);
   
    if (videoNo >= 3) {
      $(`#${screenPreview} .step__decor`).append('<small style="position: absolute; bottom: 5%; left: 10%; color: white;">* due to long loading videos are not shown in preview </small>')
    }
}

function styleToObject(style) {
  const regex = /([\w-]*)\s*:\s*([^;]*)/g;
  let match, properties={};
  while(match=regex.exec(style)) properties[match[1]] = match[2].trim(); 
  return properties;
}

function setElements(val, type, data_key, stepMediaObject) {
  src = '/data/media/' + val;
 
  const avatarsElement = `<div class="avatars" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;" data-key=${data_key} data-type=${type}>
                          </div>`;

  const console = `<div id="console" class="console" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:666666;">
                    <iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe>
                  </div>`;

  const imageElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                          <img style="width: 100%;" src=${src} class="media"></img>
                        </div>`

  const videoElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type} data-audioOutput=''>
                          <video autoplay volume=0.5 style="width: 100%;" src=${src} class="media"></video>
                        </div>`
                 
  const audioElement = `<div style="width: 5%; position: absolute; top: 25%; left:85%; padding:5px;" data-key=${data_key} data-type=${type}>
                            <audio autoplay volume=0.5 class="media" src=${src}></audio>
                          </div>`

  const streamElement = `<div style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                            <video autoplay style="width: 100%;" class="media"></video>
                          </div>`
 
  const textElement = `
                        <pre contenteditable="true" class="text draggable" data-key=${data_key} data-type=${type} 
                                  style=" 
                                  position: absolute; 
                                  top: 25%; 
                                  left:25%;
                                  white-space: pre-wrap; 
                                  word-wrap: break-word;
                                  color: white;
                                  font-size: 16px;
                                  margin: 0px;
                                  padding: 10px;
                                  font-family: Arial;
                                  "
                        >${val}</pre>
                    `
  
  const elements = {
    'media_images' : imageElement,
    'media_gifs' : imageElement,
    'media_video' : videoElement,
    'media_audio' : audioElement,
    'videoStream' : streamElement,
    'avatars' : avatarsElement,
    'text' : textElement
  } 

  if (type in elements) {
      if($(`#${screenPreview} .step__decor [data-key=${data_key}]`).length === 0) {
          $(`#${screenPreview} .step__decor`).append(elements[type]);
      }
  }
  
  // if(type === 'console') {
  //     if(stepMediaObject.active === true && $(`#${screenPreview} .step .console`).length === 0) {
  //         $(`#${screenPreview} .step`).append(console);
  //     }
  //     if (stepMediaObject.active === false && $(`#${screenPreview} .step .console`).length !== 0) {
  //       $(`#${screenPreview} .step .console`).remove();
  //     }
  // } 
  if(type === 'console') {
    if($(`#${screenPreview} .step .console`).length === 0) {
      $(`#${screenPreview} .step`).append(console);
    }
  } 
  
  // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
  if (stepMediaObject) {
      if (type === 'console') {
          // $(`#${screenPreview} .${type}`).css(stepMediaObject['css']);

          if (!stepMediaObject['active']) {
            $(`#${screenPreview} .${type}`).hide();
          } else {
            $(`#${screenPreview} .${type}`).show();
          }
          $(`#${screenPreview} .${type}`).css(stepMediaObject['css']);
      } 
      else if (type === 'media_audio') {
        let mediaElement = $(`#${screenPreview} .step`).find(`*[data-key="${data_key}"]`);
        if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
            mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
        }
        mediaElement.find('.media').prop('volume', 0)
        mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
      } 
      else {
          // APPLY CSS
          let mediaElement = $(`#${screenPreview} .step`).find(`*[data-key="${data_key}"]`);
          mediaElement.removeAttr('style');
          mediaElement.css(stepMediaObject['css']);

          // APPLY LOOP AND MUTED TO VIDEOS
          if(stepMediaObject['type'] === 'media_video') {
              mediaElement.find('.media').prop('muted', true);
              mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop']);
              mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume']);
              // mediaElement.data('audioOutput', stepMediaObject['attributes']['audioOutput']);
              // mediaElement.find('.media')[0].setSinkId(stepMediaObject['attributes']['audioOutput']);
          }

           // CHECK IF NEW SRC SHOULD BE APPLIED
           if (stepMediaObject['type'] === 'media_video' || stepMediaObject['type'] === 'media_images' || stepMediaObject['type'] === 'media_gifs') {
            if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
                mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
            }
          }

          if (stepMediaObject['type'] === 'videoStream') {
              if (mediaElement.data('device') !== stepMediaObject['attributes']['device']) {
                  const constraints = {
                      video: { deviceId: stepMediaObject['attributes']['device']}
                  };
                  mediaElement.data('device', stepMediaObject['attributes']['device']);
                  mediaElement.data('label', stepMediaObject['attributes']['label']);

                  startStream(constraints, data_key, screenPreview);
              } 
          }

           // ADD NEW TEXT IF NEEDED
           if (stepMediaObject['type'] === 'text') {
              if (mediaElement.text() !== stepMediaObject['content']) {
                if (stepMediaObject['classes'].join(' ').includes('fantasy')) {
                  finalFantasy(stepMediaObject['content'], data_key, screenPreview ,true);
                } else {
                    mediaElement.text(stepMediaObject['content']);
                }
              }
               // CORRECTION DUE TO DIFFERENCE IN EDITOR SCREEN SIZE AND REAL FULL SCREEN SIZE
               const textStyle = styleToObject(mediaElement.attr('style'));
               const correctionParameter = 100*mediaElement.parent().width()/window.innerWidth;
               let correctedSize = parseFloat(textStyle['font-size'])*correctionParameter/55;
               let correctedBorder = parseFloat(textStyle['border-width'])*correctionParameter/55;
               let correctedPadding = parseFloat(textStyle['padding'])*correctionParameter/55;
 
               mediaElement.css('font-size', correctedSize + 'vw');
               mediaElement.css('border-width', correctedBorder + 'vw');
               mediaElement.css('padding', correctedPadding + 'vw');
          }

          // APPLY CLASSES
          mediaElement.removeClass();
          mediaElement.addClass(stepMediaObject['classes'].join(' '));
         
          if(stepMediaObject['css']['object-fit'] && stepMediaObject['css']['object-fit'] !== "") {
              mediaElement.find('.media').css({"height" : "100%", "object-fit" : stepMediaObject['css']['object-fit']});
          }
      }
  } 
}


async function startStream(constraints, data_key, div) {
  navigator.mediaDevices.getUserMedia({video: true, audio: true});

  navigator.mediaDevices.getUserMedia( constraints )
  .then( MediaStream => {
      handleStream(MediaStream, data_key, div);
  })
  .catch( error => {
      console.log(error);
  });
}

function handleStream(stream, data_key, div) {
  $(`#${div} .step [data-key=${data_key}] video`)[0].srcObject = stream;
}
