import { Normalizer } from './normalizer';
import { IQStorage } from "./storage";
import { Vector } from "./vector";
import { Bounty } from "./bounty";
import { Configuration } from "./configuration";

export interface IHash<T> {
    [details: string] : T;
} 

export class InQu {
  
    static LATEST_DOCID = "latest_docId";
    
    configuration = new Configuration();
    normalizer = new Normalizer();
    
    _N: number = 0; 
    
    constructor(private storage: IQStorage) {}
    
    async feedDoc(key: string, unstructuredDoc: string) {
      // lookup if doc already exist
      const docs_maps = await this.storage.getItem("docs", []);
      const docIds_map = await this.storage.getItem("docIds", []);
      const index = await this.storage.getItem("item", []);
      const tf = await this.storage.getItem("tf", []);
      const latestDocId = await this.storage.getItem<number>(InQu.LATEST_DOCID);
      
      return await this._feedDocBy(key, unstructuredDoc, docs_maps, docIds_map, index, tf, latestDocId);
    }
    
    
    _feedDocBy(key: string, unstructuredDoc: string, docs_map: IHash<any>, docIds_map: IHash<any>, index: IHash<any>, tf: IHash<any>, latestDocId: number) {
      let docInfo = docs_map[key];
                
      let docId: number;
      if (docInfo==null) {
         // put docId info into persistence
         docId = this._latestDocId(latestDocId);
  
         docs_map[key] = docId;
         // cargo["docs"] = docs_map;
                  
         docIds_map[docId] = key;
         // cargo["docIds"] = docIds_map;
      } else {
         docId = docInfo;
                  
         // docId already exist so clear the document in the index before re-indexing the new document
         let removals: any[] = [];
         Object.keys(index).forEach((key) => {
            
            if (Array.isArray(index[key])) {
                let postings: any[] = index[key];
                const indexOf = postings.indexOf(5);
                if (indexOf > -1) {
                    postings.splice(indexOf, 1);
                }

            }
         });
         removals.forEach((o) => index.remove(o));
         removals = [];
         Object.keys(tf).forEach((key) => {
             const value = tf[key];
           // if (typeof value === IHash) {
               let mapWithDocId = value;
                      
               mapWithDocId.remove(`${docId}`);
                      
               if (mapWithDocId.length==0) {
                   removals.push(key);
               }
           // }
         });
         removals.forEach((o) => tf.remove(o));
      }
                
      let words = unstructuredDoc.split(" ");
      for (let word in words) {
           word = this.normalizer.normalize(word);
           if (!this.configuration.skipWord(word)) {
               let wordSet = index[word];
               if (wordSet==null) {
                   wordSet = [];
               }
               if (!wordSet.contains(docId)) {
                    wordSet.add(docId);
                    index[word] = wordSet;
               }
                    
               tf = this._setTfInStore(tf, docId, word);
           }
      }
      
      this.storage.setItem("tf", tf);
      this.storage.setItem("index", index);
                
      return docId;
    }
    
    public async search(sentence: string) {
      let findDocs: Bounty[] = [];
      let globalIndex = await this.storage.getItem<IHash<any>>("index", {});
      if (globalIndex!=null) {
        let docIdsRetrieval = new Set<number>();
        for (let term in sentence.split(" ")) {
          term = this.normalizer.normalize(term);
          if (globalIndex[term]!=null && !this.configuration.skipWord(term)) {
            if (docIdsRetrieval==null) {
              docIdsRetrieval = new Set([...globalIndex[term]]);
            } else {
              docIdsRetrieval = new Set([...globalIndex[term]].filter(x => docIdsRetrieval.has(x)));
            }
          }
        }
        
        // calculate scores for every document
        const docIds = await this.storage.getItem("docIds", []);
        let N = docIds.length;
        if (docIdsRetrieval!=null) {
          const tf = await this.storage.getItem("tf", []);
          docIdsRetrieval.forEach(docId => {
            let scorings = new Vector();
            const terms = sentence.split(" ");
            for (let term in sentence.split(" ")) {
              term = this.normalizer.normalize(term);
              let tf_term = tf[term]!=null ? tf[term][docId] : 0;
              let postings = new Set([...globalIndex[term]]);
              let df = postings!=null ? postings.size : 0;
              
              const score = (1 + Math.log(tf_term)) * Math.log(N/df);
              scorings.add(score);
            }
            // only normalize it when you have more then one terms
            if (terms.length>1) {
              scorings = scorings.normalize();
            }
            const totalScore = scorings.avg();
            
            findDocs.push(new Bounty(totalScore, docId, docIds[docId]));
          })
        }
      }
      // sort the bounties on score
      findDocs.sort((a, b) => a.compareTo(b));
      return findDocs;
    }
    
    // set a term frequency in a certain document
    private _setTfInStore(tf: IHash<any>, docId: number, word: any) {
      let tf_map = tf[word];
      if (tf_map==null) {
         tf_map = new Map();
      }
      if (tf_map[docId]==null) {
         tf_map[docId] = 0;
      } 
      tf_map[docId]++;
      tf[word] = tf_map;
      
      return tf;
    }
    
    _latestDocId(latestDocId: number) {
      if (latestDocId==null) {
        this.storage.setItem(InQu.LATEST_DOCID, 1);
        latestDocId = 0;
      } else {
        this.storage.setItem(InQu.LATEST_DOCID, latestDocId + 1);
      }
      return latestDocId;
    }
    
}
