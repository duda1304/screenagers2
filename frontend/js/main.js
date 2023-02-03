const socket = io();

// socket.on('step', (data) => {
//     $('#console_section').css({ 
//         'top' : data.top,
//         'left' : data.left,
//         'width' : data.width, 
//         'height' : data.height 
//     })
// })


// socket.on('console', (data) => {
//     if ('active' in data && data.active === false) {
//         $('#console_section').hide();
//     } else {
//         $('#console_section').show();
//     }
// })

socket.on('subtitles line', (data) => {
    $('.subtitles').text(data['line']);
    $('.subtitles').css(data['style']['css']);
    adjustSubtitlesSectionSize(data['style']['css']['height']);
    
    toggleSubtitlesPosition(data['position']);
    $('.subtitles').show();

    // CORRECTION DUE TO DIFFERENCE IN EDITOR SCREEN SIZE AND REAL FULL SCREEN SIZE
    let correctedSize = parseFloat(data['style']['css']['font-size'])*100/55;
    $('.subtitles').css('font-size', correctedSize + 'vw');
})

socket.on('toggle subtitles', (data) => {
    if (data.value === 'off') {
        $('.subtitles').hide();
        $('#screen').css({'width' : '100%', 'height' : '100%'});
    } else {
        $('.subtitles').show();
        
        $('.subtitles').text(data['line']);
        $('.subtitles').css(data['style']['css']);
        adjustSubtitlesSectionSize(data['style']['css']['height']);
        toggleSubtitlesPosition(data['position']);

        let correctedSize = parseFloat(data['style']['css']['font-size'])*100/55;
        $('.subtitles').css('font-size', correctedSize + 'vw');
    }
})

socket.on('toggle subtitles position', (data) => {
    toggleSubtitlesPosition(data);
})

socket.on('change subtitles style', (data) => {
    $('.subtitles').css(data);
    let correctedSize = parseFloat(data['font-size'])*100/55;
    $('.subtitles').css('font-size', correctedSize + 'vw');
    adjustSubtitlesSectionSize(data['height']);
})


function toggleSubtitlesPosition(value) {
    if (value === 'up') {
        $('.subtitles').detach().insertBefore("#screen");
    } else {
        $('.subtitles').detach().insertAfter("#screen");
    }
}

function adjustSubtitlesSectionSize(value) {
    const size = parseInt(value);
    $('.subtitles').height(size + '%');
    $('#screen').height((100 - size) + '%');
    $('#screen').width((100 - size) + '%');
}



