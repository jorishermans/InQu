import { Comparable } from "./comparable";

export class Bounty implements Comparable {
  
  constructor(public score: number, public docId: any, public name: string) { }
  
  compareTo(other: Bounty): number {
    if (other.score < this.score) {
      return -1;
    }
    return 1;
  }
  
}