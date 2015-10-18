SL2 File format
===========
Much kudos to openstreetmap.org project and their SL2 documentation page
http://wiki.openstreetmap.org/wiki/SL2


## Datatypes
type  | definition
------|-----------
byte  | UInt8
short | UInt16LE
int   | UInt32LE
float | FloatLE (32 bits IEEE 754 floating point number)
flags | UInt32BE


## Structure
###Header
10 byte header, then a series of blocks/frames as described below.

offset| bytes | type  | description
-----:|------:|-------|-----------------------------------------------------------------
    0 |     2 | short | filetype*
    2 |     8 | ?     | unknown / not verified


__filetype*__ 1 = slg, 2 = sl2


### Block/Frame
offset| bytes | type  | description
-----:|------:|-------|-----------------------------------------------------------------
    0 |    26 | ?     | unknown / not verified
   26 |     2 | short | blockSize*, size of current block in bytes
   28 |     2 | short | lastBlockSize, size of previous block (frameIndex -1) in bytes.
   30 |     2 | short | channel*, gets translated to channelName
   32 |     2 | short | packetSize, blockSize - header size...
   34 |     4 | int   | frameIndex. Starts at 0. Used ot match frames/block on different channels.
   38 |     4 | float | upperLimit
   42 |     4 | float | lowerLimit
   46 |     6 | ?     | unknown / not verified
   51 |     1 | byte  | frequency*
   52 |    10 | ?     | unknown / not verified
   62 |     4 | float | waterDepth in feet
   66 |     4 | float | keelDepth in feet
   70 |    28 | ?     | unknown / not verified
   98 |     4 | float | speedGps, Speed from gps in knots
  102 |     4 | float | temperature, in Celcius
  106 |     4 | int   | lowrance encoded longitude
  110 |     4 | int   | lowrance encoded latitude
  114 |     4 | float | speedWater, in knots. Should be actual water speed or GPS if sensor not present.
  118 |     4 | float | courseOverGround in radians,
  122 |     4 | float | altitude in feet
  126 |     4 | float | heading, in radians
  130 |     2 | flags | flags* bit coded.
  132 |     8 | ?     | unkown / not verified
  140 |     4 | int   | time1, Unknown resolution, unknown epoch.
  144 |     ? | ?     | unknown / not verified. Contains sounding/bounce data

__blockSize*__ The last block in the file doesn't follow this pattern and I don't know why.

__channel*__
* 0 = Primary (Tranditional Sonar)
* 1 = Secondary (Traditional Sonar)
* 2 = DSI (DownScan Imaging)
* 3 = Left (Sidescan)
* 4 = Right (Sidescan)
* 5 = Composite (Sidescan)
* Any other value is treated as invalid


__frequency*__
* 0 = 200 KHz
* 1 = 50 KHz
* 2 = 83 KHz
* 4 = 800 KHz
* 5 = 38 KHz
* 6 = 28 KHz
* 7 = 130 - 210 KHz
* 8 = 90 - 150 KHz
* 9 = 40 - 60 KHz
* 10 = 25 - 45 KHz
* Any other value is treaded like 200 KHz

__flags*__
offset from LSB (rightmost bit)

offset | meaning
------:|--------
    15 | trackValid
    14 | waterSpeedValid
    13 | ?
    12 | positionValid
    11 | ?
    10 | waterTempValid
     9 | gpsSpeedValid
     8 | ?
     7 | ?
     6 | ?
     5 | ?
     4 | ?
     3 | ?
     2 | ?
     1 | altitudeValid
     0 | headingValid