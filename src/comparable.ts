import { Bounty } from "./bounty";

export interface Comparable {
    compareTo(other: Bounty): number;
}