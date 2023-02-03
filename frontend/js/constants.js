const showObject = { "name" : "",
                    "languages" : [],
                    "scene-order": [],
                    "scenes" : {}                 
}

const sceneObject = {
    "name" : "",
    "step-order" : [],
    "steps" : {}
}
const stepObject = { 
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

const consoleObject =   {
                        "mode": "console"
                        }

const boiteObject =     {
                        "type": "",
                        "arg": ""
                        }


const htmlPathToMedia = '/data/media/';

const mediaObject = {   
                        "type" : "",
                        "css" : {},
                        "attributes" : {},
                        "content" : "",
                        "classes" : [] 
                    };

// only if object-fit => inner elelemtn height:100% + object-fit property

const languages = {
                    'sq' : 'Albanian',
                    'ar' : 'Arabic',
                    'hy' : 'Armenian',
                    'be' : 'Belarusian',
                    'bs' : 'Bosnian',
                    'bg' : 'Bulgarian',
                    'zh' : 'Chinese',
                    'hr' : 'Croatian',
                    'cs' : 'Czech',
                    'da' : 'Danish',
                    'nl' : 'Dutch, Flemish',
                    'en' : 'English',
                    'eo' : 'Esperanto',
                    'et' : 'Estonian',
                    'fi' : 'Finnish',
                    'fr' : 'French',
                    'gd' : 'Gaelic, Scottish Gaelic',
                    'de' : 'German',
                    'el' : 'Greek (Modern)',
                    'ht' : 'Haitian, Haitian Creole',
                    'he' : 'Hebrew',
                    'hu' : 'Hungarian',
                    'is' : 'Icelandic',
                    'ga' : 'Irish',
                    'it' : 'Italian',
                    'ja' : 'Japanese',
                    'ko' : 'Korean',
                    'lv' : 'Latvian',
                    'lt' : 'Lithuanian',
                    'mk' : 'Macedonian',
                    'no' : 'Norwegian',
                    'pl' : 'Polish',
                    'pt' : 'Portuguese',
                    'ru' : 'Russian',
                    'sr' : 'Serbian',
                    'sk' : 'Slovak',
                    'sl' : 'Slovenian',
                    'es' : 'Spanish, Castilian',
                    'sv' : 'Swedish',
                    'tr' : 'Turkish',
                    'uk' : 'Ukrainian',
                    'vi' : 'Vietnamese',
                    'cy' : 'Welsh',
                };
