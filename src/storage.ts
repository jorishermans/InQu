export interface IQStorage {
    getItem<T>(key: string, defaultValue?: T): Promise<T>;
    setItem(key: string, value: any): Promise<void>;
}