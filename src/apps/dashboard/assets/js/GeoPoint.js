/*
 * This file is part of FamilyDAM Project.
 *
 *     The FamilyDAM Project is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     The FamilyDAM Project is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with the FamilyDAM Project.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var GeoPoint = {


    CHAR_DEG: "\u00B0",
    CHAR_MIN: "\u0027",
    CHAR_SEC: "\u0022",
    CHAR_SEP: "\u0020",

    MAX_LON: 180,
    MAX_LAT: 90,

    // decimal
    lonDec: NaN,
    latDec: NaN,

    // degrees
    lonDeg: NaN,
    latDeg: NaN,



    getLonDec: function (degree_) {
        return this.deg2dec(degree_, this.MAX_LON);
    },

    getLatDec: function (degree_) {
        return this.deg2dec(degree_, this.MAX_LAT);
    },

    getLonDeg: function () {
        return this.lonDeg;
    },

    getLatDeg: function () {
        return this.latDeg;
    },


    create : function (lon, lat)
    {

        switch (typeof(lon))
        {

            case 'number':

                this.lonDeg = this.dec2deg(lon, this.MAX_LON);
                this.lonDec = lon;

                break;

            case 'string':

                if (this.decode(lon))
                {
                    this.lonDeg = lon;
                }

                this.lonDec = this.deg2dec(lon, this.MAX_LON);

                break;
        }

        switch (typeof(lat))
        {

            case 'number':

                this.latDeg = this.dec2deg(lat, this.MAX_LAT);
                this.latDec = lat;

                break;

            case 'string':

                if (this.decode(lat))
                {
                    this.latDeg = lat;
                }

                this.latDec = this.deg2dec(lat, this.MAX_LAT);

                break;

        }

        return this;
    },



    dec2deg: function (value, max) {

        var sign = value < 0 ? -1 : 1;

        var abs = Math.abs(Math.round(value * 1000000));

        if (abs > (max * 1000000))
        {
            return NaN;
        }

        var dec = abs % 1000000 / 1000000;
        var deg = Math.floor(abs / 1000000) * sign;
        var min = Math.floor(dec * 60);
        var sec = (dec - min / 60) * 3600;

        var result = "";

        result += deg;
        result += this.CHAR_DEG;
        result += this.CHAR_SEP;
        result += min;
        result += this.CHAR_MIN;
        result += this.CHAR_SEP;
        result += sec.toFixed(2);
        result += this.CHAR_SEC;

        return result;

    },

    deg2dec: function (value) {

        var matches = this.decode(value);

        if (!matches)
        {
            return NaN;
        }

        var deg = parseFloat(matches[1]);
        var min = parseFloat(matches[2]);
        var sec = parseFloat(matches[3]);

        if (isNaN(deg) || isNaN(min) || isNaN(sec))
        {
            return NaN;
        }

        return deg + (min / 60.0) + (sec / 3600);
    },

    decode: function (value) {
        var pattern = "";

        // deg
        pattern += "(-?\\d+)";
        pattern += this.CHAR_DEG;
        pattern += "\\s*";

        // min
        pattern += "(\\d+)";
        pattern += this.CHAR_MIN;
        pattern += "\\s*";

        // sec
        pattern += "(\\d+\\.\\d+)";
        pattern += this.CHAR_SEC;

        return value.match(new RegExp(pattern));
    }

};

module.exports = GeoPoint;