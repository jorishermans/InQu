export class Configuration {
  
  stopWords: Array<String>;
  
  constructor() {
    this.stopWords = []; 
  }
  
  // Configuration.fromList(this.stopWords);
  
  skipWord(word: string) {
    return this.stopWords.indexOf(word) !== -1;
  }
}