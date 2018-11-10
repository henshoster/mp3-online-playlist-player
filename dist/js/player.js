"use strict";
var Player = /** @class */ (function () {
    function Player() {
        // --------------End of Singleton logic-------------------//
        this._id = "";
        this._name = "";
        this._image = "";
        this._songs = [];
        if (Player._instance) {
            throw new Error("Error: Instantiation failed: Use Player.getInstance() instead of new.");
        }
        Player._instance = this;
    }
    Player.getInstance = function () {
        return Player._instance;
    };
    Object.defineProperty(Player.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (id) {
            this._id = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "image", {
        get: function () {
            return this._image;
        },
        set: function (image) {
            this._image = image;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "songs", {
        get: function () {
            return this._songs;
        },
        set: function (songs) {
            this._songs = songs;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.play = function () {
        if (this.myAmazingPlayer.paused && !onplaying) {
            this.myAmazingPlayer.play();
            this.playerImg.addClass("rotate-center");
            this.playIcon.addClass("displayNone");
            this.pauseIcon.removeClass("displayNone");
        }
    };
    Player.prototype.pause = function () {
        if (!this.myAmazingPlayer.paused && !onpause) {
            this.myAmazingPlayer.pause();
            this.playerImg.removeClass("rotate-center");
            this.pauseIcon.addClass("displayNone");
            this.playIcon.removeClass("displayNone");
        }
    };
    Player.prototype.next = function (i) {
        if (i === void 0) { i = null; }
        $("li[id=song_" + this.nowPlaying + "]")
            .removeClass("font-weight-bold")
            .addClass("reduce-opacity");
        if (i != null) {
            this.nowPlaying = i;
        }
        else if (this.nowPlaying + 1 < this._songs.length) {
            this.nowPlaying++;
        }
        else {
            this.nowPlaying = 0;
        }
        this.pageTitle.html(this._name + " :: " + this._songs[this.nowPlaying].name);
        $("li[id=song_" + this.nowPlaying + "]")
            .addClass("font-weight-bold")
            .removeClass("reduce-opacity");
        this.myAmazingPlayer.src = this._songs[this.nowPlaying].url;
        this.myAmazingPlayer.load();
        this.myAmazingPlayer.play();
    };
    Player.prototype.buildPlayer = function () {
        var _this = this;
        this.pageTitle = $("title");
        this.nowPlaying = 0;
        this.pageTitle.html(this._name + " :: " + this._songs[this.nowPlaying].name);
        var songsNames = "";
        for (var i = 0; i < this._songs.length; i++) {
            var row = this._songs[i];
            if (i != this.nowPlaying) {
                songsNames += "<li class=\"reduce-opacity\" id='song_" + i + "' onclick='player.next(" + i + ")'>" + row.name + "</li>";
            }
            else {
                songsNames += "<li class=\"font-weight-bold \" id='song_" + i + "' onclick='player.next(" + i + ")'>" + row.name + "</li>";
            }
        }
        var playerTemplate = "\n    <div class=\"col-md-6 row my-3 border \">\n    <div class=\"col-4 align-self-center\">\n      <img id=\"playerImg\" src=\"" + this._image + "\" class=\"rounded-circle\">\n      <i id=\"playIcon\" class=\"fas fa-play-circle fa-2x\" onclick='player.play(event)'></i>\n      <i id=\"pauseIcon\" class=\"displayNone far fa-pause-circle fa-2x\" onclick='player.pause(event)'></i>\n    </div>\n    <div class=\"col-7 align-self-center\">\n      <audio src='" + this._songs[this.nowPlaying].url + "' id='myAmazingPlayer' controls onended=\"player.next()\">\n       \n      </audio>\n      <ol>\n        <span class=\"lead font-weight-bold\">Now Playing: " + this._songs[this.nowPlaying].name + "</span>\n        " + songsNames + "\n      </ol>\n    </div>\n    <div class=\"col-1 btns\">\n      <i class=\"far fa-times-circle fa-2x\" onclick=\"deletePlaylist(event," + this._id + ")\"></i>\n      <i class=\"fas fa-pen-square fa-2x\" onclick=\"loadStepOneModal(" + this._id + ")\"></i>  \n    </div>\n  </div>\n    ";
        var playerContainer = $("#playerContainer");
        playerContainer.fadeOut(0);
        playerContainer.children().remove();
        playerContainer.append(playerTemplate);
        playerContainer.fadeIn(1000).css("display", "flex");
        this.myAmazingPlayer = $("#myAmazingPlayer")[0];
        this.playerImg = $("#playerImg");
        this.playIcon = $("#playIcon");
        this.pauseIcon = $("#pauseIcon");
        this.myAmazingPlayer.onplaying = function () {
            _this.onplaying = true;
            _this.onpause = false;
            _this.playerImg.addClass("rotate-center");
            _this.playIcon.addClass("displayNone");
            _this.pauseIcon.removeClass("displayNone");
        };
        this.myAmazingPlayer.onpause = function () {
            _this.onplaying = false;
            _this.onpause = true;
            _this.playerImg.removeClass("rotate-center");
            _this.pauseIcon.addClass("displayNone");
            _this.playIcon.removeClass("displayNone");
        };
    };
    //---------Singleton logic---------------------//
    Player._instance = new Player();
    return Player;
}());
//# sourceMappingURL=player.js.map