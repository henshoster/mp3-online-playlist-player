// create new simple tooltop (for searchField) , @arg1 : Jquery element (as a container for tooltip),@arg2 : tooltip text to be presented
const tooltip = new Tooltip(
  $("#searchField"),
  "Please enter at least<br><u><b>2</b> Characters</u>"
);

// @const allPlayLists contains array of all playlists from DB
const allPlaylists: Playlist[] = [];
Playlist.getAllPlaylists(allPlaylists);

//@const player - create singletone player class to be used to play playlists
const player = Player.getInstance();

//filter playlists view on screen by search, changes on input event
//@param e : Input Event
function search(e: any) {
  // @const inputValue : user input on search field
  const inputValue: string = e.target.value;
  // @const filteredArr : all the playlists that are goin to match to user input on search field
  const filteredArr: Playlist[] = allPlaylists.filter(
    album => album.name.indexOf(inputValue) != -1
  );
  // @const allPlContainter - playlists container in html
  const allPlContainter = $("#albums_list");
  //search algoritm logic
  if (inputValue.length > 1) {
    if (filteredArr.length != 0) {
      tooltip.dispose();
      allPlContainter.children().remove();
      filteredArr.sort(function(a: any, b: any) {
        return a.name.indexOf(inputValue) - b.name.indexOf(inputValue);
      });
      filteredArr.forEach(function(album: Playlist) {
        album.drawPlaylist();
      });
    } else {
      allPlContainter.children().remove();
      tooltip.editTitle("<u><b>Not Found 404!</b></u>");
    }
  } else if (
    allPlContainter.children().length < allPlaylists.length &&
    inputValue.length < 1
  ) {
    tooltip.editTitle("Please enter at least<br><u><b>2</b> Characters</u>");
    allPlContainter.children().remove();
    allPlaylists.forEach(function(album: Playlist) {
      album.drawPlaylist();
    });
  } else {
    tooltip.editTitle("Please enter at least<br><u><b>2</b> Characters</u>");
  }
}

//return specific Playlist from allPlaylistst:Playlist[] filtered by id
function returnPlById(id: string): Playlist {
  const temp: Playlist[] = allPlaylists.filter(
    album => album.id.indexOf(id) != -1
  );
  return temp[0];
}

// build and loads player --- player is singletone
function loadPlayer(id: string) {
  //@var waitingForDataToUpdate : deferred ---> resolve when playlist have songs loaded
  let waitingForDataToUpdate = $.Deferred();
  //@const playlistToPlay : selected playlist to be played
  const playlistToPlay: Playlist = returnPlById(id);
  //if songs already loaded -> resolve , else -> get songs
  if (playlistToPlay.songs[0]) {
    waitingForDataToUpdate.resolve();
  } else {
    playlistToPlay.getSongs(waitingForDataToUpdate);
  }
  //when songs are loaded -> reinit player and build it.
  $.when(waitingForDataToUpdate).done(() => {
    player.id = id;
    player.image = playlistToPlay.image;
    player.name = playlistToPlay.name;
    player.songs = playlistToPlay.songs;
    player.buildPlayer();
    player.pause();
    $("#playerContainer").removeClass("displayNone");
    $("#albums_list").addClass("moreMargin");
    player.play();
  });
}

//loads step one modal
function loadStepOneModal(id: string) {
  const loadSteoTwoBtn = $("#loadStepTwoModalBtn");
  const stepOneModalTitle = $("#stepOneModalTitle");
  const stepTwoModalTitle = $("#stepTwoModalTitle");
  const finishAndSaveBtn = $("#finishAndSaveBtn");
  const playListToLoad: Playlist = returnPlById(id);
  //if edited playlist is playing right now->pause it
  if (player.id == id) {
    player.pause();
  }
  //!!!Reset Modal!!!
  $("#step_one_modal .modal-footer button:nth-child(2)").trigger("click");
  //if editing existing playlist --> load updated info and change view to edit mode.
  //else -> keep empty and change view to add new mode
  if (id != "0") {
    $("#playlist_name").val(playListToLoad.name);
    $("#playlist_url").val(playListToLoad.image);
    $("#step_one_modal_img").attr("src", playListToLoad.image);
    stepOneModalTitle.html("Edit Playlist");
    loadSteoTwoBtn.html("Update&Next");
    finishAndSaveBtn.html("Update&Save");
    stepTwoModalTitle.html("Edit Playlist Songs");
  } else {
    stepOneModalTitle.html("Add New Playlist");
    loadSteoTwoBtn.html("Next");
    finishAndSaveBtn.html("Finish&Save");
    stepTwoModalTitle.html("Add Playlist Songs");
  }
  loadSteoTwoBtn.attr("onclick", `loadStepTwoModal(event,${id})`);
  finishAndSaveBtn.attr("onclick", `validateModalStepTwo(event,${id})`);
  $("#step_one_modal").modal("show");
}
// before load step two modal validate if inputs from step one are not empty and valid
function loadStepTwoModal(e: MouseEvent, id: string) {
  const playlistName: JQuery<Element> = $("#playlist_name");
  const playlistUrl: JQuery<Element> = $("#playlist_url");
  //input validation
  if (playlistName.val() == "") {
    playlistName.focus();
  } else if (!checkUrlExtension(String(playlistUrl.val()), "img")) {
    playlistUrl.focus();
  }
  // else:  passed! validation:
  else {
    //@var waitingForDataToUpdate : deferred ---> resolve when playlist have songs loaded
    let waitingForDataToUpdate = $.Deferred();
    //if editing existing playlist --> update playlist and load songs if not already loaded,also update player with changes
    //else -> adding new playlist->continue
    if (id != "0") {
      const plToUpdate: Playlist = returnPlById(id);
      plToUpdate.name = String(playlistName.val());
      plToUpdate.image = String(playlistUrl.val());
      plToUpdate.updatePlaylist();
      plToUpdate.getSongs(waitingForDataToUpdate);
      if (player.id == id) {
        player.image = plToUpdate.image;
        player.name = plToUpdate.name;
        player.buildPlayer();
      }
    } else {
      waitingForDataToUpdate.resolve();
    }
    $.when(waitingForDataToUpdate).done(() => {
      // on edit:building existing songs row on step two modal container
      if (id != "0") {
        const songRows: JQuery<Element> = $("#step_two_modal .row");
        songRows.remove();
        const thisPlSongs = returnPlById(id).songs;
        for (
          let i = 0;
          i < (thisPlSongs.length > 3 ? thisPlSongs.length : 3);
          i++
        ) {
          const name = thisPlSongs[i] ? thisPlSongs[i].name : "";
          const url = thisPlSongs[i] ? thisPlSongs[i].url : "";
          addAnotherSong(name, url);
        }
      }
      $("#step_one_modal").modal("hide");
      $("#step_two_modal").modal("show");
    });
  }
}
// if passed validation : changes image preview on step one modal
// @this = #playlist_url input
$("#playlist_url").on("input", function() {
  const playlistUrl: string = String($(this).val());
  const imgPreviewSrc: JQuery = $("#step_one_modal_img");
  if (checkUrlExtension(playlistUrl, "img")) {
    $(this).removeClass("inputRedWarning");
    imgPreviewSrc.attr("src", playlistUrl);
  } else {
    $(this).addClass("inputRedWarning");
    imgPreviewSrc.attr("src", "images/preview.jpg");
  }
});

//step one modal reset fields btn (also reset step 2 fields)
function resetFields(e: any) {
  const playlistName: JQuery<Element> = $("#playlist_name");
  const playlistUrl: JQuery<Element> = $("#playlist_url");
  const imgPreviewSrc: JQuery<Element> = $("#step_one_modal_img");
  const stepTwoModal: JQuery<Element> = $("#step-two-modal-body");
  const songRows: JQuery<Element> = stepTwoModal.find(".row");
  songRows.remove();
  for (let numOfRowsSoFar = 0; numOfRowsSoFar < 3; numOfRowsSoFar++) {
    addAnotherSong();
  }
  playlistName.val("");
  playlistUrl.val("");
  playlistUrl.removeClass("inputRedWarning");
  imgPreviewSrc.attr("src", "images/preview.jpg");
}

//building new row template for step two modal
//@params: numOfRowsSoFar = counting rows,url?=url to inject to input,name?=name of playlist to inject
function buildNewRowTemplate(
  numOfRowsSoFar: number,
  url?: string,
  name?: string
): string {
  return `
  <div class="form-group row my-1">
    <label for="song_url_${numOfRowsSoFar}" class="col-sm-2 col-form-label col-form-label-sm">SongURL</label>
    <div class="col-sm-5">
      <input value="${
        url ? url : ""
      }" type="text" class="form-control form-control-sm" id="song_url_${numOfRowsSoFar}" oninput="validateExt(event)">
    </div>
    <label for="song_name_${numOfRowsSoFar}" class="col-sm-1 col-form-label col-form-label-sm">Name</label>
    <div class="col-sm-4">
      <input value="${
        name ? name : ""
      }" type="text" class="form-control form-control-sm" id="song_name_${numOfRowsSoFar}">
    </div>
  </div>
`;
}

//step two modal - > adds new row (to be able to add more songs)
function addAnotherSong(name?: string, url?: string) {
  const modalBody: JQuery<Element> = $("#step-two-modal-body");
  const numOfRowsSoFar: number = modalBody.children().length;
  const newRowTemplate: string = buildNewRowTemplate(numOfRowsSoFar, url, name);
  modalBody.append(newRowTemplate);
}
//validate mp3 ext on songsURL
function validateExt(e: any) {
  const thisSongInput: EventTarget = e.target;
  const thisSongInputVal: string = String($(thisSongInput).val());
  if (checkUrlExtension(thisSongInputVal, "mp3") || thisSongInputVal == "") {
    $(thisSongInput).removeClass("inputRedWarning");
  } else {
    $(thisSongInput).addClass("inputRedWarning");
  }
}
//validate modal step two to make sure each row was inserted as needed.
function validateModalStepTwo(e: MouseEvent, id: string) {
  let isValid: boolean = true;
  let isThereIsAtLeastOneRow = false;
  const inputs: JQuery<Element> = $("#step_two_modal input");
  for (let i: number = 0; i < inputs.length - 1; i = i + 2) {
    const songUrlInput: JQuery<Element> = $(inputs[i]);
    const nameInput: JQuery<Element> = $(inputs[i + 1]);
    const songUrlVal: string = String(songUrlInput.val());
    const nameVal: string = String(nameInput.val());
    if (songUrlVal != "" || nameVal != "") {
      isThereIsAtLeastOneRow = true;
    }
    if (songUrlVal != "" && !checkUrlExtension(songUrlVal, "mp3")) {
      songUrlInput.focus();
      isValid = false;
      break;
    } else if (songUrlVal == "" && nameVal != "") {
      songUrlInput.addClass("inputRedWarning");
      songUrlInput.focus();
      isValid = false;
      break;
    } else if (songUrlVal != "" && nameVal == "") {
      nameInput.addClass("inputRedWarning");
      nameInput.on("input", function(this: Element) {
        $(this).removeClass("inputRedWarning");
      });
      nameInput.focus();
      isValid = false;
      break;
    }
  }
  if (isValid && isThereIsAtLeastOneRow) {
    $("#step_two_modal").modal("hide");
    createNewPlaylistOrUpdateExistingPlaylist(id);
    $("#step_one_modal .modal-footer button:nth-child(2)").trigger("click");
  } else if (!isThereIsAtLeastOneRow) {
    $(inputs[0]).focus();
  }
}

// creates new playlist, or update songs of existing one
function createNewPlaylistOrUpdateExistingPlaylist(id: string) {
  const rowsOfSongs: JQuery<HTMLElement> = $("#step_two_modal .row");
  const songs: Song[] = [];
  rowsOfSongs.each(function() {
    const inputs = $(this).find("input");
    if ($(inputs[0]).val() != "") {
      songs.push({
        name: String($(inputs[1]).val()),
        url: String($(inputs[0]).val())
      });
    }
  });
  if (id != "0") {
    const plToUpdate = returnPlById(id);
    plToUpdate.songs = songs;
    plToUpdate.updateSongs();
    if (player.id == id) {
      player.songs = plToUpdate.songs;
      player.buildPlayer();
    }
  } else {
    const name: string = String($("#playlist_name").val());
    const image: string = String($("#playlist_url").val());
    const newPlaylist = new Playlist(id, name, image, songs);
    Playlist.createNewPlaylist(newPlaylist, allPlaylists);
  }
}
//loads delete modal with correct information
function deletePlaylist(event: MouseEvent, id: string) {
  const deleteModal = $("#delete_modal");
  deleteModal
    .find("#deleteBtn")
    .attr("onclick", `Playlist.deletePlaylist(event,${id})`);
  const plId = deleteModal.find("#playlist_id_for_modal_body");
  plId.html(returnPlById(id).name);
  deleteModal.modal("show");
}
