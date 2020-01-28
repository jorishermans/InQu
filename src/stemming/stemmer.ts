export interface Stemmer {
    stem(): void;
    add(ch: any): void;
    addWord(w: string): void;
    reset(): void;
}