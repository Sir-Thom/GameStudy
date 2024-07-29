use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Inventory {
    player_id: i32,
    item_id: i32,
    quantity: i32,
}
