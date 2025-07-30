use std::path::PathBuf;

fn main() {
    tauri_build::build();
    
    // Get the absolute path to the libs directory
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let libs_path = PathBuf::from(&manifest_dir).join("libs");
    let target_dir = std::env::var("OUT_DIR").unwrap();
    let target_path = PathBuf::from(target_dir);
    let _target_dir = target_path.ancestors().nth(3).unwrap();
    
    // VideoSDK functionality is now provided by ZMVideoSDK.framework
    // No need to copy standalone VideoSDK.dylib
    
    // Add framework and library search paths
    println!("cargo:rustc-link-search=framework={}", libs_path.display());
    println!("cargo:rustc-link-search=native={}", libs_path.display());
    
    // Set runtime search paths (@rpath) for frameworks and dylibs
    println!("cargo:rustc-link-arg=-Wl,-rpath,@executable_path/../Frameworks");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@executable_path/../Resources");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@executable_path/../Resources/libs");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@executable_path/libs");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@executable_path");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@loader_path");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@loader_path/../Frameworks");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@loader_path/../Resources/libs");
    println!("cargo:rustc-link-arg=-Wl,-rpath,@loader_path/libs");
    
    // Link Zoom Video SDK frameworks
    println!("cargo:rustc-link-lib=framework=ZMVideoSDK");
    println!("cargo:rustc-link-lib=framework=ZoomTask");
    println!("cargo:rustc-link-lib=framework=ZoomVideoSDKMeetingBridge");
    println!("cargo:rustc-link-lib=framework=cmmbiz");
    println!("cargo:rustc-link-lib=framework=cmmlib");
    println!("cargo:rustc-link-lib=framework=curl64");
    println!("cargo:rustc-link-lib=framework=nydus");
    println!("cargo:rustc-link-lib=framework=protobuf");
    println!("cargo:rustc-link-lib=framework=tp");
    println!("cargo:rustc-link-lib=framework=util");
    println!("cargo:rustc-link-lib=framework=viper");
    println!("cargo:rustc-link-lib=framework=xmpp_framework");
    println!("cargo:rustc-link-lib=framework=zEventTracker");
    println!("cargo:rustc-link-lib=framework=zNetUtils");
    
    // Link dynamic libraries by their actual names (without lib prefix for Rust)
    // VideoSDK functionality is provided by ZMVideoSDK.framework, not dylib
    // All others have lib prefix, so we use the name after lib
    println!("cargo:rustc-link-lib=dylib=cares");
    println!("cargo:rustc-link-lib=dylib=crypto");
    println!("cargo:rustc-link-lib=dylib=json");
    println!("cargo:rustc-link-lib=dylib=looper");
    println!("cargo:rustc-link-lib=dylib=minizip");
    println!("cargo:rustc-link-lib=dylib=ssl");
    println!("cargo:rustc-link-lib=dylib=zContext");
    println!("cargo:rustc-link-lib=dylib=zoombase_crypto_shared");
    
    // Tell cargo to re-run if the libs directory or specific files change
    println!("cargo:rerun-if-changed=libs");
    println!("cargo:rerun-if-changed=libs/ZMVideoSDK.framework");
}