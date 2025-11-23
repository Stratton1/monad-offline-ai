use std::{env, path::PathBuf};

fn main() {
  let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

  // Ensure resource globs resolve from the crate directory.
  if let Err(err) = env::set_current_dir(&manifest_dir) {
    panic!("Failed to set current dir to {:?}: {}", manifest_dir, err);
  }

  // Watch backend folder for changes; canonical path is ../../backend (repo root)
  let backend_candidates = [
    manifest_dir.join("../../backend"),
    manifest_dir.join("../backend"),
  ];

  for path in backend_candidates.iter().filter(|p| p.exists()) {
    println!("cargo:rerun-if-changed={}", path.display());
  }

  tauri_build::build()
}
