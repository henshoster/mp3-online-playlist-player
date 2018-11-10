"use strict";
/* class Playlist
@params:
  @private _id: string = playlist id
  @private _name: string = playlist name
  @private _image: string = playlist url to image
  @private _songs: Song[]= array of songs for the playlist
*/
var Playlist = /** @class */ (function () {
    function Playlist(id, name, image, songs) {
        if (songs === void 0) { songs = []; }
        this._id = id;
        this._name = name;
        this._image = image;
        this._songs = songs;
    }
    Object.defineProperty(Playlist.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (id) {
            this._id = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Playlist.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Playlist.prototype, "image", {
        get: function () {
            return this._image;
        },
        set: function (image) {
            this._image = image;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Playlist.prototype, "songs", {
        get: function () {
            return this._songs;
        },
        set: function (songs) {
            this._songs = songs;
        },
        enumerable: true,
        configurable: true
    });
    Playlist.getAllPlaylists = function (allPlaylists) {
        $.ajax({
            method: "GET",
            url: "http://localhost/playlist/api/playlist",
            success: function (response) {
                response.data.forEach(function (row) {
                    var lastPl = new Playlist(row.id, row.name, row.image);
                    lastPl.drawPlaylist();
                    allPlaylists.push(lastPl);
                });
            },
            error: function (error) {
                console.log(error);
            }
        });
    };
    Playlist.createNewPlaylist = function (playlist, allPlaylists) {
        $.ajax({
            method: "POST",
            url: "http://localhost/playlist/api/playlist",
            data: {
                name: playlist.name,
                image: playlist.image,
                songs: playlist.songs
            },
            success: function (response) {
                playlist.id = response.data.id;
                playlist.drawPlaylist();
                allPlaylists.push(playlist);
            },
            error: function (error) {
                console.error(error);
            }
        });
    };
    Playlist.deletePlaylist = function (event, id) {
        $.ajax({
            method: "DELETE",
            url: "http://localhost/playlist/api/playlist/" + id,
            success: function (response) {
                if (response.success == true) {
                    var filteredRemovedArr = allPlaylists.filter(function (album) { return album.id != id; });
                    allPlaylists = filteredRemovedArr;
                    $("div[id=" + id + "]").remove();
                    $("#delete_modal").modal("hide");
                    if (player.id == id) {
                        player.pause();
                        $("#albums_list").removeClass("moreMargin");
                        $("#playerContainer").css("display", "none");
                        $("title").html("MyPlayer");
                    }
                }
            },
            error: function (error) {
                console.error(error);
            }
        });
    };
    Playlist.prototype.updatePlaylist = function () {
        var _this = this;
        $.ajax({
            method: "POST",
            url: "http://localhost/playlist/api/playlist/" + this._id,
            data: {
                name: this._name,
                image: this._image
            },
            success: function (response) {
                if (response.success == true) {
                    var title = $("#albums_list #" + _this._id + " h3");
                    var img = $("#albums_list #" + _this._id + " img");
                    title.html(_this._name);
                    img.attr("src", _this._image);
                    new CircleType(title[0]).radius(220);
                }
            },
            error: function (error) {
                console.error(error);
            }
        });
    };
    Playlist.prototype.updateSongs = function () {
        $.ajax({
            method: "POST",
            url: "http://localhost/playlist/api/playlist/" + this._id + "/songs",
            data: {
                songs: this._songs
            },
            success: function (response) {
                if (response.success == true) {
                }
            },
            error: function (error) {
                console.error(error);
            }
        });
    };
    Playlist.prototype.getSongs = function (waitingForDataToUpdate) {
        var _this = this;
        $.ajax({
            method: "GET",
            url: "http://localhost/playlist/api/playlist/" + this._id + "/songs",
            success: function (response) {
                if (response.success == true) {
                    _this._songs = response.data.songs;
                    waitingForDataToUpdate.resolve();
                }
            },
            error: function (error) {
                console.error(error);
            }
        });
    };
    Playlist.prototype.drawPlaylist = function () {
        var albumsContainer = $("#albums_list");
        var template = "\n    <div class='col-md-3 album-col my-3' id='" + this._id + "'>\n      <h3>" + this._name + "</h3>\n      <img src=\"" + this._image + "\">\n      <i class=\"far fa-times-circle fa-2x\" onclick=\"deletePlaylist(event," + this._id + ")\"></i>\n      <i class=\"fas fa-pen-square fa-2x\" onclick=\"loadStepOneModal(" + this._id + ")\"></i>\n      <i class=\"fas fa-play-circle fa-3x\" onclick=\"loadPlayer(" + this._id + ")\"></i>\n    </div>\n    ";
        albumsContainer.append(template);
        var thisDivAppended = $("div[id=" + this._id + "] h3")[0];
        new CircleType(thisDivAppended).radius(220);
    };
    return Playlist;
}());
//# sourceMappingURL=playlist.js.map