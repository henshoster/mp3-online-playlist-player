/* class Playlist
@params:
  @private _id: string = playlist id
  @private _name: string = playlist name
  @private _image: string = playlist url to image
  @private _songs: Song[]= array of songs for the playlist
*/
class Playlist {
  private _id: string;
  private _name: string;
  private _image: string;
  private _songs: Song[];

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

  constructor(id: string, name: string, image: string, songs: Song[] = []) {
    this._id = id;
    this._name = name;
    this._image = image;
    this._songs = songs;
  }

  static getAllPlaylists(allPlaylists: Playlist[]) {
    $.ajax({
      method: "GET",
      url: `http://localhost/playlist/api/playlist`,
      success: function(response) {
        response.data.forEach(function(row: any) {
          const lastPl: Playlist = new Playlist(row.id, row.name, row.image);
          lastPl.drawPlaylist();
          allPlaylists.push(lastPl);
        });
      },
      error: function(error) {
        console.log(error);
      }
    });
  }

  static createNewPlaylist(playlist: Playlist, allPlaylists: Playlist[]) {
    $.ajax({
      method: "POST",
      url: `http://localhost/playlist/api/playlist`,
      data: {
        name: playlist.name,
        image: playlist.image,
        songs: playlist.songs
      },
      success: function(response) {
        playlist.id = response.data.id;
        playlist.drawPlaylist();
        allPlaylists.push(playlist);
      },
      error: function(error) {
        console.error(error);
      }
    });
  }
  static deletePlaylist(event: MouseEvent, id: string) {
    $.ajax({
      method: "DELETE",
      url: `http://localhost/playlist/api/playlist/${id}`,
      success: function(response) {
        if (response.success == true) {
          const filteredRemovedArr: Playlist[] = allPlaylists.filter(
            album => album.id != id
          );
          allPlaylists = filteredRemovedArr;
          $(`div[id=${id}]`).remove();
          $("#delete_modal").modal("hide");
          if (player.id == id) {
            player.pause();
            $("#albums_list").removeClass("moreMargin");
            $("#playerContainer").css("display", "none");
            $("title").html("MyPlayer");
          }
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  }

  updatePlaylist() {
    $.ajax({
      method: "POST",
      url: `http://localhost/playlist/api/playlist/${this._id}`,
      data: {
        name: this._name,
        image: this._image
      },
      success: response => {
        if (response.success == true) {
          const title = $(`#albums_list #${this._id} h3`);
          const img = $(`#albums_list #${this._id} img`);
          title.html(this._name);
          img.attr("src", this._image);
          new CircleType(title[0]).radius(220);
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  }
  updateSongs() {
    $.ajax({
      method: "POST",
      url: `http://localhost/playlist/api/playlist/${this._id}/songs`,
      data: {
        songs: this._songs
      },
      success: response => {
        if (response.success == true) {
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  }
  getSongs(waitingForDataToUpdate: JQuery.Deferred<any>) {
    $.ajax({
      method: "GET",
      url: `http://localhost/playlist/api/playlist/${this._id}/songs`,
      success: response => {
        if (response.success == true) {
          this._songs = response.data.songs;
          waitingForDataToUpdate.resolve();
        }
      },
      error: function(error) {
        console.error(error);
      }
    });
  }
  drawPlaylist() {
    const albumsContainer: JQuery<HTMLElement> = $("#albums_list");
    const template: string = `
    <div class='col-md-3 album-col my-3' id='${this._id}'>
      <h3>${this._name}</h3>
      <img src="${this._image}">
      <i class="far fa-times-circle fa-2x" onclick="deletePlaylist(event,${
        this._id
      })"></i>
      <i class="fas fa-pen-square fa-2x" onclick="loadStepOneModal(${
        this._id
      })"></i>
      <i class="fas fa-play-circle fa-3x" onclick="loadPlayer(${this._id})"></i>
    </div>
    `;
    albumsContainer.append(template);
    const thisDivAppended = $(`div[id=${this._id}] h3`)[0];
    new CircleType(thisDivAppended).radius(170);
  }
}
