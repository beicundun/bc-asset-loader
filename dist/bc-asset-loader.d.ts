declare class BcAssetLoader {
    loaded: boolean;
    /**
     * ロード済みの量。image・font・extFont は完了ごとに +1、
     * video はバッファ済み割合（0〜1）をリアルタイムで加算するため小数になる場合がある。
     */
    loadedAmount: number;
    /**
     * アセットの総量。
     * extFont は URL 単位で 1 としてカウントする。
     */
    totalAmount: number;
    /** ロードの進捗（0〜1）。loadedAmount / totalAmount で計算される。 */
    progress: number;
    onComplete: () => void;
    private imageLoaders;
    private fontLoaders;
    private extFontLoaders;
    private videoLoaders;
    constructor(options: BcAssetLoaderOptions);
    load(): Promise<void>;
    private _updateProgress;
}
export default BcAssetLoader;

declare interface BcAssetLoaderOptions {
    image?: {
        url: string;
    }[];
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
    video?: {
        url: string;
    }[];
    /** 全アセットのロード完了時に呼ばれるコールバック */
    onComplete?: () => void;
}

export { }
