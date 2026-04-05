interface ImageLoaderOptions {
  /** ロードする画像ファイルの URL */
  url: string;
}

class ImageLoader {
  url: string;
  loaded: boolean = false;

  constructor(options: ImageLoaderOptions) {
    this.url = options.url;
  }

  /**
   * 画像をロードする。
   * 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
   */
  load(): Promise<void> {
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

      // src を設定することでブラウザがダウンロードを開始する
      img.src = this.url;
    });
  }
}

export default ImageLoader;
