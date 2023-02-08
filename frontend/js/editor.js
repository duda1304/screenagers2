let mainData = {};
// const socket = io();

// MAIN STATUS TRACKER
let active = {
    fileName : "",
    scene : "",
    step : ""
}


let subtitlesData = {};

const screens = ['screen', 'laptop'];

let activeScreen = 'screen';

$('#delete-media-button').on('click', showTooltips);
$('#edit-media-button').on('click', showTooltips);

$('.screens div').on('click', function(){
    $('.screens div').not(this).removeClass('active');
    $(this).addClass('active');
    activeScreen = $(this).text().toLowerCase();

     // deactivate active media
     if ($('#step-media li.active').length !== 0){
        $('#step-media li.active').click();
    }

    // adjust console radio button
    if ($(`#${activeScreen} .console`).css('display') === 'none') {
        $('#console-checkbox').prop('checked', false);
    } else {
        $('#console-checkbox').prop('checked', true);
    }

    //adjust background color
    $('#preview_background-color').val($(`#${activeScreen}`).css('background-color'));
    activateColorPicker();

    // toggle media list
    $(`#step-media .${activeScreen}`).show();
    $(`#step-media ul`).not(`.${activeScreen}`).hide();

    // pause video and audio on previous screen and start on active
    $(`.preview:not(#${activeScreen}) audio`).each(function(){$(this)[0].pause()});
    $(`.preview:not(#${activeScreen}) video`).each(function(){$(this)[0].pause()});

    $(`#${activeScreen} audio`).each(function(){$(this)[0].play()})
    $(`#${activeScreen} video`).each(function(){$(this)[0].play()})
   
    // toggle preview
    $(`#${activeScreen}`).show();
    $('.preview').not(`#${activeScreen}`).hide();

    // adjust transition button label
    adjustTransitionButtonLabel();
});

$( function() {
    $( ".draggable" ).draggable();
} );

socket.on('subtitles', function(data) {
    if (data.length !== 0) {
        setSubtitlesData(data);
    }
});

function setSubtitlesData(data) {
    let count = 0;
    data.forEach(async(translation) => {
        await $.getJSON(translation.replace('frontend', '.'), function(jsonData) {
            count = count + 1;
            let array = translation.split('/');
            let fileName = array[array.length -1].replace('.json', '');
            subtitlesData[fileName] = {};
            Object.assign(subtitlesData[fileName], jsonData);

            if (count === data.length && active.fileName !== '') {
                toggleSubtitles($(`input:radio[name=${`${active.fileName}_subtitles`}]:checked`).val());
            }
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
            $('.subtitles').removeAttr('style');
            $('.subtitles').css(subtitlesData['style'][this.value]['css']);
            adjustSubtitlesSectionSize(subtitlesData['style'][this.value]['css']["height"]);
            $('input[name=subtitles-size]').val(parseInt(subtitlesData['style'][this.value]['css']["height"]));
        })

        $(`#load-saved-style option[value='${preselected}']`).attr('selected', true);
        adjustSubtitlesSectionSize(subtitlesData['style'][preselected]['css']["height"]);
        $('input[name=subtitles-size]').val(parseInt(subtitlesData['style'][preselected]['css']["height"]));
    })
}

// separate JSONs for each show made, data gives array of all JSONs
socket.on('initial json', function(data) {
    setJSONsdata(data);
});

function setJSONsdata(data) { 
    mainData = {};
    let count = 0;
    $('#structure-content').empty();

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
                    $(`#${currentActive.fileName} .show-name`).click();
                    if (currentActive.scene !== "") {
                        $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] .toggler`).click();
                        if (currentActive.step !== "") {
                            $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] li[data-step=${currentActive.step}]`).click();
                            $(`#${currentActive.fileName} li[data-scene=${currentActive.scene}] ul`).scrollTo(`li[data-step=${currentActive.step}]`); 
                            
                        }
                    } 
                }
            }
        })    
    });
}

let startPosition;
let movedStep;
let arrayEl;

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

function toggleSubtitles(value) {
    const subtitlesDiv = `<div class="subtitles" style="width: 100%; height: 15%; color: white; background-color: rgb(211,211,211, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5vw;" data-key='subtitles'></div>`
    const wrapperDiv = `<div class='wrapper-div'></div>`;
    
    $('#line').removeData('line');
    if (value === 'off') {
        $('.wrapper-div .subtitles').remove();
        $('.subtitles-menu').hide();
        $('.subtitles-menu .editor-buttons').empty();
        $('#line').text('Subtitle lines');
        if ($('.wrapper-div').length !== 0) {
            $('#screen').unwrap();
        }
        $('#screen').height('');
        $('#screen').width('');
       
        $('#screen').removeClass('subtitles-added');
    } else {
        if ($('.wrapper-div').length === 0) {
            $('#screen').wrap(wrapperDiv);
        }
        if ($('#screen .subtitles').length === 0) {
            // $('#screen').wrap(wrapperDiv);
            $('.wrapper-div').append(subtitlesDiv);
            // $('#screen').addClass('subtitles-added');
        }

        $('#screen').addClass('subtitles-added');
        
        $('.subtitles-menu .editor-buttons').empty();
        $('.subtitles-menu').show();

        if (active.fileName in subtitlesData) {
            if ($(`#${active.fileName} .languages`).val() in subtitlesData[active.fileName]) {
                $('.subtitles-menu .subtitles-style')
                    .append(`
                            <button onclick="editElement('subtitles', 'text')">
                                <img src="./icons/settings.svg">
                            </button>
                            <select id="load-saved-style"></select>
                            <button type="button" onclick="saveSubtitlesStyle('new')">Save as</button>
                            <button type="button" onclick="saveSubtitlesStyle('existing')">Save</button>
                            <div class="break"></div>
                            <fieldset id="subtitles-position" style="width: 100%">
                                    <label for="down">subtitles down</label>
                                    <input type="radio" value="down" id="down" name="subtitles_position" checked>
                                    <label for="up">subtitles up</label>
                                    <input type="radio" value="up" id="up" name="subtitles_position">
                            </fieldset>
                            <fieldset>
                                <label for="subtitles-size">subtitles section size</label>
                                <input type="number" value="" step="1" id="subtitles-size" name="subtitles-size"></input>
                            </fieldset>
                            `);
                            
                $('.subtitles-menu .subtitles-content')
                    .append(`<button type="button" onclick="editTranslation()">Edit translation</button>`);  

                loadSubtitlesStyles('sGrsp');
                $('#line').text(subtitlesData[active.fileName][$(`#${active.fileName} .languages`).val()].split("\n")[0]);
                $('#line').data('line', 0);
                $('.subtitles').text(subtitlesData[active.fileName][$(`#${active.fileName} .languages`).val()].split("\n")[0]);

                $('input:radio[name=subtitles_position]').change(function() {
                    toggleSubtitlesPosition(this.value);
                });

                $('input[name=subtitles-size]').change(function() {
                    adjustSubtitlesSectionSize(this.value);
                });

            } else {
                $('.subtitles-menu .subtitles-content').append(`<button type="button" onclick="importTranslation()" style="margin: 0px;">Import translation</button> <small>No subtitles on ${$(`#${active.fileName} .languages`).val()} language</small>`);
                $('#line').text('Subtitle lines');
                $('.subtitles').text('Subtitle lines');
            }
        } else {
            $('.subtitles-menu .subtitles-content').append(`<button type="button" onclick="importTranslation()" style="margin: 0px;">Import translation</button> <small>No subtitles on ${$(`#${active.fileName} .languages`).val()} language</small>`);
            $('#line').text('Subtitle lines');
            $('.subtitles').text('Subtitle lines');
        }
    }
}

$('#subtitles__prev').on('click', function() {
    let newLineIndex = $('#line').data('line') - 1;
    let language = $(`#${active.fileName} .languages`).val();
    if (newLineIndex >= 0) {
        $('#line').text(subtitlesData[active.fileName][language].split("\n")[newLineIndex]);
        $('#line').data('line', newLineIndex);
        console.log($('#line').data())
        $('.subtitles').text(subtitlesData[active.fileName][language].split("\n")[newLineIndex]);
    }
})

$('#subtitles__next').on('click', function() {
    let newLineIndex = $('#line').data('line') + 1;
    let language = $(`#${active.fileName} .languages`).val()
    if (newLineIndex <= subtitlesData[active.fileName][language].split("\n").length - 1) {
        $('#line').text(subtitlesData[active.fileName][language].split("\n")[newLineIndex]);
        $('#line').data('line', newLineIndex);
        console.log($('#line').data())
        $('.subtitles').text(subtitlesData[active.fileName][language].split("\n")[newLineIndex]);
    }
})

function adjustSubtitlesSectionSize(value) {
    const size = parseInt(value);
    $('.subtitles').height(size + '%');
    $('#screen').height((100 - size) + '%');
    $('#screen').width((100 - size) + '%');
}

function toggleSubtitlesPosition(value) {
    if (value === 'up') {
        $('.subtitles').detach().insertBefore("#screen");
    } else {
        $('.subtitles').detach().insertAfter("#screen");
    }
}

function displayStructure(fileName, data) {
    let showElement =  `<ul id=${fileName} class="show">
                            <li class="show-name"><b><u>${data.name}</u></b></li>
                            <li style="display: none;" class="structure-buttons">
                                <span onclick="addInStructure('scene')"><img src="./icons/plus.svg"></img></span>
                                <span onclick="duplicate('show')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                                <span onclick="editName('show')"><img class="edit-icon" src="./icons/edit.png"></img></span>
                                <fieldset>
                                    <legend>Subtitles</legend>
                                    <label for="on">on</label>
                                    <input type="radio" value="on" id="on" name="${`${fileName}_subtitles`}"></input>
                                    <label for="off">off</label>
                                    <input type="radio" value="off" id="off" name="${`${fileName}_subtitles`}" checked></input>
                                </fieldset>
                            </li>
                            <li style="display: none;"><select class="languages"></select></li>
                            <li style="display: none;">
                                <ul id=${fileName + 'sceneList'} class="scenes"></ul>
                            </li>
                        </ul>`
    $('#structure-content').append(showElement);

    $(`input:radio[name=${`${fileName}_subtitles`}]`).change(function() {
        toggleSubtitles(this.value);
    });

    // APPEND AVAILABLE LANGUAGES
    $.each(data.languages, function(key, value) {   
        $('#' + fileName).find('select')
            .append($("<option></option>")
                       .attr("value", value)
                       .text(value)); 
   });

   $(`#${fileName} .languages`).on('change', function() {
        toggleSubtitles($(`input:radio[name=${`${active.fileName}_subtitles`}]:checked`).val());
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
            <div style="display: none;" class="structure-buttons">
                <span onclick="addInStructure('step')"><img src="./icons/plus.svg"></img></span>
                <span onclick="duplicate('scene')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                <span onclick="deleteFromStructure('scene')"><img src="./icons/trash.svg"></img></span>
                <span onclick="editName('scene')"><img class="edit-icon" src="./icons/edit.png"></img></span>
            </div>
            </li>`).appendTo(`#${fileName + 'sceneList'}`)
        .append(`<ul id=${id} style="display: none" class="steps"></ul>`);

        // let number = 1;
        stepOrder.forEach(stepOrderNumber => {
            let stepName;
            if ('name' in scene['steps'][stepOrderNumber]) {
                stepName = scene['steps'][stepOrderNumber]['name']
            } else {
                stepName = 'Step ' + stepOrderNumber;
            }
            $("#" + id).append(`<li class="stepElement" data-step=${stepOrderNumber} onclick="setStep(event, '${fileName}', ${sceneOrderNumber}, ${stepOrderNumber})">${stepName}</li>`)
            // number = number + 1;
        })

        // DEFINE SORTABLE FUNCTIONS FOR SCENES
        $('#' + fileName + 'sceneList').sortable({
            opacity: 0.5,
            start : function (event, ui) {
                startPosition = ui.item.index();
             },
             stop: function(event, ui) {
                let endPosition = ui.item.index();
                if (endPosition !== startPosition) {
                    // ADJUST MAIN DATA
                    let movedElement = mainData[fileName]['scene-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scene-order'].splice(endPosition, 0, movedElement);
                    // SAVE TO JSON
                    saveSceneOrder(fileName, mainData[fileName]['scene-order']);
                }
             }
        })

        // DEFINE SORTABLE FUNCTIONS FOR STEPS
        $("#" + id).sortable({
            opacity: 0.5,
            start : function (event, ui) {
               startPosition = ui.item.index();
            },
            stop: function(event, ui) {
                let endPosition = ui.item.index();
                if (endPosition !== startPosition) {
                    // ADJUST MAIN DATA
                    let movedElement = mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(startPosition, 1)[0];
                    mainData[fileName]['scenes'][sceneOrderNumber]['step-order'].splice(endPosition, 0, movedElement);
                    // SAVE TO JSON
                    saveStepOrder(fileName, sceneOrderNumber, mainData[fileName]['scenes'][sceneOrderNumber]['step-order']);
                }
            }
        });    

        // TOGGLE SCENE
        $("#" + id + "toggler").click(function() {
            $(".toggler").not(this).nextAll().hide();
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
            $(`#step-media ul`).empty();
            toggleEditTextContentElement();
            screens.forEach(screen => $(`#${screen}`).empty());
            $('#console-checkbox').prop('checked', false);
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
        if ($(this).hasClass('active')) {
            setActiveStep(fileName, "", "");
            toggleSubtitles($(`input:radio[name=${`${fileName}_subtitles`}]:checked`).val());
        } else {
            setActiveStep("", "", "");
            toggleSubtitles('off');
            // $('#line').text('Subtitle lines');
            // $('#line').removeData();
        }

        $(`#step-media ul`).empty();
        toggleEditTextContentElement();
        screens.forEach(screen => $(`#${screen}`).empty());
        $('#console-checkbox').prop('checked', false);
    })
    
}

let currentBoiteType;
// BOITE
$('#boites_types').on('click', '.button_radio', function(){
    if ($(this).find('input').is(':checked')) {
        const boiteObject =     {
            "type": "",
            "arg": ""
            }
        let data = {...boiteObject};
        data.type = $(this).find('input').val();
        $('#boite-form textarea').val('');
        data.arg = $('#boite-form textarea').val();
        currentBoiteType = $(this).find('input').val();
        // if($('#screen #boite').length === 0) {
        //     $('#screen').append(`<div id="boite"></div>`)
        // }
        setBoite(data);
    }
});

$('#boite-form textarea').on('input', function() {
    const boiteObject =     {
        "type": "",
        "arg": ""
        }
    let data = {...boiteObject};
    data.type = currentBoiteType;
    data.arg = $(this).val();
    // if($('#screen #boite').length === 0) {
    //     $('#screen').append(`<div id="boite"></div>`)
    // }
    setBoite(data);
})

function saveStepOrder(fileName, sceneOrderNumber, stepsOrder) {
    socket.emit('reorder steps', {"fileName" : fileName, "sceneOrderNumber" : sceneOrderNumber, "stepsOrder" : stepsOrder})
}

function saveSceneOrder(fileName, scenesOrder) {
    socket.emit('reorder scenes', {"fileName" : fileName, "scenesOrder" : scenesOrder})
}

function setActiveStep(fileName, scene, step) {
    active.fileName = fileName;
    active.scene = scene;
    active.step = step;
    if (step === '') {
        $('#transition-button-label').text('Transition')
    }
}

function applyZIndexes() {
    let mediaOrder = [];
    $(`#step-media .${activeScreen} li`).each(function(){mediaOrder.push($(this).data('key'))})
    let zIndex = mediaOrder.length;
    mediaOrder.forEach((value) => {
        $(`#${activeScreen} [data-key=${value}]`).css({"z-index" : zIndex});
        zIndex = zIndex - 1;
    })
}

function clearUnwantedMedia(stepMedia){ 
    let keysArray = [].map.call($(`#${activeScreen}`).children().not('#boite, .console'), function (e) {
    return e.getAttribute('data-key')
    })
    
    keysArray.forEach(key => {
        if (!stepMedia[key]) {
            if ($(`#${activeScreen} [data-key=${key}]`).find('video').length !== 0) {
                $(`#${activeScreen} [data-key=${key}] video`).stop();
                $(`#${activeScreen} [data-key=${key}] video`).attr('src', '');
              }
            $(`#${activeScreen} [data-key=${key}]`).remove();
        }
    })
}

$(`#step-media .${activeScreen}`).sortable({
    opacity: 0.5,
    start : function (event, ui) {
       startPosition = ui.item.index();
    },
    stop: function(event, ui) {
        let endPosition = ui.item.index();
        if (endPosition !== startPosition) {
            applyZIndexes();
        }
    }
});    


// STEP IS DISPLAYED FROM SAVED JSON DATA
function setStep(e, fileName, scene, step) {
    $(".stepElement").not(e.target).removeClass('active');
    $(e.target).parent().find('.structure-buttons').remove();
    $(e.target).toggleClass('active');

    // CLEAR PREVIOUS  STEP DATA LIST
    $(`#step-media ul`).empty()
    $('#console-checkbox').prop('checked', false);

    // CLEAR PREVIOUS MODES
    finalFantasy('');

    // REMOVE TEXTAREA FOR TEXT EDITING IF EXISTED
    toggleEditTextContentElement();

    // CHECK IF TRANSITION FROM PREVIOUS STEP SHOULD BE ADDED
    if (active.step !== '') {
        const currentStepPreviewData = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen];
        if ('transition' in currentStepPreviewData && currentStepPreviewData['transition']['end'] !== 'none') {
            setTimeout(() => {
                continueSettingStep();
            }, parseFloat(currentStepPreviewData['transition']['end']['animation-duration'])*1000);

            for (let data_key of currentStepPreviewData['media-order']) {
                $(`#${activeScreen} div[data-key=${data_key}]`).css(currentStepPreviewData['transition']['end']);
            }
        } else {
            continueSettingStep();
        }
    } else {
        continueSettingStep();
    }
   
    
    function  continueSettingStep() {
        if($(e.target).hasClass('active')) {
            setActiveStep(fileName, scene, step);

            // APPEND clone and delete buttons to step
            $(e.target).append(`<div class="structure-buttons">
                                    <span onclick="duplicate('step')"><img class="duplicate-icon" src="./icons/duplicate.png"></img></span>
                                    <span class='delete' onclick="deleteFromStructure('step')"><img src="./icons/trash.svg"></img></span>
                                    <span onclick="editName('step')"><img class="edit-icon" src="./icons/edit.png"></img></span>
                                </div>`)
            // PREVENT option to delete only step
            if ($(e.target).next().length === 0 && $(e.target).prev().length === 0) {
                $(e.target).find('.delete').remove();
            }
            // DISPLAY step media
            displayActiveStepMedia(); 

        } else {
            setActiveStep(fileName, scene, ""); 
            $('#preview_background-color').val('');
            screens.forEach(screen => $(`#${screen}`).empty());
        }
    }
}

function adjustTransitionButtonLabel() {
    $('#transition-button-label').text('Transition');
    const stepData = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen];
    let text = $('#transition-button-label').text();
    if ('transition' in stepData) {
        if (stepData['transition']['start']['animation-name'] !== 'none') {
            text = text + ': ' + stepData['transition']['start']['animation-name'];
        }
        if (stepData['transition']['end']['animation-name'] !== 'none') {
            text = text + ' ' + stepData['transition']['end']['animation-name'];
        }
    } else {
        text = text + ': none';
    }
    $('#transition-button-label').text(text);
}

function displayActiveStepMedia() {
    $.getJSON('./data/json/' + active.fileName + '.json', function(jsonData) {
        let currentActiveScreen = activeScreen;
        screens.forEach(screen => {
            activeScreen = screen;
            const stepData = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen];
            const mediaOrder = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['media-order'];
            const stepMedia = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['media'];
            
            clearUnwantedMedia(stepMedia);

            for (let data_key of mediaOrder) {
                // DISPLAY MEDIA IN MEDIA LIST
                let liName;
                if (stepMedia[data_key]['type'] === 'media_images' || stepMedia[data_key]['type'] === 'media_video' || stepMedia[data_key]['type'] === 'media_gifs' || stepMedia[data_key]['type'] === 'media_audio') {
                    liName = getFileName(decodeURI(stepMedia[data_key]['attributes']['src']));
                } 
                if (stepMedia[data_key]['type'] === 'videoStream') {
                    liName = stepMedia[data_key]['attributes']['label'];
                }

                if (stepMedia[data_key]['type'] === 'text') {
                    liName = stepMedia[data_key]['content'].substring(0, 20) + '...';
                }

                if (stepMedia[data_key]['type'] === 'avatars') {
                    liName = 'Avatars';
                }

                const li = `<li data-key=${data_key} data-type=${stepMedia[data_key]['type']} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${liName}</li>`;
                $(`#step-media .${activeScreen}`).append(li);

                // DISPLAY STEP IN MEDIA PREVIEW
                setElements(stepMedia[data_key].attributes.src, stepMedia[data_key]['type'], data_key, stepMedia[data_key]);

                // SET START TRANSITION if exists
                if ('transition' in stepData && stepData['transition']['start'] !== 'none') {
                    $(`#${activeScreen} div[data-key=${data_key}]`).css(stepData['transition']['start']);
                }
            }

            applyZIndexes();
            
            // SET CONSOLE
            setElements("", "console", createRandomString(5), jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['console']);

            // SET OSC MESSAGES
            if ('osc' in jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]) {
                const oscMessages = jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['osc'];
                $.each(oscMessages, function(key, value) {
                    const li = `<li data-key=${key} data-ip=${value.host} data-port=${value.port} data-address=${value.address} data-message='${value.message}' data-type='osc' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${key}></div>${value.message}</li>`;
                    $(`#step-media .${activeScreen}`).append(li);
                    setElements('', 'osc', key);
                })
                // send OSC messages
                sendOSCMessage(oscMessages);
            }

            // SET BACKGROUND COLOR OF DISPLAY
            $(`#${screen}`).css('background-color', jsonData['scenes'][active.scene]['steps'][active.step][activeScreen]['background-color']);
          
        });


        activeScreen = currentActiveScreen;

        // ADJUST tag on transition button
       adjustTransitionButtonLabel();

        // ADJUST background color value
        $('#preview_background-color').val($(`#${currentActiveScreen}`).css('background-color'));
        activateColorPicker();

        // PAUSE VIDEO ANd AUDIO on not active screen and start on active
        $(`.preview:not(#${activeScreen}) audio`).each(function(){$(this)[0].pause()});
        $(`.preview:not(#${activeScreen}) video`).each(function(){$(this)[0].pause()});

        $(`#${activeScreen} audio`).each(function(){$(this)[0].play()})
        $(`#${activeScreen} video`).each(function(){$(this)[0].play()})
       
        // SET console radio box state for active screen
        if ( $(`#${activeScreen} .console`).css('display') === 'none' ) {
            $(`#console-checkbox`).prop("checked", false);
        } else {
            $(`#console-checkbox`).prop("checked", true);
        }

        // SET BOITE
        if ('boite' in jsonData['scenes'][active.scene]['steps'][active.step]) {
            const boite = jsonData['scenes'][active.scene]['steps'][active.step]['boite'];
            // if($('#screen #boite').length === 0) {
            //     $('#screen').append(`<div id="boite"></div>`)
            $('#boite-form textarea').val(boite['arg']);
            currentBoiteType = boite['type'];
            setBoite(boite);
            $('#boite-form input').each(function(){
                $(this).prop('checked', false);
                $(`#boite-form input[value=${boite['type']}]`).prop('checked', true);
            })
        }
    }) 
}

let audioElementPosition = {
    'top' : 25,
    'left' : 85
}

let oscElementPosition = {
    'top' : 25,
    'left' : 75
}

// ADD OR REMOVE TEXT CONTENT EDITOR BOX
function toggleEditTextContentElement(action, key) {
         $('#edit-text-content').remove();
   if (action === 'add' && $(`#${activeScreen} [data-key=${key}]`).data('type') === 'text') {
            $('body').append(`<div id="edit-text-content">
                                <p>Edit text here</p>
                                <textarea rows="4">${$(`#${activeScreen} [data-key=${key}]`).text()}</textarea>
                            </div>`)

        $('#edit-text-content textarea').on('input', function() {
        $(`#${activeScreen} [data-key=${key}] pre`).text($(this).val());
        });

        $('#edit-text-content').draggable();
        $('#edit-text-content').resizable({
            handles: "se"
        });
    }
}

// ADD MEDIA ELEMENTS
function setElements(val, type, data_key, stepMediaObject) {
    src = htmlPathToMedia + val;
   
    const avatarsElement = `<div class="avatars draggable resizable" style="width: 25%; height: 15%; position: absolute; top: 25%; left:25%; border-radius: 45%; z-index:99;" data-key=${data_key} data-type=${type}>
                            </div>`;

    const console = `<div class="console draggable resizable" style="width: 25%; height: 95%; position: absolute; top: 2.5%; left:5%; z-index:100;" data-key=${data_key} data-type=${type}>
                        <iframe src="/console" style="width:100%; height: 100%; border: none;"></iframe>
                    </div>`;

    const imageElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                            <img style="width: 100%;" src=${src} class="media"></img>
                            </div>`

    const videoElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type} data-audioOutput=''>
                            <video autoplay volume=0.5 style="width: 100%;" src=${src} class="media"></video>
                          </div>`
                   
    const audioElement = `<div class="draggable" style="width: 5%; position: absolute; top: ${audioElementPosition.top}%; left:${audioElementPosition.left}%; padding:5px;" data-key=${data_key} data-type=${type}>
                            📢<audio autoplay volume=0.5 class="media" src=${src}></audio>
                          </div>`

    const streamElement = `<div class="draggable resizable" style="width: 35%; position: absolute; top: 25%; left:25%;" data-key=${data_key} data-type=${type}>
                            <video autoplay style="width: 100%;" class="media"></video>
                           </div>`
   
    const textElement = `<div class="text draggable resizable" data-key=${data_key} data-type=${type} style="position: absolute; top: 25%; left:25%; width: 35%; height: 35%; color: white; font-size: 2vw; font-family: Arial; overflow: hidden;"><pre style="white-space: pre-wrap; overflow-wrap: break-word;"></pre></div>`

    const oscElement = `<div class="draggable osc-element" style="width: 5%; position: absolute; top: ${oscElementPosition.top}%; left:${oscElementPosition.left}%; padding:5px;" data-key=${data_key} data-type=${type}>
                            OSC
                        </div>`

    const transitionElement = `<div class="draggable transition-element" style="width: fit-content; position: absolute; top: 2%; right:2%; padding:5px;" data-key=${data_key} data-type=${type}>
        Transition
    </div>`
  
    const elements = {
        'media_images' : imageElement,
        'media_gifs' : imageElement,
        'media_video' : videoElement,
        'media_audio' : audioElement,
        'videoStream' : streamElement,
        'avatars' : avatarsElement,
        'text' : textElement,
        'osc' : oscElement,
        'transition' : transitionElement
    }

    if (type in elements) {
        if($(`#${activeScreen} [data-key=${data_key}]`).length === 0) {
            $(`#${activeScreen}`).append(elements[type]);
        }
    }

    if (type === 'media_audio') {
        audioElementPosition.top = audioElementPosition.top + 2;
        audioElementPosition.left = audioElementPosition.left + 2;
    }

    if (type === 'osc') {
        oscElementPosition.top = oscElementPosition.top + 2;
        oscElementPosition.left = oscElementPosition.left + 2;
    }
  
    if(type === 'console') {
        if($(`#${activeScreen} .console`).length === 0) {
            $(`#${activeScreen}`).append(console);
        }
    } 
   

    // DEFINE FUNCTIONS FOR ELEMENT TO BE DRAGGABLE AND RESIZABLE
    $(`#${activeScreen} .draggable`).draggable({
        stop: function () {
            const l = Math.round(( 100 * parseFloat($(this).position().left / parseFloat($(`#${activeScreen}`).width())) )) + "%" ;
            const t = Math.round(( 100 * parseFloat($(this).position().top / parseFloat($(`#${activeScreen}`).height())) )) + "%" ;
            $(this).css("left", l);
            $(this).css("top", t);
        }
    });

    $(`#${activeScreen} .draggable`).mousedown(function(){
        $(`#${activeScreen} .draggable`).not(this).removeClass('active');
        $(this).addClass('active');
        // MARK ACTIVE IN MEDIA LIST
        $(`#step-media .${activeScreen} li`).not(`li[data-key="${this.dataset.key}"]`).removeClass('active');
        $(`#step-media .${activeScreen}`).find(`li[data-key="${this.dataset.key}"]`).addClass('active');
        // SET EVENT LISTENERS ON BUTTONS
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        let previewElement = $(this);
        let data_key = this.dataset.key;
        let type = this.dataset.type;
        if ($(this).hasClass('active')) {
            $("#delete-media-button").click(function(){
                $(previewElement).remove();
                $(`#step-media .${activeScreen}`).find(`li[data-key="${data_key}"]`).remove();
                $("#delete-media-button").unbind("click");
                $("#edit-media-button").unbind("click");
                $("#delete-media-button").on("click", showTooltips);
                $("#edit-media-button").on("click", showTooltips);
                applyZIndexes();
                toggleEditTextContentElement();
            })
            $("#edit-media-button").click(function(){
                editElement(data_key, type)
            })

            toggleEditTextContentElement('add', data_key)
         
        } else {
            $("#delete-media-button").unbind("click");
            $("#edit-media-button").unbind("click");
            $("#delete-media-button").on("click", showTooltips);
            $("#edit-media-button").on("click", showTooltips);
            toggleEditTextContentElement();
        }
    });

    $(".resizable").resizable({
        handles: "se",
        aspectRatio: true,
        resize: function () {
                const w = Math.round(( 100 * $(this).width() / $(`#${activeScreen}`).width() )) + "%" ;
                const h = Math.round(( 100 * $(this).height() / $(`#${activeScreen}`).height() )) + "%" ;
                $(this).css("width", w);
                $(this).css("height", h);
        }
    });

    $(".avatars").resizable({
        aspectRatio: false,
    });

    $(".console").resizable({
        aspectRatio: false,
    });

    $(".text").resizable({
        aspectRatio: false,
    });

    // APPLY STYLE IF MEDIA OBJECT IS FROM STEP
    if (stepMediaObject) {
        if (type === 'console') {
            if (!stepMediaObject['active']) {
                $(`#${activeScreen} .${type}`).hide();
                // $(`#${type}-checkbox`).prop("checked", false);
            } else {
                $(`#${activeScreen} .${type}`).show();
                // $(`#${type}-checkbox`).prop("checked", true);
            }
            $(`#${activeScreen} .${type}`).css(stepMediaObject['css']);
        }  
        else if (type === 'media_audio') {
            let mediaElement = $(`#${activeScreen}`).find(`*[data-key="${data_key}"]`);
            if (!mediaElement.find('.media').attr('src').includes(stepMediaObject['attributes']['src'])) {
                mediaElement.find('.media').attr('src', htmlPathToMedia +  stepMediaObject['attributes']['src']); 
            }
            mediaElement.find('.media').prop('volume', stepMediaObject['attributes']['volume'])
            mediaElement.find('.media').prop('loop', stepMediaObject['attributes']['loop'])
        }   
        else {
            // APPLY CSS
            let mediaElement = $(`#${activeScreen}`).find(`*[data-key="${data_key}"]`);
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

                    startStream(constraints, data_key, activeScreen);
                } 
            }

             // ADD NEW TEXT IF NEEDED
             if (stepMediaObject['type'] === 'text') {
                if (mediaElement.find('pre').text() !== stepMediaObject['content']) {
                     // CHECK IF MODES IN CLASSES
                    if (stepMediaObject['classes'].join(' ').includes('fantasy')) {
                        finalFantasy(stepMediaObject['content'], data_key, activeScreen);
                    } else {
                        mediaElement.find('pre').text(stepMediaObject['content']);
                    }
                }
             }

            // APPLY CLASSES but do not remove draggable and resizable
            let classArray = mediaElement.attr('class').split(" ");

            classArray.forEach(element => {
                if (!element.includes('draggable') && !element.includes('resizable') && !element.includes('active')) {
                    mediaElement.removeClass(element);
                }
            })

            // mediaElement.removeClass();
            mediaElement.addClass(stepMediaObject['classes'].join(' '));
           
            
            if(stepMediaObject['css']['object-fit'] && stepMediaObject['css']['object-fit'] !== "") {
                mediaElement.find('.media').css({"height" : "100%", "object-fit" : stepMediaObject['css']['object-fit']});
            }
        }
    } 
}

function checkMediaType(val) {
    if (
    val.toLowerCase().endsWith('.jpeg') ||
    val.toLowerCase().endsWith('.gif') ||
    val.toLowerCase().endsWith('.jpg') ||
    val.toLowerCase().endsWith('.png') ||
    val.toLowerCase().endsWith('.svg') ||
    val.toLowerCase().endsWith('.webp') ||
    val.toLowerCase().endsWith('.jfif') ) {
        return 'media_images'
    }
    if (
    val.toLowerCase().endsWith('.webm') ||
    val.toLowerCase().endsWith('.mp4') ||
    val.toLowerCase().endsWith('.mov') ||
    val.toLowerCase().endsWith('.wmv') ||
    val.toLowerCase().endsWith('.avi') ||
    val.toLowerCase().endsWith('.ogv') ) {
        return 'media_video'
    }

    return 'media_stream'
}

function toggleVisibility(e) {
    $(e.target).toggleClass('visible');
    $(`#${activeScreen}`).find(`[data-key='${e.target.dataset.key}']`).toggle();
}

function markActiveStepMediaElement(e) {
    // MARK IN MEDIA LIST
    $(`#step-media .${activeScreen} li`).not(e.target).removeClass('active');
    $(e.target).toggleClass('active');

    // MARK IN PREVIEW
    $(`#${activeScreen} .draggable`).not(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).removeClass('active');
    $(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).toggleClass('active');

    // ADD EVENT LISTENERS
    if ($(e.target).hasClass('active')) {
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        $("#delete-media-button").click(function(){
            $(`#${activeScreen} .draggable[data-key='${e.target.dataset.key}']`).remove();
            $(e.target).remove();
            $("#delete-media-button").unbind("click");
            $("#edit-media-button").unbind("click");
            $("#delete-media-button").on("click", showTooltips);
            $("#edit-media-button").on("click", showTooltips);
            applyZIndexes();
            toggleEditTextContentElement();
        })
        $("#edit-media-button").click(function(){
            editElement(e.target.dataset.key, e.target.dataset.type);
        })

        toggleEditTextContentElement('add', e.target.dataset.key)
     
    } else {
        $("#delete-media-button").unbind("click");
        $("#edit-media-button").unbind("click");
        $("#delete-media-button").on("click", showTooltips);
        $("#edit-media-button").on("click", showTooltips);
        toggleEditTextContentElement()
    }
}

function addMedia(e) {
    if (active.step !== "") {
        displayMediaList();
    } else {
        const button = e.currentTarget;
        $(button).addClass('active');
            setTimeout(() => {
                $(button).removeClass('active');
            }, 1800);
    }
}

function styleToObject(style) {
    const regex = /([\w-]*)\s*:\s*([^;]*)/g;
    let match, properties={};
    while(match=regex.exec(style)) properties[match[1]] = match[2].trim(); 
    return properties;
}

function analyseStep(updatedStepObject) {
    // let updatedStepObject = Object.assign({}, stepObject);

    updatedStepObject[activeScreen]['background-color'] = $(`#${activeScreen}`).css('background-color');

    let mediaOrder = [];
    // exclude osc message from media order
    $(`#step-media .${activeScreen} li[data-type!='osc']`).each(function(){mediaOrder.push($(this).data('key'))});
    updatedStepObject[activeScreen]['media-order'] = mediaOrder;


    let updatedMediaObject = {};

    // get all media elements
    $(`#${activeScreen}`).children().not('.console, #boite, .osc-element').each(function(){
        let object =   {   "type" : "",     
                            "css" : {},
                            "attributes" : {},
                            "content" : "",
                            "classes" : [] 
                        }
                        
        object['type'] = $(this).data('type');

        object['css'] = styleToObject($(this).attr('style'));

        // display none can be present if visibility was toggled
        delete object['css']['display'];

        // animation related properties should be removed
        $.each(object['css'], function(key, values) {
            if (key.includes('animation')) {
                delete object['css'][key]
            }
        })

        if ($(this).data('type') === 'media_video' || $(this).data('type') === 'media_images' || $(this).data('type') === 'media_gifs' || $(this).data('type') === 'media_audio') {
            object['attributes']['src'] = $(this).children().attr('src').replace(htmlPathToMedia, '');
        } 

        if($(this).data('type') === 'media_video') {
            object['attributes']['loop'] = $(this).find('video')[0].loop;
            object['attributes']['muted'] = $(this).find('video')[0].muted;
            object['attributes']['volume'] = $(this).find('video')[0].volume;
            object['attributes']['audioOutput'] = $(this).data('audioOutput');
        }

        if($(this).data('type') === 'videoStream') {
            object['attributes']['device'] = $(this).data('device');
            object['attributes']['label'] = $(this).data('label');
        }

        if($(this).data('type') === 'media_audio') {
            object['attributes']['loop'] = $(this).find('audio')[0].loop;
            object['attributes']['volume'] = $(this).find('audio')[0].volume;
        }

        let classArray = $(this).attr('class').split(" ");

        classArray.forEach(element => {
            if (!element.includes('draggable') && !element.includes('resizable') && !element.includes('active')) {
                object['classes'].push(element);
            }
        })

        if ($(this).data('type') === 'text') {
            object['content'] = $(this).text();
        }
       
        updatedMediaObject[$(this).data('key')] = object;
    })

    updatedStepObject[activeScreen]['media'] = updatedMediaObject;

    // add console
    if ($(`#${activeScreen} .console`).css('display') === 'none') {
        updatedStepObject[activeScreen]['console']['active'] = false;
    } else {
        updatedStepObject[activeScreen]['console']['active'] = true;
        updatedStepObject['console'] = consoleObject;
    }
    updatedStepObject[activeScreen]['console']['css'] = styleToObject($(`#${activeScreen} .console`).attr('style'));

    // add boite
    updatedStepObject['boite'] = {...boiteObject};
    let boite_type;
    $('#boite-form input').each(function(){
        if($(this).is(':checked')) {
            boite_type = $(this).val();
        } 
    })
    updatedStepObject['boite']['type'] = boite_type;
    updatedStepObject['boite']['arg'] = $('#boite-form textarea').val();

    // add osc message data
    if ($(`#${activeScreen} .osc-element`).length !== 0) {
        $.each($(`#${activeScreen} .osc-element`), function() {
            let key = $(this).data('key');
            let data = {
                'host' : $(`li[data-key=${key}]`).data('ip'),
                'port' : $(`li[data-key=${key}]`).data('port'),
                'address' : $(`li[data-key=${key}]`).data('address'),
                'message' : $(`li[data-key=${key}]`).data('message')
            };
            if ('osc' in updatedStepObject[activeScreen]) {
                updatedStepObject[activeScreen]['osc'][key] = data;
            } else {
                updatedStepObject[activeScreen]['osc'] = {};
                updatedStepObject[activeScreen]['osc'][key] = data;
            }
        })
    }

    // add transition
    if ('transition' in mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen]) {
        updatedStepObject[activeScreen]['transition'] = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen]['transition']
    }

    return updatedStepObject;
}

function saveStep(e) {
    if (active.step !== "") {
        let currentActiveScreen = activeScreen;
        let step = { 
            "screen" :  {
                            "media-order": [],
                            "background-color": "rgb(0, 0, 0)",
                            "media": {},
                            "console": {
                                "active": false,
                                "css": {}
                            }
                        },
            "laptop" :  {
                            "media-order": [],
                            "background-color": "rgb(0, 0, 0)",
                            "media": {},
                            "console": {
                                "active": false,
                                "css": {}
                            }
                        },
            "boite" :   {
                            "type": "no_phone",
                            "arg": ""
                        }
            }

        screens.forEach(screen => {
            activeScreen = screen;
            const update = analyseStep(step);
            Object.assign(step, update);
        });
        activeScreen = currentActiveScreen;
        // SAVE TO JSON
        socket.emit("save step", {"fileName" : active.fileName, "scene": active.scene, "step" : active.step, 'stepObject' : step})
    } else {
        const button = e.currentTarget;
        $(button).addClass('active');
        setTimeout(() => {
            $(button).removeClass('active');
        }, 1800);
    }
}

function addTransition(e) {
    if (active.step !== "") {
        $('#alert')
        .empty()
        .append(`<form>
                    <p>Add step transitions:</p>
                    <small>* animation applies to all media elements present in step</small><br>
                    <div class='menu-item' style='text-align: left;'>
                        <p class='menu-item'><u>Step start</u></p>
                        <fieldset>
                            <label for='start'>Animation:</label>
                            <select id='start' name='start' style='width: fit-content'>
                                <option value='none'>none</option>
                                <option value='fade-in'>fade in</option>
                            </select>
                        </fieldset>
                        <fieldset>
                            <label for='start-duration'>Duration:</label>
                            <input type='number' value=1 id='start-duration' name='start-duration' min = '0' step = '0.5' style='width: fit-content'></input> 
                            s
                        </fieldset>
                    <div>
                    <div class='menu-item' style='text-align: left;'>
                        <p class='menu-item'><u>Step end</u></p>
                        <fieldset>
                            <label for='end'>Animation:</label>
                            <select id='end' name='end' style='width: fit-content'>
                                <option value='none'>none</option>
                                <option value='fade-out'>fade out</option>
                            </select>
                        </fieldset>
                        <fieldset>
                            <label for='end-duration'>Duration:</label>
                            <input type='number' value=1 id='end-duration' name='end-duration' min = '0' step = '0.5' style='width: fit-content'></input> 
                            s
                        </fieldset>
                    <div>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type='button'>Close</button>
                    </div>
                </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });

        const currentStepActiveScreenData = mainData[active.fileName]['scenes'][active.scene]['steps'][active.step][activeScreen];
        // set values if exist
        if ('transition' in currentStepActiveScreenData) {
            $(`#alert form #start option[value=${currentStepActiveScreenData['transition']['start']['animation-name']}]`).prop('selected', true);
            $(`#alert form #end option[value=${currentStepActiveScreenData['transition']['end']['animation-name']}]`).prop('selected', true);

            $('#alert form #start-duration').val(parseFloat(currentStepActiveScreenData['transition']['start']['animation-duration']));
            $('#alert form #end-duration').val(parseFloat(currentStepActiveScreenData['transition']['end']['animation-duration']));
        }

        $('#alert form button').on('click', function() {
            if ($('#alert form #start').val() !== 'none' || $('#alert form #end').val() !== 'none') {
                currentStepActiveScreenData['transition'] = {
                    "start" : {
                        "animation-name" : $('#alert form #start').val(),
                        "animation-duration" : $('#alert form #start-duration').val() + 's',
                        "animation-fill-mode": "forwards"
                    },
                    "end" : {
                        "animation-name" : $('#alert form #end').val(),
                        "animation-duration" : $('#alert form #end-duration').val() + 's',
                        "animation-fill-mode": "forwards"
                    }
                }
            }
            adjustTransitionButtonLabel();
            closeModal();
        })
       
    } else {
        const button = e.currentTarget;
        $(button).addClass('active');
        setTimeout(() => {
            $(button).removeClass('active');
        }, 1800);
    }
}

function createNewObjectKey(array) {
    if (array.length > 0) {
        return Math.max(...array) + 1;
    } else {
        return 1;
    }
}

function closeModal() {
    setTimeout(() => {
        $('.media_cat p.active').click();
        $(".ui-dialog-titlebar-close"). click();
    }, 200);  
}

function importTranslation() {
    $('#alert')
        .empty()
        .append(`<form><p>Copy subtitles in textarea below. New row will be new sentence to display in subtitles.</p>
                    <textarea rows=10 name="lines"></textarea>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Save</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });

    $('#alert form').submit(function(e) {
        e.preventDefault();
        const lines = e.target.elements.lines.value;
        
        // SAVE TO JSON FILE
        addSubtitles(lines);
        showSpinner('alert');
    })
}

function editTranslation() {
    $('#alert')
        .empty()
        .append(`<form><p>Edit translation in textarea below. New row will be new sentence to display in subtitles.</p>
                    <textarea rows=20 name="lines"></textarea>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Save</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                </form>`)
        .dialog({
            draggable: true,
            modal: true,
            width: 800,
            maxHeight: 800,
        });
    
    $('#alert textarea').val(subtitlesData[active.fileName][$(`#${active.fileName} .languages`).val()]);

    $('#alert form').submit(function(e) {
        e.preventDefault();
        const lines = e.target.elements.lines.value;
        
        // SAVE TO JSON FILE
        addSubtitles(lines);
        showSpinner('alert');
    })
}

function saveSubtitlesStyle(status) {
    if ($('#load-saved-style option:selected').val() !== '') {
   
        $('#alert').empty();

        if (status !== 'new') {
            $('#alert')
                .append(`<form>
                            <input style="display:none" type="text" name="name" placeholder="Style name" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')" value=${$('#load-saved-style').val()}></input>
                            <div class='editor-buttons' style='justify-content: center;'>
                                <button type="submit">Save</button><button type='button'onclick="closeModal()">Cancel</button>
                            </div>
                        </form>`)
        } else {
            $('#alert')
                .append(`<form><p>Save new style</p>
                            <input type="text" name="name" placeholder="Style name" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')"></input>
                            <div class='editor-buttons' style='justify-content: center;'>
                                <button type="submit">Save</button><button type='button'onclick="closeModal()">Cancel</button>
                            </div>
                        </form>`)
        }
        $('#alert')
            .dialog({
                resizable: false,
                modal: true, width: 300,
                maxHeight: 600,
            });
        
        $('#alert form').submit(function(e) {
            e.preventDefault();
            const name = e.target.elements.name.value;
            const style = styleToObject($('.subtitles').attr('style'));
            // SAVE TO JSON FILE
            saveStyle(name, style);
            showSpinner('alert');
        })
    }
}

function addInStructure(parameter) {
    if (parameter === 'show') {
        const languageList = Object.keys(languages);

        let options = `<option value="" selected disabled>Select language</option>`

        $.each(languages, function(index,value){
            options = options + `<option data-code=${index} value=${index}>${value}</option>`
        });

        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    Add new visual novel
                    <input type="text" name="name" placeholder="New visual novel name" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')"></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
        // THIS OPTION AHOULD BE SOMEWHOW ADDDED WHEN CREATING SHOW
        // <select name="language" required>${options}</select>
        //             <small>* you need to select language due to multilingual support.<br>Languages can be edited later.</small>
        // OK BUTTON FUNCTION
        $('#alert form').submit(function(e) {
            e.preventDefault();
            const showName = e.target.elements.name.value;
            const fileName = createRandomString(8);

            let newShowObject = Object.assign({}, showObject);
            newShowObject.name = showName;
            newShowObject.languages.push(e.target.elements.language.value.toUpperCase())
            
            // SAVE TO JSON FILE
            addNewShow(fileName, newShowObject);
            showSpinner('alert');
        })
    }
    if (parameter === 'step') {
        $('#alert')
        .empty()
        .append(`<p>Add new step?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            let newStepNumber = createNewObjectKey(mainData[active.fileName]['scenes'][active.scene]['step-order']);
            // let newStepObject = {...stepObject};
            let newStepObject = Object.assign({}, stepObject);
            // SAVE TO JSON FILE
            addNewStep(newStepNumber, newStepObject);
            showSpinner('alert');
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<form>
                    Add new scene
                    <input type="text" name="name" placeholder="New scene name" required></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
        // OK BUTTON FUNCTION
        $('#alert form').submit(function(e) {
            e.preventDefault();
            const sceneName = e.target.elements.name.value;
           
            let newSceneNumber = createNewObjectKey(mainData[active.fileName]['scene-order'])

            // DEFINE NEW SCENE OBJECT
            let newSceneObject = Object.assign({}, sceneObject);
            newSceneObject['name'] = sceneName;
            newSceneObject['step-order'] = [1];
            let emptyStep = Object.assign({}, stepObject);
            newSceneObject['steps']['1'] = emptyStep;
           
            // SAVE TO JSON FILE
            addNewScene(newSceneNumber, newSceneObject);
            showSpinner('alert');
        })
    }
}

function duplicate(parameter) {
    if (parameter === 'show') {
        $('#alert')
        .empty()
        .append(`<p>Duplicate ${mainData[active.fileName]['name']} ?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            // SAVE TO JSON FILE
            duplicateShow();
            showSpinner('alert');
        })
    } 
    
    if (parameter === 'scene'){
        $('#alert')
        .empty()
        .append(`<p>Duplicate ${mainData[active.fileName]['scenes'][active.scene]['name']} ?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            const sceneName = mainData[active.fileName]['scenes'][active.scene]['name'] + '-copy';
            
            let newSceneNumber = createNewObjectKey(mainData[active.fileName]['scene-order'])

            // DEFINE NEW SCENE OBJECT
            let newSceneObject = {...mainData[active.fileName]['scenes'][active.scene]};
            newSceneObject['name'] = sceneName;
           
            // SAVE TO JSON FILE
            addNewScene(newSceneNumber, newSceneObject);
            showSpinner('alert');
        })
    }

    if (parameter === 'step'){
        $('#alert')
        .empty()
        .append(`<p>Duplicate step?</p>
                 <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                 </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
          // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            let newStepNumber = createNewObjectKey(mainData[active.fileName]['scenes'][active.scene]['step-order']);
            let newStepObject = {...mainData[active.fileName]['scenes'][active.scene]['steps'][active.step]};
            // SAVE TO JSON FILE
            addNewStep(newStepNumber, newStepObject);
            showSpinner('alert');
        })
    }


}

function editName(parameter) {
    if (parameter === 'show') {
        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    Change visual novel name
                    <input type="text" name="name" placeholder="${mainData[active.fileName]['name']}" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')"></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const showName = e.target.elements.name.value.trim();
            const newFileName = showName.replace(/ /g, '').trim();
            
            // SAVE TO JSON FILE
            renameShow(newFileName, showName);
            showSpinner('alert');
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    Change scene name
                    <input type="text" name="name" placeholder="${mainData[active.fileName]['scenes'][active.scene]['name']}" required></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const sceneName = e.target.elements.name.value.trim();
            
            // SAVE TO JSON FILE
            renameScene(sceneName);
            showSpinner('alert');
        })
    }
    if (parameter === 'step') {
        $('#alert')
        .empty()
        .append(`<form class="show-form">
                    Change step name
                    <input type="text" name="name" placeholder="${$(`#${active.fileName} li[data-scene=${active.scene}] li[data-step=${active.step}]`).text()}" required></input>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button type="submit">Ok</button><button type='button'onclick="closeModal()">Cancel</button>
                    </div>
                 </form>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });
         // OK BUTTON FUNCTION
         $('#alert form').submit(function(e) {
            e.preventDefault();
            const stepName = e.target.elements.name.value.trim();
            
            // SAVE TO JSON FILE
            renameStep(stepName);
            showSpinner('alert');
        })
    }
}

function deleteFromStructure(parameter) {
    if (parameter === 'step') {
        $('#alert')
        .empty()
        .append(`<p>Delete step?</p>
                <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteStep();
            showSpinner('alert');
        })
    } 
    if (parameter === 'scene') {
        $('#alert')
        .empty()
        .append(`<p>Delete scene?</p>
                <div class='editor-buttons' style='justify-content: center;'>
                    <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                </div>`)
        .dialog({
            resizable: false,
            modal: true, width: 300,
            maxHeight: 600,
        });

        // OK BUTTON FUNCTION
        $('#alert #ok').click(function() {
            // SAVE CHANGES TO JSON FILE
            deleteScene();
            showSpinner('alert');
        })
    }

    if (parameter === 'show') {
        $('#alert')
        .empty()

        if (active.fileName === '') {
            $('#delete-scene-step-button').addClass('active');
            setTimeout(() => {
                $('#delete-scene-step-button').removeClass('active');
            }, 1800);
        } else {
            $('#alert')
            .append(`<p>Delete ${mainData[active.fileName]['name']}?</p>
                    <div class='editor-buttons' style='justify-content: center;'>
                        <button id="ok">Ok</button><button type='button' onclick="closeModal()">Cancel</button>
                    </div>`)
            .dialog({
                resizable: false,
                modal: true, width: 300,
                maxHeight: 600,
            });

            // OK BUTTON FUNCTION
            $('#alert #ok').click(function() {
                // SAVE CHANGES TO JSON FILE
                deleteShow();
                showSpinner('alert');
            })
        }
    }
}

function showTooltips(e) {
    const button = e.currentTarget;
    $(button).addClass('active');
    setTimeout(() => {
        $(button).removeClass('active');
    }, 1800);
}

function showSpinner(div) {
    $(`#${div}`)
    .empty()
    .append(`<div class="spinner"><div>`);
}

socket.on('success', function(data){
    if ('subtitles' in data) {
        if (data.subtitles === 'added') {
            setSubtitlesData(data.data);
            closeModal();
        } else {
            loadSubtitlesStyles(data.subtitles.style);
            closeModal();
        }
    }
    else if ('qrcode' in data) {
        $('#create-QRcode').append(`<label>
                                        Filename
                                        <input id="fileName" name='fileName' required oninput="this.value = this.value.replace(/[^a-zA-Z0-9 -]/g, '')">
                                    </label>
                                    <label for="fileName" class="opacity-label">.png</label><br>
                                    <label>
                                        Content
                                        <input id="content" name='content' required>
                                    </label><br>
                                    <small>* content displayed when QR code is scanned</small>`)
        setTimeout(() => {
            $('.spinner').hide();
        }, 1000); 
        $(".media_cat p").click(function(){
            $(".media_cat p").not(this).next().hide();
            $(this).next().toggle();
            $(".media_cat p").not(this).removeClass('active');
            $(this).toggleClass('active');
        })
    } else {
    // EMPTY PREVIOUS STRUCTURE AND STEP PREVIEW
    $(`#step-media ul`).empty();
    $('#structure-content').empty();
    $('#console-checkbox').prop('checked', false);
    toggleEditTextContentElement();

    // UNBIND EVENT LISTENERS
    $("#delete-media-button").unbind("click");
    $("#edit-media-button").unbind("click");
    
    $("#delete-media-button").on("click", showTooltips);
    $("#edit-media-button").on("click", showTooltips);

    // ADJUST constant ACTIVE
    if (data && data.deleted === 'step') {
        setActiveStep(active.fileName, active.scene, "");
    } else if (data && data.deleted === 'scene') {
        setActiveStep(active.fileName, "", "");
    } else if (data && data.deleted === 'show') {
        setActiveStep("", "", "");
    }

    setJSONsdata(data.data);

    // CLOSE MODAL
    closeModal();
    }
})

socket.on('error', function(data){
    $('#alert')
    .empty()
    .append(`<p>Connection to server failed. Please try again.</p>
            <div class='editor-buttons' style='justify-content: center;'>
                <button type='button'onclick="closeModal()">Close</button>
            </div>`);

    // if (data.deleted) {
    //     $('#alert').dialog({
    //         resizable: false,
    //         modal: true, width: 300,
    //         maxHeight: 600,
    //         minWidth: 500
    //     });
    // }
    closeModal();
})

$('.editor-buttons fieldset input').change(function() {
    if (active.step !== "") {
        if ($(this).is(':checked')) {
            $(`#${activeScreen} .${$(this).attr('name')}` ).show();
        } else {
            $(`#${activeScreen} .${$(this).attr('name')}` ).hide();
        }
    } 
    else {
        $(this).prop("checked", false);
    }
    
});

function addSubtitles(lines) {
    socket.emit("add subtitles", {"fileName" : active.fileName, "language" : $(`#${active.fileName} .languages`).val(), "lines" : lines});
}

function saveStyle(name, style) {
    socket.emit("save subtitles style", {"randomName" : createRandomString(5), "name" : name, "style" : style});
}

function addNewStep(newStepNumber, step) {
    socket.emit("add step", {"fileName" : active.fileName, "scene" : active.scene, "key" : newStepNumber, "step" : step, "activeStep" : active.step});
}

function deleteStep() {
    socket.emit("delete step", {"fileName" : active.fileName, "scene" : active.scene, "step" : active.step});
}

function addNewScene(newSceneNumber, scene) {
    socket.emit("add scene", {"fileName" : active.fileName, "key" : newSceneNumber, "scene" : scene});
}

function renameScene(sceneName) {
    socket.emit("rename scene", {"fileName" : active.fileName, "scene" : active.scene, "name" : sceneName});
}

function renameStep(stepName) {
    socket.emit("rename step", {"fileName" : active.fileName, "scene" : active.scene, "step" : active.step, "name" : stepName});
}

function deleteScene() {
    socket.emit("delete scene", {"fileName" : active.fileName, "scene" : active.scene});
}

function addNewShow(fileName, show) {
    socket.emit("add show", {"fileName" : fileName, "content" : show});
}

function duplicateShow() {
    socket.emit("duplicate show", {"fileName" : active.fileName});
}

function renameShow(newFileName, showName) {
    socket.emit("rename show", {"fileName" : active.fileName, "newFileName" : newFileName, "name" : showName});
}

function deleteShow() {
    socket.emit("delete show", {"fileName" : active.fileName});
}

window.onload = function() {
    activateColorPicker();
};
  
  /* Media
======== */
var $main = $('main');

var states = {
    visual: {
        // current: 'TEST boites'
    }
};

var currentLanguage;


socket.on('init states', function(data) {
    states = deepMerge(states, data);
    // if ('oscHost' in data) $('#osc_ip').val(data.oscHost);
    displayMedia();
});

var datalists = {
    decors: {
      el: $('<datalist id="list_decors"></datalist>'),
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
val.el.addClass('edit-element');
});

var $media = $('#media');


// BOITES
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


function addAvatars() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type='avatars' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>Avatars</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    setElements('', 'avatars', data_key);
    applyZIndexes();
    closeModal(); 
}

function addText() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type='text' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${$('#text-content').val().substring(0, 20)}...</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    setElements('', 'text', data_key);
    applyZIndexes();
    $(`#${activeScreen} [data-key=${data_key}] pre`).text($('#text-content').val());
    closeModal();   
}

$media.on('mousedown', '.file', function() {
    let data_key = createRandomString(5);
    const li = `<li data-key=${data_key} data-type=${this.parentElement.className} onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${getFileName(decodeURI($(this).attr('title')))}</li>`;
    $(`#step-media .${activeScreen}`).append(li);
    
    setElements($(this).attr('title'), this.parentElement.className, data_key);

    applyZIndexes();
    closeModal();  
});

var medias = {
// styles: $('.media_styles'),
// decors: $('.media_decors'),
// pages: $('.media_pages'),
// layouts: $('.media_layouts'),
video: $('.media_video'),
audio: $('.media_audio'),
gifs: $('.media_gifs'),
images: $('#media_images'),
QRcodes : $('#media_QRcodes')
};

function displayMedia() {
// medias.styles.empty();
// medias.decors.empty();
// medias.pages.empty();
// medias.layouts.empty();
medias.video.empty();
medias.audio.empty();
medias.gifs.empty();
medias.images.empty();
medias.QRcodes.empty();

$.each(datalists, function(key, val) {
    val.el.empty();
    val.data.length = 0;
});

// datalists.modes.data = Object.keys(modes);

/* Pages
======== */
// $.each(states.pages, function(key, val) {
//     var path = `@${val}`;
//     var file = `<div title="${path}" class="file">${path}</div>`;
//     medias.pages.append(file);
//     datalists.decors.data.push(path);
// });


/* Css
====== */
// var decorsStyleSheet = document.styleSheets[1].cssRules;
// [...decorsStyleSheet].forEach(val => {
//     var styles = [...val.style];
//     val = val.selectorText;
//     if (val) {
//     var file = `<div title="${val}" class="file">${val}</div>`;
//     if (styles.includes('background-color') || styles.includes('background-image')) {
//         medias.decors.append(file);
//         datalists.decors.data.push(val);
//     } else {
//         medias.styles.append(file);
//         datalists.styles.data.push(val);
//     }
//     }
// });

/* Media
======== */
$.each(states.media, function(key, val) {
    // var file = `<div title="${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}" class="file">${val.replace("frontend\\data\\media\\", "").replaceAll("\\", "/")}</div>`;
    var file = `<div title="${encodeURI(val)}" class="file">${val}</div>`;
    if (
    val.endsWith('.wav') ||
    val.endsWith('.flac') ||
    val.endsWith('.mp3') ||
    val.endsWith('.ogg')
    ) {
        medias.audio.append(file);
        // datalists.decors.data.push(val);
        // $('#select-audio').append(`<option>${val}</option>`);
    } else if (
    val.toLowerCase().endsWith('.jpeg') ||
    val.toLowerCase().endsWith('.jpg') ||
    val.toLowerCase().endsWith('.png') ||
    val.toLowerCase().endsWith('.svg') ||
    val.toLowerCase().endsWith('.webp') ||
    val.toLowerCase().endsWith('.jfif')
    ) {
        if (val.includes('QRcodes')) {
            medias.QRcodes.append(file);
        } else {
            medias.images.append(file);
        }
    
    // datalists.decors.data.push(val);
    } else if (
        val.toLowerCase().endsWith('.html')
    ) {
    medias.layouts.append(file);
    // datalists.decors.data.push(val);
    } else if (
    val.toLowerCase().endsWith('.gif') //
    ) {
    medias.gifs.append(file);
    // datalists.decors.data.push(val);
    } else if (
    val.toLowerCase().endsWith('.webm') ||
    val.toLowerCase().endsWith('.mp4') ||
    val.toLowerCase().endsWith('.mov') ||
    val.toLowerCase().endsWith('.wmv') ||
    val.toLowerCase().endsWith('.avi') ||
    val.toLowerCase().endsWith('.ogv')
    ) {
    medias.video.append(file);
    // datalists.decors.data.push(val);
    }
});
// datalistsWrite();
$(".media_cat p").click(function(){
    $(".media_cat p").not(this).next().hide();
    $(this).next().toggle();
    $(".media_cat p").not(this).removeClass('active');
    $(this).toggleClass('active');
})
}

// $('#select-audio').change(function(){
//     setElements('', 'media_audio', '', $(`#select-audio option:selected`).text());
//     // $(`#${activeScreen} audio`).attr('src', htmlPathToMedia + $(`#select-audio option:selected`).text());
// });

function toggleMediaList(e) {
    e.target.classList.toggle('active')
    $('#alert #media-backgrounds').toggleClass('d-none');
}

// EDITING
{/* <img class="icon" src="../icons/arrow-rotate-right-solid.svg"></img> */}
function editElement(key, type) {
    if (type !== 'transition') {
        if (type === 'text') {
            var textStyle;
            var textSizes
            if (key === 'subtitles') {
                textStyle = getComputedStyle($('.subtitles')[0]);
                textSizes = styleToObject($('.subtitles').attr('style'));
            } else {
                textStyle = getComputedStyle($(`#${activeScreen} [data-key=${key}]`)[0]);
                textSizes = styleToObject($(`#${activeScreen} [data-key=${key}]`).attr('style'));
            }
            // var textStyle = getComputedStyle($(`#${activeScreen} [data-key=${key}]`)[0]);
            // var textSizes = styleToObject($(`#${activeScreen} [data-key=${key}]`).attr('style'));

            var isActive = {
                "bold" : (textStyle.fontWeight === '700') ? ('active') : (''),
                "italic" : (textStyle.fontStyle === 'italic') ? ('active') : (''),
                "underline" : (textStyle.textDecorationLine === 'underline') ? ('active') : (''),
                "center" : (textStyle.textAlign === 'center') ? ('active') : (''),
                "left" : (textStyle.textAlign === 'left') ? ('active') : (''),
                "right" : (textStyle.textAlign === 'right') ? ('active') : ('')
            }
            $('#alert')
            .empty()
            .append(`<div class = 'editor-menu'>  
                            <div class='menu-item'>
                                <label for="color">FONT COLOR</label>
                                <input
                                    id = ${key + '_color'} 
                                    autocomplete="off"
                                    _list="list_decors"
                                    class="color-picker _box-min d-none"
                                    type="text"
                                    name="color"
                                    value= ${(textStyle.color) ? (textStyle.color.replaceAll(' ', '')) : ('rgb(255,255,255)')}
                                />
                            </div>
                            <div class='menu-item'>
                                <label for="background-color">BACKGROUND COLOR</label>
                                <input
                                    id = ${key + '_background-color'} 
                                    autocomplete="off"
                                    _list="list_decors"
                                    class="color-picker _box-min d-none"
                                    type="text"
                                    name="background-color"
                                    value = ${(textStyle.backgroundColor) ? (textStyle.backgroundColor.replaceAll(' ', '')) : ('transparent')} 
                                />
                            </div>
                            <div class='menu-item'>
                                <p>FONT STYLE</p>
                                <select class='font-family' id=${key + '_font-family'}>
                                    <option value='' disabled ${textStyle.fontFamily === '' ? 'selected' : ''}>Change font style</option>
                                    <option value='Arial' ${textStyle.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                                    <option value='AvenirBlack' ${textStyle.fontFamily === 'AvenirBlack' ? 'selected' : ''}>AvenirBlack</option>
                                    <option value='AvenirRoman' ${textStyle.fontFamily === 'AvenirRoman' ? 'selected' : ''}>AvenirRoman</option>
                                    <option value='DINLight' ${textStyle.fontFamily === 'DINLight' ? 'selected' : ''}>DINLight</option>
                                    <option value='faBrands' ${textStyle.fontFamily === 'faBrands' ? 'selected' : ''}>faBrands</option>
                                    <option value='fishbourne' ${textStyle.fontFamily === 'fishbourne' ? 'selected' : ''}>fishbourne</option>
                                    <option value='fixedsys' ${textStyle.fontFamily === 'fixedsys' ? 'selected' : ''}>fixedsys</option>
                                    <option value='RobotoMedium' ${textStyle.fontFamily === 'RobotoMedium' ? 'selected' : ''}>RobotoMedium</option>
                                    <option value='RobotoRegular' ${textStyle.fontFamily === 'RobotoRegular' ? 'selected' : ''}>RobotoRegular</option>
                                </select>
                            </div>
                            <div class='menu-item'>
                                <p>FONT SIZE</p>
                                <input class='font-size' type="number" min = '0' step = '0.1' id = ${key + '_font-size'} value=${parseFloat(textSizes['font-size'])}>
                            </div>
                            <div class='editor-buttons font-decor'>
                                <div class='menu-item'>
                                    <button class='font-style ${isActive.bold}' id = ${key + '_font-weight_bold'}>
                                        <img class='icon' src="../icons/bold.svg"></img>
                                    </div>
                                </button>
                                <div class='menu-item'>
                                    <button class='font-style ${isActive.italic}' id = ${key + '_font-style_italic'}>
                                        <img class='icon' src="../icons/italic.svg"></img>
                                    </div>
                                </button>
                                <div class='menu-item'>
                                    <button class='font-style ${isActive.underline}' id = ${key + '_text-decoration_underline'}>
                                        <img class='icon' src="../icons/underline.svg"></img>
                                    </button>
                                </div>
                            </div>
                            <div class='editor-buttons font-aligment'>
                                <div class='menu-item'>
                                    <button class='text-align ${isActive.center}' id = ${key + '_text-align_center'}>
                                        <img class='icon' src="../icons/align-center.svg"></img>
                                    </div>
                                </button>
                                <div class='menu-item'>
                                    <button class='text-align ${isActive.left}' id = ${key + '_text-align_left'}>
                                        <img class='icon' src="../icons/align-left.svg"></img>
                                    </div>
                                </button>
                                <div class='menu-item'>
                                    <button class='text-align ${isActive.right}' id = ${key + '_text-align_right'}>
                                        <img class='icon' src="../icons/align-right.svg"></img>
                                    </button>
                                </div>
                            </div>
                            <div class='menu-item modes-div'>
                                <p>EFFECTS</p>
                                <label for="${key + '_final-fantasy'}">final fantasy</label>
                                <input type="checkbox" value="final-fantasy" class="modes" id="${key + '_final-fantasy'}" ${$(`#${activeScreen} [data-key=${key}]`).hasClass('mode--final-fantasy') ? 'checked' : ''}></input>
                            </div>
                            <div class='border-div'>
                            <p>BORDER</p>
                            <div class='menu-item'>
                                <input 
                                    class ='font-size menu-item border' 
                                    type ="number" 
                                    min = '0'
                                    step = '0.5'
                                    id = ${key + '_border-width'} 
                                    value = ${(textStyle.borderWidth) ? (parseFloat(textSizes['border-width'])) : (0)} 
                                >
                            </div>
                            <div class='menu-item'>
                                <input
                                    id = ${key + '_border-color'} 
                                    autocomplete="off"
                                    _list="list_decors"
                                    class="color-picker _box-min d-none menu-item border-color"
                                    type="text"
                                    name="border-color"
                                    value = ${(textStyle.borderColor) ? (textStyle.borderColor.replaceAll(' ', '')) : ('transparent')} 
                                />
                            </div>
                            <select value = ${(textStyle.borderStyle) ? (textStyle.borderStyle) : ('none')}  class='menu-item border' id = ${key + '_border-style'}>
                                <option value='solid' ${(textStyle.borderStyle == 'solid') ? ('selected') : (null)}>Solid</option>
                                <option value='dashed' ${(textStyle.borderStyle == 'dashed') ? ('selected') : (null)}>Dashed</option>
                                <option value='dotted' ${(textStyle.borderStyle == 'dotted') ? ('selected') : (null)}>Dotted</option>
                                <option value='double' ${(textStyle.borderStyle === 'double') ? ('selected') : (null)}>Double</option>
                                <option value='none' ${(textStyle.borderStyle === 'none' || textStyle.borderStyle === '') ? ('selected') : (null)}>none</option>
                            </select>
                            </div>
                            <div class='menu-item rotation'>
                                <p>ROTATION</p>
                                <div class='editor-buttons'>
                                    <button>
                                    <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight('${key}');"></img>
                                    </button>
                                </div>
                                <div class='editor-buttons'>
                                <button>
                                    <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft('${key}');"></img>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`)
                    .dialog({
                        resizable: false,
                        modal: true, width: 300,
                        maxHeight: 600,
                        dialogClass: "no-titlebar"
                    });

        activateColorPicker();
        activateFontSizeControler();
        // activatePaddingControler();
        activateFontStyleControler();
        activateTextAlignControler();
        activateTextModesControler();
        activateBorderControler();
        activateFontFamilyControler();
    
        } else if (type === 'osc') {
            $('#alert')
            .empty()
            .append(` <div class="menu-item">
                        <p>Edit OSC message:</p>
                        <form onsubmit="editOSCMessage(event, '${key}')">
                        <label>
                            IP address
                            <input name='IPaddress' disabled value=${$(`li[data-key=${key}]`).data('ip')}>
                        </label>
                        <label>
                            Port
                            <input name='port' disabled value=${$(`li[data-key=${key}]`).data('port')}>
                        </label><br>
                        <label>
                            Address
                            <input name='address' required oninput="this.value = moderateOSCAddressInput(this.value)" value=${$(`li[data-key=${key}]`).data('address')}>
                        </label>
                        <label>
                            Message
                            <input name='message' required value='${$(`li[data-key=${key}]`).data('message')}'>
                        </label><br>
                        <div class='editor-buttons'>
                            <button type='submit'>Save</button>
                            <button type='submit' class="testOSCMessage">Test</button>
                        </div>
                        </form>
                    </div>`)
            .dialog({
                resizable: false,
                modal: true, width: 300,
                dialogClass: "no-titlebar"
            });
        } else {
            $('#alert')
            .empty()
            .append(`<div  
                        class = 'editor-menu'
                    >   
                        <div class='menu-item size'>
                            <p onClick="setSize(event, 'cover', '${key}', '${type}')">COVER</p>
                            <p onClick="setSize(event, 'contain', '${key}',  '${type}')">CONTAIN</p>
                            <p onClick="setSize(event, 'custom', '${key}', '${type}')">custom size</p>
                        </div>
                        <div class='menu-item bg-color'>
                            <label for="background-color">BACKGROUND COLOR</label>
                            <input
                                id = ${key + '_background-color'} 
                                autocomplete="off"
                                _list="list_decors"
                                class="color-picker _box-min d-none"
                                type="text"
                                name="background-color"
                            
                            />
                        </div>
                        <div class='menu-item bg-image'>
                            <b onclick="toggleMediaList(event)">BACKGROUND IMAGE</b> 
                            <div id="media-backgrounds" class='d-none'>
                                <div class="media_images media_cat">
                                <p onclick="removeBackgroundImage('${key}')" style="margin-bottom: 10px;">NONE</p>
                                </div>
                            </div>
                        </div>
                        <div class='menu-item rotation'>
                            <p>ROTATION</p> 
                            <div>
                                <img class="icon" src="../icons/arrow-rotate-right-solid.svg" onclick="rotateRight('${key}');"></img>
                            </div>
                            <div>
                                <img class="icon" src="../icons/arrow-rotate-left-solid.svg" onclick="rotateLeft('${key}');"></img>
                            </div>
                        </div>
                    </div>`)
            .dialog({
                resizable: false,
                modal: true, width: 300,
                // maxHeight: 600,
                dialogClass: "no-titlebar"
            });
            $('#media .media_images div').clone().appendTo('#media-backgrounds .media_images').show();
            $('#media-backgrounds .media_images div').click(function(){
                $(`#${activeScreen} [data-key=${key}]`).css({'background-image': `url('${htmlPathToMedia}${this.title}')`, 'background-size': 'cover', 'background-repeat': 'no-repeat'});
                $('.bg-image b').click();
            });
            activateColorPicker();
        }

        if (type === 'media_video') {
            const video = $(`#${activeScreen} [data-key=${key}] video`)[0];
            $('#alert .editor-menu')
            .append(`<div class='menu-item video-controls'>
                        <p class='editor-section'>CONTROLS</p> 
                        <div class='loop editor-buttons'>
                            <button class="${(video.loop) ? ('active') : ('')}" onclick="setVideoAttribute('${key}', 'loop', event);">
                                loop
                            </button>
                        </div>
                        <div class='editor-buttons'>
                            <button class="mute ${(video.muted) ? ('active') : ('')}" onclick="setVideoAttribute('${key}', 'muted', event);">
                            </button>
                        </div>
                    </div>
                    <div class="menu-item">
                        <input type="range" id="volume" name="volume" min="0" max="100" value=${($(video).prop('volume')*100) ? $(video).prop('volume')*100 : '50'} onchange="adjustMediaVolume('${key}', 'volume', event)">
                        <label for="volume">Volume</label>
                    </div>
                    <div class="menu-item">
                        <select id="select-audioOutput">
                        </select>
                    </div>`)
            getAudioOutputs(key);
        }

        if (type === 'media_audio') {
            const audio = $(`#${activeScreen} [data-key=${key}] audio`)[0];
            $('#alert .editor-menu')
            .empty()
            .append(`<div class='menu-item audio-controls'>
                        <p class='editor-section'>CONTROLS</p> 
                        <div class='loop editor-buttons'>
                            <button class="${(audio.loop) ? ('active') : ('')}" onclick="setAudioAttribute('${key}', 'loop', event);">
                                loop
                            </button>
                        </div>
                        <div class="menu-item">
                            <input type="range" id="volume" name="volume" min="0" max="100" value=${($(audio).prop('volume')*100) ? $(audio).prop('volume')*100 : '50'} onchange="adjustMediaVolume('${key}', 'volume', event)">
                            <label for="volume">Volume</label>
                        </div>
                    </div>`)
        }

        if (key === 'subtitles') {
            $('.padding').parent().remove();
            $('.font-decor').remove();
            $('.font-aligment').remove();
            $('.border-div').remove();
            $('.modes-div').remove();
            $('.rotation').remove();
            $('#alert .editor-menu').append(`<div class="menu-item">Position</div>`)
        } else {
            // APPLY CURRENT STYLE
            let objectFit = $(`#${activeScreen} [data-key=${key}]`).css('object-fit').toUpperCase();
            $(`.size p:contains('${objectFit}')`).toggleClass('active');
        }
    }
}

function moderateOSCAddressInput(value) {
    if (value.charAt(0) === '/') {
        return '/' + value.substring(1);
    } else {
        return '/' + value;
    }
}

oncontextmenu = (event) => {console.log(event) };

function setAudioAttribute(key, attribute, e) {
    let audio = $(`#${activeScreen} [data-key=${key}] audio`);

    if( $(audio).prop(attribute) ) {
            $(audio).prop(attribute, false);
    } else {
        $(audio).prop(attribute, true);
    }
    $(e.currentTarget).toggleClass('active');
    audio.load();
}

function adjustMediaVolume(key, attribute, e) {
    let media = $(`#${activeScreen} [data-key=${key}] .media`);

    $(media).prop(attribute, parseInt(e.target.value) / 100);
}

function activateFontStyleControler() {
    $('.font-style')
    .on('click', function() {
        var $this = $(this);

        var inputs = {'id' : $this.context.id.split('_')[0], 'CSSparameter' : $this.context.id.split('_')[1], 'value' : $this.context.id.split('_')[2]};
        var isActive = $this.hasClass('active');

        var newValue;

        if ($this.hasClass('active')) {
            newValue = '';
            $this.removeClass('active');
        } else {
            newValue = inputs['value'];
            $this.addClass('active');
        }
        $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], newValue);
      })
}

function activateTextAlignControler() {
    $('.text-align')
    .on('click', function() {
        var $this = $(this);

        var inputs = {'id' : $this.context.id.split('_')[0], 'CSSparameter' : $this.context.id.split('_')[1], 'value' : $this.context.id.split('_')[2]};
        var isActive = $this.hasClass('active');

        var newValue;

        if ($this.hasClass('active')) {
            newValue = '';
            $this.removeClass('active');
        } else {
            newValue = inputs['value'];
            $('.font-aligment button').not(this).removeClass('active');
            $this.addClass('active');
        }
       
        $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], newValue);
        
      })
}

function activateFontSizeControler() {
    $('.font-size')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      if ($this.context.id.includes('subtitles')) {
        $(`.subtitles`).css(inputs['CSSparameter'], val + 'vw');
    } else {
        $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + 'vw');
    }
      
    })
}

function activatePaddingControler() {
    $('.padding')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + 'vw');
    })
}

function activateFontFamilyControler() {
    $('.font-family')
    .on('input', function() {
        var $this = $(this);
        var val = $this.val();
        
        var inputs = {"id" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        if ($this.context.id.includes('subtitles')) {
            $(`.subtitles`).css(inputs['CSSparameter'], val);
        } else {
            $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val);
        }
    })
}

function activateTextModesControler() {
    $('.modes')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], "mode" : $this.context.id.split("_")[1]};

        if ($this.is(':checked')) {
            $(`#${activeScreen} [data-key=${inputs.id}]`).addClass('mode--' + inputs["mode"]);
            let content = $(`#${activeScreen} [data-key=${inputs.id}]`).text();
            finalFantasy(content, inputs.id, activeScreen);
        } else {
            finalFantasy('')
            $(`#${activeScreen} [data-key=${inputs.id}]`).removeClass('mode--' + inputs["mode"]);
        }
    })
}

function activateBorderControler() {
    $('.border')
    .on('input', function() {
      var $this = $(this);
      var val = $this.val();
    
      var inputs = {"id" : $this.context.id.split("_")[0], 'CSSparameter' : $this.context.id.split("_")[1]};
      var unit;
      if (inputs['CSSparameter'] === 'border-width') 
            {unit = 'vw';
        } else {
            unit = '';
        }

      $(`#${activeScreen} [data-key=${inputs.id}]`).css(inputs['CSSparameter'], val + unit);
    })
}

function setSize(event, size, key, type) {
    $(event.target).siblings().removeClass('active');
    $(event.target).toggleClass('active');
    if (size === 'custom') {
        $(`#${activeScreen} [data-key=${key}]`).css({'object-fit' : '', 'width' : '35%', 'height' : '', 'top' : '0%', 'left' : '0%'});
        if (type === 'media_images' || type === 'media_gifs') {
            $(`#${activeScreen} [data-key=${key}] img`).css({'object-fit' : '', 'height' : ''})
        }
        if (type === 'media_video' || type === 'videoStream') {
            $(`#${activeScreen} [data-key=${key}] video`).css({'object-fit' : '', 'height' : ''})
        }
    } else {
        $(`#${activeScreen} [data-key=${key}]`).css({'object-fit' : size, 'width' : '100%', 'height' : '100%', 'top' : '0%', 'left' : '0%'});
        if (type === 'media_images' || type === 'media_gifs') {
            $(`#${activeScreen} [data-key=${key}] img`).css({'object-fit' : size, 'height' : '100%'})
        }
        if (type === 'media_video' || type === 'videoStream') {
            $(`#${activeScreen} [data-key=${key}] video`).css({'object-fit' : size, 'height' : '100%'})
        }
    }
}

function rotateRight(key) {
    var element = document.querySelector(`#${activeScreen} [data-key='${key}']`);
    var startAngle = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', ''));
    var newAngle;
    if (startAngle) {
        newAngle = startAngle + 15;
    } else {
        newAngle = 15;
    }
    element.style.transform = 'rotate(' + newAngle + 'deg)'
}

function rotateLeft(key) {
    var element = document.querySelector(`#${activeScreen} [data-key='${key}']`);
    var startAngle = parseInt(element.style.transform.replace('rotate(', '').replace('deg)', ''));
    var newAngle;
    if (startAngle) {
        newAngle = startAngle - 15;
    } else {
        newAngle = -15;
    }
    element.style.transform = 'rotate(' + newAngle + 'deg)'
}

function playVideo(id) {
    var video = $('#' + id).find($('video'))[0];
    video.play();
}

function setVideoAttribute(key, attribute, e) {
    var video = $(`#${activeScreen} [data-key=${key}] video`);

    if( $(video).prop(attribute) ) {
            $(video).prop(attribute, false);
    } else {
        $(video).prop(attribute, true);
    }
    $(e.currentTarget).toggleClass('active');
    video.load();
}

function removeBackgroundImage(key) {
    $(`#${activeScreen} [data-key='${key}']`).css({'background-image' : '', 'background-size' : '', 'background-repeat' : ''});
}

function displayMediaList() {
    $("#text-content").val('');
    $( "#media" ).dialog({
        resizable: false,
        modal: true, width: 300,
        maxHeight: 600,
        minWidth: 500,
        dialogClass: "no-titlebar" 
    })
    getMediaStream();
    $('#media .opacity-label').css('opacity', 0.4);
}

function createQRcode() {
    socket.emit('create qr code', {'fileName' : $('#create-QRcode #fileName').val(), 'content' : $('#create-QRcode #content').val()});
    showSpinner('create-QRcode');
}

function activateColorPicker() {
    $('.color-picker')
    .on('input change', function() {
      var $this = $(this);
      var val = $this.val();
    
      if ($this.context.id === "preview_background-color") {
        $(`#${activeScreen}`).css('background-color', val);
      } else if ($this.context.id.includes("subtitles")) {
        var inputs = {"key" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        $(`.subtitles`).css(inputs['CSSparameter'], val);
      } else {
        var inputs = {"key" : $this.context.id.split("_")[0], "CSSparameter" : $this.context.id.split("_")[1]};
        $(`#${activeScreen} [data-key=${inputs.key}]`).css(inputs['CSSparameter'], val);
      }
       
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
      preferredFormat: 'rgb',
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
}

// LIVE STREAM
function getMediaStream() {
    const cameraOptions = document.querySelector('.video-options>select');

    let constraints = {
        video: { deviceId: ''}
    };
    
    cameraOptions.onchange = () => {
        let data_key = createRandomString(5);
        const li = `<li data-key=${data_key} data-type='videoStream' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${$(cameraOptions).find(":selected").text()}</li>`;
        $(`#step-media .${activeScreen}`).append(li);
        setElements('', 'videoStream', data_key);
        applyZIndexes();
        constraints.video.deviceId = cameraOptions.value;
        $(`#${activeScreen} [data-key=${data_key}]`).data('device', cameraOptions.value);
        $(`#${activeScreen} [data-key=${data_key}]`).data('label', $(cameraOptions).find(":selected").text());
        startStream(constraints, data_key, activeScreen);
        setTimeout(() => {
            $(".ui-dialog-titlebar-close"). click();
        }, 200); 
    };

    const getCameraSelection = async () => {
        navigator.mediaDevices.getUserMedia({video: true, audio: true});
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const options = videoDevices.map(videoDevice => {
            return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
        });
        cameraOptions.innerHTML = `<option value="" disabled selected>LIVE STREAM</option>` + options.join('');
    };

    getCameraSelection();
}

async function startStream(constraints, data_key, screen) {
    navigator.mediaDevices.getUserMedia( constraints )
    .then( MediaStream => {
        handleStream(MediaStream, data_key, screen);
    })
    .catch( error => {
        alert(error);
    });
}

function handleStream(stream, data_key, screen) {
    $(`#${screen} [data-key=${data_key}] video`)[0].srcObject = stream;
}

async function getAudioOutputs(data_key) {
    const audioOptions = document.querySelector('#select-audioOutput');

    audioOptions.onchange = () => {
        $(`#${activeScreen} [data-key=${data_key}]`).data('audioOutput', audioOptions.value);
        $(`#${activeScreen} [data-key=${data_key}] .media`)[0].setSinkId(audioOptions.value);
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audiooutput');
        const options = audioDevices.map(audioDevice => {
            return `<option value="${audioDevice.deviceId}">${audioDevice.label}</option>`;
        });
    audioOptions.innerHTML = `<option value="" disabled selected>AUDIO OUTPUT</option>` + options.join('');
}


// OSC MESSAGES
function listAllConnectedDevices() {
    socket.emit('find connected devices');
    $('#device-list').remove();
    $('#getDeviceList').hide();
    $('#oscMessageForm').append(`<div class="spinner"><div>`);
}

socket.on('connected devices', function(data) {
    $('#oscMessageForm .spinner').remove();
    $('#getDeviceList').show();
    if (data === 'error') {
        alert ('Server error. Could not get connected devices.');
    } else {
        $('#oscMessageForm').append(`<select id='device-list'></select>`);
        const unique = [...new Map(data.map(item => [item['mac'], item])).values()]; 
        $.each(unique, function() {
            $('#device-list').append(`<option value=${this.ip}>name: ${this.name}, IP: ${this.ip}</option>`)
        })
        $('#device-list').on('change', function() {
            $('#IPaddress').val($(this).val());
        })
    }
})

function createOSCMessage(e) {
    e.preventDefault();
    if ($(e.submitter).hasClass('testOSCMessage')) {
        const data = {"test" : {
            'host' : $('#oscMessageForm #IPaddress').val(),
            'port' : $('#oscMessageForm #port').val(),
            'address' : $('#oscMessageForm #address').val(),
            'message' : $('#oscMessageForm #message').val()
        }}
        sendOSCMessage(data);
    } else {
        let data_key = createRandomString(5);
    
        const li = `<li data-key=${data_key} data-ip=${$('#oscMessageForm #IPaddress').val()} data-port=${$('#oscMessageForm #port').val()} data-address='${$('#oscMessageForm #address').val()}' data-message='${$('#oscMessageForm #message').val()}' data-type='osc' onclick="markActiveStepMediaElement(event)"><div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${$('#oscMessageForm #message').val()}</li>`;
    
        $(`#step-media .${activeScreen}`).append(li);
    
        setElements('', 'osc', data_key);
        applyZIndexes();
        $('#oscMessageForm')[0].reset();
        closeModal(); 
    }
}

function editOSCMessage(e, data_key) {
    e.preventDefault();
    if ($(e.submitter).hasClass('testOSCMessage')) {
        const data = {"test" : {
            'host' : $(e.target).find('input[name=IPaddress]').val(),
            'port' : $(e.target).find('input[name=port]').val(),
            'address' : $(e.target).find('input[name=address]').val(),
            'message' : $(e.target).find('input[name=message]').val()
        }}
        sendOSCMessage(data);
    } else {
        const liElement = $(`li[data-key=${data_key}]`);
        $(liElement).data('address', $(e.target).find('input[name=address]').val());
        $(liElement).data('message', $(e.target).find('input[name=message]').val());
        $(liElement).html(`<div class="visibility-icon visible" onclick="toggleVisibility(event)" data-key=${data_key}></div>${$(e.target).find('input[name=message]').val()}`);
        showSpinner('alert');
        closeModal();
    }
}

function sendOSCMessage(data) {
    socket.emit('send OSC message', data);
}