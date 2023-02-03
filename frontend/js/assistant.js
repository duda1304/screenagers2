//added comment to test pull

function createRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function chooseRandom(array) {
    return array[Math.floor(Math.random()*array.length)];
    // var items = $('#' + group).find('.answer').children('p');
    // Array.from(items).forEach(element => element.classList.remove('selected'));
    // var item = items[Math.floor(Math.random()*items.length)];
    // $('#' + group + 'input').val(item.innerHTML);
    // item.classList.add('selected');
}

function serialiseData(data) {
    return JSON.stringify(data).replace(/'/g, '&#39;');
}

function startMemeGenerator(language) {
  var currentLanguage = language;
  var memeGeneratorHTML;
  var meme;

  $.getJSON('/data/memes.json', function(data) {
    if (currentLanguage in data) {
      meme = data[currentLanguage];
    } else {
      meme = data[defaultLanguage];
    }
   
    $('#collective_song').empty();
    // var i = 0;

    memeGeneratorHTML =
      '<section id="meme_generator"><fieldset id="meme_generator_select"><legend>Select meme:</legend>';
    $.each(meme, function name(key, val) {
    //   memeGeneratorHTML += `<option value="${i++}" data-key="${key}" data-meme='${serialiseData(
    //     val
    //   )}'>${val[0]}</option>`;
    let id = createRandomString(5);
      memeGeneratorHTML += `<input type="radio" id="${id}" valu="${key}" name="meme" data-meme='${serialiseData(val)}'></input><label for="${id}">${val[0]}, ${val[1]}</label><br>`;
    });

    memeGeneratorHTML += '</fieldset></section>';
    memeGeneratorHTML += `<section id="meme_lines" class="hide">
    <header class="impact" id="meme_generator_header"></header>
    <footer class="impact" id="meme_generator_footer"></footer>
    </section>`;
    $('.boite--image #meme_div').append(memeGeneratorHTML);
    $('#meme_generator_select input').on('change', function() {
    var data = $(this).data('meme');
      if (typeof data === 'object') {
        var header = typeof data[0] === 'string' ? data[0] : data[1];
        var footer = typeof data[0] === 'string' ? data[1] : data[2];
        $('#meme_generator_header').html(header || '');
        $('#meme_generator_footer').html(footer || '');
      }
      createMeme();
    })
  });

  $('#meme').append(`<div class="editor-buttons">
                        <button id='send-button'>Send to screen</button>
                        <button id='choose-random'>Choose random</button>
                        <button id='send-only-image'>Send only image</button>
                    </div>`)
  $('#send-button').on('click', function() {
    if ($('input[name=meme]:checked').length !== 0) {
      socket.emit('meme', {
        to: 'screens',
        data: $('.meme')[0].outerHTML
      });
      $('.boite--image').empty();
      $('#send-button').parent().remove();
    }
  });
  $('#send-only-image').on('click', function() {
    if ($('.meme header').length !== 0) {
      $('.meme header')[0].remove();
    }
    if ($('.meme footer').length !== 0) {
      $('.meme footer')[0].remove();
    }
      socket.emit('meme', {
        to: 'screens',
        data: $('.meme')[0].outerHTML
      });
      $('.boite--image').empty();
      $('#send-only-image').parent().remove();
  });
  $('#choose-random').on('click', function() {
    $(chooseRandom($('#meme_generator_select input'))).click();
  })
}


function createMeme() {
  $('.meme').find('#meme_header').remove();
  $('.meme').find('#meme_footer').remove();

  var $meme_header = $('#meme_generator_header').clone();
  $meme_header.css({
    'position': 'absolute',
    'top': '1em',
    'width': '100%',
    'font-size': '140%',
    'text-align': 'center'
  })
  $meme_header.attr('id', 'meme_header');
  $('.meme').append($meme_header);

  var $meme_footer = $('#meme_generator_footer').clone();
  $meme_footer.css({
    'position': 'absolute',
    'bottom': '1em',
    'width': '100%',
    'font-size': '140%',
    'text-align': 'center'
  })
  $meme_footer.attr('id', 'meme_footer');
  $('.meme').append($meme_footer);
}



socket.on('collective song answers', (data) => {
    $group = $('#' + data.group);
    $('#meme .boite--image').empty();
    let id = createRandomString(5);
    if ($group[0]) {
      $group.find('.answer').append(`<input type="radio" id="${id}" name="${data.group}" data-answer=${serialiseData(data.answer)}></input>
                                     <label for="${id}">${data.answer.substring(0, 50)}</label><br>`)
    } else {
      $('#collective_song').append(`<div id=${data.group} class='collective-song-group'>
                                        <p class='question'>${data.question}</p>
                                        <div class='answer'>
                                            <input type="radio" id="${id}" name="${data.group}" data-answer=${serialiseData(data.answer)}></input>
                                            <label for="${id}">${data.answer.substring(0, 50)}</label><br>
                                        </div>
                                        <div class='submit-div'>
                                            <button class="choose-random" class="icon box-min">🎲</button>
                                            <button class='submit-button'>Send to screen</button>
                                        </div>
                                    </div>`)
      $(`#${data.group} .choose-random`).on('click', function() {
        // randomAnswer(data.group);
        if($(`#${data.group} input`).length !== 0) {
            $(chooseRandom($(`#${data.group} input`))).click();
        }
      });
      $(`#${data.group} .submit-button`).on('click', function() {
        if($(`#${data.group} input`).length !== 0) {
            // sendAnswer(data.group)
            socket.emit('collective song selected', {'question' : data.question, 'answer' : $(`#${data.group} input:checked`).data('answer')});
            $(`#${data.group} input:checked`).next().remove();
            $(`#${data.group} input:checked`).remove();
        }
      });
    }
});

socket.on('current language', (data) => {
  currentLanguage = data;
})

socket.on('change language', (data) => {
  currentLanguage = data;
  if ($('input[name=novel_subtitles]:checked').val() === 'on') {
    toggleSubtitles('on')
  }
})

let subtitlesData = {};

socket.on('subtitles', function(data) {
  if (data.length !== 0) {
      setSubtitlesData(data);
      loadSubtitlesStyles('sGrsp')
  }
});

socket.on('initial json', (data) => {
  data.forEach(async (novel) => {
    let array = novel.split('/');
    let fileName = array[array.length -1].replace('.json', '');
    await $.getJSON(novel.replace('frontend', '.'), function(jsonData) {
      $('#select-visual-novel').append(`<option value=${fileName}>${jsonData.name}</option>`)
    })
  });
})

function setSubtitlesData(data) {
  data.forEach(async(translation) => {
      await $.getJSON(translation.replace('frontend', '.'), function(jsonData) {
          let array = translation.split('/');
          let fileName = array[array.length -1].replace('.json', '');
          subtitlesData[fileName] = {};
          Object.assign(subtitlesData[fileName], jsonData);
      })
  })
  
}

async function loadSubtitlesStyles(preselected) {
  await $.getJSON('./data/subtitles/style.json', function(jsonData) {
      subtitlesData.style = jsonData;
      $('#load-saved-style')
          .empty()
      
      $.each(subtitlesData.style, function(key, value) {
          $('#load-saved-style').append(`<option value=${key}>${value.name}</option>`)
      });

      $('#load-saved-style').on('change', function() {
          $('#line').removeAttr('style');
          $('#line').css(subtitlesData['style'][this.value]['css']);
          $('#line').css('width', 'auto');
          socket.emit('change subtitles style', subtitlesData['style'][this.value]['css']);
      })

      $(`#load-saved-style option[value='${preselected}']`).attr('selected', true);
  })
}

let currentLine = 0;

$('#subtitles__prev').on('click', function() {
  let newLineIndex = $('#line').data('line') - 1;
  let language = currentLanguage;
  let currentNovel = $('#select-visual-novel option:selected').val();
  if (newLineIndex >= 0 && language in subtitlesData[currentNovel]) {
      $('#line').text(subtitlesData[currentNovel][language].split("\n")[newLineIndex]);
      $('#line').data('line', newLineIndex);
      currentLine = newLineIndex;
      socket.emit('subtitles line', {"line" : subtitlesData[currentNovel][language].split("\n")[newLineIndex], "style" : subtitlesData['style'][$('#load-saved-style option:selected').val()], "position" : $('#subtitles-position option:selected').val()});
  }
})

$('#subtitles__next').on('click', function() {
  let newLineIndex = $('#line').data('line') + 1;
  let language = currentLanguage;
  let currentNovel = $('#select-visual-novel option:selected').val();
  if (newLineIndex <= subtitlesData[currentNovel][language].split("\n").length - 1 && language in subtitlesData[currentNovel]) {
      $('#line').text(subtitlesData[currentNovel][language].split("\n")[newLineIndex]);
      $('#line').data('line', newLineIndex);
      currentLine = newLineIndex;
      socket.emit('subtitles line', {"line" : subtitlesData[currentNovel][language].split("\n")[newLineIndex], "style" : subtitlesData['style'][$('#load-saved-style option:selected').val()], "position" : $('#subtitles-position option:selected').val()})
  }
})

// function reloadCurrentLine() {
//   let lineIndex = $('#line').data('line');
//   let language = currentLanguage;
//   let currentNovel = $('#select-visual-novel option:selected').val();
//   if (lineIndex <= subtitlesData[currentNovel][language].split("\n").length - 1) {
//       $('#line').text(subtitlesData[currentNovel][language].split("\n")[lineIndex]);
//       socket.emit('subtitles line', {"line" : subtitlesData[currentNovel][language].split("\n")[lineIndex], "style" : subtitlesData['style'][$('#load-saved-style option:selected').val()], "position" : $('#subtitles-position option:selected').val()})
//   }
// }

$(`input:radio[name=novel_subtitles]`).change(function() {
  toggleSubtitles(this.value);
});

$(`input:radio[name=subtitles_position]`).change(function() {
  socket.emit('toggle subtitles position', this.value);
});

function toggleSubtitles(value) {
  $('#line').removeData('line');
  let currentNovel = $('#select-visual-novel option:selected').val();

  if (value === 'off') {
      $('#line').text('Subtitle lines');
  } else {
      if (currentNovel in subtitlesData) {
          if (currentLanguage in subtitlesData[currentNovel]) {
            if (subtitlesData[currentNovel][currentLanguage].split("\n").length - 1 < currentLine) {
              currentLine = 0;
            }
              $('#line').text(subtitlesData[currentNovel][currentLanguage].split("\n")[currentLine]);
              $('#line').data('line', currentLine);
          } else {
              $('#line').text('Subtitle lines');
          }
      } else {
          $('#line').text('Subtitle lines');
          $('.subtitles').text('Subtitle lines');
      }
  }
  socket.emit('toggle subtitles', {"value" : value, "line" : subtitlesData[currentNovel][currentLanguage].split("\n")[currentLine], "style" : subtitlesData['style'][$('#load-saved-style option:selected').val()], "position" : $('#subtitles-position option:selected').val()});
}





