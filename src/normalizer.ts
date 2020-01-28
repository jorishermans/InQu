import { Stemmer } from "./stemming/stemmer";
import { PorterStemmer } from "./stemming/porter_stemmer";

export class Normalizer {
  
    static defaultStemmer:Stemmer = new PorterStemmer();
    
    constructor(public stemmer: Stemmer = Normalizer.defaultStemmer) {}
    
    normalize(word: string) {
      // first make it a lowercase word
      word = word.toLowerCase();
      // filter out punctuations & special chars
      word = word.replace(new RegExp('[^\w\s]'), "");
      
      // stem this word
      this.stemmer.addWord(word);
      this.stemmer.stem();
      word = this.stemmer.toString();
      this.stemmer.reset();
      
      return word;
    }
    
  }