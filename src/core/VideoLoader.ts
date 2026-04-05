interface VideoLoaderOptions {
  /** ロードする動画ファイルの URL */
  url: string;
}

class VideoLoader {
  url: string;
  loaded: boolean = false;
  /** バッファ済みの割合（0〜1）。progress イベントのたびに更新される。 */
  bufferProgress: number = 0;

  constructor(options: VideoLoaderOptions) {
    this.url = options.url;
  }

  /**
   * 動画をロードする。
   * progress イベントでバッファ済み割合をリアルタイムに onProgress へ通知し、
   * canplaythrough イベントを完了とみなして resolve する。
   * 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
   * @param onProgress - バッファ済み割合（0〜1）を受け取るコールバック
   */
  load(onProgress: (progress: number) => void): Promise<void> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      // preload='auto' でブラウザに積極的なバッファリングを指示する
      video.preload = 'auto';
      video.src = this.url;

      video.addEventListener('progress', () => {
        // buffered は複数の範囲を持つ場合があるため、最後の範囲の終端を使う
        if (video.duration && video.buffered.length > 0) {
          this.bufferProgress = video.buffered.end(video.buffered.length - 1) / video.duration;
          onProgress(this.bufferProgress);
        }
      });

      // canplaythrough：途中で止まらずに最後まで再生できると判断した時点で発火する
      video.addEventListener('canplaythrough', () => {
        this.bufferProgress = 1;
        this.loaded = true;
        onProgress(1);
        resolve();
      });

      video.addEventListener('error', () => {
        console.error(`VideoLoader: Failed to load video "${this.url}".`);
        resolve();
      });

      video.load();
    });
  }
}

export default VideoLoader;
