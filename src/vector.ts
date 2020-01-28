export class Vector {
  
    public values = new Array<number>();
    
    add(value: number) {
      this.values.push(value);
    }
    
    length() {
      let returnLen = 0.0;
      for (const value of this.values) {
        returnLen += (value*value);
      }
      return Math.sqrt(returnLen);
    }
    
    normalize() {
      let norm = new Vector();
      const length = this.length();
      for (const value of this.values) {
         norm.add((value != 0.0) ? value/length : value);
      }
      return norm;
    }
    
    sum() {
      let returnSum = this.values.reduce((sum: number, current: number, index, arr: Array<number>) =>{
          return sum + current;
        }, 0
      );
      return returnSum;
    }
    
    avg() {
      const sumValue = this.sum();
      return sumValue==0.0 ? sumValue / this.values.length : sumValue;
    }
  }