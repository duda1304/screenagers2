var nameList = require('../frontend/data/nameList.json');

var COLORS = [
  '#e21400',
  '#f78b00',
  '#f8a700',
  '#f78b00',
  '#58dc00',
  '#c3ff00',
  '#a8f07a',
  '#4ae8c4',
  '#3b88eb',
  '#ff00ff',
  '#a700ff',
  '#d300e7'
];

var defaultLanguage = 'FR';

function getUsernameColor(nick) {
  var hash = 7;
  for (var i = 0; i < nick.length; i++) {
    hash = nick.charCodeAt(i) + (hash << 5) - hash;
  }
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

function nameGenerator(language) {
  var name = '';
  var x = parseInt(Math.random() * 2 + 1);
  for (var i = 0; i < x; i++) {
    if (language in nameList) {
      name = name + nameList[language][parseInt(Math.random() * nameList[language].length)];
    } else {
      name = name + nameList[defaultLanguage][parseInt(Math.random() * nameList[defaultLanguage].length)];
    }
  }
  name = name + parseInt(Math.random() * 99);
  return name;
}

class User {
  constructor(id, language) {
    this.id = id;
    this.nick = nameGenerator(language);
    this.color = getUsernameColor(this.nick);
    this.karma = 0;
    this.banned = false;
    this.online = false;
  }
}

User.nameGenerator = nameGenerator;
User.getUsernameColor = getUsernameColor;

module.exports = User;
