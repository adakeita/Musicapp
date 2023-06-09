import { allMusic } from "./music-list.js";

const REPEAT_MODES = {
	REPEAT: 'repeat',
	REPEAT_ONE: 'repeat_one',
	SHUFFLE: 'shuffle'
};

class MusicPlayer {
	constructor(wrapperSelector, musicList) {
		this.wrapper = document.querySelector(wrapperSelector);
		this.allMusic = musicList;
		this.musicIndex = Math.floor(Math.random() * this.allMusic.length) + 1;
		this.initElements();
		this.attachEventListeners();
		this.loadMusic(this.musicIndex);
		this.playingSong();
	}

	initElements() {
		const selectors = {
			musicImg: ".img-area img",
			musicName: ".song-details .name",
			musicArtist: ".song-details .artist",
			playPauseBtn: ".play-pause",
			prevBtn: "#prev",
			nextBtn: "#next",
			mainAudio: "#main-audio",
			progressArea: ".progress-area",
			progressBar: ".progress-bar",
			musicList: ".music-list",
			moreMusicBtn: "#more-music",
			closeMoreMusic: "#close",
			repeatBtn: "#repeat-plist",
			ulTag: "ul"
		};

		for (let key in selectors) {
			this[key] = this.wrapper.querySelector(selectors[key]);
		}
	}

	attachEventListeners() {
		this.playPauseBtn.addEventListener("click", () => {
			const isPaused = this.wrapper.classList.contains("paused");
			isPaused ? this.pauseMusic() : this.playMusic();
			this.playingSong();
		});

		this.prevBtn.addEventListener("click", () => this.prevMusic());
		this.nextBtn.addEventListener("click", () => this.nextMusic());
		this.progressArea.addEventListener("click", e => this.updateProgress(e));
		this.repeatBtn.addEventListener("click", () => this.toggleRepeatMode());
		this.mainAudio.addEventListener("timeupdate", e => this.updateTime(e));
		this.mainAudio.addEventListener("ended", () => this.handleSongEnded());
		this.moreMusicBtn.addEventListener("click", () => this.toggleMusicList());
		this.closeMoreMusic.addEventListener("click", () => this.toggleMusicList());

		this.ulTag.addEventListener("click", e => {
			const liTag = e.target.closest("li");
			if (liTag) {
				const index = Array.from(this.ulTag.children).indexOf(liTag);
				this.musicIndex = index + 1;
				this.loadMusic(this.musicIndex);
				this.playMusic();
				this.playingSong();
			}
		});

		const expandMoreIcon = this.wrapper.querySelector('.top-bar .material-icons');
		const musicImageArea = this.wrapper.querySelector('.img-area');

		expandMoreIcon.addEventListener("click", () => {
			this.wrapper.classList.toggle('minimized');
			const isMinimized = this.wrapper.classList.contains('minimized');
			expandMoreIcon.textContent = isMinimized ? 'expand_less' : 'expand_more';
		});
		
	}

	loadMusic(indexNumb) {
		const { name, artist, src } = this.allMusic[indexNumb - 1];
		this.musicName.textContent = name;
		this.musicArtist.textContent = artist;
		this.musicImg.src = `images/${src}.png`;
		this.mainAudio.src = `songs/${src}.mp3`;
	}

	playMusic() {
		this.wrapper.classList.add("paused");
		this.playPauseBtn.querySelector("i").textContent = "pause";
		this.mainAudio.play();
	}

	pauseMusic() {
		this.wrapper.classList.remove("paused");
		this.playPauseBtn.querySelector("i").textContent = "play_arrow";
		this.mainAudio.pause();
	}

	prevMusic() {
		this.musicIndex = (this.musicIndex > 1) ? this.musicIndex - 1 : this.allMusic.length;
		this.loadMusic(this.musicIndex);
		this.playMusic();
		this.playingSong();
	}
	nextMusic() {
		this.musicIndex = (this.musicIndex < this.allMusic.length) ? this.musicIndex + 1 : 1;
		this.loadMusic(this.musicIndex);
		this.playMusic();
		this.playingSong();
	}

	updateTime(e) {
		const currentTime = e.target.currentTime;
		const duration = e.target.duration;
		const progressWidth = (currentTime / duration) * 100;
		this.progressBar.style.width = `${progressWidth}%`;

		const musicCurrentTime = this.wrapper.querySelector(".current-time");
		const musicDuration = this.wrapper.querySelector(".max-duration");
		musicCurrentTime.textContent = this.formatTime(currentTime);

		this.mainAudio.addEventListener("loadeddata", () => {
			musicDuration.textContent = this.formatTime(this.mainAudio.duration);
		});
	}

	formatTime(time) {
		const minutes = Math.floor(time / 60);
		let seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
	}

	updateProgress(e) {
		const progressWidth = this.progressArea.clientWidth;
		const clickedOffsetX = e.offsetX;
		const songDuration = this.mainAudio.duration;
		this.mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
		this.playMusic();
		this.playingSong();
	}

	toggleRepeatMode() {
		const currentMode = this.repeatBtn.textContent;

		if (currentMode === REPEAT_MODES.REPEAT) {
			this.repeatBtn.textContent = REPEAT_MODES.REPEAT_ONE;
			this.repeatBtn.setAttribute("title", "Song looped");
		} else if (currentMode === REPEAT_MODES.REPEAT_ONE) {
			this.repeatBtn.textContent = REPEAT_MODES.SHUFFLE;
			this.repeatBtn.setAttribute("title", "Playback shuffled");
		} else if (currentMode === REPEAT_MODES.SHUFFLE) {
			this.repeatBtn.textContent = REPEAT_MODES.REPEAT;
			this.repeatBtn.setAttribute("title", "Playlist looped");
		}
	}

	handleSongEnded() {
		const currentMode = this.repeatBtn.textContent;

		if (currentMode === REPEAT_MODES.REPEAT) {
			this.nextMusic();
		} else if (currentMode === REPEAT_MODES.REPEAT_ONE) {
			this.mainAudio.currentTime = 0;
			this.loadMusic(this.musicIndex);
			this.playMusic();
		} else if (currentMode === REPEAT_MODES.SHUFFLE) {
			let randIndex;
			do {
				randIndex = Math.floor(Math.random() * this.allMusic.length) + 1;
			} while (this.musicIndex === randIndex);
			this.musicIndex = randIndex;
			this.loadMusic(this.musicIndex);
			this.playMusic();
			this.playingSong();
		}
	}

	toggleMusicList() {
		this.musicList.classList.toggle("show");
	}

	playingSong() {
		const allLiTag = this.ulTag.querySelectorAll("li");

		allLiTag.forEach((liTag, index) => {
			const audioTag = liTag.querySelector(".audio-duration");
			const audioDuration = audioTag.getAttribute("t-duration");

			liTag.classList.toggle("playing", liTag.getAttribute("li-index") == this.musicIndex);
			audioTag.textContent = liTag.classList.contains("playing") ? "Playing" : audioDuration;
		});
	}
}

// Initializing the Music Player
document.addEventListener("DOMContentLoaded", () => {
	new MusicPlayer(".wrapper", allMusic);
});
