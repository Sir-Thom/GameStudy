import { ItemTypes } from "./ItemTypes";

export type Item = {
    id: string;
    name: string;
    image: string;
    type: ItemTypes;
  };