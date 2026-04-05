interface FontLoaderOptions {
  /** ロードするフォントファイルの URL */
  url: string;
  /** フォントファミリー名（CSS の font-family に使う名前） */
  family: string;
  /** フォントウェイト（省略時は '400'） */
  weight?: string;
  /** フォントスタイル（省略時は 'normal'） */
  style?: string;
  /** フォントの幅（省略時は 'normal'） */
  stretch?: string;
}

class FontLoader {
  url: string;
  family: string;
  weight: string;
  style: string;
  stretch: string;
  loaded: boolean = false;

  constructor(options: FontLoaderOptions) {
    this.url = options.url;
    this.family = options.family;
    this.weight = options.weight ?? '400';
    this.style = options.style ?? 'normal';
    this.stretch = options.stretch ?? 'normal';
  }

  /**
   * FontFace API を使ってフォントをロードし、document.fonts に登録する。
   * 登録後は CSS で font-family 名を指定するだけで使用できるようになる。
   * 失敗した場合はエラーをコンソールに出力し、処理を継続する。
   */
  async load(): Promise<void> {
    const fontFace = new FontFace(this.family, `url(${this.url})`, {
      weight: this.weight,
      style: this.style,
      stretch: this.stretch,
    });

    try {
      await fontFace.load();
      // ブラウザのフォントセットに登録することで CSS から参照できるようになる
      document.fonts.add(fontFace);
      this.loaded = true;
    } catch (e) {
      console.error(`FontLoader: Failed to load font "${this.family}".`, e);
    }
  }
}

export default FontLoader;
