let processor = {
    timerCallback: function() {
          if (this.video.paused || this.video.ended) {
            return;
          }
      this.computeFrame();
      let self = this;
      setTimeout(function () {
          self.timerCallback();
        }, 0);
    },
  
    doLoad: function(id, title) {
        this.video = $('#' + id).find($('video'))[0];
        var videoStyle = getComputedStyle(this.video);

        var c1 = document.createElement('canvas');
        $(c1).css({
            'position' : 'absolute',
            'top' : '0px',
            'left' : '0px',
            'display' : 'none'
        })
        $(c1).attr('id', id + '_C1');
        document.getElementById('preview').append(c1);
        this.c1 = c1;
        this.ctx1 = this.c1.getContext("2d");

        var c2 = document.createElement('canvas');
        $(c2).css({
            'background-image' : `url(data/media/${title})`,
            'background-size' : 'cover',
            'background-repeat' : 'no-repeat',
            
            'position' : 'absolute',
            'top' : '0px',
            'left' : '0px'
        })
        $(c2).attr('id', id + '_C2');
        this.video.parentElement.append(c2);
        this.c2 = c2;
        this.ctx2 = this.c2.getContext("2d");
        let self = this;

        self.c1.width = parseInt(getComputedStyle(self.video).width);
        self.c2.width = parseInt(getComputedStyle(self.video).width);
        self.c1.height = parseInt(getComputedStyle(self.video).height);
        self.c2.height = parseInt(getComputedStyle(self.video).height);
        self.timerCallback();
    },

    start: function(video) {
        this.video = video;
        var id = video.id.split('_')[0];

        this.c1 = $(video.parentElement).find('#' + id + '_C1')[0];
        this.ctx1 = this.c1.getContext("2d");

        this.c2 = $(video.parentElement).find('#' + id + '_C2')[0];;
        this.ctx2 = this.c2.getContext("2d");
        let self = this;

        this.video.addEventListener("play", function() {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            self.timerCallback();
        }, false);
    },

    startPreview: function(video) {
        this.video = video;
        var id = video.id.split('_')[0];

        this.c1 = $(video.parentElement).find('#' + id + '_C1')[0];
        this.ctx1 = this.c1.getContext("2d");

        this.c2 = $(video.parentElement).find('#' + id + '_C2')[0];;
        this.ctx2 = this.c2.getContext("2d");
        let self = this;

        // this.video.addEventListener("play", function() {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            self.timerCallback();
        // }, false);
    },
   
   

    computeFrame: function() {
      this.ctx1.drawImage(this.video, 0, 0, this.c1.width, this.c1.height);
      let frame = this.ctx1.getImageData(0, 0, this.c1.width, this.c1.height);
      
    //   OPTION 1
      var data32 = new Uint32Array(frame.data.buffer);
      var clampedArray = new Uint8ClampedArray(data32.buffer);
      
      var labColor;
      var dEScore;
      var r, g, b;
      var x, y;
      var pixel;

        var canvasHeight = this.c1.height;
        var canvasWidth = this.c1.width;

      for (y = 0; y < canvasHeight; ++y) {
        for (x = 0; x < canvasWidth; ++x) {
            pixel = data32[y * canvasWidth + x];
            r = (pixel) & 0xff;
            g = (pixel >> 8) & 0xff;
            b = (pixel >> 16) & 0xff;

            labColor = rgbToLab(r, g, b);

            // test light green
            dEScore = dE76(
                labColor[0],labColor[1],labColor[2],
                89, -99, 79
            );
            if (dEScore < 70) {
                data32[y * canvasWidth + x] = 0
                    // (255 << 24) |
                    // (0 << 16) |
                    // (0 << 8) |
                    // Math.floor(Math.random() * (255 - 1 + 1) + 1);
                continue;
            }
            // test dark green
            dEScore = dE76(
                labColor[0], labColor[1], labColor[2],
                44, -40, 43
            );
            if (dEScore < 24) {
                data32[y * canvasWidth + x] =0
                    // (255 << 24) |
                    // (0 << 16) |
                    // (0 << 8) |
                    // Math.floor(Math.random() * (255 - 1 + 1) + 1);
                continue;
            }
            // test middle green
            dEScore = dE76(
                labColor[0], labColor[1], labColor[2],
                68, -43, 53
            );
            if (dEScore < 13) {
                data32[y * canvasWidth + x] =0
                    // (255 << 24) |
                    // (0 << 16) |
                    // (0 << 8) |
                    // Math.floor(Math.random() * (255 - 1 + 1) + 1);
                continue;
            }
        }
        frame.data.set(clampedArray);
        this.ctx2.putImageData(frame, 0, 0,);
    }

    
            // OPTION 2
            // let l = frame.data.length ;
    
            
            // for (let i = 0; i < frame.data.length; i+=4) {
            //     let r = frame.data[i];
            //     let g = frame.data[i + 1];
            //     let b = frame.data[i + 2];
            //     if(r > 0 && r < 100 && g > 100 && g < 300 && b < 50)
            //     frame.data[i + 3] = 0;
            // }
            // this.ctx2.putImageData(frame, 0, 0,);
            // return;


            // OPTION 3
            // const pixels = frame.data

            // for(let i=0; i<pixels.length; i+=4) {
            //     const [r, g, b] = [pixels[i], pixels[i+1], pixels[i+2]]
            //     const [h, s, l] = RGBToHSL(r, g, b)
    
            //     // if(h > 90 && h < 200) {
            //         if(h > 100 && h < 180) {
            //     pixels[i+3] = 0
            //     }
            // }
           
            //  this.ctx2.putImageData(frame, 0, 0,);
            // return;
    }
  };

//   OPTION 3
  function RGBToHSL(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r,g,b), 
        cmax = Math.max(r,g,b), 
        delta = cmax - cmin, 
        h = 0, s = 0, l = 0;
    if (delta == 0) h = 0;
      else if (cmax == r) h = ((g - b) / delta) % 6;
      else if (cmax == g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return [h, s, l]
  }


    // OPTION 2
  var pow = Math.pow;
  window.dE76 = function(a, b, c, d, e, f) {
      return Math.sqrt(pow(d - a, 2) + pow(e - b, 2) + pow(f - c, 2))
  };

  function rgbToLab(r, g, b) {
    var xyz = rgbToXyz(r, g, b);
    return xyzToLab(xyz[0], xyz[1], xyz[2]);
}

function rgbToXyz(r, g, b) {
    var _r = (r / 255);
    var _g = (g / 255);
    var _b = (b / 255);

    if (_r > 0.04045) {
        _r = Math.pow(((_r + 0.055) / 1.055), 2.4);
    }
    else {
        _r = _r / 12.92;
    }

    if (_g > 0.04045) {
        _g = Math.pow(((_g + 0.055) / 1.055), 2.4);
    }
    else {
        _g = _g / 12.92;
    }

    if (_b > 0.04045) {
        _b = Math.pow(((_b + 0.055) / 1.055), 2.4);
    }
    else {
        _b = _b / 12.92;
    }

    _r = _r * 100;
    _g = _g * 100;
    _b = _b * 100;

    X = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
    Y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
    Z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;

    return [X, Y, Z];
}

function xyzToLab(x, y, z) {
    var ref_X = 95.047;
    var ref_Y = 100.000;
    var ref_Z = 108.883;

    var _X = x / ref_X;
    var _Y = y / ref_Y;
    var _Z = z / ref_Z;

    if (_X > 0.008856) {
        _X = Math.pow(_X, (1 / 3));
    }
    else {
        _X = (7.787 * _X) + (16 / 116);
    }

    if (_Y > 0.008856) {
        _Y = Math.pow(_Y, (1 / 3));
    }
    else {
        _Y = (7.787 * _Y) + (16 / 116);
    }

    if (_Z > 0.008856) {
        _Z = Math.pow(_Z, (1 / 3));
    }
    else {
        _Z = (7.787 * _Z) + (16 / 116);
    }

    var CIE_L = (116 * _Y) - 16;
    var CIE_a = 500 * (_X - _Y);
    var CIE_b = 200 * (_Y - _Z);

    return [CIE_L, CIE_a, CIE_b];
}
