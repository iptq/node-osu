//! # libosu
//!
//! `libosu` is an attempt to make a convenient library for writing OSU-related programs. It
//! includes data structures and parsers for beatmaps, replays, and more.
//!
//! Please note that until this crate hits `1.0`, none of the APIs in this crate will be stable, so
//! take care when using this crate. Always pin to the version that you are using!

#![allow(non_snake_case)]

#[macro_use]
extern crate serde;

mod beatmap;

pub use crate::beatmap::*;
