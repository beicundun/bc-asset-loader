interface CdnFontFamily {
  /** フォントファミリー名 */
  family: string;
  /** ロード完了の確認対象にするウェイトのリスト（省略時は ['400']） */
  weights?: string[];
  /** フォントスタイル（省略時は 'normal'） */
  style?: 'normal' | 'italic';
}

interface CdnFontLoaderOptions {
  /** Google Fonts などの CDN が提供するスタイルシートの URL */
  url: string;
  /** ロード完了の確認に使うフォントファミリーのリスト */
  families: CdnFontFamily[];
}

class CdnFontLoader {
  url: string;
  families: CdnFontFamily[];
  loaded: boolean = false;

  constructor(options: CdnFontLoaderOptions) {
    this.url = options.url;
    this.families = options.families;
  }

  /**
   * 外部Webフォントをロードする。
   * <link> タグを注入してスタイルシートを読み込み、
   * 指定したフォントファミリーが使用可能になるまで待つ。
   * 失敗した場合はエラーをコンソールに出力し、resolve する（後続のロードを止めない）。
   */
  load(): Promise<void> {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = this.url;

      link.onload = async () => {
        // families に指定された各フォントについて、ウェイトごとにロード確認を行う
        // document.fonts.load() はフォントが使用可能になるまで待つ
        // サイズ（16px）は確認のために必要だが、値は何でもよい
        const checks = this.families.flatMap(({ family, weights, style }) => {
          const styleStr = style === 'italic' ? 'italic' : 'normal';
          const targetWeights = weights && weights.length > 0 ? weights : ['400'];
          return targetWeights.map((weight) =>
            document.fonts.load(`${styleStr} ${weight} 16px "${family}"`),
          );
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
}

export default CdnFontLoader;
