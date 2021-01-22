use std::fs::File;
use std::io::Cursor;
use std::path::PathBuf;

use libosu::{beatmap::Beatmap as _Beatmap, hitobject::HitObject as _HitObject};
use wasm_bindgen::{prelude::*, throw_str};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (unsafe{log(&format_args!($($t)*).to_string())})
}

#[wasm_bindgen(inspectable)]
#[derive(Serialize, Deserialize)]
pub struct Beatmap(_Beatmap);

#[wasm_bindgen]
impl Beatmap {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Beatmap {
        Beatmap(_Beatmap::default())
    }

    /// PARSE OSU BEATMAP FROM STRING
    pub fn parse(data: &str) -> Beatmap {
        let curs = Cursor::new(data);
        match _Beatmap::parse(curs) {
            Ok(v) => Beatmap(v),
            Err(err) => wasm_bindgen::throw_str(&format!("sad: {}", err)),
        }
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
