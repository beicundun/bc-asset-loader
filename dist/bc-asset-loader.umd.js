/*!
* bc-asset-loader v0.0.0
* (c) 2026 beicun
* Released under the MIT License
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define([], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.BcAssetLoader = factory());
})(this, function() {
	//#region src/core/ImageLoader.ts
	var ImageLoader = class {
		url;
		loaded = false;
		constructor(options) {
			this.url = options.url;
		}
		/**
		* 画像をロードする。
		* 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
		*/
		load() {
			return new Promise((resolve) => {
				const img = new Image();
				img.onload = () => {
					this.loaded = true;
					resolve();
				};
				img.onerror = () => {
					console.error(`ImageLoader: Failed to load image "${this.url}".`);
					resolve();
				};
				img.src = this.url;
			});
		}
	};
	//#endregion
	//#region src/core/FontLoader.ts
	var FontLoader = class {
		url;
		family;
		weight;
		style;
		stretch;
		loaded = false;
		constructor(options) {
			this.url = options.url;
			this.family = options.family;
			this.weight = options.weight ?? "400";
			this.style = options.style ?? "normal";
			this.stretch = options.stretch ?? "normal";
		}
		/**
		* FontFace API を使ってフォントをロードし、document.fonts に登録する。
		* 登録後は CSS で font-family 名を指定するだけで使用できるようになる。
		* 失敗した場合はエラーをコンソールに出力し、処理を継続する。
		*/
		async load() {
			const fontFace = new FontFace(this.family, `url(${this.url})`, {
				weight: this.weight,
				style: this.style,
				stretch: this.stretch
			});
			try {
				await fontFace.load();
				document.fonts.add(fontFace);
				this.loaded = true;
			} catch (e) {
				console.error(`FontLoader: Failed to load font "${this.family}".`, e);
			}
		}
	};
	//#endregion
	//#region src/core/CdnFontLoader.ts
	var CdnFontLoader = class {
		url;
		families;
		loaded = false;
		constructor(options) {
			this.url = options.url;
			this.families = options.families;
		}
		/**
		* 外部Webフォントをロードする。
		* <link> タグを注入してスタイルシートを読み込み、
		* 指定したフォントファミリーが使用可能になるまで待つ。
		* 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
		*/
		load() {
			return new Promise((resolve) => {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = this.url;
				link.onload = async () => {
					const checks = this.families.flatMap(({ family, weights, style }) => {
						const styleStr = style === "italic" ? "italic" : "normal";
						return (weights && weights.length > 0 ? weights : ["400"]).map((weight) => document.fonts.load(`${styleStr} ${weight} 16px "${family}"`));
					});
					try {
						await Promise.all(checks);
						this.loaded = true;
					} catch (e) {
						console.error(`CdnFontLoader: Failed to verify fonts from "${this.url}".`, e);
					}
					resolve();
				};
				link.onerror = () => {
					console.error(`CdnFontLoader: Failed to load stylesheet "${this.url}".`);
					resolve();
				};
				document.head.appendChild(link);
			});
		}
	};
	//#endregion
	//#region src/core/VideoLoader.ts
	var VideoLoader = class {
		url;
		loaded = false;
		/** バッファ済みの割合（0〜1）。progress イベントのたびに更新される。 */
		bufferProgress = 0;
		constructor(options) {
			this.url = options.url;
		}
		/**
		* 動画をロードする。
		* progress イベントでバッファ済み割合をリアルタイムに onProgress へ通知し、
		* canplaythrough イベントを完了とみなして resolve する。
		* 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
		* @param onProgress - バッファ済み割合（0〜1）を受け取るコールバック
		*/
		load(onProgress) {
			return new Promise((resolve) => {
				const video = document.createElement("video");
				video.preload = "auto";
				video.src = this.url;
				video.addEventListener("progress", () => {
					if (video.duration && video.buffered.length > 0) {
						this.bufferProgress = video.buffered.end(video.buffered.length - 1) / video.duration;
						onProgress(this.bufferProgress);
					}
				});
				video.addEventListener("canplaythrough", () => {
					this.bufferProgress = 1;
					this.loaded = true;
					onProgress(1);
					resolve();
				});
				video.addEventListener("error", () => {
					console.error(`VideoLoader: Failed to load video "${this.url}".`);
					resolve();
				});
				video.load();
			});
		}
	};
	//#endregion
	//#region src/index.ts
	var BcAssetLoader = class {
		loaded = false;
		/**
		* ロード済みの量。image・font・extFont は完了ごとに +1、
		* video はバッファ済み割合（0〜1）をリアルタイムで加算するため小数になる場合がある。
		*/
		loadedAmount = 0;
		/**
		* アセットの総量。
		* extFont は URL 単位で 1 としてカウントする。
		*/
		totalAmount = 0;
		/** ロードの進捗（0〜1）。loadedAmount / totalAmount で計算される。 */
		progress = 0;
		onComplete;
		imageLoaders;
		fontLoaders;
		extFontLoaders;
		videoLoaders;
		constructor(options) {
			this.onComplete = options.onComplete ?? (() => {});
			this.imageLoaders = (options.image ?? []).map((o) => new ImageLoader(o));
			this.fontLoaders = (options.font ?? []).map((o) => new FontLoader(o));
			this.extFontLoaders = (options.extFont ?? []).map((o) => new CdnFontLoader(o));
			this.videoLoaders = (options.video ?? []).map((o) => new VideoLoader(o));
			this.totalAmount = this.imageLoaders.length + this.fontLoaders.length + this.extFontLoaders.length + this.videoLoaders.length;
		}
		async load() {
			if (this.totalAmount === 0) {
				this.loaded = true;
				this.progress = 1;
				this.onComplete();
				return;
			}
			const imagePromises = this.imageLoaders.map((loader) => loader.load().then(() => {
				this.loadedAmount += 1;
				this._updateProgress();
			}));
			const fontPromises = this.fontLoaders.map((loader) => loader.load().then(() => {
				this.loadedAmount += 1;
				this._updateProgress();
			}));
			const extFontPromises = this.extFontLoaders.map((loader) => loader.load().then(() => {
				this.loadedAmount += 1;
				this._updateProgress();
			}));
			const videoProgressValues = this.videoLoaders.map(() => 0);
			const videoPromises = this.videoLoaders.map((loader, index) => loader.load((progress) => {
				const prev = videoProgressValues[index];
				videoProgressValues[index] = progress;
				this.loadedAmount += progress - prev;
				this._updateProgress();
			}));
			await Promise.all([
				...imagePromises,
				...fontPromises,
				...extFontPromises,
				...videoPromises
			]);
			this.loaded = true;
			this.loadedAmount = this.totalAmount;
			this.progress = 1;
			this.onComplete();
		}
		_updateProgress() {
			this.progress = this.loadedAmount / this.totalAmount;
		}
	};
	//#endregion
	return BcAssetLoader;
});
