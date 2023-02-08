var $main = $('main');
var $step = $('<div class="step"></div>');
var $decor = $('<div class="step__decor"></div>');
var $texte = $('<div class="step__texte"></div>');
var $boite = $('<div id="boite"></div>');
// var $boiteAvatars = $('<div id="avatars"></div>');
$boite.hide();

$step.append($decor, $texte, $boite);
$main.append($step);

var audio = new Audio();
var img = new Image();
var dataFolder = '/data/media/';

var screenTypes = {
  screen: '📽️ SCREEN',
  // emo: '📺 EMO',
  laptop: '💻 LAPTOP',
  console: '🖥️ CONSOLE'
};

window.onload = (event) => {
  if (cat === 'console') {
    $('body').css('background-color', 'transparent');
  } else {
    $('body').css('background-color', 'black');
  }
}

if (cat in screenTypes) {
  document.title = screenTypes[cat];
  $main[0].id = cat;
}

// function afterFirstClick(cb) {
//   if (firstClick) cb();
//   else $(window).one('click', cb);
// }

/* Sounds
========= */
var sounds = {
  bot: new Howl({
    src: ['data/media/Sons/Jer.wav'],
    volume: 0.16
  })
};

function s(sound) {
  if (sound in sounds) sounds[sound].play();
}

actions.console = function(params) {
  if (mode.type === 'console') mode.write(params);
};

actions.validated = function(params) {
  if (boite && 'validated' in boite) {
    boite.validated(params);
  }
};

var gamepad_paused = false;
var tid;
actions.gamepad_master = function(key) {
  if (boite && 'gamepad' in boite) {
    boite.gamepad(key);
    clearTimeout(tid);
    tid = setTimeout(() => {
      gamepad_paused = false;
      socket.emit('send', {
        to: 'screen',
        pause_gamepad: false
      });
    }, 2000);
    gamepad_paused = true;
  }
};
actions.gamepad = function(key) {
  if (boite && 'gamepad' in boite && gamepad_paused === false) {
    boite.gamepad(key);
  }
};

/* Emoji
======== */
function emojify(data) {
  return twemoji.parse(data, {
    base: '/fonts/',
    folder: 'emoji',
    ext: '.svg'
  });
}

/* Steps
======== */
var repetDefault = {
  time: 0,
  pause: false
};

var repet = {};

function stop(media) {
  document.querySelectorAll('video').forEach(element => {
    element.pause();
    element.removeAttribute('src');
    delete element.src;
    element.load();
  })
  document.querySelectorAll('audio').forEach(element => {
    element.pause();
    element.removeAttribute('src');
    delete element.src;
    element.load();
  })
  // if (media.src) {
  //   media.pause();
  //   media.removeAttribute('src');
  //   delete media.src;
  //   media.load();
  // }
}

function playPause(media) {
  document.querySelectorAll('video').forEach(element => {
    if (repet.pause) element.pause();
    else if (element.paused) {
      element.play().catch(() => {});
    }
  })
  document.querySelectorAll('audio').forEach(element => {
    if (repet.pause) element.pause();
    else if (element.paused) {
      element.play().catch(() => {});
    }
  })
  // if (media.src) {
  //   if (repet.pause) media.pause();
  //   else if (media.paused) {
  //     media.play().catch(() => {});
  //   }
  // }
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

var video = $('video')[0]
actions.repet = function(data) {
  repet = Object.assign(repetDefault, data);
  playPause(audio);
  playPause(video);
};

actions.rewind = function() {
  rewind(audio);
  rewind(video);
};

actions.forward = function() {
  forward(audio);
  forward(video);
};

// var containCSS = {'width' : '100%', 'height' : '100%', 'object-fit': 'contain'};
// var coverCSS = {'width' : '100%', 'height' : '100%', 'object-fit': 'cover'};

// var lastVideoSrc;
// function setVideo({ src, style, volume, fit, loop }) {
//   var $video = $('<video></video>');
//     if (style !== " " && style !== undefined && style !== "[]") {
//       $video.css(style);
//     } else {
//       if (fit === 'contain') {
//         $video.css(containCSS);
//       } else {
//         $video.css(coverCSS);
//       }
//     }
    
//     var loop;
//     var muted;

//     if (style.loop && style.loop !== null) {
//        loop = true;
//     }

//     if (style.muted && style.muted !== null) {
//      muted = true;
//     }

//   var deviceId;

//   if (src.includes('deviceId')) {
//     deviceId = src.split('_')[1];
//     $video.attr('id', 'stream');
//     $video.attr('autoplay', true);
//     $decor.append($video); 
//     // afterFirstClick(
//       async() => {
//       await navigator.mediaDevices.getUserMedia({
//         video: {
//             deviceId: deviceId
//         }}).then(stream => document.getElementById('stream').srcObject = stream)}
//     // })
//     ;
   
//   } else {
//     src = dataFolder + src;
//     var video = $video[0];
//     video.loop = loop;
//     if (!style.muted || style.muted === null) {
//       if (typeof volume === 'number') video.volume = volume / 100;
//       else video.volume = 0.5;
//     }
   
//     if (repet.time !== '') {
//       if (Number.isNaN(video.duration) !== false) {
//         video.currentTime = repet.time > video.duration ? video.duration : repet.time;
//       } else {
//         video.currentTime = repet.time;
//       }
//     }
//     $decor.append($video);  
//     // afterFirstClick(() => {
//       video.src = src;
//       video.muted = muted;
//       video.addEventListener('canplay', event => {
//         if (repet.pause) video.pause();
//         else video.play();
//       });
//       video.addEventListener('ended', event => {
//         if (video.loop === false) {
//           $video.hide();
//         }
//       });
//     // });
//   }
// }

async function startStream(constraints, data_key) {
  navigator.mediaDevices.getUserMedia( constraints )
  .then( MediaStream => {
      handleStream(MediaStream, data_key);
  })
  .catch( error => {
      console.log(error);
  });
}

function handleStream(stream, data_key) {
  $(`.step [data-key=${data_key}] video`)[0].srcObject = stream;
}






// var lastImageSrc;
// function setImage({ src, style, fit }) {
//   var $image = $('<img style="position:absolute"></img>');

//     if (style !== " " && style !== undefined && style !== "[]") {
//       $image.css(style);
//     } else {
//       if (fit === 'contain') {
//         $image.css(containCSS);
//       } else {
//         $image.css(coverCSS);
//       }
//     }
  
//   src = dataFolder + src;
//   $decor.append($image);
//   // $decor.css('background-color', '');
//   var image = $image[0];

//   // $image.show();

//   // if (lastImageSrc === src) return;
//   // afterFirstClick(() => {
//     image.src = src;
//     // lastImageSrc = src;
    
   
//   // });
// }

// var lastMusicSrc;
// function setMusic({ src, volume, loop = false }) {
//   src = dataFolder + src;
//   audio.loop = loop;
//   if (typeof volume === 'number') audio.volume = volume / 100;
//   else audio.volume = 0.5;

//   if (repet.time !== '') {
//     if (Number.isNaN(audio.duration) !== false) {
//       audio.currentTime = repet.time > audio.duration ? audio.duration : repet.time;
//     } else {
//       audio.currentTime = repet.time;
//     }
//   }

//   if (lastMusicSrc === src) return;
//   // afterFirstClick(() => {
//     stop(audio);
//     audio.src = src;
//     lastMusicSrc = src;
//     audio.addEventListener('canplay', event => {
//       if (repet.pause) audio.pause();
//       else audio.play();
//     });
//   // });
// }

// var lastIframeSrc;
// function setIframe({ src, style, fit }) {
//   var $iframe = $('<iframe />');

//     if (style !== " " && style !== undefined && style !== "[]") {
//       $iframe.css(style);
//     } else {
//       if (fit === 'contain') {
//         $iframe.css(containCSS);
//       } else {
//         $iframe.css(coverCSS);
//       }
//     }
  
//   if (src.includes("layouts")) {
//     src = src.startsWith('http') ? src : `/data/media/${src}`;
//   } else {
//     src = src.slice(1);
//     src = src.startsWith('http') ? src : `/data/pages/${src}/index.html`;
//   }
//   $decor.append($iframe);
//   var iframe = $iframe[0];
//     // if (lastIframeSrc === src) return;
//     // afterFirstClick(() => {
//       // $iframe.show();
//       // $iframe.css(style);
//       iframe.src = src;
//       // lastIframeSrc = src;
//       // iframe.addEventListener('load', () => {
//       //   console.log('iframe loaded');
//       // });
//       // iframe.onload = function(e) {
//       //   if (e.target.contentWindow.document.getElementsByTagName('video')[0]) {
//       //     video = e.target.contentWindow.document.getElementsByTagName('video')[0];
          
//       //     video.addEventListener('canplay', event => {
//       //       if (repet.pause) video.pause();
//       //       else video.play();
//       //     });
//       //     video.addEventListener('ended', event => {
//       //       if (video.loop === false) {
//       //         $(iframe).contents().find("video").hide();
//       //         // $video.hide();
//       //         // $decor.css('background-color', '#000');
//       //       }
//       //     });
//       //     if (e.target.contentWindow.document.getElementsByTagName('canvas')[0]) {
//       //       processor.start(video);
//       //     }
//       //   } 
//       // }
     
      
//     // });
  
// }

// function killDecors(expect) {
 
//   $('.step__decor').find('img').each(function(){$(this).remove()})
//   $('.step__decor').find('iframe').each(function(){$(this).remove()})
//   $decor.css('background-color', '');
//   $step[0].className = 'step';
  
// }

// function isJsonString(str) {
//   try {
//       JSON.parse(str);
//   } catch (e) {
//       return false;
//   }
//   return true;
// }

// function setDecor(data) {
//   var src = data.src;
//   killDecors();
//   if (isJsonString(data.src)) {
//       const src = JSON.parse(data.src);
//       const style = JSON.parse(data.style);

//       // check if there is already video with same source and leave it
//       var existingVideos = [];
//       var newVideoSrc = [];
//       for (var i = 0; i < src.length; i++) {
//         if (
//           src[i].toLowerCase().endsWith('.webm') ||
//           src[i].toLowerCase().endsWith('.ogv') ||
//           src[i].toLowerCase().endsWith('.mp4') ||
//           src[i].toLowerCase().endsWith('.mov') ||
//           src[i].toLowerCase().endsWith('.wmv') ||
//           src[i].toLowerCase().endsWith('.avi') ||
//           src[i].includes('deviceId')
//         ) {
//           if (jQuery(`video[src*='${src[i]}']`).length === 0) {
//             newVideoSrc.push(src[i]);
//           } else {
//             existingVideos.push(src[i]);
//           }
//         }
//       }
//       if (existingVideos.length > 0) {
//         document.querySelectorAll('video').forEach(element => {
//           if (element.getAttribute('src') !== null) {
//             if (!existingVideos.includes(element.getAttribute('src').replace("/data/media/",""))) {
//             $(element)[0].remove();
//           }
//         }})
//       }

//       for (var i = 0; i < src.length; i++) {
//         if (typeof src[i] === 'string') {
//           if (src[i].charAt(0) === '.') {
//                     // killDecors();
//                     $step.addClass(src[i].split('.').join(' '));
//                   } else if (src[i].charAt(0) === '@') {
//                     if (jQuery(`iframe[src*='${src[i]}']`).length === 0) {
//                       // killDecors('iframe');
//                       var tempDATA = data;
//                       tempDATA.src = src[i];
//                       tempDATA.style = style[i];
//                       setIframe(tempDATA);
//                     }
//                   } else if (src[i].includes("html") && src[i].charAt(0) !== '@') {
//                     if (jQuery(`iframe[src*='${src[i]}']`).length === 0) {
//                     // killDecors('iframe');
//                     var tempDATA = data;
//                     tempDATA.src = src[i];
//                     tempDATA.style = style[i];
//                     setIframe(tempDATA);
//                     }
//                   } else if (
//                     src[i].toLowerCase().endsWith('.jpg') ||
//                     src[i].toLowerCase().endsWith('.jpeg') ||
//                     src[i].toLowerCase().endsWith('.gif') ||
//                     src[i].toLowerCase().endsWith('.png') ||
//                     src[i].toLowerCase().endsWith('.webp') ||
//                     src[i].toLowerCase().endsWith('.svg') ||
//                     src[i].toLowerCase().endsWith('.jfif')
//                   ) {
//                     if (jQuery(`img[src*='${src[i]}']`).length === 0) {
//                     // killDecors('image');
//                     var tempDATA = data;
//                     tempDATA.src = src[i];
//                     tempDATA.style = style[i];
//                     setImage(tempDATA);
//                     }
//                     // var url = dataFolder + src[i];
//                     // img.onload = function() {
//                     //   $decor.css('background-image', 'url(' + url + ')');
//                     // };
//                     // img.src[i] = url;
//                   } else if (
//                     src[i].toLowerCase().endsWith('.webm') ||
//                     src[i].toLowerCase().endsWith('.ogv') ||
//                     src[i].toLowerCase().endsWith('.mp4') ||
//                     src[i].toLowerCase().endsWith('.mov') ||
//                     src[i].toLowerCase().endsWith('.wmv') ||
//                     src[i].toLowerCase().endsWith('.avi') ||
//                     src[i].includes('deviceId')
//                   ) {
//                     // if (jQuery(`video[src*='${src[i]}']`).length === 0) {
//                     //   $('.step__decor').find('video').each(function(){$(this).remove()})
//                     if (newVideoSrc.includes(src[i])) {
//                       var tempDATA = data;
//                       tempDATA.src = src[i];
//                       tempDATA.style = style[i];
//                       setVideo(tempDATA);
//                       $step[0].className = 'step';
//                     }
                      
//                     // }
//                   } else {
//                     // killDecors('color');
//                     $decor.css('background-image', '');
//                     $step[0].className = 'step';
//                     $decor.css('background-color', src[i]);
//                   }
//                 }
//     }
//   } 
//   else {
//     if (typeof src === 'string') {
//       killDecors();
//       if (src === ' ') {
//         killDecors();
//         $('.step__decor').find('video').each(function(){$(this).remove()});
//       } else if (src.charAt(0) === '.') {
//         killDecors();
//         $step.addClass(src.split('.').join(' '));
//       } else if (src.charAt(0) === '@') {
//         // killDecors('iframe');
//         setIframe(data);
//       } else if (src.includes("html") && src.charAt(0) !== '@') {
//         // killDecors('iframe');
//         setIframe(data);
//       } else if (
//         src.toLowerCase().endsWith('.jpeg') ||
//         src.toLowerCase().endsWith('.jpg') ||
//         src.toLowerCase().endsWith('.gif') ||
//         src.toLowerCase().endsWith('.png') ||
//         src.toLowerCase().endsWith('.svg') ||
//         src.toLowerCase().endsWith('.webp') ||
//         src.toLowerCase().endsWith('.jfif')
//       ) {
//         // if (jQuery(`img[src*='${src}']`).length === 0) {
//         // killDecors('image');
//         setImage(data);
//         // }
//         // var url = dataFolder + src;
//         // img.onload = function() {
//         //   $decor.css('background-image', 'url(' + url + ')');
//         // };
//         // img.src = url;
//       } else if (
//         src.toLowerCase().endsWith('.webm') ||
//         src.toLowerCase().endsWith('.ogv') ||
//         src.toLowerCase().endsWith('.mp4') ||
//         src.toLowerCase().endsWith('.mov') ||
//         src.includes('deviceId')
//       ) {
//         if (jQuery(`video[src*='${src}']`).length === 0) {
//           $('.step__decor').find('video').each(function(){$(this).remove()});
//           setVideo(data);
//           $step[0].className = 'step';
//         }
//       } else {
//         // killDecors('color');
//         $decor.css('background-image', '');
//         $step[0].className = 'step';
//         $decor.css('background-color', src);
//       }
//     }
//   }

//   $main
//     .removeClass('screen_contain')
//     .removeClass('screen_cover')
//     .addClass(`screen_${data.fit}`);
// }

var mode;
function setMode(data) {
  if (mode) {
    if (mode.type === data) return;
    if ('destroy' in mode) mode.destroy();
  }
  if (arguments.length === 1 && data in modes) {
    mode = modes[data]();
  } else {
    mode = modes.normal();
  }
}
setMode();

socket.on('current language', (data) => {
  startMemeGenerator(data);
})

socket.on('language changed', (data) => {
  startMemeGenerator(data);
})

socket.on('append avatar', (data) => {
    var id = data;
    if (jQuery(`#avatars img[src*=${id}]`).length === 0) {
    var src = 'data/media/Gif/Avatars/Avatars' + id + '.gif';
    var img = new Image();
    $img = $(img);
    img.src = src;
    img.onload = function() {
      $('#avatars').append($img);
      var cw = $('#avatars').width();
      var ch = $('#avatars').height();

      var iw = $img.width();
      var ih = $img.height();

      var x = Math.random() * (cw - iw);
      var y = Math.random() * (ch - ih);
      $img.css({ top: y, left: x });
    };
  }
}
)

socket.on('remove avatar', (data) =>{
  jQuery(`#avatars img[src*=${data}]`).remove();
})

htmlPathToMedia = './data/media/';

function clearUnwantedMedia(data){
  const stepMedia = data['media'];

  let keysArray = [].map.call($decor.children().not('#boite, .console'), function (e) {
  return e.getAttribute('data-key')
  })

  keysArray.forEach(key => {
      if (!stepMedia[key]) {
        if ($(`.step [data-key=${key}]`).find('video').length !== 0) {
          $(`.step [data-key=${key}] video`).stop();
          $(`.step [data-key=${key}] video`).attr('src', '');
        }
          $(`.step [data-key=${key}]`).remove();
      }
  })
}

function applyZIndexes(data) {
  let zIndex = data['media-order'].length;
  data['media-order'].forEach((value, index) => {
      $(`.step__decor [data-key=${value}]`).css({"z-index" : zIndex});
      zIndex = zIndex - 1;
  })
}


let stepData = {};

function displayStep(data) {
     // CHECK IF TRANSITION FROM PREVIOUS STEP SHOULD BE ADDED
    //  if ('transition' in data) {
    //     const currentStepPreviewData = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen];
        if ('transition' in stepData && stepData['transition']['end'] !== 'none') {
            setTimeout(() => {
                continueSettingStep();
            }, parseFloat(stepData['transition']['end']['animation-duration'])*1000);

            for (let data_key of stepData['media-order']) {
                $(`.step__decor div[data-key=${data_key}]`).css(stepData['transition']['end']);
            }
        } else {
            continueSettingStep();
        }
    // } else {
    //     continueSettingStep();
    // }
      function continueSettingStep() {
        clearUnwantedMedia(data);

        // CLEAR PREVIOUS MODES
        finalFantasy('');
    
        const mediaOrder = data['media-order'];
        const stepMedia = data['media'];
    
        for (let data_key of mediaOrder) {
          setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);
          // SET START TRANSITION if exists
          if ('transition' in data && data['transition']['start'] !== 'none') {
              $(`.step__decor div[data-key=${data_key}]`).css(data['transition']['start']);
          }
        }
        applyZIndexes(data); 
        
        setElements("", "console", "", data['console']);
        $('.step').css('background-color', data['background-color']);
    
        stepData = data;
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

  const console = `<div id="console" class="console" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;">
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
 
                          
  // const textElement = `
  //                       <pre contenteditable="true" class="text draggable" data-key=${data_key} data-type=${type} 
  //                                 style=" 
  //                                 position: absolute; 
  //                                 top: 25%; 
  //                                 left:25%;
  //                                 white-space: pre-wrap; 
  //                                 word-wrap: break-word;
  //                                 color: white;
  //                                 font-size: 16px;
  //                                 margin: 0px;
  //                                 padding: 10px;
  //                                 font-family: Arial;
  //                                 "
  //                       >${val}</pre>
  //                   `

                    const textElement = `<div class="text" data-key=${data_key} data-type=${type} style="position: absolute; top: 25%; left:25%; width: 35%; height: 35%; color: white; font-size: 2vw; font-family: Arial; overflow: hidden;"><pre style="white-space: pre-wrap; overflow-wrap: break-word;">${val}</pre></div>`
  
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
      if($(`.step__decor [data-key=${data_key}]`).length === 0) {
          $('.step__decor').append(elements[type]);
      }
  }
  
  // if(type === 'console') {
  //     if(stepMediaObject.active === true && $('.console').length === 0) {
  //         $('.step').append(console);
  //     }
  //     if ((stepMediaObject.active === false && $('.console').length !== 0)) {
  //       $('.step .console').remove();
  //     }
  // } 

  if(type === 'console') {
    if($(`.console`).length === 0) {
      $('.step').append(console);
    }
  } 
  
  // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
  if (stepMediaObject) {
      if (type === 'console') {
          if (!stepMediaObject['active']) {
            $(`.${type}`).hide();
        } else {
            $(`.${type}`).show();
        }
        $(`.${type}`).css(stepMediaObject['css']);
      } 
      
      else if (type === 'media_audio') {
        let mediaElement = $(`.step`).find(`*[data-key="${data_key}"]`);
        if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
            mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
        }
        mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume'])
        mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
      } 
      
      else {
          // APPLY CSS
          let mediaElement = $(".step").find(`*[data-key="${data_key}"]`);
          mediaElement.removeAttr('style');
          mediaElement.css(stepMediaObject['css']);

          // APPLY LOOP AND MUTED TO VIDEOS
          if(stepMediaObject['type'] === 'media_video') {
              mediaElement.find('.media').prop('muted', stepMediaObject['attributes']['muted']);
              mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop']);
              mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume']);
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

                  startStream(constraints, data_key);
              } 
          }

           // ADD NEW TEXT IF NEEDED
           if (stepMediaObject['type'] === 'text') {
              if (mediaElement.find('pre').text() !== stepMediaObject['content']) {
                 // CHECK IF MODES IN CLASSES
                if (stepMediaObject['classes'].join(' ').includes('fantasy')) {
                  finalFantasy(stepMediaObject['content'], data_key, cat);
                } else {
                  mediaElement.find('pre').text(stepMediaObject['content']);
                }
              }

              // CORRECTION DUE TO DIFFERENCE IN EDITOR SCREEN SIZE AND REAL FULL SCREEN SIZE
              const textStyle = styleToObject(mediaElement.attr('style'));

              let correctedSize = parseFloat(textStyle['font-size'])*100/55;
              let correctedBorder = parseFloat(textStyle['border-width'])*100/55;
              let correctedPadding = parseFloat(textStyle['padding'])*100/55;

              mediaElement.css('font-size', correctedSize + 'vw');
              mediaElement.css('border-width', correctedBorder + 'vw');
              mediaElement.css('padding', correctedPadding + 'vw');
          }

          // APPLY CLASSES
          mediaElement.removeClass();
          mediaElement.addClass(stepMediaObject['classes'].join(' '));
         
          // ADJUST ALL PARAMETERS FOR OBJECT FIT COVER AND CONTAIN
          if(stepMediaObject['css']['object-fit'] && stepMediaObject['css']['object-fit'] !== "") {
              mediaElement.find('.media').css({"height" : "100%", "object-fit" : stepMediaObject['css']['object-fit']});
          }
      }
  } 
}


socket.on('step', function(data){
  if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
  if ('media-order' in data) displayStep(data);
  if ('mode' in data) setMode(data['mode']);
})

// socket.on('step', function(data) {
//   // console.log('step', cat, data);
//   if (data.avatars === 'on') { 
//     if (data.avatars_area && data.avatars_area !== ' ') {
//       $('#avatars').css(JSON.parse(data.avatars_area));
//       $('#avatars')[0].style.bottom = 'auto';
//       $('#avatars')[0].style.right = 'auto';
//     }
//     $('#avatars')
//     $('#avatars').show();
//   } 
//   if (data.avatars === 'off') {
//     $('#avatars').hide();
//   }
//   repet = Object.assign(repetDefault, data.repet);

//   if (data && data.active !== false) {
//     $main.removeClass('off');
//     if ('effect' in data) {
//       setSlideEffect(data['effect']); 
//       setTimeout(() => {
//         if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
//         if ('mode' in data) setMode(data.mode);
//         if ('code' in data) actions.eval(data.code);
//         if ('texte' in data) mode.write(data.texte);
//         if ('decor' in data && data.decor.src) setDecor(data.decor);
//         if ('music' in data && data.music.src) setMusic(data.music);
//         if ('color' in data) {
//           var style = data.color.trim();
//           $texte.css('color', style);
//         }
//         if ('style' in data) {
//           var style = data.style.trim();
//           $texte[0].className = 'step__texte';
//           // if (style) $texte.addClass(style.slice(1));
//           $texte.attr("style",style);
//           $texte.css('padding', '0px')
//         }
//         setSlideEffect(data['effect']); 
//       }, 1000);
//     } else {
//     if ('boite' in data && 'type' in data.boite) setBoite(data.boite);
//     if ('mode' in data) setMode(data.mode);
//     if ('code' in data) actions.eval(data.code);
//     if ('texte' in data) mode.write(data.texte);
//     if ('decor' in data && data.decor.src) setDecor(data.decor);
//     if ('music' in data && data.music.src) setMusic(data.music);
//     if ('color' in data) {
//       var style = data.color.trim();
//       $texte.css('color', style);
//     }
//     if ('style' in data) {
//       var style = data.style.trim();
//       $texte[0].className = 'step__texte';
//       // if (style) $texte.addClass(style.slice(1));
//       $texte.attr("style",style);
//       $texte.css('padding', '0px')
//     }
//   }
//   } else {
//     $main.addClass('off');
//     lastMusicSrc = null;
//     setMode();
//     // $texte.html('');
//     killDecors();
//     $('.step__decor').find('video').each(function(){$(this).remove()})
//     stop(audio);
//   }
// });

// socket.on('collective song answers', (data) => {
//   console.log(data)
// })

socket.on('meme', (data) => {
  $('#boite')[0].style.display = 'block';
  $('#boite')[0].innerHTML = data.data;
})

socket.open();

var $body = $('body');

// if (cat === 'screen') {
//   $(document).idle({
//     onIdle: function() {
//       $body.css('cursor', 'none');
//     },
//     onActive: function() {
//       $body.css('cursor', 'default');
//     },
//     idle: 3000
//   });

//   Mousetrap.bind('ctrl+enter', function() {
//     socket.emit('send', {
//       to: 'master',
//       next_step: true
//     });
//   });
//   Mousetrap.bind('ctrl+backspace', function() {
//     socket.emit('send', {
//       to: 'master',
//       prev_step: true
//     });
//   });
// }

// function setSlideEffect(where) {
//   $('#screen').toggleClass(`slide-${where}`);
// }
