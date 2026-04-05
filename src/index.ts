import ImageLoader from './core/ImageLoader';
import FontLoader from './core/FontLoader';
import CdnFontLoader from './core/CdnFontLoader';
import VideoLoader from './core/VideoLoader';

interface BcAssetLoaderOptions {
  image?: { url: string }[];
  font?: {
    url: string;
    family: string;
    weight?: string;
    style?: string;
    stretch?: string;
  }[];
  extFont?: {
    url: string;
    /** ロード完了の確認に使うフォントファミリーのリスト */
    families: {
      family: string;
      weights?: string[];
      style?: 'normal' | 'italic';
    }[];
  }[];
  video?: { url: string }[];
  /** 全アセットのロード完了時に呼ばれるコールバック */
  onComplete?: () => void;
}

class BcAssetLoader {
  loaded: boolean = false;

  /**
   * ロード済みの量。image・font・extFont は完了ごとに +1、
   * video はバッファ済み割合（0〜1）をリアルタイムで加算するため小数になる場合がある。
   */
  loadedAmount: number = 0;

  /**
   * アセットの総量。
   * extFont は URL 単位で 1 としてカウントする。
   */
  totalAmount: number = 0;

  /** ロードの進捗（0〜1）。loadedAmount / totalAmount で計算される。 */
  progress: number = 0;

  onComplete: () => void;

  private imageLoaders: ImageLoader[];
  private fontLoaders: FontLoader[];
  private extFontLoaders: CdnFontLoader[];
  private videoLoaders: VideoLoader[];

  constructor(options: BcAssetLoaderOptions) {
    this.onComplete = options.onComplete ?? (() => {});

    // 各オプションを対応するローダーインスタンスの配列に変換する
    this.imageLoaders = (options.image ?? []).map((o) => new ImageLoader(o));
    this.fontLoaders = (options.font ?? []).map((o) => new FontLoader(o));
    this.extFontLoaders = (options.extFont ?? []).map((o) => new CdnFontLoader(o));
    this.videoLoaders = (options.video ?? []).map((o) => new VideoLoader(o));

    this.totalAmount =
      this.imageLoaders.length +
      this.fontLoaders.length +
      this.extFontLoaders.length +
      this.videoLoaders.length;
  }

  async load(): Promise<void> {
    // アセットが1件もない場合は即座に完了とみなす
    if (this.totalAmount === 0) {
      this.loaded = true;
      this.progress = 1;
      this.onComplete();
      return;
    }

    const imagePromises = this.imageLoaders.map((loader) =>
      loader.load().then(() => {
        this.loadedAmount += 1;
        this._updateProgress();
      }),
    );

    const fontPromises = this.fontLoaders.map((loader) =>
      loader.load().then(() => {
        this.loadedAmount += 1;
        this._updateProgress();
      }),
    );

    const extFontPromises = this.extFontLoaders.map((loader) =>
      loader.load().then(() => {
        this.loadedAmount += 1;
        this._updateProgress();
      }),
    );

    // video は progress イベントで bufferProgress が更新されるたびに loadedAmount へ差分を加算する
    // 前回値との差分（progress - prev）を使うことで二重加算を防ぐ
    const videoProgressValues = this.videoLoaders.map(() => 0);
    const videoPromises = this.videoLoaders.map((loader, index) =>
      loader.load((progress) => {
        const prev = videoProgressValues[index];
        videoProgressValues[index] = progress;
        this.loadedAmount += progress - prev;
        this._updateProgress();
      }),
    );

    // 全アセットを並列でロードし、すべての完了を待つ
    await Promise.all([...imagePromises, ...fontPromises, ...extFontPromises, ...videoPromises]);

    this.loaded = true;
    this.loadedAmount = this.totalAmount;
    this.progress = 1;
    this.onComplete();
  }

  private _updateProgress(): void {
    this.progress = this.loadedAmount / this.totalAmount;
  }
}

export default BcAssetLoader;
