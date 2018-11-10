class Player {
  //---------Singleton logic---------------------//
  private static _instance: Player = new Player();

  constructor() {
    if (Player._instance) {
      throw new Error(
        "Error: Instantiation failed: Use Player.getInstance() instead of new."
      );
    }

    Player._instance = this;
  }

  public static getInstance(): Player {
    return Player._instance;
  }

  // --------------End of Singleton logic-------------------//
  private _id: string = "";
  private _name: string = "";
  private _image: string = "";
  private _songs: Song[] = [];
  private pageTitle: any;
  private myAmazingPlayer: any;
  private playerImg: any;
  private playIcon: any;
  private pauseIcon: any;
  private nowPlaying: any;
  private onplaying: any;
  private onpause: any;

  set id(id: string) {
    this._id = id;
  }
  set name(name: string) {
    this._name = name;
  }
  set image(image: string) {
    this._image = image;
  }
  set songs(songs: Song[]) {
    this._songs = songs;
  }
  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }

  get image(): string {
    return this._image;
  }

  get songs(): Song[] {
    return this._songs;
  }
  play() {
    if (this.myAmazingPlayer.paused && !onplaying) {
      this.myAmazingPlayer.play();
      this.playerImg.addClass("rotate-center");
      this.playIcon.addClass("displayNone");
      this.pauseIcon.removeClass("displayNone");
    }
  }
  pause() {
    if (!this.myAmazingPlayer.paused && !onpause) {
      this.myAmazingPlayer.pause();
      this.playerImg.removeClass("rotate-center");
      this.pauseIcon.addClass("displayNone");
      this.playIcon.removeClass("displayNone");
    }
  }
  next(i = null) {
    $(`li[id=song_${this.nowPlaying}]`)
      .removeClass("font-weight-bold")
      .addClass("reduce-opacity");
    if (i != null) {
      this.nowPlaying = i;
    } else if (this.nowPlaying + 1 < this._songs.length) {
      this.nowPlaying++;
    } else {
      this.nowPlaying = 0;
    }
    this.pageTitle.html(
      `${this._name} :: ${this._songs[this.nowPlaying].name}`
    );
    $(`li[id=song_${this.nowPlaying}]`)
      .addClass("font-weight-bold")
      .removeClass("reduce-opacity");
    this.myAmazingPlayer.src = this._songs[this.nowPlaying].url;
    this.myAmazingPlayer.load();
    this.myAmazingPlayer.play();
  }
  buildPlayer() {
    this.pageTitle = $("title");
    this.nowPlaying = 0;
    this.pageTitle.html(
      `${this._name} :: ${this._songs[this.nowPlaying].name}`
    );
    let songsNames: string = "";
    for (let i = 0; i < this._songs.length; i++) {
      const row = this._songs[i];
      if (i != this.nowPlaying) {
        songsNames += `<li class="reduce-opacity" id='song_${i}' onclick='player.next(${i})'>${
          row.name
        }</li>`;
      } else {
        songsNames += `<li class="font-weight-bold " id='song_${i}' onclick='player.next(${i})'>${
          row.name
        }</li>`;
      }
    }
    const playerTemplate = `
    <div class="col-md-6 row my-3 border ">
    <div class="col-4 align-self-center">
      <img id="playerImg" src="${this._image}" class="rounded-circle">
      <i id="playIcon" class="fas fa-play-circle fa-2x" onclick='player.play(event)'></i>
      <i id="pauseIcon" class="displayNone far fa-pause-circle fa-2x" onclick='player.pause(event)'></i>
    </div>
    <div class="col-7 align-self-center">
      <audio src='${
        this._songs[this.nowPlaying].url
      }' id='myAmazingPlayer' controls onended="player.next()">
       
      </audio>
      <ol>
        <span class="lead font-weight-bold">Now Playing: ${
          this._songs[this.nowPlaying].name
        }</span>
        ${songsNames}
      </ol>
    </div>
    <div class="col-1 btns">
      <i class="far fa-times-circle fa-2x" onclick="deletePlaylist(event,${
        this._id
      })"></i>
      <i class="fas fa-pen-square fa-2x" onclick="loadStepOneModal(${
        this._id
      })"></i>  
    </div>
  </div>
    `;
    const playerContainer = $("#playerContainer");
    playerContainer.fadeOut(0);
    playerContainer.children().remove();
    playerContainer.append(playerTemplate);
    playerContainer.fadeIn(1000).css("display", "flex");

    this.myAmazingPlayer = $("#myAmazingPlayer")[0];
    this.playerImg = $("#playerImg");
    this.playIcon = $("#playIcon");
    this.pauseIcon = $("#pauseIcon");
    this.myAmazingPlayer.onplaying = () => {
      this.onplaying = true;
      this.onpause = false;
      this.playerImg.addClass("rotate-center");
      this.playIcon.addClass("displayNone");
      this.pauseIcon.removeClass("displayNone");
    };
    this.myAmazingPlayer.onpause = () => {
      this.onplaying = false;
      this.onpause = true;
      this.playerImg.removeClass("rotate-center");
      this.pauseIcon.addClass("displayNone");
      this.playIcon.removeClass("displayNone");
    };
  }
}
