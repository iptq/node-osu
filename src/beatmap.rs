use std::fs::File;
use std::io::Cursor;
use std::path::PathBuf;

use libosu::{beatmap::Beatmap as _Beatmap, hitobject::HitObject as _HitObject};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Beatmap(_Beatmap);

#[wasm_bindgen]
impl Beatmap {
    /// PARSE OSU BEATMAP FROM STRING
    pub fn parse(data: &str) -> Beatmap {
        let curs = Cursor::new(data);
        match _Beatmap::parse(curs) {
            Ok(v) => Beatmap(v),
            Err(err) => wasm_bindgen::throw_str(&format!("sad: {}", err)),
        }
    }

    /// PARSE OSU BEATMAP FROM FILE
    pub fn parseFromFile(path: &str) -> Beatmap {
        let path = PathBuf::from(path);
        let file = File::open(path).unwrap();
        match _Beatmap::parse(file) {
            Ok(v) => Beatmap(v),
            Err(err) => wasm_bindgen::throw_str(&format!("sad: {}", err)),
        }
    }

    /// JSON
    pub fn asJson(&self) -> JsValue {
        JsValue::from_serde(&self).unwrap()
    }
}

#[wasm_bindgen]
impl Beatmap {
    /// The osu! file format being used
    #[wasm_bindgen(getter)]
    pub fn version(&self) -> u32 {
        self.0.version
    }

    #[wasm_bindgen(setter)]
    pub fn set_version(&mut self, value: u32) {
        self.0.version = value;
    }

    /// The name of the audio file to use, relative to the beatmap file.
    #[wasm_bindgen(getter)]
    pub fn audioFilename(&self) -> String {
        self.0.audio_filename.to_owned()
    }

    #[wasm_bindgen(setter)]
    pub fn set_audioFilename(&mut self, value: &str) {
        self.0.audio_filename = value.to_owned();
    }

    /// The amount of time (in milliseconds) added before the audio file begins playing. Useful for audio files that begin immediately.
    #[wasm_bindgen(getter)]
    pub fn audioLeadIn(&self) -> u32 {
        self.0.audio_leadin
    }

    #[wasm_bindgen(setter)]
    pub fn set_audioLeadIn(&mut self, value: u32) {
        self.0.audio_leadin = value;
    }
}
