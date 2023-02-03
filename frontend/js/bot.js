'use strict';

function startChatBot(language) {
  // (function() {
    var data;
    var currentLanguage = language;
  
    var elizaQuits = ['bye', 'a+', 'salut', 'ciao!', 'bises'];
    var elizaPres = [];
    var elizaPosts = [];
  
    // regexp/replacement pairs to be performed as final cleanings
    // here: cleanings for multiple bots talking to each other
    var elizaPostTransforms = [
      / old old/g,
      ' old',
      /\bthey were( not)? me\b/g,
      'it was$1 me',
      /\bthey are( not)? me\b/g,
      'it is$1 me',
      /Are they( always)? me\b/,
      'it is$1 me',
      /\bthat your( own)? (\w+)( now)? \?/,
      'that you have your$1 $2?',
      /\bI to have (\w+)/,
      'I have $1',
      /Earlier you said your( own)? (\w+)( now)?\./,
      'Earlier you talked about your $2.'
    ];
  
    /* elizabot.js v.1.1 - ELIZA JS library (N.Landsteiner 2005) */
  
    function ElizaBot(noRandomFlag) {
      this.noRandom = noRandomFlag ? true : false;
      this.capitalizeFirstLetter = !true;
      this.debug = !false;
      this.memSize = 20;
      this.version = '1.1 (original)';
      if (!this._dataParsed) this._init();
      this.reset();
    }
  
    ElizaBot.prototype.reset = function() {
      this.quit = false;
      this.mem = [];
      this.lastchoice = [];
      for (var k = 0; k < elizaKeywords.length; k++) {
        this.lastchoice[k] = [];
        var rules = elizaKeywords[k][2];
        for (var i = 0; i < rules.length; i++) this.lastchoice[k][i] = -1;
      }
    };
  
    ElizaBot.prototype._dataParsed = false;
  
    ElizaBot.prototype._init = function() {
      // install ref to global object
      // var window = (ElizaBot.prototype.global = self);
      // parse data and convert it from canonical form to internal use
      // prodoce synonym list
      var synPatterns = {};
      if (data.synonyms && typeof data.synonyms == 'object') {
        for (var i in data.synonyms)
          synPatterns[i] = '(' + i + '|' + data.synonyms[i].join('|') + ')';
      }
      ElizaBot.prototype.synPatterns = synPatterns;
      //console.log(synPatterns);
      // check for keywords or install empty structure to prevent any errors
      if (!elizaKeywords || typeof elizaKeywords.length == 'undefined') {
        elizaKeywords = [['###', 0, [['###', []]]]];
      }
      // 1st convert rules to regexps
      // expand synonyms and insert asterisk expressions for backtracking
      var sre = /@(\S+)/;
      var are = /(\S)\s*\*\s*(\S)/;
      var are1 = /^\s*\*\s*(\S)/;
      var are2 = /(\S)\s*\*\s*$/;
      var are3 = /^\s*\*\s*$/;
      var wsre = /\s+/g;
      for (var k = 0; k < elizaKeywords.length; k++) {
        var rules = elizaKeywords[k][2];
        elizaKeywords[k][3] = k; // save original index for sorting
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          // check mem flag and store it as decomp's element 2
          if (r[0].charAt(0) == '$') {
            var ofs = 1;
            while (r[0].charAt[ofs] == ' ') ofs++;
            r[0] = r[0].substring(ofs);
            r[2] = true;
          } else {
            r[2] = false;
          }
          // expand synonyms (v.1.1: work around lambda function)
          var m = sre.exec(r[0]);
          while (m) {
            var sp = synPatterns[m[1]] ? synPatterns[m[1]] : m[1];
            r[0] = r[0].substring(0, m.index) + sp + r[0].substring(m.index + m[0].length);
            m = sre.exec(r[0]);
          }
          // expand asterisk expressions (v.1.1: work around lambda function)
          if (are3.test(r[0])) {
            r[0] = '\\s*(.*)\\s*';
          } else {
            m = are.exec(r[0]);
            if (m) {
              var lp = '';
              var rp = r[0];
              while (m) {
                lp += rp.substring(0, m.index + 1);
                if (m[1] != ')') lp += '\\b';
                lp += '\\s*(.*)\\s*';
                if (m[2] != '(' && m[2] != '\\') lp += '\\b';
                lp += m[2];
                rp = rp.substring(m.index + m[0].length);
                m = are.exec(rp);
              }
              r[0] = lp + rp;
            }
            m = are1.exec(r[0]);
            if (m) {
              var lp = '\\s*(.*)\\s*';
              if (m[1] != ')' && m[1] != '\\') lp += '\\b';
              r[0] = lp + r[0].substring(m.index - 1 + m[0].length);
            }
            m = are2.exec(r[0]);
            if (m) {
              var lp = r[0].substring(0, m.index + 1);
              if (m[1] != '(') lp += '\\b';
              r[0] = lp + '\\s*(.*)\\s*';
            }
          }
          // expand white space
          r[0] = r[0].replace(wsre, '\\s+');
          wsre.lastIndex = 0;
        }
      }
      // now sort keywords by rank (highest first)
      elizaKeywords.sort(this._sortKeywords);
      // and compose regexps and refs for pres and posts
      ElizaBot.prototype.pres = {};
      ElizaBot.prototype.posts = {};
      if (elizaPres && elizaPres.length) {
        var a = new Array();
        for (var i = 0; i < elizaPres.length; i += 2) {
          a.push(elizaPres[i]);
          ElizaBot.prototype.pres[elizaPres[i]] = elizaPres[i + 1];
        }
        ElizaBot.prototype.preExp = new RegExp('\\b(' + a.join('|') + ')\\b');
      } else {
        // default (should not match)
        ElizaBot.prototype.preExp = /####/;
        ElizaBot.prototype.pres['####'] = '####';
      }
      if (elizaPosts && elizaPosts.length) {
        var a = new Array();
        for (var i = 0; i < elizaPosts.length; i += 2) {
          a.push(elizaPosts[i]);
          ElizaBot.prototype.posts[elizaPosts[i]] = elizaPosts[i + 1];
        }
        ElizaBot.prototype.postExp = new RegExp('\\b(' + a.join('|') + ')\\b');
      } else {
        // default (should not match)
        ElizaBot.prototype.postExp = /####/;
        ElizaBot.prototype.posts['####'] = '####';
      }
      // check for elizaQuits and install default if missing
      if (!elizaQuits || typeof elizaQuits.length == 'undefined') {
        elizaQuits = [];
      }
      // done
      ElizaBot.prototype._dataParsed = true;
    };
  
    ElizaBot.prototype._sortKeywords = function(a, b) {
      // sort by rank
      if (a[1] > b[1]) return -1;
      else if (a[1] < b[1]) return 1;
      // or original index
      else if (a[3] > b[3]) return 1;
      else if (a[3] < b[3]) return -1;
      else return 0;
    };
  
    ElizaBot.prototype.transform = function(text) {
      var rpl = '';
      this.quit = false;
      // unify text string
      text = text.toLowerCase();
      text = text.replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ');
      text = text.replace(/\s+-+\s+/g, '.');
      text = text.replace(/\s*[,\.\?!;]+\s*/g, '.');
      text = text.replace(/\s*\bbut\b\s*/g, '.');
      text = text.replace(/\s{2,}/g, ' ');
      // split text in part sentences and loop through them
      var parts = text.split('.');
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part != '') {
          // check for quit expression
          for (var q = 0; q < elizaQuits.length; q++) {
            if (elizaQuits[q] == part) {
              this.quit = true;
              return this.getFinal();
            }
          }
          // preprocess (v.1.1: work around lambda function)
          var m = this.preExp.exec(part);
          if (m) {
            var lp = '';
            var rp = part;
            while (m) {
              lp += rp.substring(0, m.index) + this.pres[m[1]];
              rp = rp.substring(m.index + m[0].length);
              m = this.preExp.exec(rp);
            }
            part = lp + rp;
          }
          this.sentence = part;
          // loop trough keywords
          for (var k = 0; k < elizaKeywords.length; k++) {
            //console.log(123, part, elizaKeywords[k][0]);
            var patern =
              ElizaBot.prototype.synPatterns[elizaKeywords[k][0]] || elizaKeywords[k][0];
            //console.log(patern, part.search(new RegExp('\\b'+patern+'\\b', 'i')));
            var reg = /^\W/.test(part)
              ? new RegExp(patern, 'i')
              : new RegExp('\\b' + patern + '\\b', 'i');
            if (part.search(reg) >= 0) {
              rpl = this._execRule(k);
            }
            if (rpl != '') return rpl;
          }
        }
      }
      // nothing matched try mem
      rpl = this._memGet();
      // if nothing in mem, so try xnone
      if (rpl == '') {
        this.sentence = ' ';
        var k = this._getRuleIndexByKey('xnone');
        if (k >= 0) rpl = this._execRule(k);
      }
      // return reply or default string
      return rpl != '' ? rpl : sample(elizaKeywords[0][2][1]);
    };
  
    ElizaBot.prototype._execRule = function(k) {
      var rule = elizaKeywords[k];
      var decomps = rule[2];
      var paramre = /\(([0-9]+)\)/;
      for (var i = 0; i < decomps.length; i++) {
        var m = this.sentence.match(decomps[i][0]);
        if (m != null) {
          var reasmbs = decomps[i][1];
          var memflag = decomps[i][2];
          var ri = this.noRandom ? 0 : Math.floor(Math.random() * reasmbs.length);
          if (
            (this.noRandom && this.lastchoice[k][i] > ri) ||
            this.lastchoice[k][i] == ri
          ) {
            ri = ++this.lastchoice[k][i];
            if (ri >= reasmbs.length) {
              ri = 0;
              this.lastchoice[k][i] = -1;
            }
          } else {
            this.lastchoice[k][i] = ri;
          }
          var rpl = reasmbs[ri];
          if (this.debug)
            console.log(
              'match:\nkey: ' +
                elizaKeywords[k][0] +
                '\nrank: ' +
                elizaKeywords[k][1] +
                '\ndecomp: ' +
                decomps[i][0] +
                '\nreasmb: ' +
                rpl +
                '\nmemflag: ' +
                memflag
            );
          if (rpl.search('^goto ', 'i') == 0) {
            var ki = this._getRuleIndexByKey(rpl.substring(5));
            if (ki >= 0) return this._execRule(ki);
          }
          // substitute positional params (v.1.1: work around lambda function)
          var m1 = paramre.exec(rpl);
          if (m1) {
            var lp = '';
            var rp = rpl;
            while (m1) {
              var param = m[parseInt(m1[1])];
              // postprocess param
              var m2 = this.postExp.exec(param);
              if (m2) {
                var lp2 = '';
                var rp2 = param;
                while (m2) {
                  lp2 += rp2.substring(0, m2.index) + this.posts[m2[1]];
                  rp2 = rp2.substring(m2.index + m2[0].length);
                  m2 = this.postExp.exec(rp2);
                }
                param = lp2 + rp2;
              }
              lp += rp.substring(0, m1.index) + param;
              rp = rp.substring(m1.index + m1[0].length);
              m1 = paramre.exec(rp);
            }
            rpl = lp + rp;
          }
          rpl = this._postTransform(rpl);
          if (memflag) this._memSave(rpl);
          else return rpl;
        }
      }
      return '';
    };
  
    ElizaBot.prototype._postTransform = function(s) {
      // final cleanings
      s = s.replace(/\s{2,}/g, ' ');
      s = s.replace(/\s+\./g, '.');
      if (elizaPostTransforms && elizaPostTransforms.length) {
        for (var i = 0; i < elizaPostTransforms.length; i += 2) {
          s = s.replace(elizaPostTransforms[i], elizaPostTransforms[i + 1]);
          elizaPostTransforms[i].lastIndex = 0;
        }
      }
      // capitalize first char (v.1.1: work around lambda function)
      if (this.capitalizeFirstLetter) {
        /*var re=/^([a-z])/;
      var m=re.exec(s);
      if (m) s=m[0].toUpperCase()+s.substring(1);*/
        s = s[0].toUpperCase() + s.substring(1);
      }
      return s;
    };
  
    ElizaBot.prototype._getRuleIndexByKey = function(key) {
      for (var k = 0; k < elizaKeywords.length; k++) {
        if (elizaKeywords[k][0] == key) return k;
      }
      return -1;
    };
  
    ElizaBot.prototype._memSave = function(t) {
      this.mem.push(t);
      if (this.mem.length > this.memSize) this.mem.shift();
    };
  
    ElizaBot.prototype._memGet = function() {
      if (this.mem.length) {
        if (this.noRandom) return this.mem.shift();
        else {
          var n = Math.floor(Math.random() * this.mem.length);
          var rpl = this.mem[n];
          for (var i = n + 1; i < this.mem.length; i++) this.mem[i - 1] = this.mem[i];
          this.mem.length--;
          return rpl;
        }
      } else return '';
    };
  
    ElizaBot.prototype.getFinal = function() {
      // if (!ElizaBot.prototype.global.data.finals) return '';
      if (!data.finals) return '';
      return data.finals[Math.floor(Math.random() * data.finals.length)];
    };
  
    ElizaBot.prototype.getInitial = function() {
      // if (!ElizaBot.prototype.global.data.initials) return '';
      if (!data.initials) return '';
      return data.initials[Math.floor(Math.random() * data.initials.length)];
    };
  
    // fix array.prototype methods (push, shift) if not implemented (MSIE fix)
    if (typeof Array.prototype.push == 'undefined') {
      Array.prototype.push = function(v) {
        return (this[this.length] = v);
      };
    }
    if (typeof Array.prototype.shift == 'undefined') {
      Array.prototype.shift = function() {
        if (this.length == 0) return null;
        var e0 = this[0];
        for (var i = 1; i < this.length; i++) this[i - 1] = this[i];
        this.length--;
        return e0;
      };
    }
  
    /* Markov */
  
    class Markov {
      constructor(props) {
        this.props = props;
        if (!this.props.input) {
          return false;
        }
        this.terminals = {};
        this.startWords = [];
        this.wordStats = {};
        for (let i = 0, length = this.props.input.length; i < length; i++) {
          let words = this.props.input[i].split(' ');
          if (this.terminals[words[words.length - 1]]) {
            this.terminals[words[words.length - 1]]++;
          } else {
            this.terminals[words[words.length - 1]] = 1;
          }
  
          if (words[0].length && !this.startWords.includes(words[0])) {
            this.startWords.push(words[0]);
          }
  
          for (let j = 0, len = words.length - 1; j < len; j++) {
            if (this.wordStats.hasOwnProperty(words[j])) {
              this.wordStats[words[j]].push(words[j + 1]);
            } else {
              this.wordStats[words[j]] = [words[j + 1]];
            }
          }
        }
        for (let word in this.terminals) {
          if (
            this.terminals[word] < 4 ||
            this.terminals[word] === '' ||
            !this.terminals[word]
          ) {
            delete this.terminals[word];
          }
        }
        delete this.terminals[''];
        delete this.wordStats[''];
      }
  
      choice(a) {
        return a[Math.floor(a.length * Math.random())];
      }
  
      makeChain(minLength, maxLength) {
        if (this.props.minLength && !minLength) minLength = this.props.minLength;
        if (!minLength) {
          minLength = 1;
        }
        if (this.props.maxLength && !maxLength) maxLength = this.props.maxLength;
        if (!maxLength) {
          maxLength = 15;
        }
        let word = this.choice(this.startWords);
        let chain = [word];
        while (this.wordStats.hasOwnProperty(word)) {
          let nextWords = this.wordStats[word];
          word = this.choice(nextWords);
          chain.push(word);
          if (chain.length > minLength && this.terminals.hasOwnProperty(word)) break;
          if (chain.length > maxLength && this.terminals.hasOwnProperty(word)) break;
        }
        if (chain.length < minLength) return this.makeChain(minLength, maxLength);
        if (chain.length > maxLength) return this.makeChain(minLength, maxLength);
        return chain.join(' ');
      }
    }
  
    var memory = {
      bot: []
    };
  
    function append() {
      var str = markov.makeChain(3, 6);
      return str[0].toLowerCase() + str.substring(1);
      if (memory.bot.indexOf(str) > -1) return append();
      if (str) {
        memory.bot.push(str);
        return str[0].toLowerCase() + str.substring(1);
      } else return '';
    }
    function prefix(array) {
      var str = markov.choice(array);
      return str + ' ';
      if (memory.bot.indexOf(str) > -1) return prefix(array);
      if (str) {
        memory.bot.push(str);
        return str + ' ';
      } else return '';
    }
  
    function reply(userinput) {
      // return eliza.transform(userinput);
  
      var rrepl = '';
      var intro = '';
  
      if (chance(80)) {
        rrepl = eliza.transform(userinput);
      } else {
        if (userinput && chance()) intro = prefix(data.intros);
        rrepl = markov.makeChain();
      }
      if (chance(60)) {
        rrepl += ' ' + (chance() ? prefix(data.puis) : '') + append();
      }
  
      if (memory.bot.indexOf(rrepl) > -1) return reply(userinput);
      memory.bot.push(rrepl);
  
      if (chance(60)) {
        rrepl = rrepl.trim();
        rrepl = rrepl.replace(/[\.,\?!; ]*$/gi, '') + (', ' + prefix(data.suffixQuestion));
      }
  
      return (intro + rrepl).toLowerCase();
    }
  
    var markov;
    var eliza;
    var elizaKeywords;
  
    var defaultLanguage = 'FR';

    $.when(
      $.getJSON(`/data/visual_${currentLanguage}.json`), //
      $.get(`/data/chatbot_${currentLanguage}.txt`),
      $.getJSON('/data/chatbot.json')
    ).then(function(a, b, c) {
      
      var results = b[0];
  
      $.each(a[0], function(key, x) {
        x.forEach(function(item) {
          if (typeof item === 'string') {
            results += item + '\n';
          } else {
            // $.each(item, function(key, y) {
            //   if (typeof y !== 'string') {
            //     if ('texte' in y) {
            //       if (typeof y.texte !== 'string') {
            //         if (currentLanguage in y.texte) {
            //           results += y.texte[currentLanguage] + '\n';
            //         } else {
            //           results += y.texte[defaultLanguage] + '\n';
            //         }
            //       }
            //     }
            //   } else {
            //     if (currentLanguage in item) {
            //       results += item[currentLanguage] + '\n';
            //     } else {
            //       results += item[defaultLanguage] + '\n';
            //     }
            //   }
            // });
            $.each(item, function(key, y) {
              if ('texte' in y) results += y.texte + '\n';
            });
          }
        });
      });
      
      if (currentLanguage in c[0]) {
        data = c[0][currentLanguage];
      } else {
        data = c[0][defaultLanguage];
      }
      
  
      elizaKeywords = [
        ['xnone', 0, [['*', data.phrases]]],
        ['sorry', 0, [['*', data.sorry]]],
        ['lol', 0, [['*', data.lol]]],
        ['fuck', 3, [['*', data.insultes]]],
        ['hello', 0, [['*', ['Salut, ça va?', 'Yo.']]]]
      ];
      eliza = new ElizaBot();
      eliza.debug = false;
  
      results = results.split(/\n/);
      results = results.concat(data.phrases);
      results = results.filter(function(n) {
        return !!n.trim();
      });
  
      markov = new Markov({
        input: results
      });
  
      // window.bot.onready();
    });
  
    window.bot = {
      reply: reply,
      initials: function() {
        return sample(data.initials);
      },
      finals: function() {
        return sample(data.finals);
      }
    };
  // })();
}

