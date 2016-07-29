
function Flags(number) {
  if (!(this instanceof Flags)) {
    return new Flags(number);
  }

  this.trackValid = false;
  this.waterSpeedValid = false;
  this.positionValid = false;
  this.waterTempValid = false;
  this.gpsSpeedValid = false;
  this.altitudeValid = false;
  this.headingValid = false;

  if (typeof number === 'number') {
    parseFlags(this, number);
  }
}

function parseFlags(f, number) {
  //"1011111000000010"
  //first, low byte
  f.trackValid = (number & 0x0080) > 0;
  f.waterSpeedValid = (number & 0x0040) > 0;
  f.positionValid = (number & 0x0010) > 0;
  f.waterTempValid = (number & 0x0004) > 0;
  f.gpsSpeedValid = (number & 0x0002) > 0;

  //second, high byte
  f.altitudeValid = (number & 0x0200) > 0;
  f.headingValid = (number & 0x0100) > 0;
  return f;
}

module.exports = Flags;
