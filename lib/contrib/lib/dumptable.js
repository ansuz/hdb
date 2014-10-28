#!/usr/bin/env node
/* vim: set expandtab ts=4 sw=4: */
/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Cjdns = require('./cjdnsadmin');

var dumptable = function(callback){
  Cjdns.connectWithAdminInfo(function (cjdns) {
    var roster = [];
    callback=callback||console.log;
    var again = function (i) {
      cjdns.NodeStore_dumpTable(i, function (err, table) {
        if (err)console.log(err);
        var row = table.routingTable;
        row.index = i;
        roster.push(row);
        if(table.more){
          i+=1;
          again(i);
        }else{
          // you have an array of arrays
          // what do the nested arrays represent? a row?
          // <@cjd> nah, that's just "what fits in a udp packey"
          // so let's flatten it out
          callback(roster.reduce(function(a,b){
            return a.concat(b);
          }));
          cjdns.disconnect();
        }
      });
    };
    again(0);
  });
};

module.exports = dumptable;
