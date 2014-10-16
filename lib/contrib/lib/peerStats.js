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
var PublicToIp6 = require('./publicToIp6');

var peerStats = function(callback){
  if(typeof callback == 'undefined'){
    callback = console.log;
  }
  Cjdns.connectWithAdminInfo(function (cjdns) {
    var again = function (i) {
    var roster = [];
      cjdns.InterfaceController_peerStats(i, function (err, ret) {
        if (err) { throw err; }
          ret.peers.forEach(function (peer) {
            var stats = {
              key:PublicToIp6(peer['publicKey'])
              ,switchLabel:peer['switchLabel']
              ,bytesIn:peer['bytesIn']
              ,bytesOut:peer['bytesOut']
              ,state:peer['state']
              ,duplicates:peer['duplicates']
              ,receivedOutOfRange:peer['receivedOutOfRange']
              ,user:(typeof(peer.user) === 'string')?peer['user']:""
            };
          roster.push(stats);
          });
        if (typeof(ret.more) !== 'undefined') {
          again(i+1);
        } else {
          callback(roster);
          cjdns.disconnect();
        }
      });
    };
    again(0);
  });
};

module.exports = peerStats;
