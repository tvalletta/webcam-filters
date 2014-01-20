/**
 * Created by validity on 1/17/14.
 */
function SlowExposure(cfg) {
  var _cfg = cfg || {};
  this.config = {
    frames: _cfg.frames || 2
  }

  /**
   *
   *
   * The buffer length is calculated thus:
   * width
   * height
   * 4  - one value for each: r g b a
   * 16 - one score for each 4 x 4 sector
   * 4  - one array spot for each Uint32 value
   *
   * @param video
   * @param mask
   */
  this.setup = function(video, mask) {
    this.video = video;
    this.mask = mask;

    mask.img = mask.ctx.createImageData(video.width, video.height);

    mask.history = [];
    for (var i = 0; i < this.config.frames; i++) {
      mask.history[i] = mask.ctx.createImageData(video.width, video.height);
    }
    this.current = 0;

    this.width = video.width;
    this.height = video.height;
//
//    var block = this.config.sector * this.config.sector;
//    var bufferLength = video.width * video.height * 4 / block * 4;
//    var buffer = new ArrayBuffer(bufferLength);
//
//    this.scores = new Uint32Array(buffer);
  }

  this.frame = function() {
    console.time('frame');
    var mask = this.mask;
    var ctx = mask.ctx;

    ctx.drawImage(this.video, 0, 0, this.width, this.height);
    mask.history[this.current] = ctx.getImageData(0, 0, this.width, this.height);

    for (var i = 0; i < (mask.img.data.length / 4); ++i) {
      for (var ii = 0; ii < 3; ii++) {
        var index = i * 4 + ii;
        var sum = 0;
        for (var iii = 0; iii < mask.history.length; iii++) {
          sum += mask.history[iii].data[index];
        }
        mask.img.data[index] = Math.round(sum / mask.history.length);
      }
      mask.img.data[i * 4 + 3] = 0xFF;
    }

    mask.ctx.putImageData(mask.img, 0, 0);
    this.current = (this.current + 1) % mask.history.length;
    console.timeEnd('frame');
  }

  this.teardown = function() {
    console.log('teardown');
  }
}

filterRegistry.addFilter('Slow Exposure', SlowExposure);